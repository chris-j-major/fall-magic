var notes = [
  { title:"A" , notes:[
    "A1","C2","A1",
    "C2","A1","B1",
    "B1","A1","B1","A1",
    "C2","A1","B1"] },
  { title:"B" , notes:[
    "A2","C1","A1",
    "C2","B2",
    "B1","A2","A1",
    "C1","A1","B2"] },
  { title:"C" , notes:[
    "A4",
    "B4",
    "C4",
    "B4"] },
  { title:"D" , notes:[
    "A4",
    "B4",
    "C4",
    "B4"] },
];

module.exports = {
  getNotes:function(n,callback){
    var retval = [];
    for ( var i=0;i<n;i++ ){
      var index = Math.floor(Math.random() * notes.length);
      retval.push( notes[index] );
    }
    setTimeout(function(){
      callback(retval);

    },500);
  },
  getNoteSet:function(id,callback){
    var retval = null;
    for ( var i=0;i<notes.length;i++ ){
      if ( notes[i].title == id ){
        retval = notes[i];
      }
    }
    setTimeout(function(){
      callback(retval);

    },500);
  }
};
