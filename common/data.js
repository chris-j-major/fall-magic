if ( window.module != null ){
  module.exports  = inner();
}else{
  window.data = inner();
}

function inner(){
  function Notes( data ){
    if ( ! data ) data = {};
    /* some notes, 4 bars etc. */
    this.title = data.title||"[unnamed]";
    this.notes = [];
  }
  function Phrase(data ){
    if ( ! data ) data = {};
    /* a block of music, positioned and keyed */
    this.pitch = data.pitch||4;
    this.notes = data.notes;
  }
  function Composition( data ){
    if ( ! data ) data = {};
    /* a collection of phrases and metadata */
    this.phrases = [];
    this.key = "C";
  }
  Composition.prototype.toJSON = function(){
    return {
      key:this.key,
      phrases:this.phrases.map(function(p){
        return {
          pitch:p.pitch,
          notes:p.notes.title
        }
      })
    }
  }

  return {
    Notes,Notes,
    Phrase:Phrase,
    Composition:Composition
  };
}
