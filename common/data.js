if ( window.module != null ){
  module.exports  = inner();
}else{
  window.data = inner();
}

function inner(){
  function Notes(){
    /* some notes, 4 bars etc. */
    this.notes = [];
  }
  function Phrase(){
    /* a block of music, positioned and keyed */
    this.pitch = 12;
  }
  function Composition(){
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
