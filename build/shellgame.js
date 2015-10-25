
var Game = function () {
  this.gameStatus = "new";
  this.isballVisible = false;
  this.isCupUp = false;
  this.isOverlayShown = "new";
  this.cups = [];
  this.numCups = 3;
  this.rounds = 5;
  this.ballPosition = 1;
  Cup.id = 0;
  for (var i = 0; i < this.numCups; ++i) {
    var cup = new Cup;
    this.cups.push(cup);
  }
  // this.setPositions();
};

Game.prototype.showHideBall = function (toggle) {
  this.isballVisible = toggle;
  return this;
};

Game.prototype.upDownCup = function (toggle) {
  this.isCupUp = toggle;
  this.cups[this.ballPosition].up = this.isCupUp;
  return this;
};

Game.prototype.moveCups = function () {
  a = Math.floor(Math.random() * this.numCups);
  b = (a + 1) % this.numCups;
  tempPosition = this.cups[a].position;
  this.cups[a].position = this.cups[b].position;
  this.cups[b].position = tempPosition;
  
  this.rounds --; 
  return this;
};

// Game.prototype.play = function () {
//   this.cups[1].raise = true;

// }

var Cup = function (position) {
  this.id = Cup.id++;
  this.position = this.id;
  this.up = false;
  this.oldPosition = this.id;
};

Cup.id = 0;

Cup.prototype.move = function (newPosition) {
  this.position = newPosition;
};
