(function() {
  // ----- TYPED.JS -----
  const typed = new Typed('#typed-output', {
    strings: ['A special surprise for your 21st birthday...', 'scroll down for memories', 'mini games inside!', 'you are loved 💝'],
    typeSpeed: 60,
    backSpeed: 30,
    loop: true
  });

  // ----- scroll reveal (simple) -----
  const cards = document.querySelectorAll('[data-reveal]');
  function revealOnScroll() {
    cards.forEach(c => {
      const rect = c.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) c.classList.add('reveal');
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // ----- ENTER BUTTON smooth scroll to story -----
  document.getElementById('enterBtn').addEventListener('click', ()=>{
    document.getElementById('story').scrollIntoView({behavior:'smooth'});
  });

  // ---------- GAME 1 : CATCH THE CAKE ----------
  const cakeContainer = document.getElementById('cakeContainer');
  const basket = document.getElementById('basket');
  const cakeScoreSpan = document.getElementById('cakeScore');
  let cakeScore = 0, cakeInterval;
  let game1Active = false;

  document.getElementById('startCatch').addEventListener('click', function() {
    if (game1Active) return;
    game1Active = true; 
    cakeScore = 0; 
    cakeScoreSpan.innerText = '0';
    
    cakeInterval = setInterval(() => {
      const cake = document.createElement('div');
      cake.innerText = '🍰';
      cake.className = 'falling-cake';
      cake.style.left = Math.random() * (cakeContainer.offsetWidth - 30) + 'px';
      cake.style.fontSize = '2rem';
      cake.dataset.fall = 0;
      cakeContainer.appendChild(cake);
    }, 700);

    // falling movement
    const fallInterval = setInterval(() => {
      document.querySelectorAll('.falling-cake').forEach(c => {
        let top = parseFloat(c.style.top || 0);
        top += 4;
        c.style.top = top + 'px';
        if (top > cakeContainer.offsetHeight - 30) {
          c.remove();
        }
        // collision with basket (rough)
        const basketRect = basket.getBoundingClientRect();
        const cakeRect = c.getBoundingClientRect();
        if (basketRect && cakeRect) {
          if (cakeRect.bottom >= basketRect.top && cakeRect.right > basketRect.left && cakeRect.left < basketRect.right) {
            c.remove();
            cakeScore++;
            cakeScoreSpan.innerText = cakeScore;
            if (cakeScore >= 10) { // win condition
              if (confirm('🎉 you won cake game! proceed to final?')) {
                checkAllGamesCompleted();
              }
            }
          }
        }
      });
    }, 70);

    // stop after 20 seconds or manually
    setTimeout(() => { 
      clearInterval(cakeInterval); 
      clearInterval(fallInterval); 
      game1Active = false; 
    }, 20000);
  });

  // ----- GAME 2 : POP BALLOONS -----
  const balloonField = document.getElementById('balloonField');
  const balloonScoreSpan = document.getElementById('balloonScore');
  let balloonScore = 0, balloonInterval;

  document.getElementById('startBalloons').addEventListener('click', ()=>{
    balloonScore = 0; 
    balloonScoreSpan.innerText = '0';
    if (balloonInterval) clearInterval(balloonInterval);
    balloonField.innerHTML = '';
    
    balloonInterval = setInterval(() => {
      const b = document.createElement('div');
      b.innerText = '🎈';
      b.className = 'balloon';
      b.style.left = Math.random() * (balloonField.offsetWidth-40) + 'px';
      b.style.bottom = '0px';
      b.dataset.vy = 1 + Math.random() * 2;
      balloonField.appendChild(b);
    }, 600);

    const moveBalloons = setInterval(() => {
      document.querySelectorAll('.balloon').forEach(b => {
        let bottom = parseFloat(b.style.bottom) || 0;
        bottom += parseFloat(b.dataset.vy || 1);
        b.style.bottom = bottom + 'px';
        if (bottom > 200) b.remove();
      });
    }, 50);

    balloonField.addEventListener('click', (e) => {
      if (e.target.classList.contains('balloon')) {
        e.target.remove();
        balloonScore++;
        balloonScoreSpan.innerText = balloonScore;
        if (balloonScore >= 8) {
          if (confirm('🎈 balloons popped! go to celebration?')) checkAllGamesCompleted();
        }
      }
    });

    setTimeout(() => { 
      clearInterval(balloonInterval); 
      clearInterval(moveBalloons); 
    }, 15000);
  });

  // ----- GAME 3 : MEMORY MATCH (simplified birthday pairs) -----
  const memoryBoard = document.getElementById('memoryBoard');
  const attemptsSpan = document.getElementById('attempts');
  let memoryCards = ['🎂','🎁','🎈','🧁','🎂','🎁','🎈','🧁'];
  let flipped = [], matched = [], attempts = 0, lock = false;

  function renderMemory() {
    memoryBoard.innerHTML = '';
    memoryCards.forEach((emoji, idx) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      if (matched.includes(idx)) card.classList.add('matched');
      card.dataset.index = idx;
      card.dataset.emoji = emoji;
      card.innerText = matched.includes(idx) ? emoji : '?';
      card.addEventListener('click', onMemoryClick);
      memoryBoard.appendChild(card);
    });
  }
  
  function onMemoryClick(e) {
    if (lock) return;
    const card = e.currentTarget;
    const idx = parseInt(card.dataset.index);
    if (matched.includes(idx) || flipped.includes(idx) || card.classList.contains('matched')) return;
    card.innerText = card.dataset.emoji;
    card.classList.add('flipped');
    flipped.push(idx);
    
    if (flipped.length === 2) {
      lock = true;
      attempts++;
      attemptsSpan.innerText = attempts;
      const [i1, i2] = flipped;
      if (memoryCards[i1] === memoryCards[i2] && i1 !== i2) {
        matched.push(i1, i2);
        document.querySelectorAll('.memory-card').forEach(c => {
          if (c.dataset.index == i1 || c.dataset.index == i2) {
            c.classList.add('matched');
            c.classList.remove('flipped');
          }
        });
        flipped = [];
        lock = false;
        if (matched.length === memoryCards.length) {
          if (confirm('🧠 memory complete! final section?')) checkAllGamesCompleted();
        }
      } else {
        setTimeout(() => {
          document.querySelectorAll('.memory-card.flipped').forEach(c => {
            c.innerText = '?';
            c.classList.remove('flipped');
          });
          flipped = [];
          lock = false;
        }, 800);
      }
    }
  }
  
  document.getElementById('resetMemory').addEventListener('click', ()=>{
    memoryCards.sort(()=> Math.random() - 0.5);
    matched = []; 
    flipped = []; 
    attempts = 0;
    attemptsSpan.innerText = '0';
    renderMemory();
  });
  
  renderMemory();

  // ----- FINAL CELEBRATION condition + confetti -----
  function checkAllGamesCompleted() {
    document.getElementById('final').classList.remove('hidden');
    document.getElementById('final').scrollIntoView({behavior:'smooth'});
    const burstSound = new Audio('confetti.mp3');
    burstSound.play().catch(e => console.error('Error playing burst sound:', e));
    confetti({particleCount:150, spread:80, origin:{y:0.6}});
    confetti({particleCount:100, spread:130, origin:{y:0.5, x:0.2}, colors:['#bb0760','#bf7c47','#e67e97']});
  }

  document.getElementById('confettiBtn').addEventListener('click', ()=>{
    const burstSound = new Audio('confetti.mp3');
    burstSound.play().catch(e => console.error('Error playing burst sound:', e));
    confetti({particleCount:200, spread:100, origin:{y:0.6}});
  });
  
  document.getElementById('playMusicBtn').addEventListener('click', ()=>{
    const audio = new Audio('birthday.mp3');
    audio.play().catch(e => console.error('Error playing audio:', e));
  });

  // basket move with mouse/touch
  const gameAreaCatch = document.getElementById('gameCatch');
  gameAreaCatch.addEventListener('mousemove', (e) => {
    const rect = gameAreaCatch.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.min(rect.width-70, Math.max(0, x-35));
    basket.style.transform = `translateX(${x}px)`;
  });
  
  gameAreaCatch.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = gameAreaCatch.getBoundingClientRect();
    let x = e.touches[0].clientX - rect.left;
    x = Math.min(rect.width-70, Math.max(0, x-35));
    basket.style.transform = `translateX(${x}px)`;
  });
})();