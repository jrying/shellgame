/** @jsx React.DOM */

//TODO improve animation
//TODO fix sequence, remove timeouts
//TODO make better dom structure and css to support devices
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var GameView = React.createClass({displayName: 'GameView',
  getInitialState: function () {
    return {game: new Game};
  },
  newGame: function () {
    this.setState(this.getInitialState());
    this.state.game.gameStatus = "new";
  },
  startGame: function () {
    this.state.game.gameStatus = "start";
    // Show ball
    this.showBall();
    // Move cups
    // Guess
    setTimeout(this.startShow, 2000);
  },
  endGame: function () {
    this.state.game.showHideBall(true);
    this.state.game.upDownCup(true);
    this.setState(this.state.game);
    this.state.game.gameStatus = "end";
    setTimeout(this.cupDown, 1200);
    setTimeout(this.hideBall, 2000);
    setTimeout(this.newGame, 2000);
  },
  moveCups: function () {
    if (this.state.game.rounds > 0) {
      this.setState(this.state.game.moveCups());
      setTimeout(this.moveCups, 1000);
    }
    else {
      this.endShow();
    }
  },
  handleCupClick: function (cup_id) {
    if (this.state.game.gameStatus != "guess") {
      return;
    }
    if (cup_id == 1) {
      this.state.game.gameStatus = "win";
    }
    else {
      this.state.game.gameStatus = "lose";
    }
    this.setState(this.state.game);
  },
  render: function () {
    var that = this;
    var cups = this.state.game.cups.map(function (cup) {
      return (CupView({cup: cup, raise: cup.up, onClick: that.handleCupClick.bind(this, cup.id)}))
    });
    var classArray = [''];
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      React.DOM.div(null, 
      GameStatusView({status: this.state.game.gameStatus, onStart: this.startGame, onEnd: this.endGame}), 
        React.DOM.div({className: "gameBoard"}, 
          cups, 
          BallView({position: this.state.game.ballPosition, visible: this.state.game.isballVisible})
        )
      )
    );
  }
});

var CupView = React.createClass({displayName: 'CupView',
  getInitialState: function () {
    return {game: new Game, gameStatus: "new"};
  },
  render: function () {
    var cup = this.props.cup;
    var raise = this.props.raise;
    var clickHandler = this.props.onClick;
    var classArray = ['cup'];
    var position = 'position_' + cup.position;

    classArray.push(position);
    if (raise) {
      classArray.push("raise");
    }

    var classes = React.addons.classSet.apply(null, classArray);
    return (
      ReactCSSTransitionGroup({transitionName: "switch"}, 
        React.DOM.span({className: classes, onClick: clickHandler, key: cup.id})
      )
    );
  }
});

var BallView = React.createClass({displayName: 'BallView',
  render: function () {
    var classArray = ['ball'];
    var visible = this.props.visible;
    var position = 'position_' + this.props.position;
    classArray.push(position);
    if (!visible) {
      classArray.push("hidden");
    }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      React.DOM.span({className: classes})
    );
  }
});

var GameStatusView = React.createClass({displayName: 'GameStatusView',
  render: function () {
    var status = this.props.status;
    var classArray = ['overlay', 'status'];
    var message = '';
    var button = '';
    if (status == 'new') { 
      message = 'Welcome to Shell Game!';
      button = (React.DOM.button({onClick: this.props.onStart, onTouchEnd: this.props.onStart}, "Start"))

    }
    else if (status == "endshow") {
      message = "Now guess where the ball is?";
    }
    else if (status == "win") {
      message = "You Win!";
      button = (React.DOM.button({onClick: this.props.onEnd, onTouchEnd: this.props.onEnd}, "Continue"))
    }
    else if (status == "lose") {
      message = "You Lose!";
      button = (React.DOM.button({onClick: this.props.onEnd, onTouchEnd: this.props.onEnd}, "Continue"))

    }
    else {
      classArray.push("hidden")
    }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      React.DOM.div({className: classes}, 
        React.DOM.span(null, message), 
        button
      )
    );
  }

});

React.initializeTouchEvents(true);
var ci = React.renderComponent(GameView(null), document.getElementById('content'));
