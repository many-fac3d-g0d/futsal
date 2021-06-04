const socketIO = require('socket.io');
const express = require('express');
const path = require('path');
const SAT = require('sat');

const port = process.env.PORT || 8000;

const app = express();

let canvasWidth = 672;
let canvasHeight = 840;
let activeStadiums = [];

class Ball{
    constructor(){
        this.posX = canvasWidth/2;
        this.posY = canvasHeight/2;
        this.radius = 13;
        this.dx = 2;
        this.dy = -2;
    }

    setInitialPos(){
        this.posX = canvasWidth/2;
        this.posY = canvasHeight/2;
    }
    updateBall(collided){
        if(collided){
            this.dx = -this.dx;
            this.dy = -this.dy;
            //console.log("Change dir after collision :", this.dx, this.dy);
        }
        if( (this.posX + this.dx > canvasWidth - this.radius) || (this.posX + this.dx < this.radius ))
            this.dx = -this.dx;
        if( (this.posY + this.dy > canvasHeight) || (this.posY + this.dy < 0 ))
            this.dy = -this.dy;
        
        this.posX = this.posX + this.dx;
        this.posY = this.posY + this.dy;
    }
}

class Player{
    constructor(playerName, teamName, stadiumName, socketId){
        this.playerName = playerName;
        this.teamName = teamName;
        this.playerWidth = 40;
        this.playerHeight = 80;
        this.stadiumName = stadiumName;
        this.socketId = socketId;
        this.GOAT = false;
        this.posX = null;
        this.posY = null;
        this.dx = 8;
        this.dy = 8;
    }

    setInitialPos(){
        this.posX = Math.random() * ((canvasWidth - 100) - 100) + 100;
        this.posY = Math.random() * ((canvasHeight - 100) - 100) + 100;
    }

    move(direction){
        switch(direction){
            case 'left': if(this.posX - this.dx + 40 > 0) // Restrict movement only within canvas (half of player's body can be outside by intent :)
                            this.posX = this.posX - this.dx;
                        break;
            case 'right': if(this.posX + this.dx + 40 < canvasWidth)
                            this.posX = this.posX + this.dx;
                        break;
            case 'up': if(this.posY - this.dy + 40 > 0)
                            this.posY = this.posY - this.dy;
                        break;
            case 'down': if(this.posY + this.dy + 40 < canvasHeight)
                            this.posY = this.posY + this.dy;
                        break;
            default:  return;
        }
    }

    checkMove(direction){
        switch(direction){
            case 'left': return [this.posX - this.dx, this.posY];
                         break;
            case 'right': return [this.posX + this.dx, this.posY];
                          break;
            case 'up': return [this.posX, this.posY - this.dy];
                       break;
            case 'down': return [this.posX, this.posY + this.dy];
                         break;
            default:  return;
        }
    }

    isGoat(){
        if(this.playerName.toLowerCase() === 'messi' || this.playerName.toLowerCase() === 'viki')
            this.GOAT = true;
    }
}

class Stadium{
    constructor(name){
        this.name = name;
        this.gameStart = false;
        this.gameOver = false;
        this.homePlayers = [];
        this.awayPlayers = [];
        this.teams = [];
        this.ball = new Ball();
        this.scoreBoard = [0, 0];
        this.lastTouch = 'N/A';
        this.fullTime = 120;
        this.homeGoalPost = [canvasWidth/3, 0];
        this.awayGoalPost = [canvasWidth/3, canvasHeight-20];

    }

    addTeam(teamName){
        if(this.teams.includes(teamName))
            return 1;
        else{
            if(this.teams.length < 2){
                this.teams.push(teamName);
                return 1;
            }  
            else
                return 0;
        }

    }
    addPlayer(player, teamName){
        if(teamName === this.teams[0]){ //check homeTeam count and add Player to game
            if(this.homePlayers.length < 3){
                this.homePlayers.push(player);
                return 1;
            }else
                return 0;
        }else if(teamName === this.teams[1]){
            if(this.awayPlayers.length < 3){
                this.awayPlayers.push(player);
                return 1;
            }else
                return 0;
        }

    }

    canGameStart(){
        if(((this.homePlayers.length + this.awayPlayers.length) === 2) && !(this.gameOver)){
            this.gameStart = true;
            return this.gameStart;
        }
        else{
            this.gameStart = false;
            return this.gameStart;
        }
    }

    checkGoal(){
        if(this.ball.posX >= canvasWidth/3 && this.ball.posX <= 2*canvasWidth/3){
            if(this.ball.posY === 0){
                console.log(" Away team scored");
                this.scoreBoard[1] = this.scoreBoard[1] + 1;
                return "away-team";
            }
            if(this.ball.posY === canvasHeight){
                console.log(" Home team scored");
                this.scoreBoard[0] = this.scoreBoard[0] + 1;
                return "home-team";
            }
        }
        return false;
    }

    whichTeamWon(){
        if(this.scoreBoard[0] > this.scoreBoard[1])
            return 0;
        else if(this.scoreBoard[0] < this.scoreBoard[1])
            return 1;
        else    
            return 2;
    }
}


app.use(express.static(path.join(__dirname, '../client/')));
console.log(path.join(__dirname, '../client/'));

const server = app.listen(port,()=>{
    console.log(`Server started at http://localhost:${port}/`);
});

app.get('/', (req, res) => { 
    res.sendFile('index.html',{ root: './client/' });
});

const io = socketIO(server);

