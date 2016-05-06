var Midi = require('jsmidgen');

var noteMatcher = /([A-F])([0-9]*)-([0-9]+)/i;

module.exports = {
  toBytes:function( composition ){

    var file = new Midi.File();
    var track = new Midi.Track();
    file.addTrack(track);

    if ( composition.notes ){
      addNotes( composition.notes );
    }

    function addNotes( notes ){
      for ( var i=0 ; i<notes.length ; i++ ){
        // splitthe noite syntax.
        var match = notes[i].match( noteMatcher );
        if ( match ){
          var length = parseInt(match[3]) * 32;
          var note = match[1];
          var octave = match[2]|"4";
          var combine = note.toUpperCase()+octave;
          track.addNote(0,combine, length);
        }else{
          console.log("WTF:"+notes[i] );
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
