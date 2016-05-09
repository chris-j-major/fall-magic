(function(){/*IFFEY*/

  var phraseColorList = [
    "#ff0000","#00ff00","#0000ff",
    "#aa8800","#00aa88","#8800aa",
    "#440000","#004400","#000044"];

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
      $elem.text( item.id )
      if ( ! item.color ){
        item.color = phraseColorList.pop();
      }
      $elem.css("background-color",item.color);
      jQuery.data( $elem[0] , "index" , index );
    }
  );
  notesDOM( notes );
  $toolbox.on("mousedown touchstart",".notes",function(event){
    event.preventDefault();
    // start draggin these notes
    var notesObj = $(event.currentTarget)[0];
    var index = jQuery.data( notesObj , "index" );
    var note = notes[index];
    startDrag( new data.Phrase( { pitch:1 , notes:note } ) , event , {x:-event.offsetX,y:-event.offsetY} );
    musicPlayer.setCallback( trackPlaying( $(notesObj) ) );
    musicPlayer.play("/dynamic/notes/"+note.id+".midi");
    return false;
  })

  var compositionDOM = newDOMBinding( $compose ,
    function createPhrase( $parent , item){
      var $e = $("<div>").addClass("phrase");
      return $e;
    },
    function updatePhrase( $parent , $elem , item , index ){
      $elem.text( item.notes.id )
      $elem.css( {left: (index*6)+"em" , top:(item.pitch*2)+"em" ,'background-color':item.notes.color});
      $elem.toggleClass("temp",item.temp)
      jQuery.data( $elem[0] , "index" , index );
    }
  );
  compositionDOM( activeComposition.phrases );
  $compose.on("mousedown touchstart",".phrase",function(event){
    // start draggin these notes
    event.preventDefault();
    var index = jQuery.data( $(event.currentTarget)[0] , "index" );
    var phrase = activeComposition.phrases[index];
    compositionDOM( activeComposition.phrases ); // update the display...
    console.log(event);
    startDrag( phrase ,event , {x:-event.offsetX,y:-event.offsetY} );
    return false;
  });


  var draggingPhrase = null;
  var dragOffset = null;
  function startDrag( phrase ,event,offset ){
    draggingPhrase = phrase;
    draggingPhrase.temp = true;
    dragOffset = offset;
    $(window).on("mousemove",dragMouseOver).on("mouseup touchend",dragMouseUp);
    $dragOutline.removeClass("hidden").css({ left:event.pageX+dragOffset.x, top:event.pageY+dragOffset.y });
  }

  function dragMouseOver(event){
    event.preventDefault();
    $dragOutline.css({ left:event.pageX+dragOffset.x, top:event.pageY+dragOffset.y });

    /* work out where on the main canvas */
    var x = event.pageX + dragOffset.x;
    var y = event.pageY + dragOffset.y;
    var target = $compose.offset();
    var index = -1;
    var updateRequired = false;
    if ( x > target.left && y > target.top ){
      // in the right box - hooray!
      index = Math.round((x - target.left) / $offsetSpacer.width());
      if ( index > activeComposition.phrases.length ){
        index = activeComposition.phrases.length; // target index can't be too long
      }
      var pitch = Math.round((y - target.top) / $offsetSpacer.height());
      draggingPhrase.pitch = pitch;
      updateRequired = (draggingPhrase.pitch == pitch);
    }
    var curIndex = activeComposition.phrases.indexOf( draggingPhrase );
    if ( curIndex != index ){ // index changed, update required
      if ( curIndex !== -1 ){
        activeComposition.phrases.splice(curIndex,1); // remove current
      }
      if ( index !== -1 ){
        activeComposition.phrases.splice(index,0,draggingPhrase); // add new
      }
      updateRequired = true;
    }
    if ( updateRequired ){
      compositionDOM( activeComposition.phrases ); // update the display]
    }
  }
  function dragMouseUp(event){
    event.preventDefault();
    $(window).off("mousemove",dragMouseOver);
    $(window).off("mouseup",dragMouseUp);
    $dragOutline.addClass("hidden");

    // clear the drag settings
    draggingPhrase.temp = false;
    draggingPhrase = null;

    compositionDOM( activeComposition.phrases ); // update the display]
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
    musicPlayer.setCallback( trackPlaying( $compose ) );
    musicPlayer.play("/dynamic/toMidi/"+activeComposition.toString() );
  });
})();

function trackPlaying($target){
  $target.addClass("playback");
  return function(ev){
    var time = ev.time;
    var n = time / 4.0;
    $target.css("background-position",n+"em 0em");
  }
}

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
