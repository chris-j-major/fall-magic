var express = require('express');
var route = express.Router();

var database = require("./database");

route.get("/notes",function(req,res,next){
  res.send(database.getNotes());
});

route.get("/notes/:id.mid",function(req,res,next){
  res.status(404).send();
});

route.post("/toMidi",function(req,res,next){
  res.status(404).send();
});

module.exports = route;
