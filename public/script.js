const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}
var logado = false;

const socket = io.connect();
const butao = document.getElementById('button')
butao.addEventListener('click', e=>{
    logado = true
    playerName = userName.value
    leaderBoardUsers.players[currentUserId] = {
        playerName: playerName,
        points: 0
    }
    socket.emit('playerName', playerName, currentUserId)
 
})

var userName = document.getElementById('userName')
var playerName = null

var verificado = false;


const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const leaderBoard = document.getElementById("leaderBoard")
var fired = false;
var space = false;
var powered = 0
var controller = false;
var definied = true;
var bulletCollisionX = -1
var bulletCollisionY = -1
var currentUserId = null
var currentUserIdPlayer = null


const leaderBoardUsers = {
    players:{ }
}
const game = {
    players: { }
}
const fire = {
    bullet: { }
}
var bulletDirection = 'up'

socket.on('connect', ()=>{
    currentUserId = socket.id
    currentUserIdPlayer = socket.id
    addPlayer(currentUserId)
})


function addPlayerPoints(actualUser, currentUserId){
    leaderBoardUsers.players[currentUserId] = {
        playerName: actualUser.playerName,
        points: actualUser.points
    } 
    const usersPoints = leaderBoardUsers.players[currentUserId]
    const users = document.createElement('div')
    users.id = currentUserId

    if(currentUserIdPlayer == currentUserId){
        users.classList.add('leader', 'player');
    }else{
        users.classList.add('leader');
    }
    users.innerHTML = `<b>${usersPoints.playerName}</b> - pontos: ${usersPoints.points}`
    leaderBoard.append(users)
}


socket.on('currentState', already)

function already(currentState, userId){
    currentUserId = socket.id
    for(let alreadyPlayers in currentState){
        player = alreadyPlayers
        addPlayer(player)
        game.players[player] = currentState[alreadyPlayers]

    }
}

socket.on('log', addPlayer)

function addPlayer(userId){
    game.players[userId] = {
        x: 0,
        y: 0
    } 
}

function power(event){
    if(fired && space){
        powered = powered +1
        if(bulletDirection == 'up'){
            fire.bullet[currentUserId] = {
                x: bulletPosX,
                y: bulletPosY + 1,
                height: powered * -1,
                width: 1
            }
        }
        if(bulletDirection == 'down'){
            fire.bullet[currentUserId] = {
                x: bulletPosX,
                y: bulletPosY,
                height: powered,
                width: 1
            }
        }
        if(bulletDirection == 'left'){
            fire.bullet[currentUserId] = {
                x: bulletPosX + 1,
                y: bulletPosY,
                height: 1,
                width: powered * -1
            }
        }
        if(bulletDirection == 'right'){
            fire.bullet[currentUserId] = {
                x: bulletPosX,
                y: bulletPosY,
                height: 1,
                width: powered
            }
        }
        const height = fire.bullet[currentUserId].height
        const width = fire.bullet[currentUserId].width
        const direction = bulletDirection
        socket.emit('addBullet', currentUserId, bulletPosX, bulletPosY, width, height, direction);
        
    }
}setInterval(power, 40);

socket.on('currentBulletPos', currentBulletPos)


function currentBulletPos(bulletPosX, bulletPosY, currentUserId, bulletHeight, bulletWidth){

    fire.bullet[currentUserId] = {
        x: bulletPosX,
        y: bulletPosY,
        width:bulletWidth,
        height:bulletHeight

    }
}
function addBullet(userId){
    const playerPos = game.players[userId]

    bulletPosX = playerPos.x
    bulletPosY = playerPos.y
    powered = 0

    if(bulletDirection === 'up'){
        bulletPosY = bulletPosY - 1
    }
    if(bulletDirection === 'down'){
        bulletPosY = bulletPosY + 1
    }
    if(bulletDirection === 'right'){
        bulletPosX = bulletPosX + 1
    }
    if(bulletDirection === 'left'){
        bulletPosX = bulletPosX - 1
    }
    fire.bullet[userId] = {
        x: bulletPosX,
        y: bulletPosY
    }
        
}

window.addEventListener('keydown', move);

window.onkeyup = function(event){
    collision()
    fired = false;        
    space = false;
    controller = true
   
}

socket.on('updatePlayerPos', update)

socket.on('deleteBulletServer', deleteBulletServer)
socket.on('currentPoints', updatePlayerPoints)

socket.on('leaderBoard', addPlayerPoints)

socket.on('currentLeaderBoard', actualPoints)

function actualPoints(currentLeaderBoard, userId){
        for(let alreadyUsers in currentLeaderBoard){
            currentLeaderBoard[alreadyUsers] = {
                playerName: currentLeaderBoard[alreadyUsers].playerName,
                points: currentLeaderBoard[alreadyUsers].points
            } 
            const usersPoints = currentLeaderBoard[alreadyUsers]
            const users = document.createElement('div')
            users.id = alreadyUsers
            if(alreadyUsers == currentUserId){
                users.classList.add('leader', 'player');
            }else{
                users.classList.add('leader');
            }
            users.innerHTML = `<b>${usersPoints.playerName}</b> - pontos: ${usersPoints.points}`
            leaderBoard.append(users)
        }
    }

