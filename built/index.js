/** @jsx React.DOM */

//TODO improve Animation
//TODO fix sequence, remove timeouts
//TODO make better dom structure and css to support devices

var Animation = {SHOW_BALL: 1, MOVE_CUPS: 2}
var Status = {new_game: 1, start: 2, end: 3, end_win: 4, end_lose: 5}
var GAME_ROUND = 3;
var NUM_CUPS = 3;

var ShellGame = React.createClass({displayName: 'ShellGame',
  getInitialState: function () {
    var cups = [];
    for (var i = 0; i < NUM_CUPS; i++) {
      cups.push({id: i, up: false, pos: i})
    }
    return {
      status: Status.new_game,
      frame: 0,
      cups: cups,
      ball: false,
      overlay: true
    };
  },
  newGame: function () {
    this.setState(this.getInitialState());
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
          setTimeout(function () {that.playAnimation(type, callback)}, 500);
          this.setState({ball: true, frame: this.state.frame+1});
          break;
        case 1: // 2. Put cup down
          this.state.cups[1].up = false;
          setTimeout(function () {that.playAnimation(type, callback)}, 500);
          this.setState({frame: this.state.frame+1});
          break;
        case 2: // 3. Hide ball
          this.setState({ball: false, frame: 0});
          callback();
          break;
      }
    }
    else if (type == Animation.MOVE_CUPS) {
      if (this.state.frame < GAME_ROUND) {
        // Make 2 cups switch position
        a = Math.floor(Math.random() * NUM_CUPS);
        b = (a + 1) % NUM_CUPS;
        tempPosition = this.state.cups[a].pos;
        this.state.cups[a].pos = this.state.cups[b].pos;
        this.state.cups[b].pos = tempPosition;
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
        that.setState({status: Status.end_win, overlay: true})
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
      return (CupView({cup: cup, up: cup.up, onClick: that.handleCupClick.bind(this, cup.id)}))
    });
    if (this.state.overlay) {
      overlay = (Overlay({status: this.state.status, onStart: this.startGame, onEnd: this.endGame, onNew: this.newGame}));
    }
    if (this.state.ball) {
      ball = (Ball({position: this.state.cups[1].pos}));
    }
    return (
      React.DOM.div(null, 
        overlay, 
        React.DOM.div({className: "board"}, " ", cups, " ", ball, " ")
      )
    );
  }
});

var CupView = React.createClass({displayName: 'CupView',
  render: function () {
    var cup = this.props.cup;
    var raise = this.props.up;
    var clickHandler = this.props.onClick;
    var classArray = ['cup'];
    var position = 'position_' + cup.pos;
    classArray.push(position);
    if (raise) { classArray.push('raise'); }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      React.DOM.span({className: classes, onClick: clickHandler, key: cup.id})
    );
  }
});

var Ball = React.createClass({displayName: 'Ball',
  render: function () {
    var classArray = ['ball'];
    var position = 'position_' + this.props.position;
    classArray.push(position);
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      React.DOM.span({className: classes})
    );
  }
});

var Overlay = React.createClass({displayName: 'Overlay',
  render: function () {
    var status = this.props.status;
    var classArray = ['overlay'];
    var message = '';
    var button = '';

    if (status == Status.new_game) { 
      message = 'Welcome to Shell Game!';
      button = (React.DOM.button({onClick: this.props.onStart, onTouchEnd: this.props.onStart}, "Start"));
    }
    else if (status == Status.start) {
      message = 'Where the ball is?';
      button = (React.DOM.button({onClick: this.props.onEnd, onTouchEnd: this.props.onEnd}, "Guess"));
    }
    else if (status == Status.end_win) {
      message = 'You are right!';
      button = (React.DOM.button({onClick: this.props.onNew, onTouchEnd: this.props.onNew}, "Continue"));
    }
    else if (status == Status.end_lose) {
      message = 'Ball is not there :(';
      button = (React.DOM.button({onClick: this.props.onNew, onTouchEnd: this.props.onNew}, "Continue"));
    }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      React.DOM.div({className: classes}, 
        React.DOM.span({className: "message"}, message), 
        button
      )
    );
  }
});

React.initializeTouchEvents(true);
var ci = React.renderComponent(ShellGame(null), document.getElementById('content'));
