/** @jsx React.DOM */

//TODO mobile border broken
//TODO ontouchend event triggered twice

var Animation = {SHOW_BALL: 1, MOVE_CUPS: 2}
var Status = {new_game: 1, start: 2, end: 3, end_win: 4, end_lose: 5, beaten: 6}
var LevelParams = [{round:3, num_cups: 3}, {round:5, num_cups: 3}, {round:5, num_cups: 4}, {round:7, num_cups: 4}]
var current_level = 0;

var ShellGame = React.createClass({
  getInitialState: function () {
    var cups = [];
    for (var i = 0; i < LevelParams[current_level].num_cups; i++) {
      cups.push({id: i, up: false, pos: i, oldPos: i})
    }
    return {
      status: Status.new_game,
      frame: 0,
      cups: cups,
      ball: false,
      overlay: true,
      round: LevelParams[current_level].round
    };
  },
  newGame: function () {
    var that = this;
    if (this.state.status == Status.end_win) current_level += 1;
    // Add delay to workaround OnTouchEnd triggered twice
    setTimeout(that.setState(that.getInitialState()), 500);
  },
  startGame: function () {
    var that = this;
    this.setState({status: Status.start, overlay: false});
    this.playAnimation(Animation.SHOW_BALL, function () {
      that.playAnimation(Animation.MOVE_CUPS, 
        function () {
          that.setState({overlay: true});
        });
    });
  },
  endGame: function () {
    this.setState({status: Status.end, overlay: false})
  },
  playAnimation: function (type, callback) {
    callback = callback || function () {};
    var that = this;
    if (type == Animation.SHOW_BALL) {
      switch (this.state.frame) {
        case 0: // 1. Lift cup and show the ball
          this.state.cups[1].up = true;
          setTimeout(function () {that.playAnimation(type, callback)}, 800);
          this.setState({ball: true, frame: this.state.frame+1});
          break;
        case 1: // 2. Put cup down
          this.state.cups[1].up = false;
          setTimeout(function () {that.playAnimation(type, callback)}, 800);
          this.setState({frame: this.state.frame+1});
          break;
        case 2: // 3. Hide ball
          this.setState({ball: false, frame: 0});
          callback();
          break;
      }
    }
    else if (type == Animation.MOVE_CUPS) {
      var num_cups = this.state.cups.length;
      if (this.state.frame < this.state.round) {
        for (var i = 0; i < num_cups; i++) {
          this.state.cups[i].oldPos = this.state.cups[i].pos;  
        }
        // Make 2 cups switch position
        a = Math.floor(Math.random() * num_cups);
        b = (a + Math.floor(Math.random() * (num_cups-1)) + 1) % num_cups;
        this.state.cups[a].pos = this.state.cups[b].oldPos
        this.state.cups[b].pos = this.state.cups[a].oldPos;
        this.setState({frame: this.state.frame+1});
        setTimeout(function () {that.playAnimation(type, callback)}, 1000);
      }
      else {
        this.setState({frame: 0});
        callback();
      }
    }
  },
  handleCupClick: function (cup_id) {
    var that = this;
    if (this.state.status != Status.end) {
      return;
    }
    this.playAnimation(Animation.SHOW_BALL, function () {
      if (cup_id == 1) {
        if (current_level == LevelParams.length - 1) {
          that.setState({status: Status.beaten, overlay: true})
        }
        else {
          that.setState({status: Status.end_win, overlay: true})
        }
      }
      else {
        that.setState({status: Status.end_lose, overlay: true})
      }
    });
  },
  render: function () {
    var that = this;
    var overlay = '';
    var ball ='';
    var cups = this.state.cups.map(function (cup) {
      return (<CupView cup={cup} up={cup.up} onClick={that.handleCupClick.bind(this, cup.id)} />)
    });
    var boardClassArray = ['board', 'board_' + this.state.cups.length];
    var boardClasses = React.addons.classSet.apply(null, boardClassArray);
    if (this.state.overlay) {
      overlay = (<Overlay status={this.state.status} onStart={this.startGame} onEnd={this.endGame} onNew={this.newGame} />);
    }
    if (this.state.ball) {
      ball = (<Ball position={this.state.cups[1].pos} />);
    }
    return (
      <div>
        {overlay}
        <div className={boardClasses}>
         {cups} {ball}
         <span className='level'> Level {current_level+1}</span>
        </div>
      </div>
    );
  }
});

var CupView = React.createClass({
  render: function () {
    var cup = this.props.cup;
    var raise = this.props.up;
    var clickHandler = this.props.onClick;
    var classArray = ['cup'];
    var position = 'position_' + cup.pos;
    classArray.push(position);
    var move = 'move_from_' + cup.oldPos + '_to_' + cup.pos;
    classArray.push(move);
    if (raise) { classArray.push('raise'); }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      <span className={classes} onClick={clickHandler} onTouchEnd={clickHandler} key={cup.id}></span>
    );
  }
});

var Ball = React.createClass({
  render: function () {
    var classArray = ['ball'];
    var position = 'position_' + this.props.position;
    classArray.push(position);
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      <span className={classes}></span>
    );
  }
});

var Overlay = React.createClass({
  render: function () {
    var status = this.props.status;
    var classArray = ['overlay'];
    var message = '';
    var button = '';

    if (status == Status.new_game) { 
      message = 'Ready to start?';
      button = (<button onClick={this.props.onStart} onTouchEnd={this.props.onStart}>Start</button>);
    }
    else if (status == Status.start) {
      message = 'Where is the ball?';
      button = (<button onClick={this.props.onEnd} onTouchEnd={this.props.onEnd}>Guess</button>);
    }
    else if (status == Status.end_win) {
      message = 'You are right!';
      button = (<button onClick={this.props.onNew} onTouchEnd={this.props.onNew}>Continue</button>);
    }
    else if (status == Status.end_lose) {
      message = 'Ball is not there :(';
      button = (<button onClick={this.props.onNew} onTouchEnd={this.props.onNew}>Continue</button>);
    }
    else if (status == Status.beaten) {
      message = 'You are the WINNER!';
      button = '';
    }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      <div className={classes}>
        <span className="message">{message}</span>
        {button}
      </div>
    );
  }
});

React.initializeTouchEvents(true);
React.renderComponent(<ShellGame />, document.getElementById('content'));