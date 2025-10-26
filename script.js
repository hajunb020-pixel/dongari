const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const infoBox = document.getElementById("infoBox");
const restartBtn = document.getElementById("restartBtn");
const scoreList = document.getElementById("scoreList");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const startModal = document.getElementById("startModal");
const startBtn = document.getElementById("startBtn");
const modalText = document.getElementById("modalText");

let player = { x: canvas.width/2-20, y: canvas.height-50, width: 40, height: 40, speed: 3 };
let items = [], score=0, gameOver=false, timeLeft=60, timerInterval;
let movingLeft=false, movingRight=false;
let playerName="";

// 원소 데이터
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
  {name:"K", info:"칼륨 — 신경과 근육 기능", point:10},
  {name:"Na", info:"나트륨 — 체액 균형 유지", point:10},
  {name:"P", info:"인 — DNA와 에너지 전달 필수", point:12},
  {name:"S", info:"황 — 단백질 합성 필요", point:10},
  {name:"Zn", info:"아연 — 면역과 효소 기능", point:12},
  {name:"Cu", info:"구리 — 혈액 생성 및 효소 보조", point:12},
];

const badItems = [
  {name:"CO₂", info:"지구온난화 유발", point:-10},
  {name:"NO₂", info:"대기오염", point:-10},
  {name:"SO₂", info:"산성비 원인", point:-10},
  {name:"Hg", info:"수은 — 신경계 유해", point:-12},
  {name:"Pb", info:"납 — 인체 유해", point:-12},
  {name:"H₂SO₄", info:"강산성 위험", point:-15},
  {name:"Arsenic", info:"비소 — 독성", point:-15},
  {name:"Cd", info:"카드뮴 — 신장 손상 유발", point:-15},
  {name:"Cr(VI)", info:"육가크롬 — 발암성", point:-15},
  {name:"CO", info:"일산화탄소 — 치명적", point:-20},
];

// 키보드 이벤트
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowLeft") movingLeft=true;
  if(e.key==="ArrowRight") movingRight=true;
});
document.addEventListener("keyup", e=>{
  if(e.key==="ArrowLeft") movingLeft=false;
  if(e.key==="ArrowRight") movingRight=false;
});

// 모바일 버튼
leftBtn.addEventListener("touchstart", ()=>{ movingLeft=true; });
leftBtn.addEventListener("touchend", ()=>{ movingLeft=false; });
rightBtn.addEventListener("touchstart", ()=>{ movingRight=true; });
rightBtn.addEventListener("touchend", ()=>{ movingRight=false; });

// 모바일 스와이프
let touchStartX = 0;
canvas.addEventListener("touchstart", e=>{
  touchStartX = e.touches[0].clientX;
});
canvas.addEventListener("touchmove", e=>{
  const touchX = e.touches[0].clientX;
  if(touchX - touchStartX > 5) { movingRight=true; movingLeft=false; }
  else if(touchStartX - touchX > 5) { movingLeft=true; movingRight=false; }
});
canvas.addEventListener("touchend", e=>{
  movingLeft=false;
  movingRight=false;
});

// 플레이어 업데이트
function updatePlayer(){
  if(movingLeft) player.x -= player.speed;
  if(movingRight) player.x += player.speed;
  if(player.x<0) player.x=0;
  if(player.x+player.width>canvas.width) player.x=canvas.width-player.width;
}

// 아이템 생성
function createItem(){
  const isGood = Math.random() > 0.5;
  const data = isGood ? goodItems[Math.floor(Math.random()*goodItems.length)]
                      : badItems[Math.floor(Math.random()*badItems.length)];
  items.push({
    x: Math.random()*(canvas.width-30),
    y: -30,
    width: 30,
    height: 30,
    speed: 2 + Math.random()*2,
    name: data.name,
    info: data.info,
    isGood: isGood,
    point: data.point
  });
}

// 충돌 체크
function checkCollision(item){
  return item.x<player.x+player.width && item.x+item.width>player.x &&
         item.y<player.y+player.height && item.y+item.height>player.y;
}

// 점수판 업데이트
function updateLeaderboard(){
  let scores = JSON.parse(localStorage.getItem("chemScores")||"[]");
  scores.push({name:playerName||"익명", score:score});
  scores.sort((a,b)=>b.score-a.score);
  scores = scores.slice(0,5);
  localStorage.setItem("chemScores", JSON.stringify(scores));

  scoreList.innerHTML="";
  scores.forEach(s=>scoreList.innerHTML+=`<li>${s.name}: ${s.score}</li>`);
}

// 게임 종료
function endGame(){
  gameOver=true;
  clearInterval(timerInterval);
  infoBox.textContent="게임 종료! 다시 시작 버튼을 눌러주세요.";
  updateLeaderboard();
}

// 게임 루프
function updateGame(){
  if(gameOver) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  updatePlayer();
  ctx.fillStyle="#00ffff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if(Math.random()<0.03) createItem();

  for(let i=items.length-1;i>=0;i--){
    const it = items[i];
    it.y += it.speed;
    ctx.fillStyle = it.isGood ? "#00ff00" : "#ff3333";
    ctx.font = "bold 16px Arial";
    ctx.fillText(it.name, it.x, it.y);

    if(checkCollision(it)){
      score += it.point;
      infoBox.textContent=`${it.name}: ${it.info}`;
      items.splice(i,1);
    } else if(it.y>canvas.height){
      items.splice(i,1);
    }
  }

  scoreDisplay.textContent = score;
  if(!gameOver) requestAnimationFrame(updateGame);
}

// 게임 시작
function startGame(){
  playerName = prompt("플레이어 이름을 입력하세요:","익명") || "익명";
  modalText.textContent = `안녕하세요, ${playerName}님!\n좌우로 움직여 좋은 원소(초록색)를 먹어 점수를 올리세요. 나쁜 원소(빨간색)를 먹으면 점수가 떨어집니다. 제한 시간 내 최대 점수를 달성하세요!`;
  startModal.style.display="block";
}

// 실제 게임 시작 버튼
startBtn.addEventListener("click", ()=>{
  startModal.style.display="none";
  score=0; items=[]; gameOver=false; timeLeft=60;
  player.x = canvas.width/2-20;
  infoBox.textContent="먹은 원소 정보가 여기에 표시됩니다.";
  timerDisplay.textContent = timeLeft;

  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if(timeLeft<=0) endGame();
  },1000);

  updateGame();
});

// 다시 시작 버튼
restartBtn.addEventListener("click", ()=>{
  startGame();
});

// 최초 실행
startGame();

