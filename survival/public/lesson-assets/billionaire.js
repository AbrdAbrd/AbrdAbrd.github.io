const GAME_PRIZES=[10000,100000,1000000,10000000,100000000,1000000000];
const GAME_LOGO='./public/lesson-assets/aipac-game-logo.png';
function aipacMark(){return `<span class="aipac-game-mark"><img src="${GAME_LOGO}" alt="AIPAC game emblem" width="447" height="447"><b>AIPAC</b></span>`}
function gameStatus(){
 let bank=0,secured=0,correct=0,answered=0,next=0;
 for(let i=0;i<QUIZ.length;i++){
  const answer=state.answers[i];if(answer===null)break;
  answered++;next=i+1;
  if(answer!==QUIZ[i].ans)return {bank:secured,secured,correct,answered,next:i,finished:true,outcome:'lost'};
  bank=GAME_PRIZES[i];correct++;if(i===2)secured=bank;
 }
 if(correct===QUIZ.length)return {bank,secured,correct,answered,next:QUIZ.length-1,finished:true,outcome:'won'};
 return {bank,secured,correct,answered,next,finished:state.gameWalked,outcome:state.gameWalked?'walked':null};
}
function renderGameIntro(){
 return `<img class="billionaire-intro-photo" src="./public/lesson-assets/billionaire-intro.jpg" alt="Supplied image of Benjamin Netanyahu, Elon Musk and Donald Trump on an island" width="1168" height="784"><div class="billionaire-intro-shade"></div><div class="billionaire-intro-title"><p>AYMAN &amp; MILO · THE SURVIVAL CHALLENGE</p><h2>Who wants to be<br>a <em>Billionaire?</em></h2></div><div class="billionaire-intro-bottom"><div class="intro-prize">${aipacMark()}<span>Six rounds. One billion<br><strong>Israeli Shekels</strong></span></div><button data-game-start>Continue to the game <span aria-hidden="true">→</span></button></div>`;
}
function gameSidebar(g){
 return `<aside class="game-sidebar" aria-label="Prize ladder"><div class="game-bank">${aipacMark()}<span>GAME WINNINGS</span><strong>${g.bank.toLocaleString('en-GB')}</strong><small>Israeli Shekels</small></div><ol class="prize-ladder" reversed>${GAME_PRIZES.map((prize,i)=>{const a=state.answers[i],hit=a!==null&&a===QUIZ[i].ans;return `<li class="${i===state.question&&!g.finished?'current':''} ${hit?'reached':''} ${i===2?'checkpoint':''}"><span>${i+1}</span><strong>${prize.toLocaleString('en-GB')}</strong><span>${hit?'✓':i===2?'◆':''}</span></li>`}).reverse().join('')}</ol><p class="ladder-units">All prizes in Israeli Shekels<br>Round 3 secures 1,000,000</p><div class="game-host"><img src="./public/lesson-assets/${state.question%2?'netanyahu':'trump'}-pointing.webp" alt="${state.question%2?'Benjamin Netanyahu':'Donald Trump'} pointing toward the audience" width="640" height="853"><span>Final answer?</span></div></aside>`;
}
function renderBillionaire(){
 const g=gameStatus(),q=QUIZ[state.question],pick=state.answers[state.question],locked=pick!==null;
 if(g.finished){
  const won=g.outcome==='won',walked=g.outcome==='walked';
  return `<div class="billionaire-game"> <section class="game-play game-finish"><p class="game-eyebrow">WHO WANTS TO BE A BILLIONAIRE?</p><h2>${won?'You’re a billionaire!':walked?'You walked away.':'Your run ends here.'}</h2><p class="finish-caption">${won?'Six correct answers. Final round reward: +'+shekels(GAME_PRIZES[5]-GAME_PRIZES[4]):walked?'You kept your game winnings.':'The AIPAC prize bank returns to your last secured milestone.'}</p><div class="finish-prize">${aipacMark()}<div><strong>${g.bank.toLocaleString('en-GB')}</strong><span>Israeli Shekels</span></div></div>${won?'<img class="finish-photo" src="./public/lesson-assets/correct-answer-aipac.png" alt="Benjamin Netanyahu giving two thumbs up at AIPAC" width="638" height="480">':''}${g.outcome==='lost'?`<div class="game-explanation"><strong>Correct answer: ${'ABCD'[q.ans]}.</strong> ${esc(q.why)}</div>`:''}<div class="game-end-actions"><button class="gold-button" data-game-reset>Play again</button><button class="game-secondary" data-game-review>Review answers</button><button class="game-secondary" data-game-finish>Continue the lesson →</button></div></section>${gameSidebar(g)}</div>`;
 }
 const reward=GAME_PRIZES[state.question]-(state.question?GAME_PRIZES[state.question-1]:0),selected=state.finalSelection;
 return `<div class="billionaire-game"><section class="game-play"><header class="game-heading"><div><p class="game-eyebrow">WHO WANTS TO BE A BILLIONAIRE?</p><h2>Round ${state.question+1} <span>/ ${QUIZ.length}</span></h2></div><span class="game-host-label">${esc(q.host)} hosts</span></header><div class="round-stakes"><span>ROUND REWARD</span><strong>+${shekels(reward)}</strong></div><h3 class="billionaire-question">${esc(q.q)}</h3><div class="billionaire-options" role="group" aria-label="Choose your final answer">${q.opts.map((o,i)=>{const removed=state.fiftyRound===state.question&&state.fiftyRemoved.includes(i);return `<button data-game-pick="${i}" ${locked||removed?'disabled':''} aria-pressed="${!locked&&selected===i}" class="${!locked&&selected===i?'chosen':''} ${locked&&i===q.ans?'right-answer':''} ${locked&&i===pick&&pick!==q.ans?'wrong-answer':''} ${removed?'eliminated':''}"><b>${'ABCD'[i]}:</b><span>${removed?'Removed by 50:50':esc(o)}</span></button>`}).join('')}</div>${locked?`<div class="game-correct" role="status">${aipacMark()}<div><strong>Correct! +${shekels(reward)}</strong><p>${esc(q.why)}</p></div><img class="round-win-photo" src="./public/lesson-assets/correct-answer-aipac.png" alt="Benjamin Netanyahu giving two thumbs up at AIPAC" width="638" height="480"></div><div class="game-answer-actions"><button class="gold-button" data-game-next>Next round →</button><button class="game-secondary" data-game-walk>Walk away with ${shekels(g.bank)}</button></div>`:`<div class="game-answer-actions"><button class="gold-button" data-game-lock ${selected===null?'disabled':''}>${selected===null?'Choose an answer first':'Lock '+('ABCD'[selected])+' as your final answer'}</button><button class="game-secondary" data-game-walk>Walk away</button></div><div class="game-lifelines"><span>LIFELINES</span><button data-game-fifty ${state.fiftyUsed?'disabled':''}>50:50${state.fiftyUsed?' · used':''}</button><button data-game-class ${state.classUsed?'disabled':''}>Ask the class${state.classUsed?' · used':''}</button><button class="game-text-button" data-game-reset>Restart game</button></div>${state.classRound===state.question?'<p class="class-prompt" role="status">Ask the class: discuss your choice, then support it with a quotation or event from the novel.</p>':'<p class="game-instructions">Choose A, B, C or D, then lock it in. A wrong answer ends the run.</p>'}`}</section>${gameSidebar(g)}</div>`;
}
function selectGameAnswer(answer){
 if(gameStatus().finished||state.answers[state.question]!==null||!Number.isInteger(answer)||answer<0||answer>3)return;
 if(state.fiftyRound===state.question&&state.fiftyRemoved.includes(answer))return;
 state.finalSelection=answer;render();
}
function lockGameAnswer(){
 const g=gameStatus();if(g.finished||state.finalSelection===null||state.answers[state.question]!==null)return;
 state.answers[state.question]=state.finalSelection;state.finalSelection=null;render();
}
function resetBillionaire(){
 state.question=0;state.answers=QUIZ.map(()=>null);state.finalSelection=null;state.gameWalked=false;state.fiftyUsed=false;state.fiftyRound=null;state.fiftyRemoved=[];state.classUsed=false;state.classRound=null;render();
}
function handleGameClick(b){
 if(b.hasAttribute('data-game-start')){go(slides.findIndex(s=>s.type==='quiz'));return true}
 if(b.hasAttribute('data-game-pick')){selectGameAnswer(Number(b.dataset.gamePick));return true}
 if(b.hasAttribute('data-game-lock')){lockGameAnswer();return true}
 if(b.hasAttribute('data-game-reset')){resetBillionaire();return true}
 if(b.hasAttribute('data-game-next')){if(!gameStatus().finished&&state.answers[state.question]===QUIZ[state.question].ans&&state.question<QUIZ.length-1){state.question++;state.finalSelection=null;render()}return true}
 if(b.hasAttribute('data-game-walk')){if(!gameStatus().finished){state.gameWalked=true;state.finalSelection=null;render()}return true}
 if(b.hasAttribute('data-game-fifty')){
  if(!state.fiftyUsed&&state.answers[state.question]===null&&!gameStatus().finished){state.fiftyUsed=true;state.fiftyRound=state.question;state.fiftyRemoved=QUIZ[state.question].opts.map((_,i)=>i).filter(i=>i!==QUIZ[state.question].ans).slice(0,2);if(state.fiftyRemoved.includes(state.finalSelection))state.finalSelection=null;render()}return true;
 }
 if(b.hasAttribute('data-game-class')){if(!state.classUsed&&state.answers[state.question]===null&&!gameStatus().finished){state.classUsed=true;state.classRound=state.question;render()}return true}
 if(b.hasAttribute('data-game-review')){showReview();return true}
 if(b.hasAttribute('data-game-finish')){go(slides.findIndex(s=>s.type==='reading'));return true}
 return false;
}
