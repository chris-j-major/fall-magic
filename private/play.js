var teoria = require('teoria');
var Midi = require('jsmidgen');

var Sequence = require('./sequence');

var styles = {
  "A":require("./style/a"),
  "B":require("./style/b"),
  "C":require("./style/c"),
  "D":require("./style/d")
};

var baseScale = "ABCDEFGabcdefg".split("");

module.exports = {
  toMusic:function( composition ){
    var m = new Music( composition.scale );
    if ( composition.notes ){ // notes not phrases...
      m.addNotes( composition.notes , 0 /* default pitch */);
    }else if ( composition.phrases ){
      for ( var i=0;i<composition.phrases.length;i++){
        var phrase = composition.phrases[i];
        m.addNotes( phrase.notes , phrase.pitch );
      }
    }
    return m;
  }
};

function Music( style ){
  var style = styles[style]||styles['A'];
  this.style = style;
  this.baseNote = style.getBaseNote();
  this.scale = style.getScale();
  this.chordVel = style.getChordVelArray();
  this.chordPMap = style.getChordPMap();
  this.beatsInBar = 4;
  this.bars = [];
  this.lastBar = null;
}
Music.prototype.intervals = function(n){
  var i = teoria.interval.from(this.baseNote, this.scale.get(n) );
  return i;
}
Music.prototype.addNote = function( pitch , length , transpose ){
  var note = null;
  if ( pitch > -1 ){
    note = this.scale.get( pitch+1 );
    if ( note && transpose ){
      note = note.transpose( this.intervals(transpose) );
    }
  }
  if ( ! this.lastBar ){
    this.lastBar = new Bar( this );
    this.lastBar.index = this.bars.length;
    this.bars.push( this.lastBar );
  }
  this.lastBar.addNote( note , length );
}
Music.prototype.addNotes = function( str , transpose ){
  var music = this;
  var curNote = null;
  var restLength = 0;
  for ( var i=0 ; i<str.length ; i++ ){
    var char = str[i];
    if ( char === "-" ){
      // extend...
      if ( curNote ){
        curNote.length ++
      }
    }else if ( char === " " ){
      addNote(curNote);
      curNote = { length:1 , pitch:-1};
    }else{
      addNote(curNote);
      curNote = { length:1 , pitch: baseScale.indexOf(char)};
    }
  }
  addNote(curNote);
  function addNote(c){
    if ( c ){
      music.addNote( c.pitch , c.length , transpose );
    }
  }
};
Music.prototype.chordify = function(){
  // work backwards through the bars
  var music = this;
  var bars = this.bars.length;
  for ( var i=bars-1 ; i>=0 ; i--){
    this.bars[i].progression( this.bars.slice(i+1, bars) , i );
  }
  this.bars.map(function(bar){ bar.chordify() });
}
Music.prototype.toSequence = function(){
  var s = new Sequence();
  this.bars.map( function(bar){
    bar.toSequence( s );
  });
//  s.startBlock(); // add an bar at the end...
//  s.sustain(this.baseNote,0,this.beatsInBar,0); // with a whole length silent note
  return s;
}
Music.prototype.toString = function(){
  return this.toSequence().toString();
}
Music.prototype.toMidiBytes = function(){
  var file = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track);

  this.toSequence().toMidi( track);

  return file.toBytes();
}


function Bar( music ){
  this.music = music;
  this.length = 0;
  this.index = 0;
  this.notes = [];
  this.pitches = [];
}
Bar.prototype.addNote = function( note , length  ){
  this.length += length;
  this.notes.push({
    note:note,length:length
  });
  if ( note ){
    if ( this.pitches.indexOf(note) == -1 ){
        this.pitches.push(note);
    }
  }
  if ( this.length >= this.music.beatsInBar ){
    this.music.lastBar = null;
  }
};
const progressions = {
  "I":["I","V","vii"],
  "ii":["I","vi"],
  "iii":["I","vii"],
  "IV":["I","vi"],
  "V":["I","ii","IV"],
  "vi":["I","iii"],
  "vii":["I","ii","IV"]
};

Bar.prototype.progression = function( followingBars , index ){
  if ( followingBars.length == 0 ){
    this.chordP = "I";
  }else if ( followingBars.length == 1 ){
    this.chordP = "V";
  }else{
    var nextBar = followingBars[0];
    var options = progressions[nextBar.chordP];
    this.chordP = this.getBestChroma( options );
  }
};
Bar.prototype.getBestChroma = function (options) {
  var best = options[0];
  var score = this.scoreChord( options[0] );
  for ( var i=1;i<options.length;i++){
    var s = this.scoreChord( options[i] ) + Math.random();
    if ( s > score ){
      best = options[i];
    }
  }
  return best;
};
const chordNoteWeightings = [ 10 , -3 , 5 , 3 ];
Bar.prototype.scoreChord = function( pchord ){
  var music = this.music;
  var bar = this;
  var score = 0;
  var chordName = music.chordPMap[pchord];
  var chordNotes = teoria.chord(chordName).notes();
  var noteScore = {};
  for ( var n=0;n< chordNotes.length;n++){
    var c = chordNotes[n].chroma();
    noteScore[c] = Math.max(chordNoteWeightings[n],noteScore[c]||-1);
  }
  for ( var id=0;id<bar.notes.length;id++){
    var na = bar.notes[id].note;
    if (na){ // ignore rests
      var n = na.chroma();
      var cp = noteScore[n];
      var sc = 50 * bar.notes[id].length;
      if ( !cp ){
        cp = -1;
        noteScore[n] = -1;
      }
      score = score + (sc * cp );
    }
  }
  return score;
}
Bar.prototype.chordify = function () {
  var chord = this.music.chordPMap[this.chordP];
  this.chord = teoria.chord(chord).notes();
  //this.chord = best.chord.notes();
  //this.chord = this.notes[0].note.chord().notes();
};
Bar.prototype.toSequence = function( seq ){
  seq.startBlock(); // e.g. all times relative to now.
  var music = this.music;
  var bar = this;
  if ( this.chord ){
    // we have a chord
    var rhythm = music.style.getRhythmMaps( this.index , this.pChord );
    var time = 0;
    for ( var i=0;i<rhythm.length;i++){
      var n = rhythm[i];
      if ( n == " "){ // a spave is a rest
        time++;
      }else{
        var len = parseInt(n);
        var chordIndex = 0;
        bar.chord.map(function(n){
          var vel = music.chordVel[chordIndex++];
          seq.sustain( n , time , len , vel);
        });
        time += len;
      }
    }
  }
  // now do the melody
  var time = 0;
  this.notes.map(function(n){
    if ( n.note ){
      seq.sustain( n.note , time , n.length , 90 );
    }
    time += n.length;
  });
  seq.pushTime( music.beatsInBar ); // ensure the whole bar is recorded
}
