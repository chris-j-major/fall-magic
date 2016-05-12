if ( typeof module !== 'undefined' ){
  module.exports  = inner();
}else{
  window.data = inner();
}

function inner(){
  function Notes( data ){
    if ( ! data ) data = {};
    /* some notes, 4 bars etc. */
    this.key = data.key||"[unnamed]";
    this.notes = data.notes;
  }
  function Phrase(data){
    if ( ! data ) data = {};
    /* a block of music, positioned and keyed */
    this.pitch = data.pitch||4;
    this.notes = data.notes;
  }
  function Composition( data ){
    if ( ! data ) data = {};
    if ( typeof data === 'string' ){
      // pharse the string data
      var block = data.split(":");
      this.scale = block.splice(0,1)[0];
      if ( block.length == 0 ){
        this.phrases = [];
      }else{
        this.phrases = block.map(function(str){
          // build phrase structure here...
          var s = str.split("-");
          return new Phrase({
            pitch:parseInt(s[0]),
            notes:s[1]
          });
        });
      }
    }else{
      /* a collection of phrases and metadata */
      this.phrases = data.phrases||[];
      this.scale = data.scale||"C";
    }
  }
  Composition.prototype.toString = function(){
    return this.scale+":"+
      this.phrases.map(function(p){
        return p.pitch+"-"+p.notes.id;
      }).join(":");
  }

  return {
    Notes:Notes,
    Phrase:Phrase,
    Composition:Composition
  };
}
