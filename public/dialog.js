window.msg = ((function(){
  var curId = -1;
  var nextId = 0;

  return {
    error:function(msg){
      $("#dialog").removeClass("hidden warning normal").addClass("error");
      $("#dialog-title").text("Error:");
      $("#dialog-text").text(msg);
      return curId = (nextId++);
    },
    warning:function(msg){
      $("#dialog").removeClass("hidden error normal").addClass("warning");
      $("#dialog-title").text("Warning:");
      $("#dialog-text").text(msg);
      return curId = (nextId++);
    },
    normal:function(title,msg){
      $("#dialog").removeClass("hidden error warning").addClass("normal");
      $("#dialog-title").text(title);
      $("#dialog-text").text(msg);
      return curId = (nextId++);
    },
    clear:function(id){
      if ( id === curId ){
        $("#dialog").removeClass("error warning normal").addClass("hidden");
      }
    }
  };
})());
