var Midi = require('jsmidgen');

module.exports = {
  toBytes:function( composition ){

    var file = new Midi.File();
    var track = new Midi.Track();
    file.addTrack(track);

    track.addNote(0, 'c4', 64);
    track.addNote(0, 'd4', 64);
    track.addNote(0, 'e4', 64);
    track.addNote(0, 'f4', 64);
    track.addNote(0, 'g4', 64);
    track.addNote(0, 'a4', 64);
    track.addNote(0, 'b4', 64);
    track.addNote(0, 'c5', 64);

    track.addNote(0, 'c4', 64);
    track.addNote(0, 'd4', 64);
    track.addNote(0, 'e4', 64);
    track.addNote(0, 'f4', 64);
    track.addNote(0, 'g4', 64);
    track.addNote(0, 'a4', 64);
    track.addNote(0, 'b4', 64);
    track.addNote(0, 'c5', 64);

    track.addNote(0, 'c4', 64);
    track.addNote(0, 'd4', 64);
    track.addNote(0, 'e4', 64);
    track.addNote(0, 'f4', 64);
    track.addNote(0, 'g4', 64);
    track.addNote(0, 'a4', 64);
    track.addNote(0, 'b4', 64);
    track.addNote(0, 'c5', 64);

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
