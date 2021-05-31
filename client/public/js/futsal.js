const socket = io();

var $heading, $loading, $stage, $subHeading, $switchBtn, $switcher, $team, $terrain, $world, data, init;

$stage = null;

$world = null;

$terrain = null;

$team = null;

$switchBtn = null;

$heading = null;

$subHeading = null;

$loading = null;

$switcher = null;

var canvas = $('#futsalCanvas')[0];
var ctx = canvas.getContext('2d');
var homePlayer = new Image();
var homePlayer1 = new Image();
var homePlayer2 = new Image();

var awayPlayer = new Image();
var awayPlayer1 = new Image();
var awayPlayer2 = new Image();

homePlayer.src = './public/img/home.png';
homePlayer1.src = './public/img/home1.png';
homePlayer2.src = './public/img/home2.png';

awayPlayer.src = './public/img/away.png';
awayPlayer1.src = './public/img/away1.png';
awayPlayer2.src = './public/img/away2.png';

let playerName = '';
let stadiumName = '';
let teamName = '';

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

  class events {
     static attachAll() {
      $switchBtn.on('click', function(e) {
        var $el;
        e.preventDefault();
        $el = $(this);
        if ($el.hasClass('disabled')) {
          return;
        }
        scenes.switchSides();
        $switchBtn.removeClass('disabled');
        return $el.addClass('disabled');
      });
    }
     /*static attachClose() {
      return $stage.one('click', function(e) {
        e.preventDefault();
        return scenes.unfocusPlayer();
      });
    }*/
  };

  class scenes{
     static preLoad() {
      $switcher.velocity({
        opacity: 0
      }, 0);
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
      anim.fadeInDir($switcher, 300, delay + 900, 0, 30);
    }
     static startLoading(){
      var images;
      anim.fadeInDir($loading, 300, 0, 0, -20);
      images = [];
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
      var delay, delayInc;
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
      var display;
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
    $switchBtn = $('.js-switch');
    $heading = $('.js-heading');
    $switcher = $('.js-switcher');
    $subHeading = $('.js-subheading');
    $terrain = $('.js-terrain');
    $team = $('.js-team');
    $loading = $('.js-loading');
    //dom.addPlayers('home');
    //dom.addPlayers('away');
    scenes.preLoad();
    //scenes.arrangePlayers();
    events.attachAll();
    scenes.startLoading();
  };

  $(document).ready(function() {
    return init();
  });

  function draw(stad){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(stad.ball);
    drawHomePlayers(stad.homePlayers, stad.gameStart);
    drawAwayPlayers(stad.awayPlayers, stad.gameStart);
  }

  function drawBall(Ball){
    ctx.beginPath();
    ctx.arc(Ball.posX, Ball.posY, 13, 0, Math.PI*2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();
  }

  function drawHomePlayers(homePlayers, gameStart){
    if(!gameStart){ // Player wont run if the game is not started
      homePlayers.forEach((player, index) => {
        ctx.drawImage(homePlayer, player.posX, player.posY, 80, 100);
        //ctx.fillRect(player.posX, player.posY, 40, 80)
        ctx.font = "15px Charlie Sans";
        ctx.fillText(player.playerName.substring(0,4), player.posX+28, player.posY+105);
      });
    }else{
      let randomNo = Math.floor(Math.random() * 10);
      homePlayers.forEach((player, index) => {
        // reduce running animation speed by random draw
        switch(randomNo){
          case 0: ctx.drawImage(homePlayer1, player.posX, player.posY, 80, 100);
                  break;
          case 1: ctx.drawImage(homePlayer1, player.posX, player.posY, 80, 100);
                  break;
          case 2: ctx.drawImage(homePlayer1, player.posX, player.posY, 80, 100);
                  break;
          case 3: ctx.drawImage(homePlayer1, player.posX, player.posY, 80, 100);
                  break;
          default: ctx.drawImage(homePlayer2, player.posX, player.posY, 80, 100);
        }
          
        //ctx.fillRect(player.posX, player.posY, 40, 80)
        ctx.font = "15px Charlie Sans";
        ctx.fillText(player.playerName.substring(0,4), player.posX+28, player.posY+105);
      });
    }
  }

  function drawAwayPlayers(awayPlayers, gameStart){
    if(!gameStart){
      awayPlayers.forEach((player, index) => {
        ctx.drawImage(awayPlayer, player.posX, player.posY, 80, 100);
        //ctx.fillRect(player.posX, player.posY, 40, 80)
        ctx.font = "15px Charlie Sans";
        ctx.fillText(player.playerName.substring(0,4), player.posX+28, player.posY+105);
      });
    }else{
      let randomNo = Math.floor(Math.random() * 2);
      awayPlayers.forEach((player, index) => {
        switch(randomNo){
          case 0: ctx.drawImage(awayPlayer1, player.posX, player.posY, 80, 100);
                  break;
          case 1: ctx.drawImage(awayPlayer1, player.posX, player.posY, 80, 100);
                  break;
          case 2: ctx.drawImage(awayPlayer1, player.posX, player.posY, 80, 100);
                  break;
          case 3: ctx.drawImage(awayPlayer1, player.posX, player.posY, 80, 100);
                  break;
          default: ctx.drawImage(awayPlayer2, player.posX, player.posY, 80, 100);
        }
        //ctx.fillRect(player.posX, player.posY, 40, 80)
        ctx.font = "15px Charlie Sans";
        ctx.fillText(player.playerName.substring(0,4), player.posX+28, player.posY+105);
      });
    }
  }

  $(".play-image").mouseenter(function(){//game-controller animation on hover
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

  $('.arrow-key').bind('click',(event)=>{
    let keyClicked = event.target.attributes['data-key'].value;
    //console.log("Clicked ",keyClicked);

    switch(keyClicked){
      case '37': // left
              socket.emit('move', 'left', playerName, stadiumName, teamName);
              break;

        case '38': // up
              socket.emit('move', 'up', playerName, stadiumName, teamName);
              break;

        case '39': // right
              socket.emit('move', 'right', playerName, stadiumName, teamName);
              break;
        case '40': // down
              socket.emit('move', 'down', playerName, stadiumName, teamName);
              break;
        default:
               return; // exit for other keys
    }
  });

  socket.on('new-player', (stad, startFlag) => {
    console.log(stad, startFlag);

    anim.fadeOutDir($loading, 300, 1000, 0, -20);
    scenes.loadIn(1600);
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