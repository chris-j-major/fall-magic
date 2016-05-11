var Midi = require('jsmidgen');
var teoria = require('teoria');

var a4 = teoria.note('a4');

var baseScale = "CDEFGAB".split("");

module.exports = {
  toMusic:function( composition ){
    var m = new Music();
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

function Music(){
  this.scale = teoria.note('a2').scale('ionian');
  this.beatsInBar = 4;
  this.bars = [];
  this.lastBar = null;
}
Music.prototype.intervals = function(n){
  var i = teoria.interval.from(teoria.note('a2'), this.scale.get(n) );
  return i;
}
Music.prototype.addNote = function( pitch , length , transpose ){
  var note = null;
  if ( pitch > -1 ){
    note = this.scale.get( pitch+1 );
    if ( note ){
      note = note.transpose( this.intervals(transpose) );
    }
  }
  if ( ! this.lastBar ){
    this.lastBar = new Bar( this );
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
      curNote = { length:1 , pitch: baseScale.indexOf(char.toUpperCase() )};
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
  var bars = this.bars.length;
  for ( var i=bars-1 ; i>=0 ; i--){
    this.bars[i].progression( this.bars.slice(i+1, bars) , i );
  }
  this.bars.map(function(bar){ bar.chordify() });
}
Music.prototype.toMidiBytes = function(){
  var file = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track);

  this.bars.map( function(bar){
    bar.toMidi( track );
  });


  return file.toBytes();
}


function Bar( music ){
  this.music = music;
  this.length = 0;
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
  "I":["I","V","VII"],
  "II":["I","VI",],
  "III":["I","VII"],
  "IV":["I","IV"],
  "V":["I","II","IV"],
  "VI":["I","VI"],
  "VII":["I","II","IV"]
};
Bar.prototype.progression = function( followingBars , index ){
  console.log( "PROGRESSION" , index , followingBars.length );
  if ( followingBars.length == 0 ){
    this.chordP="I";
  }else{
    var nextBar = followingBars[0];
    var options = progressions[nextBar.chordP];
    var ix = Math.floor(Math.random()*options.length);
    this.chordP = options[ix];
  }
};
Bar.prototype.chordify = function () {
  console.log(this.chordP);
  var bar = this;
  var majorOptions = this.pitches.map( function(n){ return n.chord('major')});
  var minorOptions = this.pitches.map( function(n){ return n.chord('m7')});
  var allOptions = majorOptions.concat( minorOptions );
  var scored = allOptions.map(function(chord){
    var score = 0;
    var notes = chord.notes().map( function(l){ return l.chroma(); });
    for ( var id=0;id<bar.notes.length;id++){
      var n = bar.notes[id].note.chroma();
      if ( notes.indexOf[n] == -1 ){
        score = score - 20;
      }else{
        score = score + n;
      }
    }
    return { chord:chord , score:score };
  });
  var best = scored.sort(function(a,b){ return a.score -b.score; })[0];
  console.log( best.chord.name );
  this.chord = best.chord.notes();
  //this.chord = this.notes[0].note.chord().notes();
};
Bar.prototype.toMidi = function( track ){
  if ( this.chord ){
    this.chord.map(function(n){
      track.noteOn(0, n.midi() , 0 ,50 );
    });
  }
  var delay = 0;
  this.notes.map(function(n){
    if (  n.note ){
      track.noteOn(0, n.note.midi() , delay , 90 );
      track.noteOff(0, n.note.midi() , n.length * 64 );
      delay = 0;
    }else{
      delay += n.length * 64;
    }
  })
  if ( this.chord ){
    this.chord.map(function(n){
      track.noteOff(0, n.midi() , delay );
      delay = 0; // note - the first note off needs the delay in case we end on a rest.
    });
  }
}
