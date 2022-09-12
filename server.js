const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const server = app.listen(port);
app.use(express.static('public'));
console.log("conectado")
const socket = require('socket.io');
const io = socket(server);
const gameServer = {
    players: { }
}

const pointsServer = {
    players: { }
}
const fireServer = {
    bullet: { }
}
function addPlayer(playerId){
    gameServer.players[playerId] = {
        x:0,
        y:0
    }
}

io.sockets.on('connection', (socket)=>{
    console.log('nova conexão');
    
    socket.on('playerName', playerPoints)

    function playerPoints(playerName, currentUserId){
        pointsServer.players[currentUserId] = {
            playerName: playerName,
            points: 0
        }
        const actualUser = pointsServer.players[currentUserId];
        io.emit('leaderBoard', actualUser, currentUserId)
    }

    const userId = socket.id
    
    addPlayer(userId)

    const currentState = gameServer.players
    const currentLeaderBoard = pointsServer.players
  
    io.emit('currentState', currentState, userId)

    socket.on('addBullet', addBullet)
    socket.broadcast.emit('log', userId)

    socket.on('currentPos', updatePlayerPos)

    socket.on('grabbedPlayer', (grabPlayer))
    socket.on('deleteBullet', deleteBullet)

    function deleteBullet(currentUserId){
        delete fireServer.bullet[currentUserId];
        socket.broadcast.emit('deleteBulletServer', currentUserId)
    }

    function addBullet(currentUserId, bulletPosX, bulletPosY,width, height, direction){
    if(direction == 'up'){
        var bulletPosY = bulletPosY + 1
        fireServer.bullet[currentUserId] = {
            x:bulletPosX,
            y:bulletPosY,
            width: width,
            height: height
        }
    }
    else if(direction == 'left'){
        var bulletPosX = bulletPosX + 1
        fireServer.bullet[currentUserId] = {
            x:bulletPosX,
            y:bulletPosY,
            width: width,
            height: height
        }
    }
    fireServer.bullet[currentUserId] = {
        x:bulletPosX,
        y:bulletPosY,
        width: width,
        height: height
    }
    var bulletPosX = fireServer.bullet[currentUserId].x
    var bulletPosY = fireServer.bullet[currentUserId].y
    var bulletWidth = fireServer.bullet[currentUserId].width
    var bulletHeight = fireServer.bullet[currentUserId].height

    socket.broadcast.emit('currentBulletPos', bulletPosX, bulletPosY, currentUserId, bulletHeight, bulletWidth)
}
socket.emit('currentLeaderBoard', currentLeaderBoard, userId)

    function grabPlayer(player, grabbed, currentUserId){
        gameServer.players[player].x = grabbed.x
        gameServer.players[player].y = grabbed.y
        currentPos = gameServer.players[player]
        const userId = player
        pointsServer.players[currentUserId].points = pointsServer.players[currentUserId].points + 1
        const currentPlayerPoints = pointsServer.players[currentUserId]
        io.emit('currentPoints', currentPlayerPoints, currentUserId)
        socket.broadcast.emit('updatePlayerPos', currentPos, userId)
    }

    function updatePlayerPos(currentPos){
        gameServer.players[userId] = currentPos
        socket.broadcast.emit('updatePlayerPos', currentPos, userId)
    }

    socket.on("disconnect", () => {
        const userId = socket.id
        deletePlayer(userId)    
    });

    function deletePlayer(userId){
        delete gameServer.players[userId]
        socket.broadcast.emit('disconnected', userId)
    }

});

