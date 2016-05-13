var express = require('express');
var async = require('async');
var route = express.Router();

var database = require("./database");
var play = require("./play");

var common = require('../common/data.js')

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
      res.status(404).send(notes);
    }
  });
});

route.get("/notes/:id.midi",function(req,res,next){
  res.setHeader("content-type", "audio/midi");
  database.getNoteSet( req.params.id , function(notes){
    if ( notes ){
      var m = play.toMusic( notes );
      res.status(200).send( new Buffer( m.toMidiBytes() ,'binary') );
    }else{
      res.status(404).send(null);
    }
  });
});

route.get("/toMidi/:data",function(req,res,next){
  res.setHeader("content-type", "audio/midi");
  var data = new common.Composition(req.params.data);
  var phraseSet = {};
  var phraseList = [];
  data.phrases.map(function(p){
    if ( phraseSet[p.notes] == null ){
      phraseSet[p.notes] = {};
      phraseList.push( loadPhrases(p.notes) );
    }
  });
  function loadPhrases(id){
    return function(callback){
      database.getNoteSet( id , function(notes){
        phraseSet[id] = notes;
        callback();
      });
    }
  }
  async.parallel( phraseList , function(){
    data.phrases = data.phrases.map(function(p){
      return { notes: phraseSet[p.notes].notes , pitch:p.pitch };
    });
    var m = play.toMusic( data );
    m.chordify();
    res.status(200).send( new Buffer( m.toMidiBytes() ,'binary') );
  });
});

module.exports = route;
