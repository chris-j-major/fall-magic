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

  return {
    Notes,Notes,
    Phrase:Phrase,
    Composition:Composition
  };
}
