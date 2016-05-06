var notes = [
  { title:"A" , notes:[
    "A-1","C-2","A-1",
    "C-2","A-1","B-1",
    "B-1","A-1","B-1","A-1",
    "C-2","A-1","B-1"] },
  { title:"B" , notes:[
    "A-2","C-1","A-1",
    "C-2","B-2",
    "B-1","A-2","A-1",
    "C-1","A-1","B-2"] },
  { title:"C" , notes:[
    "A-4",
    "B-4",
    "C-4",
    "B-4"] },
  { title:"D" , notes:[
    "A-4",
    "B-4",
    "C-4",
    "B-4"] },
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