function updatePlayerPoints(currentPlayerPoints, currentUserId){
        const newLeader = document.getElementById(currentUserId)
        newLeader.innerHTML = `<b>${currentPlayerPoints.playerName}</b> - pontos: ${currentPlayerPoints.points}`
}

function update(currentPos, userId){

    game.players[userId] = currentPos
}
socket.on('disconnected', deleter)

function deleter(userId){
    delete game.players[userId];
}
function deleteBulletServer(currentUserId){
    delete fire.bullet[currentUserId];
}


function deleteBullet(){
    if(space == false && controller == true){   
        delete fire.bullet[currentUserId];
        powered = 1
        socket.emit('deleteBullet', currentUserId)
    }
}setInterval(deleteBullet, 40);

function collision(){
    for(const player in game.players){
        const playerPos /* position */ = game.players[player] // real id
        if(playerPos.x == bulletCollisionX && playerPos.y == game.players[currentUserId].y || playerPos.y == bulletCollisionY && playerPos.x == game.players[currentUserId].x){
            if(bulletDirection == 'right'){
                game.players[player].x = game.players[currentUserId].x + 1 // direita pra esquerda
            }
            if(bulletDirection == 'left'){
                game.players[player].x = game.players[currentUserId].x - 1 // esquerda pra direita
            }
            if(bulletDirection == 'up'){
                game.players[player].y = game.players[currentUserId].y - 1 // direita pra esquerda
            }
            if(bulletDirection == 'down'){
                game.players[player].y = game.players[currentUserId].y + 1 // esquerda pra direita
            }
            var grabbed = game.players[player]
            socket.emit('grabbedPlayer', player, grabbed, currentUserId)
        }
    
    }
}

function move(event){
    if(logado){
        const posX = game.players[currentUserId].x
        const posY = game.players[currentUserId].y
            if(event.key === 'w' && game.players[currentUserId].y > 0){
                game.players[currentUserId].y = posY - 1
            }
            else if(event.key === 'a' && game.players[currentUserId].x > 0){
                game.players[currentUserId].x = posX - 1
            }
            else if(event.key === 's' && game.players[currentUserId].y < 24){
                game.players[currentUserId].y = posY + 1
            }
            else if(event.key === 'd' && game.players[currentUserId].x < 24){
                game.players[currentUserId].x = posX + 1
            }

            currentPos = game.players[currentUserId]

            socket.emit('currentPos', currentPos)
                definied = true 
    if(!fired){
        fired = true;
        if(event.code === 'Space'){
            addBullet(currentUserId)
            space = true
        }
    }
    if(event.key == 'ArrowUp' && space == false){
        bulletDirection = 'up'
    }
    if(event.key == 'ArrowDown' && space == false){
        bulletDirection = 'down'
    }
    if(event.key == 'ArrowRight' && space == false){
        bulletDirection = 'right'
    }
    if(event.key == 'ArrowLeft' && space == false){
        bulletDirection = 'left'
    }
    event.preventDefault();
}
}

function bulletPos(playerId){
    const bulletPos /* position */ = fire.bullet[playerId] // real id;

        if(bulletDirection == 'right'){
            bulletCollisionX = bulletPos.x + bulletPos.width -1 
        }
        if(bulletDirection == 'left'){
            bulletCollisionX = bulletPos.x + bulletPos.width 
        }
        if(bulletDirection == 'up'){
            bulletCollisionY = bulletPos.y + bulletPos.height
        }
        if(bulletDirection == 'down'){
            bulletCollisionY = bulletPos.y + bulletPos.height -1
        }
}

renderScreen()
function renderScreen(){
    context.clearRect(0, 0, width, height)
        context.globalCompositeOperation = 'destination-over';

    if(space == true){
        bulletPos(currentUserId)
    }else{
        bulletCollisionX = -1
        bulletCollisionY = -1
    }        
     
    for(const playerId in game.players){
        const player = game.players[playerId]
        var playerColor = 'rgb(0 0 0 / 50%)'
        if(playerId == currentUserId){
            playerColor = '#F0941F'
        }
        context.fillStyle = playerColor
        context.fillRect(player.x, player.y, 1, 1)
    }
    for (const playerBullet in fire.bullet){
        context.globalCompositeOperation = 'destination-over';
        var bulletColor = 'rgb(0 0 0 / 25%)'
        if(playerBullet == currentUserId){
            bulletColor = '#FF1D0D'
        }
        const shoot = fire.bullet[playerBullet]
        context.fillStyle = bulletColor
        context.fillRect(shoot.x, shoot.y, shoot.width, shoot.height)      
    }

    requestAnimationFrame(renderScreen)
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)
}

