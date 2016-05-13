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
  this.intervalScores = {
    "P1":50,"P8":50,"P5":50,"d6":50,"d2":50,
    "M4":40,"m4":40,"M5":40,"m5":40,
    "M3":30,"m3":30,"M6":30,"m6":30,"d4":30,"d7":30,
    "P4":-10,"m9":-10,"dd5":-10,
    "M2":-30,"m7":-30,"M9":-30,"d8":-30,"d3":-30,"A8":-30,
    "m2":-40,"M7":-40,"m9":-40,
    "A4":-50,"d5":-50,
  };
}
Music.prototype.intervals = function(n){
  var i = teoria.interval.from(this.baseNote, this.scale.get(n) );
  return i;
}

Music.prototype.scoreInterval = function(i){
  if ( !this.intervalScores[i] ){
    console.log("WTF Intreval "+i);
    return -50;
  }else{
    return this.intervalScores[i];
  }
}
Music.prototype.addNote = function( pitch , length , transpose ){
  var note = null;
  if ( pitch > -1 ){
    try{
      note = this.scale.get( pitch+1 );
      if ( note && transpose ){
        note = note.transpose( this.intervals(transpose) );
      }
    }catch(e){
      console.log("Error in addNote",e,arguments);
      console.trace(e);
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
  var music = this.music;
  if ( followingBars.length == 0 ){
    this.chordP = "I";
    this.chord = music.chordPMap["I"][0]; // final chord
//  }else if ( followingBars.length == 1 ){
//    this.chordP = "V";
  }else{
    var nextBar = followingBars[0];
    var options = progressions[nextBar.chordP];
    var o = [];
    options.map(function(n){
      music.chordPMap[n].map(function(chord){
        o.push({p:n,chord:chord});
      })
    });
    console.log(" before "+nextBar.chordP+"...");
    var best = this.getBestScore( o );
    this.chordP = best.p;
    this.chord = best.chord;
    this.chordScore = best.score;
    console.log("Chose ",best);
  }
};
Bar.prototype.getBestScore = function (options) {
  var best = options[0];
  var score = this.scoreChord( options[0].chord );
  best.score = score;
  for ( var i=1;i<options.length;i++){
    var s = this.scoreChord( options[i].chord ) + Math.random();
    if ( s > score ){
      score = s;
      best = options[i];
      best.score = s;
    }
  }
  return best;
};
const chordNoteWeightings = [ 5 , 5 , 5 , 5 ];
Bar.prototype.scoreChord = function( chordName ){
  var music = this.music;
  var bar = this;
  var score = 0;
  var chordNotes = teoria.chord(chordName).notes();
  for ( var id=0;id<bar.notes.length;id++){
    var na = bar.notes[id].note;
    if (na){ // ignore rests
      for ( var chordNoteId=0;chordNoteId<chordNotes.length;chordNoteId++){
        var chordNote = chordNotes[chordNoteId];
        var interval = chordNote.interval(na).simple(true);
        score += music.scoreInterval( interval.toString() ) * bar.notes[id].length;
      }
    }
  }
  console.log(" "+chordName+" scored "+score);
  return score;
}
Bar.prototype.chordify = function () {
  console.log("using progression "+this.chordP+" -> "+this.chord+"  ("+this.chordScore+")");
  this.chordNotes = teoria.chord(this.chord).notes();
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
        bar.chordNotes.map(function(n){
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
