function Sequence(){
  this.events = [];
  this.baseTime = 0;
  this.maxTime = 0;
}
Sequence.prototype.startBlock = function(){
  this.baseTime = this.maxTime;
};
Sequence.prototype.pushTime = function(n){
  this.maxTime = this.baseTime + n;
};
Sequence.prototype.noteOn = function(note,time,vel){
  this.maxTime = Math.max(this.baseTime + time,this.maxTime);
  this.events.push({
    time:this.baseTime+time,
    type:"ON",
    note:note,
    vel:vel
  });
};
Sequence.prototype.noteOff = function(note,time){
  this.maxTime = Math.max(this.baseTime + time,this.maxTime);
  this.events.push({
    time:this.baseTime+time,
    type:"OFF",
    note:note,
  });
};
Sequence.prototype.sustain = function( note , time , len , vel){
  this.noteOn( note , time , vel );
  this.noteOff( note , time + len );
};

Sequence.prototype.toMidi = function( track ){
  this.sortEvents();
  var lastTime = 0;
  this.events.map(function(event){
    var delay = (event.time - lastTime)*64;
    lastTime = event.time;
    if ( event.type === "ON" ){
      track.noteOn(0, event.note.midi() , delay , event.vel );
    }else{
      track.noteOff(0, event.note.midi() , delay );
    }
  });
}
Sequence.prototype.toString = function(){
  this.sortEvents();
  this.events.map(function(event){
    console.log( event.time+"   "+event.type+"  "+event.note );
  });
}

Sequence.prototype.sortEvents = function(){
  this.events.sort(function(a,b){
    return a.time - b.time;
  });
}

module.exports = Sequence;
