let board;
const titleSize = 30;
const countRow = 21;
const countColumn = 19;
const boardHeight = countRow*titleSize;
const boardWidth = countColumn*titleSize;

let context; //this to draw on canvas
//some event like 'onclick' , 'onsubmit' , 'onload' (pre define event)
// same window.onload (jab Jab window fully load ho jaye, toh  function chala dena)
//fully loaded means html render ho , sari image download ho jaye , js file a jye , css apy ho haye
// ex.<link>.onload Stylesheet load hone pe fxn run krna

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;
let ahhSound = new Audio("./images/ghost_hit_sound.mp3");
ahhSound.playbackRate = 4;

const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

const direction = ['U' , 'D' , 'L' ,'R'];
let score = 0;
let lives = 3;
let gameOver = false;

window.onload = function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d") //place for drwaing
    loadImage();
    loadMap();

    for (let ghost of ghosts.values()){
        const newDirection = direction[Math.floor(Math.random()*4)];
        ghost.updatDirection(newDirection);
    }

    update();
    document.addEventListener("keyup",movePacman)


}

//let wallImage = new Image(); ---> same as ---> let wallImage = document.createElement("img");
//browser internally isse banata hai ek HTMLImageElement
//<img> HTML element hota hai — jisme tum .src set kar ke image load karwa sakte ho

function loadImage(){
    wallImage = new Image();
    wallImage.src = "./images/wall.png";

    blueGhostImage = new Image();
    blueGhostImage.src ="./images/blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "./images/orangeGhost.png"
    pinkGhostImage = new Image();
    pinkGhostImage.src =  "./images/pinkGhost.png"
    redGhostImage = new Image();
    redGhostImage.src = "./images/redGhost.png"

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./images/pacmanUp.png"
    pacmanDownImage = new Image();
    pacmanDownImage.src =  "./images/pacmanDown.png"
    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./images/pacmanLeft.png"
    pacmanRightImage = new Image();
    pacmanRightImage.src =  "./images/pacmanRight.png"
}

function loadMap(){
    walls.clear();
    foods.clear();
    ghosts.clear();

    for(let r=0 ; r < countRow ; r++){
        for (let c= 0; c < countColumn ; c++) {
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c*titleSize;
            const y = r*titleSize;

            if(tileMapChar == 'X'){  //block wall
                const wall = new Block(wallImage, x , y , titleSize , titleSize);
                walls.add(wall);
            }
            else if (tileMapChar == 'b'){ //blue ghost
                const ghost = new Block(blueGhostImage, x, y, titleSize, titleSize )
                ghosts.add(ghost);}
              
            else if (tileMapChar == 'o'){ //blue ghost
                const ghost = new Block(orangeGhostImage, x, y, titleSize, titleSize )
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'p'){ //pink ghost
                const ghost = new Block(pinkGhostImage, x, y, titleSize, titleSize )
                ghosts.add(ghost);}
            else if (tileMapChar == 'r'){ //red ghost
                const ghost = new Block(redGhostImage, x, y, titleSize, titleSize )
                ghosts.add(ghost);}
            else if (tileMapChar == 'P'){ //pacman
                pacman = new Block(pacmanRightImage, x, y, titleSize, titleSize)
            }
            else if(tileMapChar == ' '){//Empty is food
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);

                
            }
        }
    }}



// in programming left uper corner always as origion

function update() {
    if(gameOver){
        return;
    }
    move();
    draw();
    setTimeout(update, 50);
}

function draw() {
    context.clearRect(0, 0, board.width, board.height);
    if (pacman.image) {
        context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    }
    for(let ghost of ghosts.values()){
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    for(let wall of walls.values()){
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height)
    }
    for(let food of foods.values()){
    context.fillStyle = "rgb(255, 195, 139)";
    context.fillRect(food.x, food.y, food.width, food.height);}

    //score
    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over: " + String(score), titleSize/2, titleSize/2);
    }
    else{
        context.fillText("x" + String(lives) + " " + String(score), titleSize/2, titleSize/2);
    }

    
    }


function move() {
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    //check wall collisions
    for(let wall of walls.values()) {
        if (collision(pacman, wall)){
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    for(let ghost of ghosts.values()) {
        if(collision(ghost, pacman)){
            ahhSound.play();
            lives -= 1;
            if(lives ==0){
                gameOver = true;
                return;
            }
            resetPositions();
        }

        if(ghost.y == titleSize*9 && ghost.direction != 'U' && ghost.direction != 'D'){
            ghost.updatDirection('U')
        }
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        for(let wall of walls.values()){
            if(collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth){
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = direction[Math.floor(Math.random()*4)];
                ghost.updatDirection(newDirection);

            }
        }
    }
    
    //check food collision
    let foodEaten = null;
    for(let food of foods.values()) {
        if(collision(pacman, food)){
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);


        

}

function movePacman(e) {
    if (gameOver) {
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        update(); //reset game loop
        return;
    }
    if (e.code == "ArrowUp" || e.code =="KeyW"){
        pacman.updatDirection('U');
    }
    else if (e.code == "ArrowDown" || e.code =="KeyS" ){
        pacman.updatDirection('D');
    }
    else if (e.code =="ArrowLeft" || e.code =="KeyA"){
        pacman.updatDirection('L');
    }
    else if ( e.code == "ArrowRight" || e.code =="KeyD"){
        pacman.updatDirection('R');
    }

    //update pacman Images
    if (pacman.direction =='U'){
        pacman.image = pacmanUpImage
    }
    else if (pacman.direction == 'D'){
        pacman.image = pacmanDownImage
    }
    else if (pacman.direction == 'L'){
        pacman.image = pacmanLeftImage
    }
    else if (pacman.direction == 'R'){
        pacman.image = pacmanRightImage
    }
}

function collision(a,b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;

}

function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()){
        ghost.reset();
        const newDirection = direction[Math.floor(Math.random()*4)];
        ghost.updatDirection(newDirection);
    }

}


class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updatDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();

        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity() {
        if (this.direction == 'U') {
            this.velocityX = 0;
            this.velocityY = -titleSize / 4; 
        } else if (this.direction == 'D') {
            this.velocityX = 0;
            this.velocityY = titleSize / 4;
        } else if (this.direction == 'L') {
            this.velocityX = -titleSize / 4;
            this.velocityY = 0;
        } else if (this.direction == 'R') {
            this.velocityX = titleSize / 4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}