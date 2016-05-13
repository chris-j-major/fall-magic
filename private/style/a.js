var teoria = require('teoria');

module.exports = {
  getScale:function(){
    return teoria.note('a2').scale('ionian');
  },
  getBaseNote:function(){
    return teoria.note('a2');
  },
  getChordVelArray:function(){
    return [50,30,20];
  },
  getRhythmMaps:function( index , prog ){
    return "13";
  },
  getChordPMap:function(){
    return {
      "I":["A","A/C"],
      "ii":["Bb","Bb/D"],
      "iii":["C","C/E"],
      "IV":["D","D/F"],
      "V":["E","E/G"],
      "vi":["F","F/A"],
      "vii":["G","G/B"]
    };
  }
};
