(function(){/*IFFEY*/

  var $toolbar = $("#toolbar");
  var $main = $("#main");
  var $toolbox = $("#toolbox");
  var $compose = $("#compose");

  var activeComposition = new data.Composition();
  var notes = [
    new data.Notes({
      title:"A",
    }) ,
    new data.Notes({
      title:"B",
    }) ,
    new data.Notes({
      title:"C",
    })];

  activeComposition.phrases = [
    new data.Phrase({
      pitch:1,
      notes: notes[0]
    }) ,
    new data.Phrase({
      pitch:2,
      notes: notes[1]
    }) ,
    new data.Phrase({
      pitch:2,
      notes: notes[1]
    }) ,
    new data.Phrase({
      pitch:1,
      notes: notes[2]
    })
  ];

  function resize(){
    var height = $(window).height();
    var width = $(window).width();
    $main.height( height - $main.offset().top );
    $main.width( width );
    $toolbox.height( $main.height() );
    $compose.height( $main.height() );
  }

  var notesDOM = newDOMBinding( $toolbox ,
    function createNotes( $parent , item){
      var $e = $("<div>").addClass("notes");
      return $e;
    },
    function updatePhrase( $parent , $elem , item  ){
      $elem.text( item.title )
    }
  );
  notesDOM( notes );

  var compositionDOM = newDOMBinding( $compose ,
    function createPhrase( $parent , item){
      var $e = $("<div>").addClass("phrase");
      return $e;
    },
    function updatePhrase( $parent , $elem , item , index ){
      $elem.text( item.notes.title )
      $elem.css( {left: (index * 5)+"em" , top:(item.pitch*2)+"em" });
    }
  );
  compositionDOM( activeComposition.phrases );

  $(document).ready(resize);
  $(window).resize(resize);
})();

function newDOMBinding( $parent , create , update ){
  var mapping = {};
  var nextId = 0;
  return function(a){
    var newMapping = {};
    for ( var i=0;i<a.length;i++ ){
      if ( !a[i]._id ){
        a[i]._id = (nextId++);
      }
      var id = a[i]._id;
      if ( !mapping[id] ){
        newMapping[id] = create( $parent , a[i] );
        $parent.append( newMapping[id] );
      }else{
        newMapping[id] = mapping[id];
        delete mapping[id];
      }
      update( $parent , newMapping[id] , a[i] , i );
    }
    for (var key in mapping ){
      mapping[key].remove();
    }
    mapping  = newMapping;
  }

}
