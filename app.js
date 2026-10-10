/**
 * CHICHESTER JAMIA CENTRE — FUNDRAISING & AWARENESS APP
 * Registered UK Charity No. 1148130
 * GoFundMe: https://www.gofundme.com/f/chichester-mosque
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------
  // 1. Initial State & Currency Conversion Rates (Base: GBP £)
  // ------------------------------------------------------------------
  const currencyRates = {
    GBP: { symbol: '£', code: 'GBP', rate: 1.0 },
    USD: { symbol: '$', code: 'USD', rate: 1.30 },
    EUR: { symbol: '€', code: 'EUR', rate: 1.18 },
    SAR: { symbol: '﷼', code: 'SAR', rate: 4.88 },
    AED: { symbol: 'د.إ', code: 'AED', rate: 4.77 }
  };

  let activeCurrency = 'GBP';
  let speechEnabled = false;

  let campaignState = {
    targetGBP: 580000,
    raisedGBP: 324850,
    donors: 542,
    totalBricks: 5800,
    brickCostGBP: 100
  };

  // ------------------------------------------------------------------
  // 2. UI Elements
  // ------------------------------------------------------------------
  const raisedDisplay = document.getElementById('raisedDisplay');
  const targetDisplay = document.getElementById('targetDisplay');
  const percentDisplay = document.getElementById('percentDisplay');
  const progressBarFill = document.getElementById('progressBarFill');
  const donorCount = document.getElementById('donorCount');
  const remainingDisplay = document.getElementById('remainingDisplay');
  const bricksFundedHeader = document.getElementById('bricksFundedHeader');
  const brickFundedCount = document.getElementById('brickFundedCount');
  const brickRemainingCount = document.getElementById('brickRemainingCount');
  const currencySelect = document.getElementById('currencySelect');
  const currSymbol = document.getElementById('currSymbol');
  const currCode = document.getElementById('currCode');

  // Form elements
  const donationForm = document.getElementById('donationForm');
  const customAmountInput = document.getElementById('customAmountInput');
  const giftAidCheck = document.getElementById('giftAidCheck');
  const gaBaseDisplay = document.getElementById('gaBaseDisplay');
  const gaTotalDisplay = document.getElementById('gaTotalDisplay');
  const btnPayAmount = document.getElementById('btnPayAmount');
  const donorName = document.getElementById('donorName');
  const donorEmail = document.getElementById('donorEmail');
  const donorNotes = document.getElementById('donorNotes');

  // Brick Counter
  const brickCountInput = document.getElementById('brickCountInput');
  const btnBrickMinus = document.getElementById('btnBrickMinus');
  const btnBrickPlus = document.getElementById('btnBrickPlus');
  const brickTotalCost = document.getElementById('brickTotalCost');
  const brickCountText = document.getElementById('brickCountText');
  const btnSponsorBricks = document.getElementById('btnSponsorBricks');

  // Modals
  const paymentModal = document.getElementById('paymentModal');
  const closePaymentModal = document.getElementById('closePaymentModal');
  const paymentModalContent = document.getElementById('paymentModalContent');
  const certificateModal = document.getElementById('certificateModal');
  const closeCertModal = document.getElementById('closeCertModal');
  const btnCloseCertAction = document.getElementById('btnCloseCertAction');
  const btnPrintCert = document.getElementById('btnPrintCert');

  // ------------------------------------------------------------------
  // 3. Dark / Light Theme Toggle & Persistence
  // ------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('cjc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('cjc_theme', nextTheme);
      showToast(`Switched to ${nextTheme === 'dark' ? 'Midnight Emerald' : 'Royal Pearl'} theme`);
    });
  }

  // ------------------------------------------------------------------
  // 4. Multi-Currency Conversion Handler
  // ------------------------------------------------------------------
  function updateCurrencyDisplay() {
    const cur = currencyRates[activeCurrency];
    if (currSymbol) currSymbol.textContent = cur.symbol;
    if (currCode) currCode.textContent = cur.code;
    
    document.querySelectorAll('.currency-label-text').forEach(el => {
      el.textContent = `${cur.code} ${cur.symbol}`;
    });

    updateCampaignUI();
    updateGiftAidCalculation();
    updateBrickCalculator();
    updateImpactCalculation(document.getElementById('impactRangeSlider')?.value || 250);
  }

  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      activeCurrency = e.target.value;
      updateCurrencyDisplay();
      showToast(`Currency changed to ${activeCurrency}`);
    });
  }

  // ------------------------------------------------------------------
  // 5. Update Campaign Progress UI
  // ------------------------------------------------------------------
  function updateCampaignUI() {
    const raisedConverted = campaignState.raisedGBP * currencyRates[activeCurrency].rate;
    const targetConverted = campaignState.targetGBP * currencyRates[activeCurrency].rate;
    const remainingGBP = campaignState.targetGBP - campaignState.raisedGBP;
    const remainingConverted = remainingGBP * currencyRates[activeCurrency].rate;

    const percent = ((campaignState.raisedGBP / campaignState.targetGBP) * 100).toFixed(1);
    const bricksFunded = Math.floor(campaignState.raisedGBP / campaignState.brickCostGBP);
    const bricksRemaining = campaignState.totalBricks - bricksFunded;

    const sym = currencyRates[activeCurrency].symbol;

    if (raisedDisplay) raisedDisplay.textContent = `${sym}${Math.round(raisedConverted).toLocaleString()}`;
    if (targetDisplay) targetDisplay.textContent = `${sym}${Math.round(targetConverted).toLocaleString()}`;
    if (percentDisplay) percentDisplay.textContent = `${percent}%`;
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    if (donorCount) donorCount.textContent = campaignState.donors.toLocaleString();
    if (remainingDisplay) remainingDisplay.textContent = `${sym}${Math.round(remainingConverted).toLocaleString()}`;
    if (bricksFundedHeader) bricksFundedHeader.textContent = bricksFunded.toLocaleString();
    if (brickFundedCount) brickFundedCount.textContent = `${bricksFunded.toLocaleString()} Bricks`;
    if (brickRemainingCount) brickRemainingCount.textContent = `${bricksRemaining.toLocaleString()} Bricks`;
  }

  updateCampaignUI();

  // ------------------------------------------------------------------
  // 6. Gift Aid & Amount Sync
  // ------------------------------------------------------------------
  function updateGiftAidCalculation() {
    let amount = parseFloat(customAmountInput.value) || 0;
    if (amount < 0) amount = 0;
    const sym = currencyRates[activeCurrency].symbol;

    if (gaBaseDisplay) gaBaseDisplay.textContent = `${sym}${amount.toFixed(2)}`;
    
    if (giftAidCheck && giftAidCheck.checked && activeCurrency === 'GBP') {
      const boosted = amount * 1.25;
      if (gaTotalDisplay) gaTotalDisplay.textContent = `${sym}${boosted.toFixed(2)}`;
    } else {
      if (gaTotalDisplay) gaTotalDisplay.textContent = `${sym}${amount.toFixed(2)}`;
    }

    if (btnPayAmount) btnPayAmount.textContent = `${sym}${amount.toFixed(2)}`;
  }

  if (customAmountInput) customAmountInput.addEventListener('input', updateGiftAidCalculation);
  if (giftAidCheck) giftAidCheck.addEventListener('change', updateGiftAidCalculation);

  // Preset buttons
  document.querySelectorAll('.preset-btn, .amount-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn, .amount-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-amount') || btn.getAttribute('data-val');
      if (customAmountInput && val) {
        const valConverted = Math.round(parseFloat(val) * currencyRates[activeCurrency].rate);
        customAmountInput.value = valConverted;
        updateGiftAidCalculation();
      }
    });
  });

  // Category Radio Selection
  document.querySelectorAll('.cat-radio-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.cat-radio-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Payment method selection
  document.querySelectorAll('.pay-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        if (radio.value === 'gofundme') {
          showToast('Opening GoFundMe page...');
          setTimeout(() => {
            window.open('https://www.gofundme.com/f/chichester-mosque', '_blank');
          }, 400);
        }
      }
    });
  });

  // ------------------------------------------------------------------
  // 7. Interactive Visual "Wall of Bricks" Builder
  // ------------------------------------------------------------------
  const brickGridContainer = document.getElementById('brickGridContainer');
  const brickSelectionStatus = document.getElementById('brickSelectionStatus');
  const bbActionCost = document.getElementById('bbActionCost');
  const btnConfirmBrickSponsor = document.getElementById('btnConfirmBrickSponsor');
  const brickInscribeName = document.getElementById('brickInscribeName');

  const sampleDonors = [
    "Dr. Bilal & Family", "Br. Yusuf Al-Hassan", "Sister Amina", "NHS Staff Chichester",
    "Anonymous Supporter", "Farooq & Zainab", "Tariq Mahmood", "Hassan Family",
    "Uni of Chichester MSA", "Brother Imran", "Khadija Begum", "Ahmed & Mariam",
    "Rashid Brothers", "Chichester Community", "Al-Qasim Family", "Sadaqah Jariyah"
  ];

  let selectedBrickCount = 1;

  function initBrickWall() {
    if (!brickGridContainer) return;
    brickGridContainer.innerHTML = '';

    const totalSampleBricks = 64;
    for (let i = 1; i <= totalSampleBricks; i++) {
      const brick = document.createElement('div');
      brick.className = 'brick-unit';

      if (i <= 44) {
        brick.classList.add('funded');
        const donorName = sampleDonors[i % sampleDonors.length];
        brick.innerHTML = `<span>#${i}</span><small style="font-size:0.55rem; opacity:0.8;">Funded</small>`;
        brick.title = `Brick #${i} — Funded by ${donorName}`;
      } else if (i === 45) {
        brick.classList.add('selected');
        brick.innerHTML = `<span>#${i}</span><small style="font-size:0.55rem; color:#fff;">Selected</small>`;
        brick.title = `Brick #${i} — Currently Selected for You!`;
      } else {
        brick.classList.add('available');
        brick.innerHTML = `<span>#${i}</span><small style="font-size:0.55rem;">£100</small>`;
        brick.title = `Brick #${i} — Available! Click to sponsor.`;
      }

      brick.addEventListener('click', () => {
        if (brick.classList.contains('funded')) {
          showToast(`Brick #${i} is already funded. Please pick an available brick.`);
          return;
        }

        brick.classList.toggle('selected');
        if (brick.classList.contains('selected')) {
          brick.querySelector('small').textContent = 'Selected';
        } else {
          brick.querySelector('small').textContent = '£100';
        }

        const selectedCount = brickGridContainer.querySelectorAll('.brick-unit.selected').length || 1;
        selectedBrickCount = selectedCount;
        updateBrickWallStatus();
      });

      brickGridContainer.appendChild(brick);
    }

    updateBrickWallStatus();
  }

  function updateBrickWallStatus() {
    const totalGBP = selectedBrickCount * 100;
    const totalConverted = Math.round(totalGBP * currencyRates[activeCurrency].rate);
    const sym = currencyRates[activeCurrency].symbol;

    if (brickSelectionStatus) {
      brickSelectionStatus.innerHTML = `<span>Selected: <strong>${selectedBrickCount} Brick${selectedBrickCount > 1 ? 's' : ''} (${sym}${totalConverted})</strong></span>`;
    }
    if (bbActionCost) bbActionCost.textContent = `${sym}${totalConverted}`;
  }

  if (btnConfirmBrickSponsor) {
    btnConfirmBrickSponsor.addEventListener('click', () => {
      const totalGBP = selectedBrickCount * 100;
      const totalConverted = Math.round(totalGBP * currencyRates[activeCurrency].rate);

      if (customAmountInput) {
        customAmountInput.value = totalConverted;
        updateGiftAidCalculation();
      }

      const brickRadio = document.querySelector('input[name="purpose"][value="Buy a Brick (£100)"]');
      if (brickRadio) {
        brickRadio.checked = true;
        document.querySelectorAll('.cat-radio-card').forEach(c => c.classList.remove('active'));
        if (brickRadio.closest('.cat-radio-card')) {
          brickRadio.closest('.cat-radio-card').classList.add('active');
        }
      }

      const inscribeText = brickInscribeName?.value.trim();
      if (inscribeText && donorNotes) {
        donorNotes.value = `Brick Inscription: "${inscribeText}"`;
      }

      document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Selected ${selectedBrickCount} Brick(s) (${currencyRates[activeCurrency].symbol}${totalConverted}). Form updated.`);
    });
  }

  initBrickWall();

  // ------------------------------------------------------------------
  // 8. Interactive Sadaqah Jariyah Impact Slider
  // ------------------------------------------------------------------
  const impactRangeSlider = document.getElementById('impactRangeSlider');
  const impactAmountValue = document.getElementById('impactAmountValue');
  const impactResultCards = document.getElementById('impactResultCards');
  const btnApplyImpactToDonate = document.getElementById('btnApplyImpactToDonate');
  const btnImpactAmountText = document.getElementById('btnImpactAmountText');

  function updateImpactCalculation(amountGBP) {
    const amt = parseInt(amountGBP) || 250;
    const rate = currencyRates[activeCurrency].rate;
    const sym = currencyRates[activeCurrency].symbol;
    const converted = Math.round(amt * rate);

    if (impactAmountValue) impactAmountValue.textContent = `${sym}${converted.toLocaleString()}`;
    if (btnImpactAmountText) btnImpactAmountText.textContent = `${sym}${converted.toLocaleString()}`;

    const bricks = (amt / 100).toFixed(1);
    const prayerSpaceShare = Math.min(100, Math.round((amt / 500) * 100));
    const carpetSqMeters = (amt / 45).toFixed(1);
    const quranCopies = Math.round(amt / 10);
    const sujoodReward = (amt * 120).toLocaleString();

    if (impactResultCards) {
      impactResultCards.innerHTML = `
        <div class="impact-item-card">
          <div class="iic-icon">🧱</div>
          <div class="iic-info">
            <strong>${bricks} Foundation Bricks</strong>
            <p>Directly builds the structural exterior and interior walls of Chichester's 1st Masjid.</p>
          </div>
        </div>

        <div class="impact-item-card">
          <div class="iic-icon">🕌</div>
          <div class="iic-info">
            <strong>${prayerSpaceShare}% of a Dedicated Musalla</strong>
            <p>Funds permanent prayer space for brothers and sisters during 5 daily and Friday Jumu'ah prayers.</p>
          </div>
        </div>

        <div class="impact-item-card">
          <div class="iic-icon">✨</div>
          <div class="iic-info">
            <strong>${sujoodReward}+ Prostrations (Sujood)</strong>
            <p>Every worshiper touching their forehead to the prayer hall carpet shares in your eternal reward.</p>
          </div>
        </div>

        <div class="impact-item-card">
          <div class="iic-icon">📖</div>
          <div class="iic-info">
            <strong>${quranCopies} Madrasa Children's Resources</strong>
            <p>Equips weekend Quranic school students with Tajweed books, Arabic alphabets, and study kits.</p>
          </div>
        </div>
      `;
    }
  }

  if (impactRangeSlider) {
    impactRangeSlider.addEventListener('input', (e) => {
      updateImpactCalculation(e.target.value);
    });
    updateImpactCalculation(impactRangeSlider.value);
  }

  if (btnApplyImpactToDonate) {
    btnApplyImpactToDonate.addEventListener('click', () => {
      const amtGBP = parseInt(impactRangeSlider?.value) || 250;
      const converted = Math.round(amtGBP * currencyRates[activeCurrency].rate);

      if (customAmountInput) {
        customAmountInput.value = converted;
        updateGiftAidCalculation();
      }

      document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Pledge of ${currencyRates[activeCurrency].symbol}${converted} loaded into donation form.`);
    });
  }

  // ------------------------------------------------------------------
  // 9. Interactive Floor Plan Explorer (With 3D Isometric View)
  // ------------------------------------------------------------------
  const floorData = {
    isometric: {
      title: "3D Isometric Overview — Full Mosque & Community Centre",
      desc: "Complete architectural cutaway of Chichester Jamia Centre. Featuring the ground floor main prayer hall, ablution areas, upper floor educational library and Madrasa classrooms, solar green roof, minaret, and central courtyard.",
      image: "assets/isometric.jpg",
      specs: [
        "🏛 Complete 2-Story Comprehensive Mosque & Community Complex",
        "🕌 Ground Floor Prayer Sanctuary for 200+ Worshipers",
        "🧕 Separate First Floor Dedicated Sister's Sanctuary",
        "📚 3 State-of-the-Art Madrasa Classrooms & Reference Library",
        "☀️ Eco-Friendly Solar Panels & Green Roof Design"
      ]
    },
    ground: {
      title: "Ground Floor — Main Prayer Sanctuary & Wudu",
      desc: "Spacious climate-controlled main prayer hall accommodating over 200 worshipers for daily & Friday Jumu'ah prayers, featuring acoustic sound proofing and high-capacity modern wudu facilities.",
      image: "assets/prayer_hall.jpg",
      specs: [
        "🕌 Main Prayer Capacity: 200+ Worshipers",
        "💧 High-capacity Men's Wudu & Washrooms",
        "♿ Wheelchair Accessible Ramp & Barrier-free Entrance",
        "📜 Mihrab Wall with Hand-crafted Islamic Calligraphy"
      ]
    },
    first: {
      title: "First Floor — Dedicated Sister's Sanctuary & Creche",
      desc: "A private, serene, and comfortable prayer sanctuary dedicated exclusively for Sisters, complete with private wudu area, audio-visual link to Khutbah, and a mother-child creche space.",
      image: "assets/building.jpg",
      specs: [
        "🧕 Sister's Prayer Capacity: 100+ Worshipers",
        "💧 Private Sister's Wudu Facilities",
        "🧸 Mother & Child Creche Room",
        "📺 High-definition Audio-Visual Link to Imams"
      ]
    },
    annexe: {
      title: "Community Annexe — Madrasa, Library & Food Bank",
      desc: "A multi-purpose educational wing dedicated to Quranic weekend schools for children, adult Islamic history lectures, community food distribution drives, and interfaith receptions.",
      image: "assets/community.jpg",
      specs: [
        "📚 Children's Quranic Weekend School (Madrasa)",
        "💻 Islamic Reference Library & Digital Resource Hub",
        "📦 Community Food Bank Storage & Relief Center",
        "🤝 Inter-faith Dialogue Lounge & Visitor Desk"
      ]
    }
  };

  const floorDisplay = document.getElementById('floorDisplay');

  function renderFloorPlan(floorKey) {
    if (!floorDisplay || !floorData[floorKey]) return;
    const data = floorData[floorKey];
    floorDisplay.innerHTML = `
      <div class="floor-plan-view">
        <div class="fp-image-wrap">
          <img src="${data.image}" alt="${data.title}">
        </div>
        <div class="fp-info">
          <h3>${data.title}</h3>
          <p>${data.desc}</p>
          <ul class="fp-specs-list">
            ${data.specs.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  renderFloorPlan('isometric');

  document.querySelectorAll('.floor-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.floor-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const floorKey = tab.getAttribute('data-floor');
      renderFloorPlan(floorKey);
    });
  });

  // ------------------------------------------------------------------
  // 10. Printable Digital Certificate Generator
  // ------------------------------------------------------------------
  function openCertificate(donorData) {
    if (!certificateModal) return;
    const certDonorName = document.getElementById('certDonorName');
    const certAmountDisplay = document.getElementById('certAmountDisplay');
    const certPurposeDisplay = document.getElementById('certPurposeDisplay');
    const certRefDisplay = document.getElementById('certRefDisplay');
    const certDateDisplay = document.getElementById('certDateDisplay');

    if (certDonorName) certDonorName.textContent = donorData.name || "Generous Supporter";
    if (certAmountDisplay) certAmountDisplay.textContent = donorData.amountFormatted || "£100.00";
    if (certPurposeDisplay) certPurposeDisplay.textContent = donorData.purpose || "Masjid Foundation Brick";
    if (certRefDisplay) certRefDisplay.textContent = donorData.ref || "CJC-894201";
    if (certDateDisplay) certDateDisplay.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    certificateModal.classList.add('active');
  }

  if (closeCertModal) closeCertModal.addEventListener('click', () => certificateModal.classList.remove('active'));
  if (btnCloseCertAction) btnCloseCertAction.addEventListener('click', () => certificateModal.classList.remove('active'));
  if (btnPrintCert) btnPrintCert.addEventListener('click', () => window.print());

  document.getElementById('btnOpenCertBlank')?.addEventListener('click', () => {
    openCertificate({
      name: "Generous Supporter of Chichester",
      amountFormatted: `${currencyRates[activeCurrency].symbol}100.00`,
      purpose: "Masjid Foundation Brick",
      ref: "CJC-" + Math.floor(100000 + Math.random() * 900000)
    });
  });

  // ------------------------------------------------------------------
  // 11. Next Jumu'ah Countdown Timer
  // ------------------------------------------------------------------
  function updateJumuahCountdown() {
    const timerElem = document.getElementById('nextJumuahTimer');
    if (!timerElem) return;

    const now = new Date();
    const nextFriday = new Date();
    
    // Day 5 is Friday
    const dayOfWeek = now.getDay();
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    
    // If today is Friday but after 1:45 PM, target next Friday
    if (dayOfWeek === 5 && (now.getHours() > 13 || (now.getHours() === 13 && now.getMinutes() >= 45))) {
      daysUntilFriday = 7;
    }

    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(13, 15, 0, 0); // 1:15 PM Khutbah

    const diff = nextFriday - now;
    if (diff <= 0) {
      timerElem.textContent = "Khutbah Live Today (1:15 PM)";
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);

    timerElem.textContent = `${d}d ${h}h ${m}m until Jumu'ah (1:15 PM)`;
  }

  setInterval(updateJumuahCountdown, 60000);
  updateJumuahCountdown();

  // ------------------------------------------------------------------
  // 12. Audio Quranic Recitation Player
  // ------------------------------------------------------------------
  const btnPlayAudio = document.getElementById('btnPlayAudio');
  const quranAudio = document.getElementById('quranAudio');

  if (btnPlayAudio && quranAudio) {
    const playIcon = btnPlayAudio.querySelector('.play-icon');
    const pauseIcon = btnPlayAudio.querySelector('.pause-icon');

    btnPlayAudio.addEventListener('click', () => {
      if (quranAudio.paused) {
        quranAudio.play();
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        showToast('Playing Surah Al-Baqarah (2:261) recitation...');
      } else {
        quranAudio.pause();
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
      }
    });

    quranAudio.addEventListener('ended', () => {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    });
  }

  // ------------------------------------------------------------------
  // 13. AI CHATBOT KNOWLEDGE ENGINE ("Jamia Assistant 2.0")
  // ------------------------------------------------------------------
  const aiChatTriggerBtn = document.getElementById('aiChatTriggerBtn');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const closeAiChatBtn = document.getElementById('closeAiChatBtn');
  const aiChatMessages = document.getElementById('aiChatMessages');
  const aiChatForm = document.getElementById('aiChatForm');
  const aiChatInput = document.getElementById('aiChatInput');
  const toggleSpeechBtn = document.getElementById('toggleSpeechBtn');

  function openAiChat() {
    if (aiChatWindow) aiChatWindow.classList.add('active');
  }

  function closeAiChat() {
    if (aiChatWindow) aiChatWindow.classList.remove('active');
  }

  if (aiChatTriggerBtn) aiChatTriggerBtn.addEventListener('click', () => {
    if (aiChatWindow.classList.contains('active')) closeAiChat();
    else openAiChat();
  });

  if (closeAiChatBtn) closeAiChatBtn.addEventListener('click', closeAiChat);
  document.getElementById('triggerAiChatHero')?.addEventListener('click', openAiChat);
  document.getElementById('openAiChatbotBtnMobile')?.addEventListener('click', () => {
    document.getElementById('mobileMenuDrawer')?.classList.remove('active');
    openAiChat();
  });
  document.getElementById('triggerAiChatMobileSticky')?.addEventListener('click', openAiChat);

  // Sound Synth Helper
  function playSoftChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
  }

  if (toggleSpeechBtn) {
    toggleSpeechBtn.addEventListener('click', () => {
      speechEnabled = !speechEnabled;
      toggleSpeechBtn.textContent = speechEnabled ? '🔊' : '🔇';
      showToast(speechEnabled ? 'AI Voice Speech Enabled' : 'AI Voice Speech Muted');
    });
  }

  function speakTextAloud(text) {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch(e) {}
  }

  function getAiResponse(userQuery) {
    const query = userQuery.toLowerCase();

    if (query.includes('bank') || query.includes('sort code') || query.includes('lloyds') || query.includes('account number')) {
      return `
        <p><strong>🏦 Official Lloyds Bank Transfer Details:</strong></p>
        <p>• <strong>Bank:</strong> Lloyds Bank<br>
        • <strong>Sort Code:</strong> <span style="color:var(--accent-gold); font-weight:800;">30-99-50</span><br>
        • <strong>Account No:</strong> <span style="color:var(--accent-gold); font-weight:800;">34785863</span><br>
        • <strong>Account Name:</strong> Chichester Jamia Centre<br>
        • <strong>Reference:</strong> MASJID</p>
        <p>Direct bank transfers have 0% processing fees!</p>
        <button class="btn btn-sm btn-gold mt-2" onclick="navigator.clipboard.writeText('Sort Code: 30-99-50 | Account: 34785863 | Bank: Lloyds Bank')">Copy Bank Info</button>
      `;
    }

    if (query.includes('gofundme') || query.includes('go fund me') || query.includes('link')) {
      return `
        <p>❤️ <strong>Official GoFundMe Appeal Page:</strong></p>
        <p>You can donate directly through GoFundMe at:<br>
        <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" style="color:var(--gofundme-green); font-weight:800;">gofundme.com/f/chichester-mosque</a></p>
        <p>All donations go directly to Chichester Jamia Centre for property purchase & refurbishment.</p>
        <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" class="btn btn-sm btn-gofundme mt-2">Open GoFundMe ↗</a>
      `;
    }

    if (query.includes('brick') || query.includes('builder') || query.includes('wall')) {
      return `
        <p>🧱 <strong>Interactive Brick Builder Wall:</strong></p>
        <p>You can visually click on any available brick on our interactive wall in the <strong>"Brick Builder"</strong> section to sponsor it for <strong>£100</strong>.</p>
        <p>You can also inscribe your family or loved one's name as an eternal Sadaqah Jariyah.</p>
        <a href="#brick-builder" class="btn btn-sm btn-gold mt-2" onclick="document.getElementById('aiChatWindow').classList.remove('active')">Go to Brick Builder</a>
      `;
    }

    if (query.includes('target') || query.includes('580') || query.includes('breakdown')) {
      return `
        <p>🎯 <strong>Fundraising Target Breakdown (£580,000):</strong></p>
        <p>• <strong>£420,000 (72.4%):</strong> Freehold Property Purchase<br>
        • <strong>£95,000 (16.4%):</strong> Refurbishment & Wudu Area<br>
        • <strong>£35,000 (6.0%):</strong> Planning & Legal Fees<br>
        • <strong>£30,000 (5.2%):</strong> Operational Reserves</p>
        <p>So far we have raised over <strong>£324,850 (56.0%)</strong>!</p>
      `;
    }

    if (query.includes('prayer') || query.includes('jumuah') || query.includes('qibla')) {
      return `
        <p>🕌 <strong>Chichester Prayers & Qibla Direction:</strong></p>
        <p>• <strong>Fajr:</strong> 05:32 AM | <strong>Dhuhr:</strong> 01:02 PM<br>
        • <strong>Asr:</strong> 04:18 PM | <strong>Maghrib:</strong> 06:46 PM<br>
        • <strong>Isha:</strong> 08:15 PM<br>
        • <strong>Qibla:</strong> 119.2° ESE towards Makkah.<br>
        Friday Jumu'ah Khutbah starts at 01:15 PM.</p>
      `;
    }

    if (query.includes('certificate') || query.includes('receipt')) {
      return `
        <p>📜 <strong>Official Sadaqah Jariyah Certificate:</strong></p>
        <p>Every donation comes with an official digital certificate of appreciation and tax receipt from Chichester Jamia Centre (Charity No: 1148130).</p>
        <button class="btn btn-sm btn-gold mt-2" onclick="document.getElementById('btnOpenCertBlank').click()">View Sample Certificate</button>
      `;
    }

    return `
      <p>Assalamu Alaikum! Chichester Jamia Centre (Charity No. 1148130) is establishing the first permanent Masjid in Chichester, UK.</p>
      <p>You can donate via <strong>GoFundMe</strong>, <strong>Bank Transfer (30-99-50 / 34785863)</strong>, or our <strong>Interactive Brick Wall</strong>.</p>
      <p>How else may I help you?</p>
    `;
  }

  function appendChatMessage(sender, text) {
    if (!aiChatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${sender}`;
    msgDiv.innerHTML = `
      <div class="ai-msg-bubble">${text}</div>
      <span class="ai-msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    aiChatMessages.appendChild(msgDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    if (sender === 'bot') {
      speakTextAloud(text);
      playSoftChime();
    }
  }

  if (aiChatForm) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userText = aiChatInput.value.trim();
      if (!userText) return;

      appendChatMessage('user', userText);
      aiChatInput.value = '';
      playSoftChime();

      setTimeout(() => {
        const botReply = getAiResponse(userText);
        appendChatMessage('bot', botReply);
      }, 500);
    });
  }

  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        appendChatMessage('user', query);
        playSoftChime();
        setTimeout(() => {
          const botReply = getAiResponse(query);
          appendChatMessage('bot', botReply);
        }, 500);
      }
    });
  });

  // ------------------------------------------------------------------
  // 14. Circular Back To Top Button With Progress Ring
  // ------------------------------------------------------------------
  const backToTopBtn = document.getElementById('backToTopBtn');
  const progressCircle = document.querySelector('.progress-ring-circle');
  const circumference = 2 * Math.PI * 20; // r=20 -> ~125.66

  if (progressCircle) {
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;
  }

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

    if (progressCircle) {
      const offset = circumference - (scrollPercent * circumference);
      progressCircle.style.strokeDashoffset = offset;
    }

    if (backToTopBtn) {
      if (scrollTop > 350) backToTopBtn.classList.add('visible');
      else backToTopBtn.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------
  // 15. Donation Form Submission & Success Receipt Modal
  // ------------------------------------------------------------------
  if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const payMethod = document.querySelector('input[name="paymethod"]:checked')?.value;
      if (payMethod === 'gofundme') {
        window.open('https://www.gofundme.com/f/chichester-mosque', '_blank');
        return;
      }

      const name = donorName.value.trim() || 'Anonymous Supporter';
      const amount = parseFloat(customAmountInput.value) || 100;
      const purpose = document.querySelector('input[name="purpose"]:checked')?.value || 'Masjid Property Fund';
      const isGiftAid = giftAidCheck.checked;
      const notes = donorNotes.value.trim();
      const sym = currencyRates[activeCurrency].symbol;

      paymentModalContent.innerHTML = `
        <div class="spinner-ring"></div>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--text-dark); margin-bottom: 8px;">Processing Your Sadaqah...</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Securing your contribution of <strong>${sym}${amount.toFixed(2)}</strong> for Chichester Jamia Centre.</p>
      `;
      paymentModal.classList.add('active');

      setTimeout(() => {
        const refId = 'CJC-' + Math.floor(100000 + Math.random() * 900000);
        const amountGBP = amount / currencyRates[activeCurrency].rate;

        campaignState.raisedGBP += amountGBP;
        campaignState.donors += 1;
        updateCampaignUI();

        paymentModalContent.innerHTML = `
          <div style="text-align: center;">
            <div style="width: 54px; height: 54px; background: #ecfdf5; color: #047857; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--text-dark); margin-bottom: 4px;">JazakAllah Khairan, ${name}!</h3>
            <p style="color: var(--primary-emerald); font-weight: 700; font-size: 1rem; margin-bottom: 16px;">Your donation has been received successfully.</p>
            
            <div style="background: var(--bg-secondary); border: 1px dashed var(--accent-gold); border-radius: 12px; padding: 18px; text-align: left; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; margin-bottom: 6px; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Receipt Ref:</span>
                <strong style="color: var(--text-dark);">${refId}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; margin-bottom: 6px; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Charity Name:</span>
                <strong>Chichester Jamia Centre (No. 1148130)</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; margin-bottom: 6px; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Purpose:</span>
                <strong>${purpose}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Donation Amount:</span>
                <strong style="font-size: 1.05rem; color: var(--primary-emerald-light);">${sym}${amount.toFixed(2)}</strong>
              </div>
            </div>

            <div style="display:flex; gap:10px; flex-direction:column;">
              <button class="btn btn-gold btn-block" id="btnShowCertFromPayment">📜 View & Print Sadaqah Certificate</button>
              <button class="btn btn-emerald btn-block" id="btnCloseSuccessModal">Done</button>
            </div>
          </div>
        `;

        document.getElementById('btnShowCertFromPayment')?.addEventListener('click', () => {
          paymentModal.classList.remove('active');
          openCertificate({
            name: name,
            amountFormatted: `${sym}${amount.toFixed(2)}`,
            purpose: purpose,
            ref: refId
          });
        });

        document.getElementById('btnCloseSuccessModal')?.addEventListener('click', () => {
          paymentModal.classList.remove('active');
        });

        addDonorToWall({
          name: name,
          amount: amount,
          notes: notes || 'May Allah accept this contribution towards Chichester Masjid.',
          time: 'Just now'
        });

        donationForm.reset();
        customAmountInput.value = 100;
        updateGiftAidCalculation();

      }, 1500);
    });
  }

  if (closePaymentModal) closePaymentModal.addEventListener('click', () => paymentModal.classList.remove('active'));

  // ------------------------------------------------------------------
  // 16. Donor Wall Feed & Dynamic Rendering
  // ------------------------------------------------------------------
  const initialDonors = [
    { name: "Br. Yusuf Al-Hassan", amount: 1000, notes: "In memory of my late parents. May Allah grant them Jannatul Firdaus.", time: "2 hours ago" },
    { name: "Dr. Amina & Family", amount: 500, notes: "For the children's Quranic weekend school and community library.", time: "4 hours ago" },
    { name: "Anonymous Supporter (GoFundMe)", amount: 250, notes: "Donated via GoFundMe. May Allah bless the Chichester Jamia Centre team!", time: "5 hours ago" },
    { name: "Sister Fatima Begum", amount: 100, notes: "Sponsoring 1 brick for my family's Sadaqah Jariyah.", time: "8 hours ago" },
    { name: "NHS Muslim Staff (St Richard's)", amount: 1500, notes: "From the Muslim healthcare staff at St Richard's Hospital Chichester.", time: "1 day ago" },
    { name: "Uni of Chichester Students", amount: 300, notes: "With love from the Chichester Muslim Student Association.", time: "1 day ago" }
  ];

  const donorWallFeed = document.getElementById('donorWallFeed');

  function addDonorToWall(donor) {
    if (!donorWallFeed) return;
    const card = document.createElement('div');
    card.className = 'donor-card-item';
    card.innerHTML = `
      <div>
        <div class="dci-top">
          <span class="dci-name">${donor.name}</span>
          <span class="dci-amount">${currencyRates[activeCurrency].symbol}${donor.amount.toLocaleString()}</span>
        </div>
        <p class="dci-note">"${donor.notes}"</p>
      </div>
      <span class="dci-time">⏱ ${donor.time}</span>
    `;
    donorWallFeed.prepend(card);
  }

  initialDonors.forEach(addDonorToWall);

  // ------------------------------------------------------------------
  // 17. Prayer Times Widget (Chichester, UK)
  // ------------------------------------------------------------------
  function initPrayerTimes() {
    const today = new Date();
    const hijriDateDisplay = document.getElementById('hijriDateDisplay');
    if (hijriDateDisplay) {
      hijriDateDisplay.textContent = `23 Rabi' al-Thani 1448 AH • ${today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    }

    const nextPrayerCountdown = document.getElementById('nextPrayerCountdown');
    function updateCountdown() {
      const now = new Date();
      let maghribTime = new Date();
      maghribTime.setHours(18, 46, 0);

      if (now > maghribTime) {
        maghribTime.setDate(maghribTime.getDate() + 1);
      }

      const diff = maghribTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (nextPrayerCountdown) {
        nextPrayerCountdown.textContent = `in ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  initPrayerTimes();

  // ------------------------------------------------------------------
  // 18. FAQ Accordion & Toast Notifications
  // ------------------------------------------------------------------
  document.querySelectorAll('.faq-question').forEach(qBtn => {
    qBtn.addEventListener('click', () => {
      const faqItem = qBtn.parentElement;
      const isActive = faqItem.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
      if (!isActive) faqItem.classList.add('active');
    });
  });

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied! (${text})`);
    }).catch(err => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(`${label} copied! (${text})`);
    });
  }

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      copyToClipboard(text, 'Detail');
    });
  });

  document.getElementById('quickCopyBankTop')?.addEventListener('click', () => {
    copyToClipboard('Sort Code: 30-99-50 | Account: 34785863 | Bank: Lloyds Bank', 'Full Bank Details');
  });

  document.getElementById('copyAllBankDetails')?.addEventListener('click', () => {
    const info = `CHICHESTER JAMIA CENTRE\nBank: Lloyds Bank\nSort Code: 30-99-50\nAccount No: 34785863\nRef: MASJID`;
    copyToClipboard(info, 'Full Bank Transfer Details');
  });

  // Mobile Drawer
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');

  if (mobileToggle && mobileMenuDrawer) {
    mobileToggle.addEventListener('click', () => mobileMenuDrawer.classList.add('active'));
  }
  if (closeDrawerBtn && mobileMenuDrawer) {
    closeDrawerBtn.addEventListener('click', () => mobileMenuDrawer.classList.remove('active'));
  }
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => mobileMenuDrawer?.classList.remove('active'));
  });

  // Share buttons
  const gofundmeUrl = 'https://www.gofundme.com/f/chichester-mosque';
  const shareText = "Help establish the FIRST Masjid in Chichester, UK! Chichester Jamia Centre (Charity Reg 1148130) is raising £580,000. Donate on GoFundMe or Bank Transfer:";

  document.getElementById('shareWhatsAppBtn')?.addEventListener('click', () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + gofundmeUrl)}`, '_blank');
  });
  document.getElementById('shareFacebookBtn')?.addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gofundmeUrl)}`, '_blank');
  });
  document.getElementById('shareXBtn')?.addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(gofundmeUrl)}`, '_blank');
  });
  document.getElementById('copyShareLinkBtn')?.addEventListener('click', () => {
    copyToClipboard(gofundmeUrl, 'GoFundMe Link');
  });
});