io.on('connection',(socket) => {
    console.log("A new socket has connected");

    socket.on('create',(playerName, stadiumName, teamName) => {

        console.log(playerName, stadiumName, teamName);
        let newPlayer = new Player(playerName, teamName, stadiumName, socket.id);
        newPlayer.setInitialPos();
        newPlayer.isGoat();
        let newStadium = true;

        activeStadiums.forEach((stad, index) => {
            console.log("stadium : ",stad.name);
            if(stad.name === stadiumName){
                newStadium = false;
                if(stad.addTeam(teamName)){
                    //console.log("Adding/Joining team in stad :",stad);

                    if(stad.addPlayer(newPlayer, teamName)){
                        socket.join(stadiumName);

                        console.log("Player has joined the game :", stad);
                        let startFlag = stad.canGameStart();
                        io.in(stadiumName).emit('new-player', stad, startFlag);
                    }
                    else
                        socket.emit('create-error','team-full',stad.teams, teamName); // Already 5 players playing in the team
                }else
                    socket.emit('create-error','team-error',stad.teams, teamName); // Aleady 2 teams in the room, send available teams to player 
            }
        });

        if(newStadium){// Stadium not part of activeStadiums
            let stad = new Stadium(stadiumName);
            stad.addTeam(teamName);
            stad.addPlayer(newPlayer, teamName);
            socket.join(stadiumName);

            activeStadiums.push(stad);

            console.log("Player has created a new game :", stad);
            let startFlag = stad.canGameStart();
            io.in(stadiumName).emit('new-player', stad, startFlag);
        }

    });

    socket.on('move', (direction, playerName, stadiumName, teamName) =>{
        for(let stad of activeStadiums ) {
            let circle = new SAT.Circle(new SAT.Vector(stad.ball.posX, stad.ball.posY), stad.ball.radius);
            let response = new SAT.Response();
            if(stad.name === stadiumName){
                if(teamName === stad.teams[0]){ //Search in homePlayers
                    for(let player of stad.homePlayers){
                        if(player.playerName === playerName && player.socketId === socket.id) {
                            let nextPos = player.checkMove(direction);
                            let box = new SAT.Box(new SAT.Vector(nextPos[0], nextPos[1]), player.playerWidth, player.playerHeight).toPolygon();
                            if(!(SAT.testPolygonCircle(box, circle, response))){  //update movement such that player does not pass through ball
                                player.move(direction);
                                io.in(stadiumName).emit('move-player', stad);
                                break;
                            }
                        }// update movement if from same socket only
                            
                    };

                }
                else if(teamName === stad.teams[1]){//Search in awayPlayers
                    for(let player of stad.awayPlayers){
                        if(player.playerName === playerName && player.socketId === socket.id) {
                            let nextPos = player.checkMove(direction);
                            let box = new SAT.Box(new SAT.Vector(nextPos[0], nextPos[1]), player.playerWidth, player.playerHeight).toPolygon();
                           if(!(SAT.testPolygonCircle(box, circle, response))){  
                                player.move(direction);
                                io.in(stadiumName).emit('move-player', stad);
                                break;
                            }
                        }// update movement if from same socket only
                            
                    };
                }
                break; //Only unique stadiums allowed, hence if not present skip
            }
        }
    });

});

const timer = ms => new Promise(res => setTimeout(res, ms))

setInterval(() =>{
    activeStadiums.forEach(async (stad, index) =>{
        if(stad.canGameStart()){
            let circle = new SAT.Circle(new SAT.Vector(stad.ball.posX, stad.ball.posY), stad.ball.radius);
            let response = new SAT.Response(); 
            let collided = 0;
            for(let player of stad.homePlayers){
                let box = new SAT.Box(new SAT.Vector(player.posX, player.posY), player.playerWidth, player.playerHeight).toPolygon();
                if (SAT.testPolygonCircle(box, circle, response)){
                    collided = 1;
                    stad.lastTouch = player.playerName; // update last player to touch the ball to update in case of goal
                    //console.log("Collision detected with home player: ",response);
                }
            }
            for(let player of stad.awayPlayers){
                let box = new SAT.Box(new SAT.Vector(player.posX, player.posY), player.playerWidth, player.playerHeight).toPolygon();
                if (SAT.testPolygonCircle(box, circle, response)){
                    collided = 1;
                    stad.lastTouch = player.playerName;
                    //console.log("Collision detected with away player: ",response);
                }
            }
            teamScored = stad.checkGoal();
            if(teamScored){
                stad.ball.setInitialPos();
                io.in(stad.name).emit('goal', stad, teamScored);
                await timer(3000);
                stad.lastTouch = 'N/A';
            }else{   
                stad.ball.updateBall(collided);
                io.in(stad.name).emit('update-ball', stad);
            }
        }
    });
},10);

setInterval(() =>{
    activeStadiums.forEach((stad, index) =>{
        if(stad.canGameStart()){
            io.in(stad.name).emit('time',stad.fullTime);
            if(stad.fullTime === 0){
                stad.gameOver = true;
                switch(stad.whichTeamWon()){
                    case 0 : io.in(stad.name).emit('win-loss', stad.teams[0]);
                             break;
                    case 1 : io.in(stad.name).emit('win-loss', stad.teams[1]);
                             break;
                    case 2 : io.in(stad.name).emit('tied', stad.teams);
                             break;
                    default : return;
                }
            }
            stad.fullTime = stad.fullTime - 1;
        }
    });
},1000);