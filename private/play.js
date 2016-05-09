var Midi = require('jsmidgen');

const baseScale = "C,C#,D,D#,E,F,G,G#,A,A#,B,".split(",");

//{ a:21, b:23, c:12, d:14, e:16, f:17, g:19 }

module.exports = {
  toBytes:function( composition ){

    var file = new Midi.File();
    var track = new Midi.Track();
    file.addTrack(track);

    if ( composition.notes ){
      addNotes( composition.notes , 0 /* default pitch */);
    }else if ( composition.phrases ){
      for ( var i=0;i<composition.phrases.length;i++){
        var phrase = composition.phrases[i];
        addNotes( phrase.notes , phrase.pitch );
      }
    }

    function addNotes( notes , shift ){
      var curNote = null;
      for ( var i=0 ; i<notes.length ; i++ ){
        var char = notes[i];
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
          curNote = { length:1 , pitch:shift + baseScale.indexOf(char.toUpperCase())+(8*12)};
        }
      }
      addNote(curNote);
      function addNote(details){
        if ( details ){
          if ( details.pitch > -1 ){
            track.addNote(0,details.pitch, details.length*32 );
          }
        }
      }
    }

    return file.toBytes();
  }
};


/*
var level = noteObj.level || 127;
  		// While writing chords (multiple notes per tick)
  		// only the first noteOn (or noteOff) needs the complete arity of the function call
  		// subsequent calls need only the first 2 args (channel and note)
  		if (noteObj.note) {
  			noteObj.note.forEach((n, idx) => {
  				if (idx === 0) {
  					track.noteOn(0, n, null, level); // channel, pitch(note), length, velocity
  				} else {
  					track.noteOn(0, n); // channel, pitch(note)
  				}
  			});
  			noteObj.note.forEach((n, idx) => {
  				if (idx === 0) {
  					track.noteOff(0, n, noteObj.length, level)
  				} else {
  					track.noteOff(0, n)
  				}
  			});
  		} else {
  			track.noteOff(0, '', noteObj.length);
  		}
      */
