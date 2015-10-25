/** @jsx React.DOM */

//TODO improve animation
//TODO fix sequence, remove timeouts

var GameView = React.createClass({
  getInitialState: function () {
    return {game: new Game};
  },
  newGame: function () {
    this.setState(this.getInitialState());
  },
  startGame: function () {
    this.state.game.gameStatus = "startshow";
    this.showBall();
    setTimeout(this.startShow, 2000);
  },
  showBall: function () {
    this.state.game.showHideBall(true);
    this.state.game.upDownCup(true);
    this.setState(this.state.game);
    setTimeout(this.cupDown, 1200);
    setTimeout(this.hideBall, 2000);
  },
  cupDown: function () {
    this.state.game.upDownCup(false);
    this.setState(this.state.game);
  },
  hideBall: function () {
    this.state.game.showHideBall(false);
    this.setState(this.state.game);
  },
  startShow: function () {
    setTimeout(this.moveCups, 1000);
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
  endShow: function () {
    this.state.game.gameStatus = "endshow";
    setTimeout(this.guess, 1000);
  },
  guess: function () {
    this.state.game.gameStatus = "guess";
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
  endGame: function () {
    this.state.game.showHideBall(true);
    this.state.game.upDownCup(true);
    this.setState(this.state.game);
    this.state.game.gameStatus = "endgame";
    setTimeout(this.cupDown, 1200);
    setTimeout(this.hideBall, 2000);
    setTimeout(this.newGame, 2000);
  },
  render: function () {
    var that = this;
    var cups = this.state.game.cups.map(function (cup) {
      return (<CupView cup={cup} raise={cup.up} onClick={that.handleCupClick.bind(this, cup.id)} />)
    });
    var classArray = [''];
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      <div>
      <GameStatusView status={this.state.game.gameStatus} onStart={this.startGame} onEnd={this.endGame}/>
        <div className="gameBoard">
          {cups}
          <BallView position={this.state.game.ballPosition} visible={this.state.game.isballVisible} />
        </div>  
      </div>
    );
  }
});

var CupView = React.createClass({
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
      <span className={classes} onClick={clickHandler} key={cup.id}></span>
    );
  }
});

var BallView = React.createClass({
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
      <span className={classes}></span>
    );
  }
});

var GameStatusView = React.createClass({
  render: function () {
    var status = this.props.status;
    var classArray = ['overlay', 'status'];
    var message = '';
    var button = '';
    if (status == 'new') { 
      message = 'Welcome to Shell Game!';
      button = (<button onClick={this.props.onStart} onTouchEnd={this.props.onStart}>Start</button>)

    }
    else if (status == "endshow") {
      message = "Now guess where the ball is?";
    }
    else if (status == "win") {
      message = "You Win!";
      button = (<button onClick={this.props.onEnd} onTouchEnd={this.props.onEnd}>Continue</button>)
    }
    else if (status == "lose") {
      message = "You Lose!";
      button = (<button onClick={this.props.onEnd} onTouchEnd={this.props.onEnd}>Continue</button>)

    }
    else {
      classArray.push("hidden")
    }
    var classes = React.addons.classSet.apply(null, classArray);
    return (
      <div className={classes}>
        <span>{message}</span>
        {button}
      </div>
    );
  }

});

React.initializeTouchEvents(true);
var ci = React.renderComponent(<GameView />, document.getElementById('content'));
