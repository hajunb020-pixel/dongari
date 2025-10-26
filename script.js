const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const infoBox = document.getElementById("infoBox");
const restartBtn = document.getElementById("restartBtn");
const scoreList = document.getElementById("scoreList");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const player = { x: canvas.width/2-20, y: canvas.height-60, width: 40, height: 40, speed: 5 };
let items = [];
let score = 0;
let gameOver = false;
let timeLeft = 60;
let timerInterval;

// 스와이프 이동 변수
let touchStartX = 0;
let touchEndX = 0;

// 원소 주기율표 일부 포함 (좋은/나쁜 원소)
const goodItems = [
  {name:"H₂O", info:"물 — 생명 유지 필수", point:10},
  {name:"O₂", info:"산소 — 호흡과 연료 연소에 필요", point:10},
  {name:"NaCl", info:"소금 성분", point:10},
  {name:"C", info:"탄소 — 생명 기본 원소", point:12},
  {name:"H", info:"수소 — 우주에서 가장 많은 원소", point:12},
  {name:"N", info:"질소 — 공기 성분의 78%", point:10},
  {name:"Ca", info:"칼슘 — 뼈와 치아 구성", point:10},
  {name:"Fe", info:"철 — 혈액과 구조물 필수", point:12},
  {name:"Mg", info:"마그네슘 — 에너지 대사 도움", point:10},
];
const badItems = [
  {name:"CO₂", info:"지구온난화 유발", point:-10},
  {name:"NO₂", info:"대기오염", point:-10},
  {name:"Hg", info:"수은 — 신경계 유해", point:-12},
  {name:"Pb", info:"납 — 인체 유해", point:-12},
  {name:"H₂SO₄", info:"강산성 위험", point:-15},
  {name:"Arsenic", info:"비소 — 독성", point:-15},
];

document.addEventListener("keydown", movePlayer);
restartBtn.addEventListener("click", restartGame);
leftBtn.addEventListener("touchstart", ()=>{if(!gameOver) moveLeft();});
rightBtn.addEventListener("touchstart", ()=>{if(!gameOver) moveRight();});
canvas.addEventListener("touchstart", e=>{touchStartX=e.touches[0].clientX;});
canvas.addEventListener("touchmove", e=>{
  touchEndX = e.touches[0].clientX;
  if(touchEndX - touchStartX > 20) moveRight();
  if(touchStartX - touchEndX > 20) moveLeft();
  touchStartX = touchEndX;
});

function moveLeft(){ if(player.x>0) player.x-=player.speed; }
function moveRight(){ if(player.x+player.width<canvas.width) player.x+=player.speed; }

function movePlayer(e){
  if(!gameOver){
    if(e.key==="ArrowLeft") moveLeft();
    if(e.key==="ArrowRight") moveRight();
  }
}

function createItem(){
  const isGood = Math.random() > 0.5;
  const data = isGood
    ? goodItems[Math.floor(Math.random()*goodItems.length)]
    : badItems[Math.floor(Math.random()*badItems.length)];
  items.push({
    x: Math.random()*(canvas.width-30),
    y: -30,
    width: 30,
    height: 30,
    speed: 2+Math.random()*2,
    name: data.name,
    info: data.info,
    isGood: isGood,
    point: data.point
  });
}

function updateLeaderboard(){
  let scores = JSON.parse(localStorage.getItem("chemScores")||"[]");
  scores.push({name:playerName||"익명", score:score});
  scores.sort((a,b)=>b.score-a.score);
  scores = scores.slice(0,5);
  localStorage.setItem("chemScores", JSON.stringify(scores));

  scoreList.innerHTML="";
  scores.forEach(s=>scoreList.innerHTML+=`<li>${s.name}: ${s.score}</li>`);
}

function endGame(){
  gameOver = true;
  clearInterval(timerInterval);
  ctx.fillStyle="#ff0000";
  ctx.font="bold 28px Arial";
  ctx.fillText("💥 실험 종료! 💥", 60, canvas.height/2);
  infoBox.textContent="게임 종료! 다시 시작 버튼을 눌러주세요.";
  updateLeaderboard();
}

let playerName = "";

function updateGame(){
  if(gameOver) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#00ffff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if(Math.random()<0.03) createItem();

  for(let i=0;i<items.length;i++){
    const it=items[i];
    it.y+=it.speed;

    ctx.fillStyle=it.isGood?"#00ff00":"#ff3333";
    ctx.font="bold 18px Arial";
    ctx.fillText(it.name,it.x,it.y);

    if(it.x<player.x+player.width && it.x+it.width>player.x &&
       it.y<player.y+player.height && it.y+it.height>player.y){
      score+=it.point;
      infoBox.textContent=`${it.name}: ${it.info} (${it.point>0?"+":""}${it.point}점)`;
      items.splice(i,1); i--;
    } else if(it.y>canvas.height){ items.splice(i,1); i--; }
  }

  scoreDisplay.textContent = score;
  requestAnimationFrame(updateGame);
}

function restartGame(){
  playerName = prompt("플레이어 이름을 입력하세요:", "익명") || "익명";
  score=0; items=[]; gameOver=false; timeLeft=60;
  player.x=canvas.width/2-20;
  infoBox.textContent="먹은 원소 정보가 여기에 표시됩니다.";
  timerDisplay.textContent = timeLeft;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if(timeLeft<=0) endGame();
  },1000);
  updateGame();
}

updateLeaderboard();
restartGame();
