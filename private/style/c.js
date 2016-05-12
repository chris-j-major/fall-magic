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
  getChordPMap:function(){
    return {
      "I":"A",
      "ii":"Bb",
      "iii":"C",
      "IV":"D",
      "V":"E",
      "vi":"F",
      "vii":"G"
    }
  }
};
