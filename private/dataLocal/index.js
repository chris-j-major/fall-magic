var notes = [
  { id:"A" , notes:"AC-AC-ABBABAC-AB" },
  { id:"B" , notes:"A-CAC-B-BA-ACAB-" },
  { id:"C" , notes:"A--BA--CA--BA--D" },
  { id:"D" , notes:"A---B---C---D---" },
//  { id:"E" , notes:"A-  B-  C-  D-  " }
];

var graph = {};

function addToGraph(src,dest){
  if ( !graph[src] ) graph[src] = {};
  if ( graph[src][dest] ){
    graph[src][dest] = 1;
  }else{
    graph[src][dest] += 1;
  }
}

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
      if ( notes[i].id == id ){
        retval = notes[i];
      }
    }
    setTimeout(function(){
      callback(retval);
    },500);
  },
  submitSet:function(sequence){

  }
};
