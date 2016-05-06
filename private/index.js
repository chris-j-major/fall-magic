var express = require('express');
var stream = require('stream');
var through = require('through');
var route = express.Router();

var database = require("./database");
var play = require("./play");

route.get("/notes",function(req,res,next){
  database.getNotes( 5 , function(notes){
    res.send(notes);
  } );
});

route.get("/notes/:id.json",function(req,res,next){
  database.getNoteSet( req.params.id , function(notes){
    if ( notes ){
      res.send(notes);
    }else{
      res.status(400).send(notes);
    }
  });
});

route.get("/notes/:id.midi",function(req,res,next){
  res.setHeader("content-type", "audio/midi");
  database.getNoteSet( req.params.id , function(notes){
    if ( notes ){
      res.status(200).send( new Buffer( play.toBytes( notes ) ,'binary') );
    }else{
      res.status(400).send(notes);
    }
  });
});

function buildThroughStream(){
  return through(function write(data) {
      this.emit('data', data);
    },
    function end () { //optional
      this.emit('end');
    })
}

route.post("/toMidi",function(req,res,next){
  res.status(404).send();
});

module.exports = route;
