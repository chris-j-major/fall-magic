window.musicPlayer = (function(){
  var playing = false;
  return {
    play:function( url ){
      if ( playing ) this.stop();
      MIDIjs.play(url)
    },
    stop:function(){
      MIDIjs.stop()
    }    
  };
})();
