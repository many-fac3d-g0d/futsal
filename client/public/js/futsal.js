const socket = io();

let $heading, $loading, $stage, $subHeading, $terrain, $world, data, init;

$stage = null;

$world = null;

$terrain = null;

$heading = null;

$subHeading = null;

$loading = null;

let canvas = $('#futsalCanvas')[0];
let ctx = canvas.getContext('2d');
let homePlayer = new Image();
let homePlayer1 = new Image();
let homePlayer2 = new Image();

let awayPlayer = new Image();
let awayPlayer1 = new Image();
let awayPlayer2 = new Image();

let goatPlayer = new Image();
let goatPlayer1 = new Image();
let goatPlayer2 = new Image();

homePlayer.src = './public/img/home.png';
homePlayer1.src = './public/img/home1.png';
homePlayer2.src = './public/img/home2.png';

awayPlayer.src = './public/img/away.png';
awayPlayer1.src = './public/img/away1.png';
awayPlayer2.src = './public/img/away2.png';

goatPlayer.src = './public/img/goat.png';
goatPlayer1.src = './public/img/goat1.png';
goatPlayer2.src = './public/img/goat2.png';


let playerName = '';
let stadiumName = '';
let teamName = '';


let myJoyStick = {
  zone: document.getElementById('my-joystick'),
  mode: 'static',
  position: {
    left: '50%',
    top: '110%' },

  size: 80 * 2,
  color: 'black' 
};

  class state {
   static home = true;
   static disabHover = false;
     static swapSides() {
      if (this.home) {
        return this.home = false;
      } else {
        return this.home = true;
      }
    }
     static curSide() {
      if (this.home) {
        return 'home';
      } else {
        return 'away';
      }
    }
  };

  class pos {
    static world = {
      baseX: 0,
      baseY: 0,
      baseZ: -200
    }
    static def = {
      goalie: [0, -50]
    }
  };

  class scenes{
     static preLoad() {
      $heading.velocity({
        opacity: 1
      }, 0);
      $subHeading.velocity({
        opacity: 0
      }, 0);
      /*$world.velocity({
        opacity: 0,
        translateZ: -200,
        translateY: -60
      },
      {
        display : 'none'
      } 
      , 0);*/
      $world.css('display', 'none');

      $('main').velocity({
        opacity: 1
      }, 0);
    }
     static loadIn(delay){
      if (delay == null) {
        delay = 0;
      }
      $world.velocity({
        opacity: 1,
        translateY: 0,
        translateZ: -200
      }, {
        duration: 1000,
        delay: delay,
        easing: 'spring'
      });
      $world.css('display', 'block');
      
      anim.fadeInDir($heading, 300, delay + 600, 0, 30);
      anim.fadeInDir($subHeading, 300, delay + 800, 0, 30);
    }
     static startLoading(){
      anim.fadeInDir($loading, 300, 0, 0, -20);
      //anim.fadeOutDir($loading, 300, 1000, 0, -20);
      //scenes.loadIn(1600);
    }
    /*arrangePlayers: function() {
      return $players.each(function() {
        var $el;
        $el = $(this);
        return $el.velocity({
          translateX: parseInt($el.attr('data-x')),
          translateZ: parseInt($el.attr('data-y'))
        });
      });
    },*/
     static switchSides() {
      let delay, delayInc;
      delay = 0;
      delayInc = 20;
      state.swapSides();
      $terrain.velocity({
        rotateX: '+=360deg'
      }, {
        delay: 150,
        duration: 1200
      });
    }
  };

  class anim {
     static fadeInDir($el, dur, delay, deltaX, deltaY, deltaZ, easing, opacity) {
      if (deltaX == null) {
        deltaX = 0;
      }
      if (deltaY == null) {
        deltaY = 0;
      }
      if (deltaZ == null) {
        deltaZ = 0;
      }
      if (easing == null) {
        easing = null;
      }
      if (opacity == null) {
        opacity = 0;
      }
      $el.css('display', 'block');
      $el.velocity({
        translateX: '-=' + deltaX,
        translateY: '-=' + deltaY,
        translateZ: '-=' + deltaZ
      }, 0);
      return $el.velocity({
        opacity: 1,
        translateX: '+=' + deltaX,
        translateY: '+=' + deltaY,
        translateZ: '+=' + deltaZ
      }, {
        easing: easing,
      });
    }
     static fadeOutDir($el, dur, delay, deltaX, deltaY, deltaZ, easing, opacity) {
      let display;
      if (deltaX == null) {
        deltaX = 0;
      }
      if (deltaY == null) {
        deltaY = 0;
      }
      if (deltaZ == null) {
        deltaZ = 0;
      }
      if (easing == null) {
        easing = null;
      }
      if (opacity == null) {
        opacity = 0;
      }
      if (!opacity) {
        display = 'none';
      } else {
        display = 'block';
      }
      return $el.velocity({
        opacity: opacity,
        translateX: '+=' + deltaX,
        translateY: '+=' + deltaY,
        translateZ: '+=' + deltaZ
      }, {
        easing: easing,
        delay: delay,
        duration: dur
      }).velocity({
        opacity: opacity,
        translateX: '-=' + deltaX,
        translateY: '-=' + deltaY,
        translateZ: '-=' + deltaZ
      }, {
        duration: 0,
        display: display
      });
    }
  };

  init = function() {
    $stage = $('.js-stage');
    $world = $('.js-world');
    $heading = $('.js-heading');
    $subHeading = $('.js-subheading');
    $terrain = $('.js-terrain');
    $loading = $('.js-loading');
    //dom.addPlayers('home');
    //dom.addPlayers('away');
    scenes.preLoad();
    //scenes.arrangePlayers();
    scenes.startLoading();
  };

  $(document).ready(function() {
    return init();
  });

  function draw(stad){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGoalPost(stad.homeGoalPost, stad.awayGoalPost, stad.teams);
    drawBall(stad.ball);
    drawHomePlayers(stad.homePlayers);
    drawAwayPlayers(stad.awayPlayers);
  }

  function drawGoalPost(homeGoalPost, awayGoalPost, teams){
    
    ctx.font = "15px Charlie Sans";
    ctx.fillStyle = '#d3342c';
    ctx.fillRect(homeGoalPost[0], homeGoalPost[1], canvas.width/3, 20);
    ctx.fillStyle = '#2b44b4';
    ctx.fillRect(awayGoalPost[0], awayGoalPost[1], canvas.width/3, 20);

    ctx.fillStyle = 'white';

    if(teams[0])
      ctx.fillText(teams[0].toUpperCase(),homeGoalPost[0] + canvas.width/9 , homeGoalPost[1] + 15);

    if(teams[1])
      ctx.fillText(teams[1].toUpperCase(), awayGoalPost[0] + canvas.width/9, awayGoalPost[1] + 15);
  }

  function drawBall(Ball){
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(Ball.posX, Ball.posY, 13, 0, Math.PI*2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();
    //ctx.fillText(`${Ball.posX}, ${Ball.posY}`, Ball.posX+10, Ball.posY+10);
  }

  function drawHomePlayers(homePlayers){
    
      let randomNo = Math.floor(Math.random() * 10);
      homePlayers.forEach((player, index) => {
        // TODO reduce running animation speed by random draw
          if(randomNo < 5){
            if(player.GOAT)
              ctx.drawImage(goatPlayer1, player.posX, player.posY, 80, 100);
            else
              ctx.drawImage(homePlayer1, player.posX, player.posY, 80, 100);
          }
          else{
            if(player.GOAT)
              ctx.drawImage(goatPlayer2, player.posX, player.posY, 80, 100);
            else
              ctx.drawImage(homePlayer2, player.posX, player.posY, 80, 100);
          }
        
          
        //ctx.fillRect(player.posX, player.posY, 40, 80)
        ctx.font = "15px Charlie Sans";
        if(player.GOAT)
          ctx.fillText(player.playerName.substring(0,7) + " 🐐", player.posX+28, player.posY+105);
        else
          ctx.fillText(player.playerName.substring(0,7), player.posX+28, player.posY+105);
      });
  }

  function drawAwayPlayers(awayPlayers){
      let randomNo = Math.floor(Math.random() * 10);
      awayPlayers.forEach((player, index) => {
        if(randomNo < 5){
          if(player.GOAT)
            ctx.drawImage(goatPlayer1, player.posX, player.posY, 80, 100);
          else
            ctx.drawImage(awayPlayer1, player.posX, player.posY, 80, 100);
        }
      else{
        if(player.GOAT)
          ctx.drawImage(goatPlayer2, player.posX, player.posY, 80, 100);
        else
          ctx.drawImage(awayPlayer2, player.posX, player.posY, 80, 100);
      }
        //ctx.fillRect(player.posX, player.posY, 40, 80)
        ctx.font = "15px Charlie Sans";
        if(player.GOAT)
          ctx.fillText(player.playerName.substring(0,7) + " 🐐", player.posX+28, player.posY+105);
        else
          ctx.fillText(player.playerName.substring(0,7), player.posX+28, player.posY+105);
      });
  }

  $(".play-image").mouseenter(function(){//game-controller animation on hover
    $(this)
      .velocity({ translateY: "-20px", rotateZ: "10deg" }, 100, "easeOut")
      .velocity({ rotateZ: "-8deg" }, 150)
      .velocity({ translateY: "0", rotateZ: "0" }, {duration: 600, easing: [ 500, 14 ]});
  });

  $(".play-image").on("touchstart",function(){//game-controller animation on hover for touch screens
    $(this)
      .velocity({ translateY: "-20px", rotateZ: "10deg" }, 100, "easeOut")
      .velocity({ rotateZ: "-8deg" }, 150)
      .velocity({ translateY: "0", rotateZ: "0" }, {duration: 600, easing: [ 500, 14 ]});
  });

  $('#join-btn').bind('click',() => {

    playerName = $('#player-name').val();
    stadiumName = $('#room-name').val();
    teamName = $('#team-name').val();

    console.log(playerName, stadiumName, teamName);
    if(!playerName || !stadiumName || !teamName)
      window.alert("Pls provide all three fields");
    else
      socket.emit('create', playerName, stadiumName, teamName);
  });

  $(document).keydown((e) => {
    switch(e.which){
      case 37: // left
              socket.emit('move', 'left', playerName, stadiumName, teamName);
              break;

        case 38: // up
              socket.emit('move', 'up', playerName, stadiumName, teamName);
              break;

        case 39: // right
              socket.emit('move', 'right', playerName, stadiumName, teamName);
              break;
        case 40: // down
              socket.emit('move', 'down', playerName, stadiumName, teamName);
              break;
        default:
               return; // exit for other keys
    }

  });



let joystick = nipplejs.create(myJoyStick);
console.log("My joystick ",joystick);
joystick.on('move',(event, data) => {
  if('direction' in data){ //Prevent uncaught exceptions if direction attribute is not present on move
    //console.log("Dir ",data.direction.angle);
    socket.emit('move', data.direction.angle, playerName, stadiumName, teamName);
  }
});

  socket.on('new-player', (stad, startFlag) => {
    console.log(stad, startFlag);

    anim.fadeOutDir($loading, 300, 1000, 0, -20);
    scenes.loadIn(1600);
    if(stad.teams[0]){
      homeTeam = document.getElementById('home-team').getElementsByTagName('h2');
      homeTeam[0].innerText = stad.teams[0].toUpperCase() + " (Home)";
    }
    if(stad.teams[1]){
      awayTeam = document.getElementById('away-team').getElementsByTagName('h2');
      awayTeam[0].innerText = stad.teams[1].toUpperCase() + " (Away)";
    }


    draw(stad);

  });

  socket.on('move-player', (stad) => {
    draw(stad);
  })

  socket.on('create-error', (msg, teams, teamName) => {
    if(msg === 'team-error'){
      console.log(`Team Name ${teamName} invalid, Available Teams in stadium : ${teams}`);
      window.alert(`Inputted Team Name ${teamName} invalid, Available Teams in stadium are : ${teams}`);
    }
    else if(msg === 'team-full'){
      console.log(`Your team ${teamName} is full, Available Teams in stadium : ${teams}`);
      window.alert(`Sorry your team ${teamName} is full, Try other teams : ${teams}`);
    }
  });

  socket.on('update-ball', (stad) =>{
    draw(stad);
  });

  socket.on('goal', (stad, teamScored) => {
    $(`#${teamScored}`).append(`<p>${stad.lastTouch} ("${stad.fullTime})</p>`); //Update goal scorer and time in sec
    score = document.getElementById('score').getElementsByTagName('h1');
    score[0].innerText = `${stad.scoreBoard[0]} - ${stad.scoreBoard[1]}`;//Update scoreboard
  });

  socket.on('time', (fullTime) => {
    let min = Math.floor(fullTime/60);
    let sec = fullTime%60;
    clock = document.getElementById('clock').getElementsByTagName('h2');
    if(sec < 10)
      clock[0].innerText = `0${min} : 0${sec}`;
    else
      clock[0].innerText = `0${min} : ${sec}`;
  });

  socket.on('win-loss', (winner) => {
    window.alert(`Team ${winner} has won the game `);
  });

  socket.on('tied', (teams) => {
    window.alert(`Game tied `);
  });