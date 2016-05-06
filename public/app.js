(function(){/*IFFEY*/

  var $toolbar = $("#toolbar");
  var $main = $("#main");
  var $toolbox = $("#toolbox");
  var $compose = $("#compose");

  function resize(){
    var height = $(window).height();
    var width = $(window).width();
    $main.height( height - $main.offset().top );
    $main.width( width );
    $toolbox.height( $main.height() );
    $compose.height( $main.height() );
  }

  $(document).ready(resize);
  $(window).resize(resize);
})();
