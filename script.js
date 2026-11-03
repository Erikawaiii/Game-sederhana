let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

// gambar
let playerImg = new Image();
playerImg.src = "player.png";

let enemyImg = new Image();
enemyImg.src = "enemy.png";

let player = {x:370, y:420, w:70, h:70, speed:7};
let bullets = [];
let enemies = [];
let explosions = [];
let particles = [];
let keys = {};

let score = 0;
let nyawa = 3;
let level = 1;
let enemySpeed = 2;
let running = false;
let shake = 0;

// ================= START =================
function startGame(){
  document.getElementById("menu").style.display="none";
  document.getElementById("gameContainer").style.display="block";
  resetGame();
  running=true;
  spawnEnemy();
  update();
}

function resetGame(){
  score=0;
  nyawa=3;
  level=1;
  enemySpeed=2;
  bullets=[];
  enemies=[];
  explosions=[];
  particles=[];
  player.x=370;

  document.getElementById("gameOver").style.display="none";
  updateScore();
}

function restartGame(){
  resetGame();
  running=true;
  spawnEnemy();
  update();
}

// ================= CONTROL =================
document.addEventListener("keydown", e=>{
  keys[e.key]=true;

  if(e.key===" " && running){
    bullets.push({x:player.x+32,y:player.y});
  }
});
document.addEventListener("keyup", e=>keys[e.key]=false);

// ================= MUSUH =================
function spawnEnemy(){
  if(!running) return;

  enemies.push({
    x:Math.random()*730,
    y:-60,
    w:60,
    h:60
  });

  setTimeout(spawnEnemy,1000);
}

// ================= UPDATE =================
function update(){
  if(!running) return;

  // efek screen shake
  if(shake>0){
    let dx=(Math.random()-0.5)*shake;
    let dy=(Math.random()-0.5)*shake;
    ctx.setTransform(1,0,0,1,dx,dy);
    shake*=0.9;
  }else{
    ctx.setTransform(1,0,0,1,0,0);
  }

  ctx.clearRect(0,0,800,500);

  // gerak player
  if(keys["ArrowLeft"] && player.x>0) player.x-=player.speed;
  if(keys["ArrowRight"] && player.x<730) player.x+=player.speed;

  ctx.drawImage(playerImg,player.x,player.y,player.w,player.h);

  // peluru
  bullets.forEach((b,i)=>{
    b.y-=8;
    ctx.fillStyle="yellow";
    ctx.fillRect(b.x,b.y,6,15);
    if(b.y<0) bullets.splice(i,1);
  });

  // musuh
  enemies.forEach((e,ei)=>{
    e.y+=enemySpeed;
    ctx.drawImage(enemyImg,e.x,e.y,e.w,e.h);

    // tabrak player
    if(
      e.x < player.x+player.w &&
      e.x+e.w > player.x &&
      e.y < player.y+player.h &&
      e.y+e.h > player.y
    ){
      enemies.splice(ei,1);
      nyawa--;
      shake=20;
      if(nyawa<=0) return gameOver();
    }

    // kena peluru
    bullets.forEach((b,bi)=>{
      if(
        b.x < e.x+e.w &&
        b.x+6 > e.x &&
        b.y < e.y+e.h &&
        b.y+15 > e.y
      ){
        // LEDAKAN
        explosions.push({x:e.x+30,y:e.y+30,size:10,alpha:1});
        shake=15;

        // partikel api
        for(let p=0;p<15;p++){
          particles.push({
            x:e.x+30,
            y:e.y+30,
            dx:(Math.random()-0.5)*6,
            dy:(Math.random()-0.5)*6,
            life:30
          });
        }

        enemies.splice(ei,1);
        bullets.splice(bi,1);
        score++;

        if(score%10===0){
          level++;
          enemySpeed+=1;
        }
      }
    });

    if(e.y>500) enemies.splice(ei,1);
  });

  // efek ledakan lingkaran
  explosions.forEach((ex,i)=>{
    ctx.beginPath();
    ctx.arc(ex.x,ex.y,ex.size,0,Math.PI*2);
    ctx.fillStyle="rgba(255,120,0,"+ex.alpha+")";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex.x,ex.y,ex.size/2,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,0,"+ex.alpha+")";
    ctx.fill();

    ex.size+=4;
    ex.alpha-=0.06;

    if(ex.alpha<=0) explosions.splice(i,1);
  });

  // partikel
  particles.forEach((p,i)=>{
    ctx.fillStyle="orange";
    ctx.fillRect(p.x,p.y,4,4);
    p.x+=p.dx;
    p.y+=p.dy;
    p.life--;

    if(p.life<=0) particles.splice(i,1);
  });

  updateScore();
  requestAnimationFrame(update);
}

// ================= SCORE =================
function updateScore(){
  document.getElementById("score").innerText=
  `Skor: ${score} | Nyawa: ${nyawa} | Level: ${level}`;
}

// ================= GAME OVER =================
function gameOver(){
  running=false;
  document.getElementById("gameOver").style.display="block";
}
