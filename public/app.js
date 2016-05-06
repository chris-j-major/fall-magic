(function(){/*IFFEY*/

  var $toolbar = $("#toolbar");
  var $main = $("#main");
  var $toolbox = $("#toolbox");
  var $compose = $("#compose");
  var $dragOutline = $("#dragOutline");
  var $offsetSpacer = $("#offsetSpacer");

  var activeComposition = new data.Composition();
  var notes = [];


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
    function updatePhrase( $parent , $elem , item , index   ){
      $elem.text( item.title )
      jQuery.data( $elem[0] , "index" , index );
    }
  );
  notesDOM( notes );
  $toolbox.on("mousedown touchstart",".notes",function(event){
    event.preventDefault();
    // start draggin these notes
    var index = jQuery.data( $(event.currentTarget)[0] , "index" );
    var note = notes[index];
    startDrag( new data.Phrase( { pitch:1 , notes:note } ) , event );
    musicPlayer.play("/dynamic/notes/"+note.title+".midi");
    return false;
  })

  var compositionDOM = newDOMBinding( $compose ,
    function createPhrase( $parent , item){
      var $e = $("<div>").addClass("phrase");
      return $e;
    },
    function updatePhrase( $parent , $elem , item , index ){
      $elem.text( item.notes.title )
      $elem.css( {left: (index * 6)+"em" , top:(item.pitch*2)+"em" });
      jQuery.data( $elem[0] , "index" , index );
    }
  );
  compositionDOM( activeComposition.phrases );
  $compose.on("mousedown touchstart",".phrase",function(event){
    // start draggin these notes
    event.preventDefault();
    var index = jQuery.data( $(event.currentTarget)[0] , "index" );
    var phrase = activeComposition.phrases[index];
    activeComposition.phrases.splice( index , 1 );
    compositionDOM( activeComposition.phrases ); // update the display...
    startDrag( phrase ,event );
    return false;
  });


  var draggingPhrase = null;
  function startDrag( phrase ,event ){
    draggingPhrase = phrase;
    $dragOutline.css({ left:event.pageX, top:event.pageY });
    $(window).on("mousemove",dragMouseOver);
    $(window).on("mouseup touchend",dragMouseUp);
    $dragOutline.removeClass("hidden");
  }

  function dragMouseOver(event){
    event.preventDefault();
    $dragOutline.css({ left:event.pageX, top:event.pageY });
  }
  function dragMouseUp(event){
    event.preventDefault();
    $(window).off("mousemove",dragMouseOver);
    $(window).off("mouseup",dragMouseUp);
    $dragOutline.addClass("hidden");

    /* work out where on the main canvas */
    var x = event.pageX;
    var y = event.pageY;
    var target = $compose.offset();
    if ( x > target.left && y > target.top ){
      // in the right box - hooray!
      var index = Math.round((x - target.left) / $offsetSpacer.width());
      var pitch = Math.round((y - target.top) / $offsetSpacer.height());
      draggingPhrase.pitch = pitch;
      if ( index > activeComposition.phrases.length ){
        activeComposition.phrases.push(draggingPhrase);
      }else{
        activeComposition.phrases.splice(index,0,draggingPhrase);
      }
      compositionDOM( activeComposition.phrases ); // update the display
    }else{
      // not on the main canvas... so

    }
    draggingPhrase = null;
  }

  $(document).ready(resize);
  $(window).resize(resize);

  var msgId = window.msg.normal("Loading","please wait...")
  $.get("/dynamic/notes")
    .done(function(data) {
      notes = data;
      notesDOM( notes );
      window.msg.clear( msgId );
    })
    .fail(function() {
      window.msg.error( "error loading notes" );
    });
  $("#play").on('click',function(){
    musicPlayer.play("/dynamic/toMidi/"+JSON.stringify(activeComposition.toJSON()) );
  });
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
