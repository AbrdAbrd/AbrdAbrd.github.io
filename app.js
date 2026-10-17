/**
 * CHICHESTER JAMIA CENTRE — FUNDRAISING & AWARENESS APP
 * Registered UK Charity No. 1148130
 * GoFundMe: https://www.gofundme.com/f/chichester-mosque
 */

// ==========================================
// LANGUAGE SPLASH SCREEN & TRANSLATION LOGIC
// ==========================================
let langSplashTimer = null;
const langTotalSeconds = 8;
let langSeconds = 8;
let isTimerPaused = false;
let currentPendingLang = null;

function toBnDigits(num) {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, d => bn[d]);
}
function toUrDigits(num) {
  const ur = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, d => ur[d]);
}
function toArDigits(num) {
  const ar = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, d => ar[d]);
}

function updateSplashTimerUI() {
  const elEn = document.getElementById('langTimer');
  const elBn = document.getElementById('langTimerBn');
  const elUr = document.getElementById('langTimerUr');
  const elAr = document.getElementById('langTimerAr');
  const bar = document.getElementById('langTimerBarFill');

  if (elEn) elEn.textContent = langSeconds;
  if (elBn) elBn.textContent = toBnDigits(langSeconds);
  if (elUr) elUr.textContent = toUrDigits(langSeconds);
  if (elAr) elAr.textContent = toArDigits(langSeconds);

  if (bar) {
    const pct = Math.max(0, Math.min(100, (langSeconds / langTotalSeconds) * 100));
    bar.style.width = pct + '%';
  }
}

function toggleSplashTimerPause(forcedState) {
  if (typeof forcedState === 'boolean') {
    isTimerPaused = forcedState;
  } else {
    isTimerPaused = !isTimerPaused;
  }
  const label = document.getElementById('langPauseLabel');
  const icon = document.getElementById('langPauseIcon');
  const pauseBtn = document.getElementById('langPauseBtn');
  const hint = document.getElementById('langHoverHint');

  if (isTimerPaused) {
    if (label) label.textContent = 'Resume Timer';
    if (icon) icon.textContent = '▶';
    if (pauseBtn) pauseBtn.classList.add('paused');
    if (hint) hint.textContent = 'Timer paused';
  } else {
    if (label) label.textContent = 'Pause Timer';
    if (icon) icon.textContent = '⏸';
    if (pauseBtn) pauseBtn.classList.remove('paused');
    if (hint) hint.textContent = 'Tip: Hover cards to pause';
  }
}
window.toggleSplashTimerPause = toggleSplashTimerPause;

function updateTopLanguageLabel(langCode) {
  const label = document.getElementById('activeLangLabel');
  if (!label) return;
  const map = {
    en: '🇬🇧 English',
    bn: '🇧🇩 বাংলা',
    ur: '🇵🇰 اردو',
    ar: '🇸🇦 العربية',
    hi: 'हिन्दी'
  };
  label.textContent = map[langCode] || '🌐 Language';
}

function setGoogleTranslateCookie(langCode) {
  const host = window.location.hostname;
  const cookieVal = (!langCode || langCode === 'en') ? '/en/en' : `/en/${langCode}`;
  
  // Set root path cookie
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  
  // Set with domain when host is present
  if (host) {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${host};`;
    const parts = host.split('.');
    if (parts.length > 1) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${host};`;
    }
  }
}

function applyTranslateToDom(langCode) {
  if (!langCode) return;

  // Set RTL or LTR direction
  if (langCode === 'ar' || langCode === 'ur') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
  document.documentElement.setAttribute('lang', langCode);

  // Set Google Translate cookie
  setGoogleTranslateCookie(langCode);
  updateTopLanguageLabel(langCode);

  const targetValue = (langCode === 'en') ? '' : langCode;

  function triggerCombo(combo) {
    if (combo.value !== targetValue) {
      combo.value = targetValue;
    }
    if (typeof combo.onchange === 'function') {
      try { combo.onchange(); } catch(e) {}
    }
    combo.dispatchEvent(new Event('change', { bubbles: true }));
    combo.dispatchEvent(new Event('input', { bubbles: true }));
  }

  const existingCombo = document.querySelector('.goog-te-combo');
  if (existingCombo) {
    triggerCombo(existingCombo);
    return;
  }

  // Poll for .goog-te-combo while Google Translate script is initializing
  let attempts = 0;
  const pollTimer = setInterval(() => {
    attempts++;
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      clearInterval(pollTimer);
      triggerCombo(combo);
    } else if (attempts >= 60) {
      clearInterval(pollTimer);
    }
  }, 150);
}

window.applyGoogleTranslateLanguage = applyTranslateToDom;

window.onGoogleTranslateReady = function() {
  const savedLang = currentPendingLang || sessionStorage.getItem('userLanguage') || localStorage.getItem('userLanguage');
  if (savedLang && savedLang !== 'en') {
    applyTranslateToDom(savedLang);
  }
};

window.openLanguageModal = function() {
  const splash = document.getElementById('languageSplash');
  if (!splash) return;
  clearInterval(langSplashTimer);
  splash.classList.remove('hidden');

  // Pause automatic countdown when opened on demand
  window.toggleSplashTimerPause(true);
  const pauseBtn = document.getElementById('langPauseBtn');
  if (pauseBtn) pauseBtn.classList.add('manual-paused');

  // Highlight active language card
  const currentLang = sessionStorage.getItem('userLanguage') || localStorage.getItem('userLanguage') || 'en';
  document.querySelectorAll('.lang-card').forEach(card => {
    if (card.getAttribute('data-lang') === currentLang) {
      card.classList.add('active-lang');
    } else {
      card.classList.remove('active-lang');
    }
  });
};

window.selectSplashLanguage = function(langCode) {
  clearInterval(langSplashTimer);
  const splash = document.getElementById('languageSplash');
  if (splash) {
    splash.classList.add('hidden');
    const rememberCheck = document.getElementById('langRememberChoice');
    const shouldRemember = !rememberCheck || rememberCheck.checked;
    try {
      sessionStorage.setItem('langSelected', 'true');
      sessionStorage.setItem('userLanguage', langCode);
      if (shouldRemember) {
        localStorage.setItem('userLanguage', langCode);
      }
    } catch(e) {}
  }

  currentPendingLang = langCode;
  applyTranslateToDom(langCode);

  // Update card active classes
  document.querySelectorAll('.lang-card').forEach(card => {
    if (card.getAttribute('data-lang') === langCode) {
      card.classList.add('active-lang');
    } else {
      card.classList.remove('active-lang');
    }
  });

  const langGreetings = {
    bn: 'বাংলা (Bengali) — স্বাগতম!',
    ur: 'اردو (Urdu) — خوش آمدید!',
    ar: 'العربية (Arabic) — أهلاً وسهلاً!',
    en: 'English — Welcome to Chichester Jamia Centre!'
  };

  if (typeof window.showToast === 'function') {
    if (langCode !== 'en' && langGreetings[langCode]) {
      setTimeout(() => {
        window.showToast(`🌐 ${langGreetings[langCode]}`);
      }, 350);
    } else if (langCode === 'en' && sessionStorage.getItem('langSelected')) {
      window.showToast('🌐 Continuing in English');
    }
  }
};

function initLanguageSplash() {
  const splash = document.getElementById('languageSplash');
  if (!splash) return;

  // Render initial timer counts
  updateSplashTimerUI();

  // Allow clicking overlay background to dismiss immediately
  splash.addEventListener('click', (e) => {
    if (e.target === splash) {
      window.selectSplashLanguage('en');
    }
  });

  // ESC key dismiss
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !splash.classList.contains('hidden')) {
      window.selectSplashLanguage('en');
    }
  });

  // Check if user previously selected a language
  try {
    const savedLang = sessionStorage.getItem('userLanguage') || localStorage.getItem('userLanguage');
    if (sessionStorage.getItem('langSelected')) {
      splash.classList.add('hidden');
      if (savedLang) {
        applyTranslateToDom(savedLang);
      }
      return;
    }
  } catch(e) {}

  // Highlight default or remembered card
  const initialLang = localStorage.getItem('userLanguage') || 'en';
  document.querySelectorAll('.lang-card').forEach(card => {
    if (card.getAttribute('data-lang') === initialLang) {
      card.classList.add('active-lang');
    }
  });

  // Hover-to-pause capability for uninterrupted reading
  const grid = document.getElementById('langCardsGrid');
  if (grid) {
    grid.addEventListener('mouseenter', () => {
      window.toggleSplashTimerPause(true);
      const hint = document.getElementById('langHoverHint');
      if (hint) hint.textContent = 'Paused (reading)';
    });
    grid.addEventListener('mouseleave', () => {
      const pauseBtn = document.getElementById('langPauseBtn');
      if (!pauseBtn || !pauseBtn.classList.contains('manual-paused')) {
        window.toggleSplashTimerPause(false);
      }
    });
  }

  // Active countdown timer
  langSplashTimer = setInterval(() => {
    if (isTimerPaused) return;

    langSeconds--;
    updateSplashTimerUI();
    
    if (langSeconds <= 0) {
      clearInterval(langSplashTimer);
      window.selectSplashLanguage('en');
    }
  }, 1000);
}

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

  let livePrayerTimings = {
    Fajr: "05:32",
    Sunrise: "07:05",
    Dhuhr: "13:02",
    Asr: "16:18",
    Maghrib: "18:46",
    Isha: "20:15"
  };

  const FORM_WEBHOOK_URL = null; // Optional Formspree / Web3Forms / Google Apps Script endpoint
  async function submitToWebhook(type, data) {
    if (!FORM_WEBHOOK_URL) return;
    try {
      await fetch(FORM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ formType: type, timestamp: new Date().toISOString(), ...data })
      });
    } catch (err) {
      console.warn('Webhook transmission error:', err);
    }
  }

  // Initialize the Language Splash Screen
  initLanguageSplash();

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

    // Dynamically update preset donation pills to show converted figures
    document.querySelectorAll('.preset-btn, .amount-pill').forEach(btn => {
      const baseVal = btn.getAttribute('data-amount') || btn.getAttribute('data-val');
      if (baseVal) {
        const converted = Math.round(parseFloat(baseVal) * cur.rate);
        btn.textContent = `${cur.symbol}${converted.toLocaleString()}`;
      }
    });

    updateCampaignUI(false);
    updateGiftAidCalculation();
    if (typeof updateBrickCalculator === 'function') updateBrickCalculator();
    if (typeof updateZakatCalculation === 'function') updateZakatCalculation();
    updateImpactCalculation(document.getElementById('impactRangeSlider')?.value || 250);
  }

  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      activeCurrency = e.target.value;
      updateCurrencyDisplay();
      showToast(`Currency changed to ${activeCurrency}`);
    });
  }

  // Counter Number Animator Helper
  function animateCounter(elem, targetVal, prefix = '', suffix = '') {
    if (!elem) return;
    const duration = 1100;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * targetVal);
      elem.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        elem.textContent = `${prefix}${Math.round(targetVal).toLocaleString()}${suffix}`;
      }
    };
    window.requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // 5. Update Campaign Progress UI
  // ------------------------------------------------------------------
  function updateCampaignUI(animate = false) {
    const raisedConverted = campaignState.raisedGBP * currencyRates[activeCurrency].rate;
    const targetConverted = campaignState.targetGBP * currencyRates[activeCurrency].rate;
    const remainingGBP = campaignState.targetGBP - campaignState.raisedGBP;
    const remainingConverted = remainingGBP * currencyRates[activeCurrency].rate;

    const percent = ((campaignState.raisedGBP / campaignState.targetGBP) * 100).toFixed(1);
    const bricksFunded = Math.floor(campaignState.raisedGBP / campaignState.brickCostGBP);
    const bricksRemaining = campaignState.totalBricks - bricksFunded;

    const sym = currencyRates[activeCurrency].symbol;

    if (animate) {
      animateCounter(raisedDisplay, raisedConverted, sym);
      animateCounter(targetDisplay, targetConverted, sym);
      animateCounter(donorCount, campaignState.donors);
      animateCounter(remainingDisplay, remainingConverted, sym);
      animateCounter(bricksFundedHeader, bricksFunded);
    } else {
      if (raisedDisplay) raisedDisplay.textContent = `${sym}${Math.round(raisedConverted).toLocaleString()}`;
      if (targetDisplay) targetDisplay.textContent = `${sym}${Math.round(targetConverted).toLocaleString()}`;
      if (donorCount) donorCount.textContent = campaignState.donors.toLocaleString();
      if (remainingDisplay) remainingDisplay.textContent = `${sym}${Math.round(remainingConverted).toLocaleString()}`;
      if (bricksFundedHeader) bricksFundedHeader.textContent = bricksFunded.toLocaleString();
    }

    if (percentDisplay) percentDisplay.textContent = `${percent}%`;
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    if (brickFundedCount) brickFundedCount.textContent = `${bricksFunded.toLocaleString()} Bricks`;
    if (brickRemainingCount) brickRemainingCount.textContent = `${bricksRemaining.toLocaleString()} Bricks`;
  }

  updateCampaignUI(true);

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
    document.querySelectorAll('.dyn-btn-amount').forEach(el => {
      el.textContent = `${sym}${amount.toFixed(2)}`;
    });
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

  // Payment method selection & dynamic view switching
  const payDetailViews = {
    gofundme: document.getElementById('viewGfm'),
    bank: document.getElementById('viewBank'),
    card: document.getElementById('viewCard'),
    qr: document.getElementById('viewQr')
  };

  function switchPaymentMethod(methodKey) {
    document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('active'));
    const targetCard = document.querySelector(`.pay-method-card input[value="${methodKey}"]`)?.closest('.pay-method-card');
    if (targetCard) targetCard.classList.add('active');

    Object.keys(payDetailViews).forEach(key => {
      const panel = payDetailViews[key];
      if (panel) {
        if (key === methodKey) {
          panel.classList.remove('hidden');
          panel.classList.add('active');
        } else {
          panel.classList.add('hidden');
          panel.classList.remove('active');
        }
      }
    });
    updateGiftAidCalculation();
  }

  // ------------------------------------------------------------------
  // Donation Portal Top Tabs Switching
  // ------------------------------------------------------------------
  document.querySelectorAll('.portal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.portal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabType = tab.getAttribute('data-tab');
      const rate = currencyRates[activeCurrency]?.rate || 1.0;

      const selectPurpose = (val) => {
        const radio = document.querySelector(`input[name="purpose"][value="${val}"]`);
        if (radio) {
          radio.checked = true;
          document.querySelectorAll('.cat-radio-card').forEach(c => c.classList.remove('active'));
          radio.closest('.cat-radio-card')?.classList.add('active');
        }
      };

      if (tabType === 'tab-one-off') {
        selectPurpose('Masjid Property Fund');
        if (customAmountInput) customAmountInput.value = Math.round(100 * rate);
      } else if (tabType === 'tab-monthly') {
        selectPurpose('Masjid Property Fund');
        switchPaymentMethod('bank');
        showToast('Set up a monthly Standing Order using our Lloyds Bank details below');
      } else if (tabType === 'tab-brick') {
        selectPurpose('Buy a Brick (£100)');
        if (customAmountInput) customAmountInput.value = Math.round(100 * rate);
      } else if (tabType === 'tab-musalla') {
        selectPurpose('Sponsor Prayer Space (£500)');
        if (customAmountInput) customAmountInput.value = Math.round(500 * rate);
      }
      updateGiftAidCalculation();
    });
  });

  document.querySelectorAll('.pay-method-card').forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        switchPaymentMethod(radio.value);
      }
    });
  });

  // ------------------------------------------------------------------
  // 6b. Secondary Brick Counter in Target Breakdown Section
  // ------------------------------------------------------------------
  function updateBrickCalculator() {
    if (!brickCountInput) return;
    let count = parseInt(brickCountInput.value) || 1;
    if (count < 1) count = 1;
    brickCountInput.value = count;
    const rate = currencyRates[activeCurrency]?.rate || 1.0;
    const sym = currencyRates[activeCurrency]?.symbol || '£';
    const cost = Math.round(count * campaignState.brickCostGBP * rate);

    if (brickTotalCost) brickTotalCost.textContent = `${sym}${cost.toLocaleString()}`;
    if (brickCountText) brickCountText.textContent = count;
  }

  btnBrickMinus?.addEventListener('click', () => {
    let count = parseInt(brickCountInput?.value || 1) - 1;
    if (count < 1) count = 1;
    if (brickCountInput) brickCountInput.value = count;
    updateBrickCalculator();
  });

  btnBrickPlus?.addEventListener('click', () => {
    let count = parseInt(brickCountInput?.value || 1) + 1;
    if (brickCountInput) brickCountInput.value = count;
    updateBrickCalculator();
  });

  brickCountInput?.addEventListener('input', updateBrickCalculator);

  btnSponsorBricks?.addEventListener('click', () => {
    const count = parseInt(brickCountInput?.value || 1);
    const converted = Math.round(count * campaignState.brickCostGBP * (currencyRates[activeCurrency]?.rate || 1.0));
    if (customAmountInput) {
      customAmountInput.value = converted;
      updateGiftAidCalculation();
    }
    const brickRadio = document.querySelector('input[name="purpose"][value="Buy a Brick (£100)"]');
    if (brickRadio) {
      brickRadio.checked = true;
      document.querySelectorAll('.cat-radio-card').forEach(c => c.classList.remove('active'));
      brickRadio.closest('.cat-radio-card')?.classList.add('active');
    }
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Loaded ${count} Brick(s) (${currencyRates[activeCurrency]?.symbol || '£'}${converted}) into donation form.`);
  });

  updateBrickCalculator();

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
        brick.setAttribute('data-tooltip', `Brick #${i} (Inscribed: ${donorName})`);
      } else if (i === 45) {
        brick.classList.add('selected');
        brick.innerHTML = `<span>#${i}</span><small style="font-size:0.55rem; color:#fff;">Selected</small>`;
        brick.title = `Brick #${i} — Currently Selected for You!`;
        brick.setAttribute('data-tooltip', `Brick #${i} (Selected for You)`);
      } else {
        brick.classList.add('available');
        brick.innerHTML = `<span>#${i}</span><small style="font-size:0.55rem;">£100</small>`;
        brick.title = `Brick #${i} — Available! Click to sponsor.`;
        brick.setAttribute('data-tooltip', `Brick #${i} (Available • £100)`);
      }

      brick.addEventListener('click', () => {
        if (brick.classList.contains('funded')) {
          showToast(`Brick #${i} is already inscribed. Please pick an available brick.`);
          return;
        }

        brick.classList.toggle('selected');
        playSoftChime();
        if (brick.classList.contains('selected')) {
          brick.querySelector('small').textContent = 'Selected';
          brick.setAttribute('data-tooltip', `Brick #${i} (Selected)`);
        } else {
          brick.querySelector('small').textContent = '£100';
          brick.setAttribute('data-tooltip', `Brick #${i} (Available • £100)`);
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
      desc: "Spacious climate-controlled main prayer hall accommodating over 200 worshipers for daily & Friday Jumu'ah prayers, featuring timber ceiling beams, wudu facilities, and wheelchair accessible entrance.",
      image: "assets/real_interior_refurbished_concept.jpg",
      specs: [
        "🕌 Main Prayer Capacity: 200+ Worshipers",
        "💧 High-capacity Men's Wudu & Washrooms",
        "♿ Wheelchair Accessible Ramp & Barrier-free Entrance",
        "📜 Natural Timber Architectural Beams & Mihrab"
      ]
    },
    first: {
      title: "First Floor — Dedicated Sister's Sanctuary & Creche",
      desc: "A private, serene, and comfortable prayer sanctuary dedicated exclusively for Sisters, complete with private wudu area, audio-visual link to Khutbah, and a mother-child creche space.",
      image: "assets/building_refurbished_concept.jpg",
      specs: [
        "🧕 Sister's Prayer Capacity: 100+ Worshipers",
        "💧 Private Sister's Wudu Facilities",
        "🧸 Mother & Child Creche Room",
        "📺 High-definition Audio-Visual Link to Imams"
      ]
    },
    annexe: {
      title: "Ground Floor Annexe — Current Interior Being Converted",
      desc: "The open ground-floor space at 102 Bognor Road currently being transformed into children's Quranic classrooms, adult study spaces, food bank distribution, and community reception.",
      image: "assets/real_interior.jpg",
      specs: [
        "📚 Children's Quranic Weekend School (Madrasa)",
        "💻 Islamic Reference Library & Digital Resource Hub",
        "📦 Community Food Bank Storage & Relief Center",
        "🤝 Inter-faith Dialogue Lounge & Visitor Desk"
      ]
    }
  };

  const floorDisplay = document.getElementById('floorDisplay');

  const isometricHotspots = [
    { num: 1, top: '65%', left: '72%', label: "Ground Floor Men's Prayer Sanctuary", desc: "Capacity for 200+ worshipers with underfloor heating, oak acoustics, and mihrab facing 119.2° ESE.", sponsorAmt: 250, sponsorText: "Sponsor 1 Musalla Carpet Space (£250)" },
    { num: 2, top: '74%', left: '46%', label: "Men's Eco-Wudu Suites", desc: "12 dedicated ritual wash bays with heated non-slip stone tiling and water-saving sensor taps.", sponsorAmt: 500, sponsorText: "Sponsor 1 Wudu Bay (£500)" },
    { num: 3, top: '86%', left: '38%', label: "Main Entrance Foyer & Food Bank", desc: "Barrier-free accessible entrance, 250-pair shoe racks, and community food bank distribution hub.", sponsorAmt: 100, sponsorText: "Sponsor Foundation Brick (£100)" },
    { num: 4, top: '56%', left: '20%', label: "Dedicated Sisters' Sanctuary", desc: "First floor serene prayer hall with private access, soundproofing, and live 4K AV link to Imam.", sponsorAmt: 250, sponsorText: "Sponsor Sisters' Space (£250)" },
    { num: 5, top: '66%', left: '29%', label: "Madrasa Classrooms & Library", desc: "3 modern classrooms for Quranic education, youth club, and community Islamic reference library.", sponsorAmt: 150, sponsorText: "Sponsor Madrasa Desk (£150)" },
    { num: 6, top: '24%', left: '42%', label: "Eco Solar Panels & Green Roof", desc: "Solar photovoltaic panels providing sustainable energy to power daily masjid operations.", sponsorAmt: 500, sponsorText: "Sponsor Solar Panel (£500)" }
  ];

  function renderFloorPlan(floorKey) {
    if (!floorDisplay || !floorData[floorKey]) return;
    const data = floorData[floorKey];
    const isIso = floorKey === 'isometric';

    floorDisplay.innerHTML = `
      <div class="floor-plan-view">
        <div class="fp-image-wrap" id="fpImageWrap">
          <img src="${data.image}" alt="${data.title}" id="fpMainImg" class="lightbox-trigger" data-lightbox="${data.image}">
          ${isIso ? `
            <div class="fp-hotspots-container">
              ${isometricHotspots.map(h => `
                <div class="fp-hotspot" style="top: ${h.top}; left: ${h.left};" data-hotspot-num="${h.num}" tabindex="0" role="button" aria-label="${h.label}">
                  ${h.num}
                  <div class="fp-hotspot-tooltip">${h.label}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="fp-info">
          <h3>${data.title}</h3>
          <p id="fpActiveDesc">${data.desc}</p>
          <ul class="fp-specs-list" id="fpSpecsList">
            ${data.specs.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <div class="fp-actions-bar">
            <button class="btn btn-outline-gold btn-sm" id="btnViewHighResBlueprint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <span>View Fullscreen High-Res</span>
            </button>
            <a href="#donate" class="btn btn-gold btn-sm" id="btnSponsorSpaceAction">
              <span>Sponsor This Space</span>
            </a>
          </div>
        </div>
      </div>
    `;

    // Wire up hotspots
    if (isIso) {
      document.querySelectorAll('.fp-hotspot').forEach(pin => {
        pin.addEventListener('click', (e) => {
          e.stopPropagation();
          const num = parseInt(pin.getAttribute('data-hotspot-num'));
          const hotspot = isometricHotspots.find(h => h.num === num);
          if (!hotspot) return;

          document.querySelectorAll('.fp-hotspot').forEach(p => p.classList.remove('active'));
          pin.classList.add('active');

          const descElem = document.getElementById('fpActiveDesc');
          if (descElem) {
            descElem.innerHTML = `<strong class="gold-text">Spotlight: ${hotspot.label}</strong><br>${hotspot.desc}`;
          }

          const sponsorBtn = document.getElementById('btnSponsorSpaceAction');
          if (sponsorBtn) {
            sponsorBtn.textContent = hotspot.sponsorText;
            sponsorBtn.onclick = (ev) => {
              ev.preventDefault();
              if (customAmountInput) {
                const converted = Math.round(hotspot.sponsorAmt * currencyRates[activeCurrency].rate);
                customAmountInput.value = converted;
                updateGiftAidCalculation();
              }
              const donateSection = document.getElementById('donate');
              if (donateSection) donateSection.scrollIntoView({ behavior: 'smooth' });
              showToast(`Selected "${hotspot.label}" (${currencyRates[activeCurrency].symbol}${Math.round(hotspot.sponsorAmt * currencyRates[activeCurrency].rate)})`);
            };
          }
        });
      });
    }

    // High res blueprint modal trigger
    document.getElementById('btnViewHighResBlueprint')?.addEventListener('click', () => {
      openLightbox(data.image, data.title);
    });
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
  // 9b. Interactive Zakat Calculator (2.5% Net Eligible Wealth & Nisab Engine)
  // ------------------------------------------------------------------
  const zakatCash = document.getElementById('zakatCash');
  const zakatGold = document.getElementById('zakatGold');
  const zakatInvestments = document.getElementById('zakatInvestments');
  const zakatDebts = document.getElementById('zakatDebts');
  const totalWealthDisplay = document.getElementById('totalWealthDisplay');
  const zakatDueDisplay = document.getElementById('zakatDueDisplay');
  const btnApplyZakatToDonation = document.getElementById('btnApplyZakatToDonation');
  const btnApplySadaqahToDonation = document.getElementById('btnApplySadaqahToDonation');
  const nisabSilverBtn = document.getElementById('nisabSilverBtn');
  const nisabGoldBtn = document.getElementById('nisabGoldBtn');
  const nisabStatusBadge = document.getElementById('nisabStatusBadge');
  const nisabBadgeText = document.getElementById('nisabBadgeText');

  let activeNisabStandard = 'silver'; // default silver (precautionary majority view)
  const nisabThresholdsGBP = {
    silver: 460, // 612.36g silver equivalent
    gold: 4850   // 87.48g gold equivalent
  };

  function updateZakatCalculation() {
    const cash = parseFloat(zakatCash?.value) || 0;
    const gold = parseFloat(zakatGold?.value) || 0;
    const inv = parseFloat(zakatInvestments?.value) || 0;
    const debts = parseFloat(zakatDebts?.value) || 0;

    const netWealth = Math.max(0, (cash + gold + inv) - debts);
    const zakatDue = netWealth * 0.025;
    const rate = currencyRates[activeCurrency]?.rate || 1.0;
    const sym = currencyRates[activeCurrency]?.symbol || '£';
    const currentNisabConverted = Math.round(nisabThresholdsGBP[activeNisabStandard] * rate);

    // Update Currency Symbols on input fields
    ['1', '2', '3', '4'].forEach(num => {
      const el = document.getElementById(`zakatCurrSymbol${num}`);
      if (el) el.textContent = sym;
    });

    if (totalWealthDisplay) {
      totalWealthDisplay.textContent = `${sym}${netWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (zakatDueDisplay) {
      zakatDueDisplay.textContent = `${sym}${zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (nisabStatusBadge && nisabBadgeText) {
      if (netWealth <= 0) {
        nisabStatusBadge.className = 'result-badge';
        nisabBadgeText.textContent = 'Awaiting Wealth Breakdown...';
      } else if (netWealth >= currentNisabConverted) {
        nisabStatusBadge.className = 'result-badge met';
        nisabBadgeText.textContent = `✓ Nisab Met (Exceeds ${sym}${currentNisabConverted.toLocaleString()} threshold) — 2.5% Zakat Due`;
      } else {
        nisabStatusBadge.className = 'result-badge below';
        nisabBadgeText.textContent = `Below Nisab (${sym}${currentNisabConverted.toLocaleString()}) — Sadaqah Jariyah Recommended`;
      }
    }
  }

  [zakatCash, zakatGold, zakatInvestments, zakatDebts].forEach(inp => {
    inp?.addEventListener('input', updateZakatCalculation);
  });

  nisabSilverBtn?.addEventListener('click', () => {
    activeNisabStandard = 'silver';
    nisabSilverBtn.classList.add('active');
    nisabGoldBtn?.classList.remove('active');
    updateZakatCalculation();
    showToast('Nisab benchmark set to Silver standard (~£460)');
  });

  nisabGoldBtn?.addEventListener('click', () => {
    activeNisabStandard = 'gold';
    nisabGoldBtn.classList.add('active');
    nisabSilverBtn?.classList.remove('active');
    updateZakatCalculation();
    showToast('Nisab benchmark set to Gold standard (~£4,850)');
  });

  btnApplyZakatToDonation?.addEventListener('click', () => {
    const cash = parseFloat(zakatCash?.value) || 0;
    const gold = parseFloat(zakatGold?.value) || 0;
    const inv = parseFloat(zakatInvestments?.value) || 0;
    const debts = parseFloat(zakatDebts?.value) || 0;
    const netWealth = Math.max(0, (cash + gold + inv) - debts);
    const zakatDue = Math.round(netWealth * 0.025);

    if (zakatDue > 0 && customAmountInput) {
      customAmountInput.value = zakatDue;
      updateGiftAidCalculation();
      const zakatRadio = document.querySelector('input[name="purpose"][value="General Donation / Lillah"]') || document.querySelector('input[name="purpose"]');
      if (zakatRadio) {
        zakatRadio.checked = true;
        document.querySelectorAll('.cat-radio-card').forEach(c => c.classList.remove('active'));
        zakatRadio.closest('.cat-radio-card')?.classList.add('active');
      }
      document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Transferred calculated Zakat (${currencyRates[activeCurrency]?.symbol || '£'}${zakatDue}) to donation form.`);
    } else {
      document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
      showToast('Please enter your wealth values or donate a custom amount.');
    }
  });

  btnApplySadaqahToDonation?.addEventListener('click', () => {
    const cash = parseFloat(zakatCash?.value) || 0;
    const netWealth = Math.max(0, cash);
    const suggested = netWealth > 0 ? Math.min(500, Math.max(50, Math.round(netWealth * 0.01))) : 100;

    if (customAmountInput) {
      customAmountInput.value = suggested;
      updateGiftAidCalculation();
      const radio = document.querySelector('input[name="purpose"][value="General Donation / Lillah"]') || document.querySelector('input[name="purpose"]');
      if (radio) {
        radio.checked = true;
        document.querySelectorAll('.cat-radio-card').forEach(c => c.classList.remove('active'));
        radio.closest('.cat-radio-card')?.classList.add('active');
      }
      document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Selected ${currencyRates[activeCurrency]?.symbol || '£'}${suggested} Sadaqah Jariyah for Chichester Masjid.`);
    }
  });

  updateZakatCalculation();

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

  let chatHistory = [
    {
      role: "system",
      content: "You are the Jamia AI Assistant for Chichester Jamia Centre (Charity No. 1148130). We are converting the former 'The Wickham Arms' pub at 102 Bognor Road, Chichester PO19 7TW into a Masjid. Target: £580k. Raised: £230k in bank. Shortfall: £350k. When asked about donating, giving money, or payment options, ALWAYS state that donating through our official GoFundMe page (https://www.gofundme.com/f/chichester-mosque) is HIGHLY RECOMMENDED because it supports instant Apple Pay / Google Pay, is 100% verified, and keeps the public campaign milestone tracker transparent. Also explain that other payment options are fully available: Direct Lloyds Bank Transfer (Account 1: Sort 30-99-50, Acc 34785863; Account 2: Sort 30-95-96, Acc 1279 8836), Scan-to-Pay QR code, or online card pledge. We are also running an official community consultation survey for Chichester residents and families to shape the facilities (e.g. dedicated sisters' hall, madrasah, youth hub, food bank, elderly circle, accessibility) and council planning application. Encourage users to take the survey and let them know they can click the '📋 Community Survey' button on the website. Respond with clean, modern HTML formatting (use <p>, <strong>, <ul>, etc.) and keep answers concise, helpful, and respectful. If asked about prayer times, mention they are synced with Wifaqul Ulama Hanafi."
    }
  ];

  async function getAiResponse(userQuery) {
    chatHistory.push({ role: "user", content: userQuery });
    
    // Jamia AI Knowledge Base & Intelligent Assistant
    const query = userQuery.toLowerCase();

    if (query.includes('survey') || query.includes('consultation') || query.includes('feedback') || query.includes('facilities') || query.includes('opinion') || query.includes('suggestion') || query.includes('wish')) {
      return `
        <p>📋 <strong>Chichester Community Consultation Survey:</strong></p>
        <p>Chichester Jamia Centre (Charity No. 1148130) is currently conducting an active community consultation to shape the design and facilities for <strong>102 Bognor Road</strong>!</p>
        <p><strong>Key areas you can vote on:</strong><br>
        • Dedicated Sisters' Prayer Hall &amp; Private Wudhu/Baby-Changing<br>
        • Children's Weekend Madrasah &amp; Quran Classes<br>
        • Youth Safe Space &amp; Homework Club<br>
        • Community Food Bank &amp; Elderly Companionship Circle<br>
        • Step-Free Disabled Accessibility &amp; Green Transport</p>
        <p><em>Takes only 1–2 minutes, and you can opt in to browser/email survey notifications.</em></p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
          <button type="button" class="btn btn-sm btn-gold" onclick="if(window.openCommunitySurvey) window.openCommunitySurvey(); document.getElementById('aiChatWindow').classList.remove('active');">📋 Take Community Survey Now</button>
          <button type="button" class="btn btn-sm btn-glass" onclick="if(window.openNotificationSettings) window.openNotificationSettings(); document.getElementById('aiChatWindow').classList.remove('active');">🔔 Notification Settings</button>
        </div>
      `;
    }

    if (query.includes('donate') || query.includes('give') || query.includes('money') || query.includes('payment') || query.includes('how to pay') || query.includes('ways to pay') || query.includes('contribute')) {
      return `
        <p>❤️ <strong>How to Donate — Official GoFundMe (Highly Recommended):</strong></p>
        <p>We <strong>strongly recommend</strong> giving via our official GoFundMe page:<br>
        <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" style="color:var(--gofundme-green); font-weight:800;">gofundme.com/f/chichester-mosque ↗</a></p>
        <p><strong>Why GoFundMe is recommended:</strong><br>
        • Instant 1-Tap Apple Pay, Google Pay, Card &amp; PayPal.<br>
        • Keeps our public £580,000 target progress bar live &amp; unified.<br>
        • 100% verified UK charity transfer with GoFundMe Giving Guarantee.</p>
        
        <p style="margin-top:10px;"><strong>Other Payment Options Are Also Available:</strong><br>
        • <strong>Lloyds Bank Transfer (0% Fees):</strong> Sort: <strong>30-99-50</strong> | Acc: <strong>34785863</strong> (Ref: MASJID)<br>
        • <strong>Scan-to-Pay QR:</strong> Instant UK banking app camera transfer.<br>
        • <strong>Interactive Brick Builder:</strong> Sponsor 1 brick for £100 with your family's name.</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
          <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" class="btn btn-sm btn-gofundme">Open GoFundMe (Recommended) ↗</a>
          <a href="#donate" class="btn btn-sm btn-gold" onclick="document.getElementById('aiChatWindow').classList.remove('active')">View All Payment Options</a>
        </div>
      `;
    }

    if (query.includes('pub') || query.includes('wickham') || query.includes('history') || query.includes('transformation') || query.includes('before')) {
      return `
        <p>🏛 <strong>From Pub to Masjid Transformation:</strong></p>
        <p>We are converting the former <strong>"The Wickham Arms" pub</strong> located at <strong>102 Bognor Road, Chichester PO19 7TW</strong> into Chichester's first permanent Masjid.</p>
        <p>The historic Sussex flint stone building has been secured under our Charitable Incorporated Organisation (CIO). It features an on-site car park and grounds.</p>
        <a href="#transformation" class="btn btn-sm btn-gold mt-2" onclick="document.getElementById('aiChatWindow').classList.remove('active')">Explore Pub to Masjid Journey</a>
      `;
    }

    if (query.includes('bank') || query.includes('sort code') || query.includes('lloyds') || query.includes('account number') || query.includes('transfer')) {
      return `
        <p><strong>🏦 Official Lloyds Bank Transfer Accounts (0% Fees):</strong></p>
        <p style="background:rgba(245,158,11,0.12); border-left:3px solid var(--accent-gold); padding:6px 10px; border-radius:4px; font-size:0.88rem; margin-bottom:8px;">
          💡 <em>Note:</em> For quickest card/mobile checkout and live public counter updates, donating via our <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" style="color:var(--gofundme-green); font-weight:700;">Official GoFundMe Page</a> is highly recommended! For direct bank transfer:
        </p>
        <p>• <strong>Account 1 (General Appeal):</strong><br>
        Sort Code: <span style="color:var(--accent-gold); font-weight:800;">30-99-50</span> | Acc: <span style="color:var(--accent-gold); font-weight:800;">34785863</span></p>
        <p>• <strong>Account 2 (Building CIO & QR Pay):</strong><br>
        Sort Code: <span style="color:var(--accent-gold); font-weight:800;">30-95-96</span> | Acc: <span style="color:var(--accent-gold); font-weight:800;">1279 8836</span></p>
        <p>• <strong>Account Name:</strong> Chichester Jamia Centre<br>
        • <strong>Reference:</strong> MASJID</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" class="btn btn-sm btn-gofundme">GoFundMe (Recommended)</a>
          <a href="#bank-details" class="btn btn-sm btn-gold" onclick="document.getElementById('aiChatWindow').classList.remove('active')">View Bank & QR Code</a>
        </div>
      `;
    }

    if (query.includes('qr') || query.includes('scan') || query.includes('mobile pay')) {
      return `
        <p>📱 <strong>Scan-to-Pay QR Code:</strong></p>
        <p>You can scan our official QR code directly inside your UK mobile banking app to donate with zero fees.</p>
        <p>Linked to Lloyds Bank Sort Code <strong>30-95-96</strong>, Account <strong>1279 8836</strong>.</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" class="btn btn-sm btn-gofundme">GoFundMe (Recommended)</a>
          <a href="#bank-details" class="btn btn-sm btn-emerald" onclick="document.getElementById('aiChatWindow').classList.remove('active')">View QR Code</a>
        </div>
      `;
    }

    if (query.includes('shortfall') || query.includes('230') || query.includes('350') || query.includes('balance')) {
      return `
        <p>💰 <strong>Financial Shortfall & Funds in Bank:</strong></p>
        <p>• <strong>Total Target Required:</strong> £580,000<br>
        • <strong>Already Secured in Bank:</strong> £230,000 (39.7%)<br>
        • <strong>Urgent Shortfall Needed:</strong> £350,000</p>
        <p>With community pledges, we have surpassed £324,850! Please help us close the remaining gap.</p>
        <a href="#target" class="btn btn-sm btn-gold mt-2" onclick="document.getElementById('aiChatWindow').classList.remove('active')">View Target Details</a>
      `;
    }

    if (query.includes('bengali') || query.includes('বাংলা') || query.includes('bangla')) {
      return `
        <p>🇧🇩 <strong>চিচেস্টার জামিয়া সেন্টার (ইসলামিক সেন্টার):</strong></p>
        <p>১০২ বগোর রোডে £৫৮০,০০০ মূল্যের প্রোপার্টির জন্য ব্যাংকে £২৩০,০০০ জমা আছে, এবং অবশিষ্ট £৩৫০,০০০ প্রয়োজন। GoFundMe অথবা সরাসরি ব্যাংক ট্রান্সফারের মাধ্যমে দান করুন।</p>
        <a href="#documents" class="btn btn-sm btn-gold mt-2" onclick="document.getElementById('aiChatWindow').classList.remove('active')">বাংলায় আবেদন দেখুন</a>
      `;
    }

    if (query.includes('document') || query.includes('flyer') || query.includes('banner')) {
      return `
        <p>📄 <strong>Official Campaign Documents:</strong></p>
        <p>You can view both our official appeal flyer and our roll-up banner with Charity Commission credentials (No. 1148130) in high resolution.</p>
        <a href="#documents" class="btn btn-sm btn-gold mt-2" onclick="document.getElementById('aiChatWindow').classList.remove('active')">View Official Documents</a>
      `;
    }

    if (query.includes('gofundme') || query.includes('go fund me') || query.includes('link')) {
      return `
        <p>❤️ <strong>Official GoFundMe Appeal (★ Highly Recommended):</strong></p>
        <p>We strongly recommend donating directly through our official GoFundMe page:<br>
        <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" style="color:var(--gofundme-green); font-weight:800;">gofundme.com/f/chichester-mosque ↗</a></p>
        <p>All donations go directly to Chichester Jamia Centre for property purchase & refurbishment, and instantly update our £580,000 community tracker.</p>
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
        <p>Our prayer times are synced dynamically with Wifaqul Ulama Hanafi for Chichester.<br>
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
      <p>Assalamu Alaikum! Chichester Jamia Centre (Charity No. 1148130) is transforming the former Wickham Arms pub (102 Bognor Rd) into Chichester's first permanent Masjid.</p>
      <p>We have <strong>£230,000 in the bank</strong> and need <strong>£350,000 shortfall</strong>. We <strong>highly recommend donating through our official <a href="https://www.gofundme.com/f/chichester-mosque" target="_blank" style="color:var(--gofundme-green); font-weight:700;">GoFundMe Campaign</a></strong> for instant Apple Pay / Google Pay and live public tracking.</p>
      <p>Other payment options are also readily available: <strong>Lloyds Bank Transfer (Sort: 30-99-50 / Acc: 34785863)</strong>, <strong>Scan-to-Pay QR</strong>, or our <strong>Interactive Brick Wall</strong>.</p>
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
    aiChatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = aiChatInput.value.trim();
      if (!userText) return;

      appendChatMessage('user', userText);
      aiChatInput.value = '';
      playSoftChime();

      // Show typing indicator
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-msg bot';
      typingDiv.innerHTML = '<div class="ai-msg-bubble"><em>Typing...</em></div>';
      aiChatMessages.appendChild(typingDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

      const botReply = await getAiResponse(userText);
      aiChatMessages.removeChild(typingDiv);
      appendChatMessage('bot', botReply);
    });
  }

  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', async () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        appendChatMessage('user', query);
        playSoftChime();
        
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-msg bot';
        typingDiv.innerHTML = '<div class="ai-msg-bubble"><em>Typing...</em></div>';
        aiChatMessages.appendChild(typingDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        const botReply = await getAiResponse(query);
        aiChatMessages.removeChild(typingDiv);
        appendChatMessage('bot', botReply);
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

    const scrollProgressBar = document.getElementById('scrollProgressBar');
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${(scrollPercent * 100).toFixed(1)}%`;
    }

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

      const payMethod = document.querySelector('input[name="paymethod"]:checked')?.value || 'gofundme';
      const name = donorName.value.trim() || 'Generous Supporter';
      const amount = parseFloat(customAmountInput.value) || 100;
      const purpose = document.querySelector('input[name="purpose"]:checked')?.value || 'Masjid Property Fund';
      const isGiftAid = giftAidCheck.checked;
      const notes = donorNotes.value.trim();
      const sym = currencyRates[activeCurrency].symbol;

      if (payMethod === 'gofundme' || payMethod === 'card') {
        showToast('Opening official GoFundMe campaign... JazakAllah Khairan!');
        window.open('https://www.gofundme.com/f/chichester-mosque', '_blank');
        
        addDonorToWall({
          name: `${name} (via ${payMethod === 'card' ? 'Card Checkout' : 'GoFundMe'})`,
          amount: amount,
          notes: notes || 'Pledged on official GoFundMe page towards Chichester Masjid.',
          time: 'Just now'
        });
        return;
      }

      paymentModalContent.innerHTML = `
        <div class="spinner-ring"></div>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--text-dark); margin-bottom: 8px;">Pledge Recorded — Awaiting Bank/QR Transfer</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Recording your pledge of <strong>${sym}${amount.toFixed(2)}</strong> for Chichester Jamia Centre (CIO 1148130).</p>
      `;
      paymentModal.classList.add('active');

      setTimeout(() => {
        const refId = 'CJC-' + Math.floor(100000 + Math.random() * 900000);
        const amountGBP = amount / currencyRates[activeCurrency].rate;

        campaignState.raisedGBP += amountGBP;
        campaignState.donors += 1;
        updateCampaignUI();

        const methodTitle = payMethod === 'bank' 
          ? 'Bank Transfer Pledge Recorded (Awaiting Transfer)' 
          : 'QR Payment Pledge Recorded';

        submitToWebhook('pledge', { name, amount, purpose, payMethod, refId });

        const methodInstructions = payMethod === 'bank'
          ? `<div style="background: rgba(245,158,11,0.12); border-left: 3px solid var(--accent-gold); padding: 10px 12px; border-radius: 6px; margin-top: 10px; font-size: 0.85rem; color: var(--text-dark);">
              <strong>Next Step:</strong> Please complete your transfer of <strong>${sym}${amount.toFixed(2)}</strong> via your online banking app to <strong>Lloyds Bank</strong>: Sort Code <strong>30-99-50</strong>, Account <strong>34785863</strong>, Reference <strong>MASJID</strong>.
            </div>`
          : payMethod === 'qr'
            ? `<div style="background: rgba(16,185,129,0.1); border-left: 3px solid var(--primary-emerald); padding: 10px 12px; border-radius: 6px; margin-top: 10px; font-size: 0.85rem; color: var(--text-dark);">
                <strong>QR Pay Confirmed:</strong> Thank you for scanning our Lloyds Bank QR code (Sort 30-95-96 / Acc 1279 8836).
              </div>`
            : '';

        paymentModalContent.innerHTML = `
          <div style="text-align: center;">
            <div style="width: 54px; height: 54px; background: #ecfdf5; color: #047857; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--text-dark); margin-bottom: 4px;">JazakAllah Khairan, ${name}!</h3>
            <p style="color: var(--primary-emerald); font-weight: 700; font-size: 1rem; margin-bottom: 16px;">${methodTitle}</p>
            
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
              ${methodInstructions}
            </div>

            <div style="display:flex; gap:10px; flex-direction:column;">
              <button class="btn btn-gold btn-block" id="btnShowCertFromPayment">📜 View &amp; Print Sadaqah Certificate</button>
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
  // 17. Prayer Times Widget (Chichester, UK) - Wifaqul Ulama Hanafi Sync
  // ------------------------------------------------------------------
  async function initPrayerTimes() {
    const today = new Date();
    const hijriDateDisplay = document.getElementById('hijriDateDisplay');
    
    // Fetch Wifaqul Ulama Hanafi Prayer Times (Custom Method 99, Fajr 18deg, Isha 15deg, Hanafi School 1)
    let timings = {
      Fajr: "05:32", Sunrise: "07:05", Dhuhr: "13:02", Asr: "16:18", Maghrib: "18:46", Isha: "20:15"
    };

    try {
      const response = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Chichester&country=UK&method=99&methodSettings=18,null,15&school=1");
      const data = await response.json();
      if(data && data.data && data.data.timings) {
        timings = data.data.timings;
        livePrayerTimings = timings;
        const hDate = data.data.date.hijri;
        if(hijriDateDisplay) {
            hijriDateDisplay.textContent = `${hDate.day} ${hDate.month.en} ${hDate.year} AH • ${today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
      }
    } catch(e) {
      console.error("Failed to fetch prayer times", e);
      if(hijriDateDisplay) {
        hijriDateDisplay.textContent = `23 Rabi' al-Thani 1448 AH • ${today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
      }
    }

    // Function to convert 24h to 12h format
    const formatTime = (time24) => {
        const [h, m] = time24.split(':');
        const hInt = parseInt(h);
        const ampm = hInt >= 12 ? 'PM' : 'AM';
        const h12 = hInt % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
    };

    // Add 15 mins for Iqamah roughly
    const formatIqamah = (time24, minsToAdd) => {
        const [h, m] = time24.split(':');
        let date = new Date();
        date.setHours(parseInt(h), parseInt(m) + minsToAdd, 0);
        const hInt = date.getHours();
        const ampm = hInt >= 12 ? 'PM' : 'AM';
        const h12 = hInt % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`;
    };

    if(document.getElementById('ptFajr')) {
      document.querySelector('#ptFajr .pt-time').textContent = formatTime(timings.Fajr);
      document.querySelector('#ptFajr .pt-iqamah').textContent = `Iqamah: ${formatIqamah(timings.Fajr, 30)}`;
      
      document.querySelector('#ptSunrise .pt-time').textContent = formatTime(timings.Sunrise);
      
      document.querySelector('#ptDhuhr .pt-time').textContent = formatTime(timings.Dhuhr);
      document.querySelector('#ptDhuhr .pt-iqamah').textContent = `Iqamah: ${formatIqamah(timings.Dhuhr, 15)}`;
      
      document.querySelector('#ptAsr .pt-time').textContent = formatTime(timings.Asr);
      document.querySelector('#ptAsr .pt-iqamah').textContent = `Iqamah: ${formatIqamah(timings.Asr, 15)}`;
      
      document.querySelector('#ptMaghrib .pt-time').textContent = formatTime(timings.Maghrib);
      document.querySelector('#ptMaghrib .pt-iqamah').textContent = `Iqamah: ${formatIqamah(timings.Maghrib, 5)}`;
      
      document.querySelector('#ptIsha .pt-time').textContent = formatTime(timings.Isha);
      document.querySelector('#ptIsha .pt-iqamah').textContent = `Iqamah: ${formatIqamah(timings.Isha, 15)}`;

      const suhoorValEl = document.getElementById('suhoorTimeVal');
      const iftarValEl = document.getElementById('iftarTimeVal');
      if (suhoorValEl) suhoorValEl.textContent = formatTime(timings.Fajr);
      if (iftarValEl) iftarValEl.textContent = formatTime(timings.Maghrib);
    }

    const nextPrayerCountdown = document.getElementById('nextPrayerCountdown');
    const nextPrayerName = document.getElementById('nextPrayerName');
    
    function updateCountdown() {
      const now = new Date();
      
      // Order of prayers to check next
      const prayerList = [
        {name: 'Fajr', time: timings.Fajr},
        {name: 'Sunrise', time: timings.Sunrise},
        {name: 'Dhuhr', time: timings.Dhuhr},
        {name: 'Asr', time: timings.Asr},
        {name: 'Maghrib', time: timings.Maghrib},
        {name: 'Isha', time: timings.Isha}
      ];

      let nextPrayer = prayerList[0];
      let foundNext = false;
      let targetDate = new Date();

      for(let p of prayerList) {
          const [h, m] = p.time.split(':');
          let pDate = new Date();
          pDate.setHours(h, m, 0);
          if(now < pDate) {
              nextPrayer = p;
              targetDate = pDate;
              foundNext = true;
              break;
          }
      }

      // If all passed, next is Fajr tomorrow
      if(!foundNext) {
          const [h, m] = prayerList[0].time.split(':');
          targetDate.setDate(targetDate.getDate() + 1);
          targetDate.setHours(h, m, 0);
          nextPrayer = prayerList[0];
      }

      const diff = targetDate - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (nextPrayerCountdown) {
        nextPrayerCountdown.textContent = `in ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      if (nextPrayerName) {
        nextPrayerName.textContent = nextPrayer.name;
      }
      
      // Highlight active
      document.querySelectorAll('.pt-card').forEach(c => c.classList.remove('active-prayer'));
      if(nextPrayer.name === 'Fajr' && !foundNext) {
          // If after Isha, Isha is active
          document.getElementById('ptIsha')?.classList.add('active-prayer');
      } else {
          // Find the one before nextPrayer
          const idx = prayerList.findIndex(p => p.name === nextPrayer.name);
          if(idx > 0) {
              document.getElementById('pt' + prayerList[idx-1].name)?.classList.add('active-prayer');
          }
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  initPrayerTimes();

  // ------------------------------------------------------------------
  // 17b. Interactive Adhan (Call to Prayer) Audio Synthesizer & Du'a
  // ------------------------------------------------------------------
  function initAdhanPlayer() {
    const btnPlayAdhan = document.getElementById('btnPlayAdhan');
    const adhanPlayerCard = document.getElementById('adhanPlayerCard');
    const adhanStyleSelect = document.getElementById('adhanStyleSelect');
    const adhanTrackTitle = document.getElementById('adhanTrackTitle');
    const adhanStyleTag = document.getElementById('adhanStyleTag');
    const adhanTimeDisplay = document.getElementById('adhanTimeDisplay');
    const adhanStatusText = document.getElementById('adhanStatusText');
    const btnMuteAdhan = document.getElementById('btnMuteAdhan');
    const adhanVolSlider = document.getElementById('adhanVolSlider');
    const btnToggleDua = document.getElementById('btnToggleDua');
    const adhanDuaContent = document.getElementById('adhanDuaContent');
    const btnCopyDua = document.getElementById('btnCopyDua');

    if (!btnPlayAdhan || !adhanPlayerCard) return;

    let audioCtx = null;
    let masterGain = null;
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 0.8;
    let currentTimer = null;
    let secondsElapsed = 0;
    const totalDurationSeconds = 195; // 03:15
    let activeOscillators = [];

    // Maqam Bayati Harmonic Frequencies (Hz)
    const bayatiScale = {
      D4: 293.66,
      Ebayati: 315.00, // Quarter-tone bayati second
      F4: 349.23,
      G4: 392.00,
      A4: 440.00,
      Bb4: 466.16,
      C5: 523.25,
      D5: 587.33
    };

    // Melodic motif phrases of the Adhan
    const adhanPhrases = [
      // Allahu Akbar, Allahu Akbar
      { notes: [bayatiScale.D4, bayatiScale.G4, bayatiScale.F4, bayatiScale.G4, bayatiScale.A4, bayatiScale.G4, bayatiScale.F4, bayatiScale.Ebayati, bayatiScale.D4], duration: 14 },
      // Allahu Akbar, Allahu Akbar
      { notes: [bayatiScale.D4, bayatiScale.G4, bayatiScale.A4, bayatiScale.Bb4, bayatiScale.A4, bayatiScale.G4, bayatiScale.F4, bayatiScale.D4], duration: 15 },
      // Ash-hadu alla ilaha illallah
      { notes: [bayatiScale.D4, bayatiScale.F4, bayatiScale.G4, bayatiScale.A4, bayatiScale.Bb4, bayatiScale.A4, bayatiScale.G4, bayatiScale.F4, bayatiScale.Ebayati, bayatiScale.D4], duration: 18 },
      // Ash-hadu anna Muhammadan Rasulullah
      { notes: [bayatiScale.G4, bayatiScale.A4, bayatiScale.Bb4, bayatiScale.C5, bayatiScale.Bb4, bayatiScale.A4, bayatiScale.G4, bayatiScale.F4, bayatiScale.D4], duration: 20 },
      // Hayya 'alas-Salah
      { notes: [bayatiScale.A4, bayatiScale.C5, bayatiScale.D5, bayatiScale.C5, bayatiScale.Bb4, bayatiScale.A4, bayatiScale.G4, bayatiScale.F4], duration: 22 },
      // Hayya 'alal-Falah
      { notes: [bayatiScale.G4, bayatiScale.Bb4, bayatiScale.C5, bayatiScale.Bb4, bayatiScale.A4, bayatiScale.G4, bayatiScale.F4, bayatiScale.Ebayati, bayatiScale.D4], duration: 22 },
      // Allahu Akbar, Allahu Akbar
      { notes: [bayatiScale.D4, bayatiScale.G4, bayatiScale.A4, bayatiScale.G4, bayatiScale.F4, bayatiScale.D4], duration: 14 },
      // La ilaha illallah
      { notes: [bayatiScale.D4, bayatiScale.F4, bayatiScale.G4, bayatiScale.F4, bayatiScale.Ebayati, bayatiScale.D4], duration: 16 }
    ];

    function stopAllAudio() {
      activeOscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch(e) {}
      });
      activeOscillators = [];
      if (currentTimer) {
        clearInterval(currentTimer);
        currentTimer = null;
      }
      isPlaying = false;
      adhanPlayerCard.classList.remove('adhan-playing');
      const playSvg = btnPlayAdhan.querySelector('.play-svg');
      const stopSvg = btnPlayAdhan.querySelector('.stop-svg');
      if (playSvg) playSvg.classList.remove('hidden');
      if (stopSvg) stopSvg.classList.add('hidden');
      if (adhanStatusText) adhanStatusText.textContent = "Call to Prayer (Adhan)";
      if (adhanTimeDisplay) adhanTimeDisplay.textContent = `00:00 / 03:15`;
      secondsElapsed = 0;
    }

    function playTone(freq, startTime, noteDuration) {
      if (!audioCtx || !masterGain) return;

      // Primary tone (warm triangle oscillator)
      const osc1 = audioCtx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, startTime);

      // Sub-harmonic octave (fullness/warmth)
      const osc2 = audioCtx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 0.5, startTime);

      // Vocal warmth envelope filter
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);
      filter.Q.setValueAtTime(1.5, startTime);

      // Individual note gain envelope (soft vocal attack & slow resonant release)
      const noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.4, startTime + 0.35);
      noteGain.gain.setValueAtTime(0.35, startTime + noteDuration - 0.5);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

      // Subtle vibrato (5 Hz vocal natural modulation)
      const vibrato = audioCtx.createOscillator();
      const vibratoGain = audioCtx.createGain();
      vibrato.frequency.setValueAtTime(4.8, startTime);
      vibratoGain.gain.setValueAtTime(3.5, startTime);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      vibrato.start(startTime);

      osc1.stop(startTime + noteDuration);
      osc2.stop(startTime + noteDuration);
      vibrato.stop(startTime + noteDuration);

      activeOscillators.push(osc1, osc2, vibrato);
    }

    function startAdhanPlayback() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          showToast('Audio API not supported in this browser');
          return;
        }

        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }

        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        masterGain = audioCtx.createGain();
        const currentVol = parseFloat(adhanVolSlider?.value || 80) / 100;
        masterGain.gain.setValueAtTime(isMuted ? 0 : currentVol * 0.6, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        stopAllAudio();
        isPlaying = true;
        secondsElapsed = 0;

        adhanPlayerCard.classList.add('adhan-playing');
        const playSvg = btnPlayAdhan.querySelector('.play-svg');
        const stopSvg = btnPlayAdhan.querySelector('.stop-svg');
        if (playSvg) playSvg.classList.add('hidden');
        if (stopSvg) stopSvg.classList.remove('hidden');

        const styleName = adhanStyleSelect ? adhanStyleSelect.options[adhanStyleSelect.selectedIndex].text : "Makkah";
        if (adhanStatusText) adhanStatusText.textContent = `Live: ${styleName}`;

        let curTime = audioCtx.currentTime + 0.1;

        // Schedule melodic sequence
        adhanPhrases.forEach(phrase => {
          const noteLen = phrase.duration / phrase.notes.length;
          phrase.notes.forEach(noteFreq => {
            playTone(noteFreq, curTime, noteLen * 1.15);
            curTime += noteLen;
          });
          curTime += 1.2; // Breath pause between sacred phrases
        });

        // Live seconds counter
        currentTimer = setInterval(() => {
          secondsElapsed++;
          const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
          const s = String(secondsElapsed % 60).padStart(2, '0');
          if (adhanTimeDisplay) adhanTimeDisplay.textContent = `${m}:${s} / 03:15`;

          if (secondsElapsed >= totalDurationSeconds) {
            stopAllAudio();
            showToast('Adhan completed. Recite the Sunnah Du\'a below 📖');
            if (adhanDuaContent) {
              adhanDuaContent.classList.remove('hidden');
              btnToggleDua?.classList.add('open');
            }
          }
        }, 1000);

        showToast(`Playing Adhan (${styleName}) 🕌`);

      } catch(err) {
        console.error("Adhan audio synthesis failed", err);
        showToast('Playback started. May Allah accept our prayers.');
      }
    }

    btnPlayAdhan.addEventListener('click', () => {
      if (isPlaying) {
        stopAllAudio();
        showToast('Adhan stopped');
      } else {
        startAdhanPlayback();
      }
    });

    adhanStyleSelect?.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected === 'makkah') {
        if (adhanTrackTitle) adhanTrackTitle.textContent = "Adhan — Makkah Al-Mukarramah (Sheikh Ali Mulla)";
        if (adhanStyleTag) adhanStyleTag.textContent = "Makkah Mukarramah";
      } else if (selected === 'madinah') {
        if (adhanTrackTitle) adhanTrackTitle.textContent = "Adhan — Madinah Al-Munawwarah (Sheikh Essam Bukhari)";
        if (adhanStyleTag) adhanStyleTag.textContent = "Madinah Munawwarah";
      } else {
        if (adhanTrackTitle) adhanTrackTitle.textContent = "Fajr Adhan — (As-Salatu Khayrun Minan Nawm)";
        if (adhanStyleTag) adhanStyleTag.textContent = "Fajr Special";
      }

      if (isPlaying) {
        stopAllAudio();
        startAdhanPlayback();
      }
    });

    adhanVolSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      lastVolume = val;
      isMuted = (val === 0);
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(val * 0.6, audioCtx.currentTime);
      }
    });

    btnMuteAdhan?.addEventListener('click', () => {
      if (!isMuted) {
        isMuted = true;
        if (masterGain && audioCtx) masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        if (adhanVolSlider) adhanVolSlider.value = 0;
        showToast('Adhan muted 🔇');
      } else {
        isMuted = false;
        const restore = lastVolume > 0.1 ? lastVolume : 0.8;
        if (masterGain && audioCtx) masterGain.gain.setValueAtTime(restore * 0.6, audioCtx.currentTime);
        if (adhanVolSlider) adhanVolSlider.value = restore * 100;
        showToast('Adhan unmuted 🔊');
      }
    });

    // Sunnah Post-Adhan Du'a Accordion
    btnToggleDua?.addEventListener('click', () => {
      if (!adhanDuaContent) return;
      const isHidden = adhanDuaContent.classList.contains('hidden');
      if (isHidden) {
        adhanDuaContent.classList.remove('hidden');
        btnToggleDua.classList.add('open');
        btnToggleDua.setAttribute('aria-expanded', 'true');
      } else {
        adhanDuaContent.classList.add('hidden');
        btnToggleDua.classList.remove('open');
        btnToggleDua.setAttribute('aria-expanded', 'false');
      }
    });

    // Copy Du'a Button
    btnCopyDua?.addEventListener('click', function() {
      const duaText = `اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ\n\nAllahumma Rabba hadhihid-da'watit-tammah, was-salatil-qa'imah, ati Muhammadan al-wasilata wal-fadilah, wab'ath-hu maqamam-mahmudan alladhi wa'adtah.\n\n"O Allah, Lord of this perfect call and established prayer, grant Muhammad the status of intercession and virtue, and resurrect him to the praiseworthy station which You have promised." (Sahih al-Bukhari 614)`;
      copyToClipboard(duaText, "Sunnah Du'a", this);
    });
  }

  initAdhanPlayer();

  // ------------------------------------------------------------------
  // 17c. Ramadan 1448 AH Target Countdown Tracker
  // ------------------------------------------------------------------
  function initRamadanCountdown() {
    const rcDays = document.getElementById('rcDays');
    const rcHours = document.getElementById('rcHours');
    const rcMins = document.getElementById('rcMins');
    const rcSecs = document.getElementById('rcSecs');

    if (!rcDays) return;

    // Projected start of Ramadan 1448 AH (approx February 7, 2027)
    const ramadanTarget = new Date('2027-02-07T18:00:00Z');

    function updateRamadan() {
      const now = new Date();
      const diff = ramadanTarget - now;

      if (diff <= 0) {
        rcDays.textContent = "00";
        rcHours.textContent = "00";
        rcMins.textContent = "00";
        rcSecs.textContent = "00";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      rcDays.textContent = String(days).padStart(2, '0');
      rcHours.textContent = String(hours).padStart(2, '0');
      rcMins.textContent = String(mins).padStart(2, '0');
      rcSecs.textContent = String(secs).padStart(2, '0');
    }

    updateRamadan();
    setInterval(updateRamadan, 1000);
  }

  initRamadanCountdown();

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
  window.showToast = showToast;

  function setButtonCopiedVisual(btn) {
    if (!btn) return;
    if (!btn._origHtml) {
      btn._origHtml = btn.innerHTML;
    }
    btn.classList.add('copy-success');
    
    // Check if there is an inner text span to update
    const span = btn.querySelector('span:not(.mb-icon)');
    if (span) {
      span.textContent = '✓ Copied!';
    } else {
      btn.innerHTML = '✓ Copied!';
    }

    clearTimeout(btn._copiedTimer);
    btn._copiedTimer = setTimeout(() => {
      btn.classList.remove('copy-success');
      if (btn._origHtml) {
        btn.innerHTML = btn._origHtml;
        delete btn._origHtml;
      }
    }, 2000);
  }

  function fallbackCopyText(text, cb) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      if (cb) cb();
    } catch (e) {
      if (cb) cb();
    }
    document.body.removeChild(textArea);
  }

  function copyToClipboard(text, label, triggerBtn) {
    const onSuccess = () => {
      showToast(`${label} copied! (${text})`);
      if (triggerBtn) setButtonCopiedVisual(triggerBtn);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
        fallbackCopyText(text, onSuccess);
      });
    } else {
      fallbackCopyText(text, onSuccess);
    }
  }

  window.copyToClipboard = copyToClipboard;
  window.setButtonCopiedVisual = setButtonCopiedVisual;

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', function() {
      const text = this.getAttribute('data-copy');
      copyToClipboard(text, 'Detail', this);
    });
  });

  document.getElementById('quickCopyBankTop')?.addEventListener('click', function() {
    copyToClipboard('Sort Code: 30-99-50 | Account: 34785863 | Bank: Lloyds Bank', 'Full Bank Details', this);
  });

  document.getElementById('copyAllBankDetails')?.addEventListener('click', function() {
    const info = `CHICHESTER JAMIA CENTRE\nBank: Lloyds Bank\nSort Code: 30-99-50\nAccount No: 34785863\nRef: MASJID`;
    copyToClipboard(info, 'Full Bank Transfer Details', this);
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
  document.getElementById('copyShareLinkBtn')?.addEventListener('click', function() {
    copyToClipboard(gofundmeUrl, 'GoFundMe Link', this);
  });

  // ------------------------------------------------------------------
  // 19. Interactive Transformation Switcher (Pub -> Masjid -> Vision)
  // ------------------------------------------------------------------
  const transStages = {
    past: {
      image: "assets/real_building_wickham_before.jpg",
      badge: "Past: The Wickham Arms Pub",
      title: "The Wickham Arms Commercial Pub (Before)",
      desc: "For decades, 102 Bognor Road operated as a commercial English public house and beer garden serving alcoholic drinks. Through generous community donations and grassroots momentum, this landmark property was identified for acquisition to be transformed into a sacred house of prayer, education, and community benefit.",
      status: "Phase 1: Historic English Pub • Ceased Commercial Operations",
      statusColor: "#ef4444",
      specs: [
        { icon: "📍", text: "<strong>Location:</strong> 102 Bognor Rd, Chichester, PO19 7TW" },
        { icon: "🍺", text: "<strong>Original Use:</strong> Licensed Public House & Beer Garden" },
        { icon: "🏛", text: "<strong>Architecture:</strong> Flint Cobblestones & Red Brick Dressings" },
        { icon: "🛑", text: "<strong>Status:</strong> Permanently Closed; Acquired for Community" }
      ]
    },
    present: {
      image: "assets/real_building_jamia.jpg",
      badge: "Present: Chichester Jamia Centre",
      title: "Chichester Jamia Centre (Current Milestone)",
      desc: "The property at 102 Bognor Road has been successfully secured under our Charitable Incorporated Organisation (CIO). The official 'Chichester Jamia Centre' signage is installed above the entrance. With £230k already secured in the bank, we now require £350k to complete the purchase and comprehensive interior refurbishment.",
      status: "Phase 2: Property Secured • Refurbishment Appeal",
      statusColor: "var(--primary-emerald)",
      specs: [
        { icon: "📍", text: "<strong>Location:</strong> 102 Bognor Rd, Chichester, PO19 7TW" },
        { icon: "🏛", text: "<strong>Architecture:</strong> Traditional Sussex Flint Stone & Red Brick" },
        { icon: "🚗", text: "<strong>Facilities:</strong> Private On-Site Car Park & Courtyard" },
        { icon: "📜", text: "<strong>Charity Status:</strong> Registered UK Charity No. 1148130" }
      ]
    },
    future: {
      image: "assets/building_refurbished_concept.jpg",
      badge: "Future: Refurbished Masjid Vision",
      title: "Chichester's First Permanent Masjid (Envisioned Vision)",
      desc: "A permanent sanctuary accommodating 300+ worshipers for daily 5-time prayers and Jumu'ah, dedicated sisters' prayer hall and wudu facilities, Weekend Madrasa classrooms, library, and peaceful landscaped courtyard.",
      status: "Phase 3: Refurbished House of Allah • Serving Generations",
      statusColor: "var(--accent-gold)",
      specs: [
        { icon: "🕌", text: "<strong>Main Hall:</strong> 200+ Worshipers with Acoustic Sound" },
        { icon: "🧕", text: "<strong>Sisters Sanctuary:</strong> 100+ Worshipers with Creche" },
        { icon: "📚", text: "<strong>Education:</strong> 3 Madrasa Classrooms & Library" },
        { icon: "♿", text: "<strong>Accessibility:</strong> Full Step-free Wheelchair Access" }
      ]
    }
  };

  const transStageImg = document.getElementById('transStageImg');
  const transBadge = document.getElementById('transBadge');
  const transStatusText = document.getElementById('transStatusText');
  const transStageTitle = document.getElementById('transStageTitle');
  const transStageDesc = document.getElementById('transStageDesc');
  const transSpecsGrid = document.getElementById('transSpecsGrid');
  const btnZoomTrans = document.getElementById('btnZoomTrans');

  function setTransformationStage(stageKey) {
    const data = transStages[stageKey];
    if (!data) return;

    // Update active tab buttons
    document.querySelectorAll('.trans-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.stage === stageKey);
    });

    // Update milestone trio cards
    document.querySelectorAll('[data-stage-jump]').forEach(card => {
      card.classList.toggle('active', card.dataset.stageJump === stageKey);
    });

    // Animate image switch
    if (transStageImg) {
      transStageImg.style.opacity = '0';
      transStageImg.style.transform = 'scale(0.98)';
      setTimeout(() => {
        transStageImg.src = data.image;
        transStageImg.alt = data.title;
        transStageImg.style.opacity = '1';
        transStageImg.style.transform = 'scale(1)';
      }, 150);
    }

    if (transBadge) transBadge.textContent = data.badge;
    if (transStatusText) transStatusText.textContent = data.status;
    if (transStageTitle) transStageTitle.textContent = data.title;
    if (transStageDesc) transStageDesc.textContent = data.desc;

    if (transSpecsGrid) {
      transSpecsGrid.innerHTML = data.specs.map(s => `
        <div class="tsg-item">
          <span class="tsg-icon">${s.icon}</span>
          <div>${s.text}</div>
        </div>
      `).join('');
    }

    if (btnZoomTrans) {
      btnZoomTrans.setAttribute('data-img', data.image);
      btnZoomTrans.setAttribute('data-caption', `${data.title} — ${data.badge}`);
    }
  }

  document.querySelectorAll('.trans-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTransformationStage(btn.dataset.stage);
    });
  });

  document.querySelectorAll('[data-stage-jump]').forEach(card => {
    card.addEventListener('click', () => {
      const stage = card.dataset.stageJump;
      setTransformationStage(stage);
      document.getElementById('transformationDisplay')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // ------------------------------------------------------------------
  // 20. Dual Bank Account Switcher Logic
  // ------------------------------------------------------------------
  const bankTabAcc1 = document.getElementById('bankTabAcc1');
  const bankTabAcc2 = document.getElementById('bankTabAcc2');
  const currentSortCodeDisplay = document.getElementById('currentSortCodeDisplay');
  const currentAccNoDisplay = document.getElementById('currentAccNoDisplay');
  const copySortCodeBtn = document.getElementById('copySortCodeBtn');
  const copyAccNoBtn = document.getElementById('copyAccNoBtn');

  function setBankAccount(accKey) {
    if (accKey === 'acc1') {
      bankTabAcc1?.classList.add('active');
      bankTabAcc2?.classList.remove('active');
      if (currentSortCodeDisplay) currentSortCodeDisplay.textContent = '30-99-50';
      if (currentAccNoDisplay) currentAccNoDisplay.textContent = '34785863';
      copySortCodeBtn?.setAttribute('data-copy', '30-99-50');
      copyAccNoBtn?.setAttribute('data-copy', '34785863');
    } else {
      bankTabAcc2?.classList.add('active');
      bankTabAcc1?.classList.remove('active');
      if (currentSortCodeDisplay) currentSortCodeDisplay.textContent = '30-95-96';
      if (currentAccNoDisplay) currentAccNoDisplay.textContent = '1279 8836';
      copySortCodeBtn?.setAttribute('data-copy', '30-95-96');
      copyAccNoBtn?.setAttribute('data-copy', '1279 8836');
    }
  }

  bankTabAcc1?.addEventListener('click', () => setBankAccount('acc1'));
  bankTabAcc2?.addEventListener('click', () => setBankAccount('acc2'));

  // ------------------------------------------------------------------
  // 21. Interactive Fullscreen Image Lightbox Modal
  // ------------------------------------------------------------------
  const imageLightboxModal = document.getElementById('imageLightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');

  function openLightbox(src, caption) {
    if (!imageLightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || 'Chichester Jamia Centre';
    imageLightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (imageLightboxModal) imageLightboxModal.classList.remove('active');
  }

  closeLightboxBtn?.addEventListener('click', closeLightbox);
  imageLightboxModal?.addEventListener('click', (e) => {
    if (e.target === imageLightboxModal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && imageLightboxModal?.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach lightbox to all zoom buttons and lightbox triggers
  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const imgPath = el.getAttribute('data-lightbox');
      const caption = el.getAttribute('data-caption') || el.getAttribute('title');
      openLightbox(imgPath, caption);
    });
  });

  btnZoomTrans?.addEventListener('click', () => {
    const imgPath = btnZoomTrans.getAttribute('data-img');
    const caption = btnZoomTrans.getAttribute('data-caption') || 'Chichester Jamia Centre Transformation';
    openLightbox(imgPath, caption);
  });

  // ------------------------------------------------------------------
  // 22. Daily Islamic Inspiration (Ayat & Hadith of the Day)
  // ------------------------------------------------------------------
  const inspirations = [
    {
      category: "Building Masjids",
      arabic: "مَنْ بَنَى مَسْجِدًا لِلَّهِ كَمَفْحَصِ قَطَاةٍ أَوْ أَصْغَرَ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ",
      transliteration: '"Man bana masjidan lillahi kamafhasi qatatin aw asghara banallahu lahu baytan fil-Jannah."',
      translation: '"Whoever builds a mosque for the sake of Allah, like a sparrow\'s nest or even smaller, Allah will build for him a house in Paradise."',
      reference: "— Sunan Ibn Majah 738 (Sahih)"
    },
    {
      category: "Sadaqah Jariyah",
      arabic: "إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ",
      transliteration: '"Iza mata ibnu adama inqata\'a \'amaluhu illa min thalathin: sadaqatin jariyah, aw \'ilmin yuntafa\'u bih, aw waladin salihin yad\'u lah."',
      translation: '"When a person dies, his deeds come to an end except for three: ongoing charity (Sadaqah Jariyah), knowledge from which benefit is derived, or a righteous child who prays for him."',
      reference: "— Sahih Muslim 1631"
    },
    {
      category: "Blessing of Charity",
      arabic: "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنْبُلَةٍ مِائَةُ حَبَّةٍ",
      transliteration: '"Mathalul-latheena yunfiqoona amwalahum fee sabeelillahi kamathali habbatin ambatat sab\'a sanabila fee kulli sumbulatim mi\'atu habbah."',
      translation: '"The example of those who spend their wealth in the way of Allah is like a seed of grain which grows seven spikes; in each spike is a hundred grains. And Allah multiplies for whom He wills."',
      reference: "— Surah Al-Baqarah (2:261)"
    },
    {
      category: "Mosque Establishment",
      arabic: "إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَأَقَامَ الصَّلَاةَ وَآتَى الزَّكَاةَ وَلَمْ يَخْشَ إِلَّا اللَّهَ",
      transliteration: '"Innama ya\'muru masajidallahi man amana billahi wal-yawmil-akhiri wa aqamas-salata wa ataz-zakata wa lam yakhsha illallah."',
      translation: '"The mosques of Allah are only to be maintained by those who believe in Allah and the Last Day and establish prayer and give zakah and do not fear except Allah."',
      reference: "— Surah At-Tawbah (9:18)"
    },
    {
      category: "Generosity & Protection",
      arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا",
      transliteration: '"Ma naqasat sadaqatun min mal, wa ma zadallahu \'abdan bi\'afwin illa \'izza."',
      translation: '"Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for Allah except that Allah raises him."',
      reference: "— Sahih Muslim 2588"
    }
  ];

  let currentInspIndex = 0;
  const inspCategory = document.getElementById('inspCategory');
  const inspArabic = document.getElementById('inspArabic');
  const inspTransliteration = document.getElementById('inspTransliteration');
  const inspTranslation = document.getElementById('inspTranslation');
  const inspReference = document.getElementById('inspReference');
  const btnNextInspiration = document.getElementById('btnNextInspiration');
  const btnCopyInspiration = document.getElementById('btnCopyInspiration');
  const btnShareWhatsAppInspiration = document.getElementById('btnShareWhatsAppInspiration');
  const btnSpeakInspiration = document.getElementById('btnSpeakInspiration');

  function renderInspiration(index) {
    const item = inspirations[index];
    if (!item) return;
    const card = document.getElementById('inspirationCard');
    if (card) {
      card.style.opacity = '0.3';
      card.style.transform = 'scale(0.98)';
      setTimeout(() => {
        if (inspCategory) inspCategory.textContent = item.category;
        if (inspArabic) inspArabic.textContent = item.arabic;
        if (inspTransliteration) inspTransliteration.textContent = item.transliteration;
        if (inspTranslation) inspTranslation.textContent = item.translation;
        if (inspReference) inspReference.textContent = item.reference;
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 200);
    }
  }

  btnNextInspiration?.addEventListener('click', () => {
    currentInspIndex = (currentInspIndex + 1) % inspirations.length;
    renderInspiration(currentInspIndex);
    playSoftChime();
  });

  btnCopyInspiration?.addEventListener('click', function() {
    const item = inspirations[currentInspIndex];
    const textToCopy = `${item.arabic}\n\n${item.transliteration}\n\n${item.translation}\n${item.reference}\n\nSupport Chichester's 1st Masjid: https://www.gofundme.com/f/chichester-mosque`;
    copyToClipboard(textToCopy, 'Reflection Quote', this);
  });

  btnShareWhatsAppInspiration?.addEventListener('click', () => {
    const item = inspirations[currentInspIndex];
    const shareText = encodeURIComponent(`*Chichester Jamia Centre Daily Reflection:*\n\n${item.arabic}\n\n${item.translation}\n_${item.reference}_\n\nHelp establish the first Masjid in Chichester:\nhttps://www.gofundme.com/f/chichester-mosque`);
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  });

  btnSpeakInspiration?.addEventListener('click', () => {
    const item = inspirations[currentInspIndex];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.translation);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showToast('Playing spoken translation 🔊', 'info');
    } else {
      showToast('Speech synthesis not supported in this browser', 'info');
    }
  });

  // ------------------------------------------------------------------
  // 23. Jumu'ah Friday Calendar Integration (Google Cal & .ics)
  // ------------------------------------------------------------------
  const btnAddToGoogleCal = document.getElementById('btnAddToGoogleCal');
  const btnDownloadIcsCal = document.getElementById('btnDownloadIcsCal');

  btnAddToGoogleCal?.addEventListener('click', () => {
    const title = encodeURIComponent("Jumu'ah Friday Prayer — Chichester Jamia Centre");
    const details = encodeURIComponent("Weekly Friday Jumu'ah Khutbah & Congregation Prayer at Chichester Jamia Centre (Charity No. 1148130). Please arrive early for Wudu and Sunnah prayers.");
    const location = encodeURIComponent("102 Bognor Rd, Chichester, PO19 7TW, United Kingdom");
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&recur=RRULE:FREQ=WEEKLY;BYDAY=FR`;
    window.open(gCalUrl, '_blank');
  });

  btnDownloadIcsCal?.addEventListener('click', () => {
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Chichester Jamia Centre//Jumuah Prayer//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Jumu'ah Prayer — Chichester Jamia Centre
DESCRIPTION:Weekly Friday Jumu'ah Khutbah & Congregation Prayer at Chichester Jamia Centre (Charity No. 1148130).
LOCATION:102 Bognor Rd, Chichester PO19 7TW
RRULE:FREQ=WEEKLY;BYDAY=FR
DTSTART:20261016T121500Z
DTEND:20261016T131500Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'chichester_jumuah_prayer.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Jumu\'ah calendar event downloaded! 📅', 'success');
  });

  const btnCopyPrayerTimes = document.getElementById('btnCopyPrayerTimes');
  btnCopyPrayerTimes?.addEventListener('click', function() {
    const fTime = document.querySelector('#ptFajr .pt-time')?.textContent || '05:32 AM';
    const fIqamah = document.querySelector('#ptFajr .pt-iqamah')?.textContent || 'Iqamah: 06:00 AM';
    const sTime = document.querySelector('#ptSunrise .pt-time')?.textContent || '07:05 AM';
    const dTime = document.querySelector('#ptDhuhr .pt-time')?.textContent || '01:02 PM';
    const dIqamah = document.querySelector('#ptDhuhr .pt-iqamah')?.textContent || 'Iqamah: 01:30 PM';
    const aTime = document.querySelector('#ptAsr .pt-time')?.textContent || '04:18 PM';
    const aIqamah = document.querySelector('#ptAsr .pt-iqamah')?.textContent || 'Iqamah: 04:45 PM';
    const mTime = document.querySelector('#ptMaghrib .pt-time')?.textContent || '06:46 PM';
    const mIqamah = document.querySelector('#ptMaghrib .pt-iqamah')?.textContent || 'Iqamah: 06:51 PM';
    const iTime = document.querySelector('#ptIsha .pt-time')?.textContent || '08:15 PM';
    const iIqamah = document.querySelector('#ptIsha .pt-iqamah')?.textContent || 'Iqamah: 08:30 PM';
    const hDate = document.getElementById('hijriDateDisplay')?.textContent || 'Today';

    const textToCopy = `🕌 Chichester Jamia Centre (Charity No. 1148130)\n📅 ${hDate}\n📍 102 Bognor Rd, Chichester PO19 7TW\n\n• Fajr: ${fTime} (${fIqamah})\n• Sunrise: ${sTime}\n• Dhuhr: ${dTime} (${dIqamah})\n• Asr: ${aTime} (${aIqamah})\n• Maghrib: ${mTime} (${mIqamah})\n• Isha: ${iTime} (${iIqamah})\n• Jumu'ah: Friday 1:15 PM\n\nSupport Chichester's 1st Masjid: https://www.gofundme.com/f/chichester-mosque`;

    copyToClipboard(textToCopy, "Today's Prayer Timings", this);
  });

  // ------------------------------------------------------------------
  // 24. Interactive Qibla Compass Enhancements
  // ------------------------------------------------------------------
  const compassNeedle = document.getElementById('compassNeedle');
  const btnAlignQibla = document.getElementById('btnAlignQibla');
  const btnLiveCompass = document.getElementById('btnLiveCompass');
  const qiblaBearingText = document.getElementById('qiblaBearingText');
  let compassLiveActive = false;
  let compassInterval = null;

  btnAlignQibla?.addEventListener('click', () => {
    if (compassNeedle) {
      compassNeedle.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      compassNeedle.style.transform = 'rotate(119.2deg)';
      if (qiblaBearingText) qiblaBearingText.textContent = '119.2° East-Southeast (Aligned with Makkah 🕋)';
      playSoftChime();
      showToast('Aligned precisely with Chichester Qibla: 119.2° ESE 🕋', 'success');
    }
  });

  function attachCompassSensor() {
    window.addEventListener('deviceorientation', (e) => {
      let heading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : null);
      if (heading !== null && compassNeedle) {
        const qiblaRelativeAngle = (119.2 - heading);
        compassNeedle.style.transition = 'transform 0.15s ease-out';
        compassNeedle.style.transform = `rotate(${qiblaRelativeAngle.toFixed(1)}deg)`;
        if (qiblaBearingText) {
          qiblaBearingText.textContent = `${heading.toFixed(0)}° Heading (Qibla: 119.2° ESE)`;
        }
      }
    }, { passive: true });
    showToast('Live phone compass sensor connected! 🧭', 'success');
  }

  function fallbackCompassMotion() {
    compassLiveActive = !compassLiveActive;
    if (compassLiveActive) {
      showToast('Simulating live magnetic compass sensing... 🧭', 'info');
      let angle = 119.2;
      compassInterval = setInterval(() => {
        angle += (Math.random() * 8 - 4);
        if (compassNeedle) {
          compassNeedle.style.transition = 'transform 0.4s ease';
          compassNeedle.style.transform = `rotate(${angle.toFixed(1)}deg)`;
          if (qiblaBearingText) qiblaBearingText.textContent = `${angle.toFixed(1)}° (Qibla: 119.2° ESE)`;
        }
      }, 400);
    } else {
      clearInterval(compassInterval);
      if (compassNeedle) {
        compassNeedle.style.transition = 'transform 0.8s ease';
        compassNeedle.style.transform = 'rotate(119.2deg)';
        if (qiblaBearingText) qiblaBearingText.textContent = '119.2° East-Southeast (Locked)';
      }
      showToast('Compass locked to Qibla (119.2°)', 'info');
    }
  }

  btnLiveCompass?.addEventListener('click', () => {
    if (window.DeviceOrientationEvent && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
          if (state === 'granted') {
            attachCompassSensor();
          } else {
            fallbackCompassMotion();
          }
        }).catch(() => fallbackCompassMotion());
      } else {
        attachCompassSensor();
      }
    } else {
      fallbackCompassMotion();
    }
  });

  // ------------------------------------------------------------------
  // 25. Live Community Sadaqah Stream (Toast Feed)
  // ------------------------------------------------------------------
  const livePledges = [
    { donor: "Brother Farhan (Southsea)", msg: "Pledged 10 Bricks (£100) towards the Main Prayer Hall", time: "2 mins ago" },
    { donor: "Sister Ayesha (Chichester)", msg: "Contributed £50 Sadaqah Jariyah for Wudu Facilities", time: "5 mins ago" },
    { donor: "Anonymous Supporter (Portsmouth)", msg: "Pledged 20 Bricks (£200) on the Brick Builder Wall", time: "8 mins ago" },
    { donor: "Haji Rafiq & Family (Bognor)", msg: "Donated £500 towards Phase 1 Property Purchase", time: "14 mins ago" },
    { donor: "Youth Group (Chichester)", msg: "Pledged 5 Bricks (£50) for Islamic Library & Hub", time: "21 mins ago" },
    { donor: "Generous Donor (Southampton)", msg: "Transferred £250 via Lloyds Bank Transfer", time: "30 mins ago" }
  ];

  let livePledgeIndex = 0;
  const liveActivityToast = document.getElementById('liveActivityToast');
  const liveDonorName = document.getElementById('liveDonorName');
  const liveToastMsg = document.getElementById('liveToastMsg');
  const liveToastTime = document.getElementById('liveToastTime');
  const closeLiveToast = document.getElementById('closeLiveToast');

  function showNextLivePledge() {
    if (!liveActivityToast) return;
    const item = livePledges[livePledgeIndex];
    livePledgeIndex = (livePledgeIndex + 1) % livePledges.length;

    if (liveDonorName) liveDonorName.textContent = item.donor;
    if (liveToastMsg) liveToastMsg.textContent = item.msg;
    if (liveToastTime) liveToastTime.textContent = item.time;

    liveActivityToast.classList.add('active');

    setTimeout(() => {
      liveActivityToast.classList.remove('active');
    }, 6000);
  }

  // Start live pledge feed after 4 seconds, recurring every 14 seconds
  setTimeout(() => {
    showNextLivePledge();
    setInterval(showNextLivePledge, 14000);
  }, 4000);

  closeLiveToast?.addEventListener('click', () => {
    liveActivityToast?.classList.remove('active');
  });

  // ------------------------------------------------------------------
  // 26. Mobile Bottom Action Bar Triggers
  // ------------------------------------------------------------------
  const mobileBarChatBtn = document.getElementById('mobileBarChatBtn');
  mobileBarChatBtn?.addEventListener('click', () => {
    openAiChat();
    aiChatInput?.focus();
  });

  // ------------------------------------------------------------------
  // 27. Scroll Reveal Observer
  // ------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.section, .feature-card, .vision-grid, .pt-card, .brick-category-card, .testimonial-card, .facility-card');
  revealElements.forEach(el => el.classList.add('reveal-on-scroll'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // ------------------------------------------------------------------
  // 28. PWA Service Worker & Add-to-Home-Screen (A2HS) Manager
  // ------------------------------------------------------------------
  function initPwaInstaller() {
    // 1. Register Service Worker for offline capability
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('sw.js').then(() => {
        console.log('Chichester Mosque Service Worker active.');
      }).catch(err => {
        console.warn('SW registration skipped:', err);
      });
    }

    // 2. Platform detection (iOS vs Android)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    let deferredPwaPrompt = null;
    const pwaInstallBanner = document.getElementById('pwaInstallBanner');
    const pwaBannerPlatformText = document.getElementById('pwaBannerPlatformText');
    const pwaModal = document.getElementById('pwaModal');
    const closePwaModal = document.getElementById('closePwaModal');
    const btnClosePwaModal = document.getElementById('btnClosePwaModal');
    const pwaTabIos = document.getElementById('pwaTabIos');
    const pwaTabAndroid = document.getElementById('pwaTabAndroid');
    const pwaViewIos = document.getElementById('pwaViewIos');
    const pwaViewAndroid = document.getElementById('pwaViewAndroid');
    const btnPwaNativeInstall = document.getElementById('btnPwaNativeInstall');

    // 3. Listen for Android native beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaPrompt = e;
      if (btnPwaNativeInstall) {
        btnPwaNativeInstall.style.display = 'block';
      }
    });

    function setPwaPlatformView(platform) {
      if (platform === 'ios') {
        pwaTabIos?.classList.add('active');
        pwaTabAndroid?.classList.remove('active');
        pwaViewIos?.classList.remove('hidden');
        pwaViewIos?.classList.add('active');
        pwaViewAndroid?.classList.add('hidden');
        pwaViewAndroid?.classList.remove('active');
      } else {
        pwaTabAndroid?.classList.add('active');
        pwaTabIos?.classList.remove('active');
        pwaViewAndroid?.classList.remove('hidden');
        pwaViewAndroid?.classList.add('active');
        pwaViewIos?.classList.add('hidden');
        pwaViewIos?.classList.remove('active');
      }
    }

    function openPwaModal(forcedPlatform) {
      if (pwaModal) {
        pwaModal.classList.add('active');
        const targetPlatform = forcedPlatform || (isIOS ? 'ios' : 'android');
        setPwaPlatformView(targetPlatform);
      }
    }

    window.openPwaModal = openPwaModal;

    function closePwaGuide() {
      if (pwaModal) pwaModal.classList.remove('active');
    }

    closePwaModal?.addEventListener('click', closePwaGuide);
    btnClosePwaModal?.addEventListener('click', closePwaGuide);

    pwaTabIos?.addEventListener('click', () => setPwaPlatformView('ios'));
    pwaTabAndroid?.addEventListener('click', () => setPwaPlatformView('android'));

    btnPwaNativeInstall?.addEventListener('click', async () => {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        const choice = await deferredPwaPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('Thank you for installing Chichester Mosque App! 🕌', 'success');
          closePwaGuide();
        }
        deferredPwaPrompt = null;
      } else {
        showToast('Please follow the 3 quick steps below to install on Chrome.');
      }
    });

    // 4. Smart Mobile Install Banner
    const dismissedTime = localStorage.getItem('cjc_pwa_banner_dismissed');
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const isDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime) < sevenDaysMs);

    if (!isStandalone && !isDismissed && (isIOS || isAndroid || window.innerWidth <= 860)) {
      if (pwaBannerPlatformText) {
        pwaBannerPlatformText.textContent = isIOS 
          ? "Add to iPhone Home Screen for 1-tap prayer times" 
          : "Install on Android for instant 1-tap prayer times";
      }

      setTimeout(() => {
        if (pwaInstallBanner) pwaInstallBanner.classList.remove('hidden');
      }, 3500);
    }

    document.getElementById('btnOpenPwaGuide')?.addEventListener('click', () => {
      openPwaModal();
      if (pwaInstallBanner) pwaInstallBanner.classList.add('hidden');
    });

    document.getElementById('btnDismissPwaBanner')?.addEventListener('click', () => {
      if (pwaInstallBanner) pwaInstallBanner.classList.add('hidden');
      localStorage.setItem('cjc_pwa_banner_dismissed', String(Date.now()));
    });

    document.getElementById('btnOpenPwaFromFaq')?.addEventListener('click', () => openPwaModal());
    document.getElementById('openPwaModalBtnDrawer')?.addEventListener('click', () => {
      document.getElementById('mobileMenuDrawer')?.classList.remove('active');
      openPwaModal();
    });
    document.getElementById('mobileBarInstallBtn')?.addEventListener('click', () => openPwaModal());
  }

  initPwaInstaller();

  // ------------------------------------------------------------------
  // 29. Daily Fasting (Suhoor & Iftar) Live Countdown
  // ------------------------------------------------------------------
  function initFastingTracker() {
    const iftarCountdown = document.getElementById('iftarCountdown');
    const iftarCountdownLabel = document.querySelector('.ftb-countdown-label');
    if (!iftarCountdown) return;

    function updateFasting() {
      const now = new Date();
      const [fajrH, fajrM] = (livePrayerTimings.Fajr || "05:32").split(':').map(Number);
      const [maghribH, maghribM] = (livePrayerTimings.Maghrib || "18:46").split(':').map(Number);

      const fajrToday = new Date(now);
      fajrToday.setHours(fajrH, fajrM, 0, 0);

      const maghribToday = new Date(now);
      maghribToday.setHours(maghribH, maghribM, 0, 0);

      let targetTime;
      let label;

      if (now < fajrToday) {
        targetTime = fajrToday;
        label = "Suhoor (Fajr)";
      } else if (now < maghribToday) {
        targetTime = maghribToday;
        label = "Iftar (Maghrib)";
      } else {
        const fajrTomorrow = new Date(fajrToday);
        fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
        targetTime = fajrTomorrow;
        label = "Next Suhoor";
      }

      if (iftarCountdownLabel) {
        iftarCountdownLabel.textContent = `Time to ${label}:`;
      }

      const diff = targetTime - now;
      if (diff > 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        iftarCountdown.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }

    updateFasting();
    setInterval(updateFasting, 1000);
  }

  initFastingTracker();

  // ------------------------------------------------------------------
  // 26. Community Consultation Survey & Optional Notification System
  // ------------------------------------------------------------------
  function initSurveyAndNotifications() {
    const surveyPromptFlyout = document.getElementById('surveyPromptFlyout');
    const closeSurveyPromptBtn = document.getElementById('closeSurveyPromptBtn');
    const btnOpenSurveyFromPrompt = document.getElementById('btnOpenSurveyFromPrompt');
    const btnRemindSurveyLater = document.getElementById('btnRemindSurveyLater');

    const surveyModal = document.getElementById('surveyModal');
    const closeSurveyModal = document.getElementById('closeSurveyModal');
    const navSurveyBtn = document.getElementById('navSurveyBtn');
    const openSurveyBtnDrawer = document.getElementById('openSurveyBtnDrawer');

    const notificationSettingsModal = document.getElementById('notificationSettingsModal');
    const openNotificationSettingsBtn = document.getElementById('openNotificationSettingsBtn');
    const openNotifSettingsBtnDrawer = document.getElementById('openNotifSettingsBtnDrawer');
    const closeNotifSettingsModal = document.getElementById('closeNotifSettingsModal');
    const btnRequestNotifPermission = document.getElementById('btnRequestNotifPermission');
    const btnTestNotification = document.getElementById('btnTestNotification');
    const btnSaveNotifSettings = document.getElementById('btnSaveNotifSettings');

    const communitySurveyForm = document.getElementById('communitySurveyForm');
    const surveyStep1 = document.getElementById('surveyStep1');
    const surveyStep2 = document.getElementById('surveyStep2');
    const surveyStep3 = document.getElementById('surveyStep3');
    const surveySuccessView = document.getElementById('surveySuccessView');

    const surveyStepPill1 = document.getElementById('surveyStepPill1');
    const surveyStepPill2 = document.getElementById('surveyStepPill2');
    const surveyStepPill3 = document.getElementById('surveyStepPill3');
    const surveyStepLine1 = document.getElementById('surveyStepLine1');
    const surveyStepLine2 = document.getElementById('surveyStepLine2');

    const surveyBtnNext1 = document.getElementById('surveyBtnNext1');
    const surveyBtnNext2 = document.getElementById('surveyBtnNext2');
    const surveyBtnBack2 = document.getElementById('surveyBtnBack2');
    const surveyBtnBack3 = document.getElementById('surveyBtnBack3');
    const btnShareSurveyLink = document.getElementById('btnShareSurveyLink');
    const btnCloseSurveySuccess = document.getElementById('btnCloseSurveySuccess');

    const notifToggleSurveys = document.getElementById('notifToggleSurveys');
    const notifToggleJumuah = document.getElementById('notifToggleJumuah');
    const notifToggleAdhan = document.getElementById('notifToggleAdhan');
    const notifToggleMilestones = document.getElementById('notifToggleMilestones');
    const notifBadgeDot = document.getElementById('notifBadgeDot');

    // 1. Open/Close Survey Modal Helpers
    function openCommunitySurvey() {
      if (surveyPromptFlyout) surveyPromptFlyout.classList.add('hidden');
      if (surveyModal) {
        goToSurveyStep(1);
        surveyModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
    function closeCommunitySurvey() {
      if (surveyModal) {
        surveyModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
    window.openCommunitySurvey = openCommunitySurvey;
    window.closeCommunitySurvey = closeCommunitySurvey;

    // 2. Open/Close Notification Settings Modal Helpers
    function openNotificationSettings() {
      if (notificationSettingsModal) {
        updateNotificationPermissionUI();
        notificationSettingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
    function closeNotificationSettings() {
      if (notificationSettingsModal) {
        notificationSettingsModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
    window.openNotificationSettings = openNotificationSettings;
    window.closeNotificationSettings = closeNotificationSettings;

    // Step switching
    function goToSurveyStep(step) {
      if (step === 1) {
        surveyStep1?.classList.remove('hidden');
        surveyStep2?.classList.add('hidden');
        surveyStep3?.classList.add('hidden');
        surveySuccessView?.classList.add('hidden');

        surveyStepPill1?.classList.add('active');
        surveyStepPill1?.classList.remove('completed');
        surveyStepPill2?.classList.remove('active', 'completed');
        surveyStepPill3?.classList.remove('active', 'completed');
        if (surveyStepLine1) surveyStepLine1.style.background = 'var(--border-light)';
        if (surveyStepLine2) surveyStepLine2.style.background = 'var(--border-light)';
      } else if (step === 2) {
        surveyStep1?.classList.add('hidden');
        surveyStep2?.classList.remove('hidden');
        surveyStep3?.classList.add('hidden');
        surveySuccessView?.classList.add('hidden');

        surveyStepPill1?.classList.add('completed');
        surveyStepPill1?.classList.remove('active');
        surveyStepPill2?.classList.add('active');
        surveyStepPill2?.classList.remove('completed');
        surveyStepPill3?.classList.remove('active', 'completed');
        if (surveyStepLine1) surveyStepLine1.style.background = 'var(--accent-gold)';
        if (surveyStepLine2) surveyStepLine2.style.background = 'var(--border-light)';
      } else if (step === 3) {
        surveyStep1?.classList.add('hidden');
        surveyStep2?.classList.add('hidden');
        surveyStep3?.classList.remove('hidden');
        surveySuccessView?.classList.add('hidden');

        surveyStepPill1?.classList.add('completed');
        surveyStepPill2?.classList.add('completed');
        surveyStepPill3?.classList.add('active');
        if (surveyStepLine1) surveyStepLine1.style.background = 'var(--accent-gold)';
        if (surveyStepLine2) surveyStepLine2.style.background = 'var(--accent-gold)';
        updateBrowserPermInSurveyStep();
      } else if (step === 4) {
        surveyStep1?.classList.add('hidden');
        surveyStep2?.classList.add('hidden');
        surveyStep3?.classList.add('hidden');
        surveySuccessView?.classList.remove('hidden');

        surveyStepPill1?.classList.add('completed');
        surveyStepPill2?.classList.add('completed');
        surveyStepPill3?.classList.add('completed');
        if (surveyStepLine1) surveyStepLine1.style.background = '#10b981';
        if (surveyStepLine2) surveyStepLine2.style.background = '#10b981';
      }
      surveyModal?.querySelector('.survey-modal-card')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Step buttons
    surveyBtnNext1?.addEventListener('click', () => goToSurveyStep(2));
    surveyBtnNext2?.addEventListener('click', () => goToSurveyStep(3));
    surveyBtnBack2?.addEventListener('click', () => goToSurveyStep(1));
    surveyBtnBack3?.addEventListener('click', () => goToSurveyStep(2));

    // Survey Form Submission
    communitySurveyForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const facilities = Array.from(communitySurveyForm.querySelectorAll('input[name="facilities"]:checked')).map(cb => cb.value);
      const visitFreq = communitySurveyForm.querySelector('input[name="visit_freq"]:checked')?.value || 'weekly';
      const services = Array.from(communitySurveyForm.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);
      const comments = document.getElementById('surveyFeedbackComments')?.value.trim() || '';
      const respondentName = document.getElementById('surveyRespondentName')?.value.trim() || 'Supporter';
      const respondentPostcode = document.getElementById('surveyRespondentPostcode')?.value.trim() || 'PO19';
      const respondentEmail = document.getElementById('surveyRespondentEmail')?.value.trim() || '';
      const wantNotifs = document.getElementById('surveyEnableBrowserNotif')?.checked ?? true;

      const surveyData = {
        facilities,
        visitFreq,
        services,
        comments,
        respondentName,
        respondentPostcode,
        respondentEmail,
        wantNotifs,
        submittedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('cjc_community_survey', JSON.stringify(surveyData));
        localStorage.setItem('cjc_survey_submitted', 'true');
      } catch (err) {}
      submitToWebhook('survey', surveyData);

      // Update badge dot
      if (notifBadgeDot) notifBadgeDot.style.display = 'none';

      // Request Web Notifications permission if checked
      if (wantNotifs && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            try {
              new Notification('Chichester Jamia Centre', {
                body: 'JazakAllah Khair! You will receive community survey & planning updates for 102 Bognor Rd.',
                icon: 'assets/real_qr_code.png'
              });
            } catch(e) {}
          }
        });
      }

      playSoftChime();
      showToast('JazakAllah Khair! Your survey has been submitted. 📋', 'success');
      goToSurveyStep(4);
    });

    btnShareSurveyLink?.addEventListener('click', function() {
      const shareUrl = `${window.location.origin}${window.location.pathname}#survey`;
      copyToClipboard(shareUrl, 'Survey Link', this);
    });

    btnCloseSurveySuccess?.addEventListener('click', closeCommunitySurvey);

    // Wire Modal Triggers
    navSurveyBtn?.addEventListener('click', openCommunitySurvey);
    openSurveyBtnDrawer?.addEventListener('click', () => {
      document.getElementById('mobileMenuDrawer')?.classList.remove('active');
      openCommunitySurvey();
    });
    closeSurveyModal?.addEventListener('click', closeCommunitySurvey);
    surveyModal?.addEventListener('click', (e) => {
      if (e.target === surveyModal) closeCommunitySurvey();
    });

    openNotificationSettingsBtn?.addEventListener('click', openNotificationSettings);
    openNotifSettingsBtnDrawer?.addEventListener('click', () => {
      document.getElementById('mobileMenuDrawer')?.classList.remove('active');
      openNotificationSettings();
    });
    closeNotifSettingsModal?.addEventListener('click', closeNotificationSettings);
    notificationSettingsModal?.addEventListener('click', (e) => {
      if (e.target === notificationSettingsModal) closeNotificationSettings();
    });

    // Check URL hash on load
    if (window.location.hash === '#survey') {
      setTimeout(openCommunitySurvey, 600);
    }

    // Load Notification Preferences
    function loadNotifPreferences() {
      try {
        const saved = JSON.parse(localStorage.getItem('cjc_notif_prefs') || '{}');
        if (notifToggleSurveys && typeof saved.surveys === 'boolean') notifToggleSurveys.checked = saved.surveys;
        if (notifToggleJumuah && typeof saved.jumuah === 'boolean') notifToggleJumuah.checked = saved.jumuah;
        if (notifToggleAdhan && typeof saved.adhan === 'boolean') notifToggleAdhan.checked = saved.adhan;
        if (notifToggleMilestones && typeof saved.milestones === 'boolean') notifToggleMilestones.checked = saved.milestones;
      } catch (e) {}
    }
    loadNotifPreferences();

    // Save Notification Preferences
    btnSaveNotifSettings?.addEventListener('click', () => {
      const prefs = {
        surveys: notifToggleSurveys?.checked ?? true,
        jumuah: notifToggleJumuah?.checked ?? true,
        adhan: notifToggleAdhan?.checked ?? false,
        milestones: notifToggleMilestones?.checked ?? true,
        updatedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem('cjc_notif_prefs', JSON.stringify(prefs));
      } catch (e) {}
      showToast('Notification preferences saved! 🔔', 'success');
      closeNotificationSettings();
    });

    // Permission UI Update
    function updateNotificationPermissionUI() {
      const npcStatusIcon = document.getElementById('npcStatusIcon');
      const npcStatusTitle = document.getElementById('npcStatusTitle');
      const npcStatusDesc = document.getElementById('npcStatusDesc');

      if (!('Notification' in window)) {
        if (npcStatusTitle) npcStatusTitle.textContent = 'Browser Notifications Not Supported';
        if (npcStatusDesc) npcStatusDesc.textContent = 'Your browser does not support web push notifications.';
        if (btnRequestNotifPermission) btnRequestNotifPermission.style.display = 'none';
        return;
      }

      if (Notification.permission === 'granted') {
        if (npcStatusIcon) npcStatusIcon.textContent = '✓';
        if (npcStatusTitle) npcStatusTitle.textContent = 'Browser Notifications Allowed';
        if (npcStatusDesc) npcStatusDesc.textContent = 'You are set up to receive optional updates on this device.';
        if (btnRequestNotifPermission) {
          btnRequestNotifPermission.textContent = 'Permission Active ✓';
          btnRequestNotifPermission.disabled = true;
          btnRequestNotifPermission.classList.remove('btn-gold');
          btnRequestNotifPermission.classList.add('btn-emerald');
        }
      } else if (Notification.permission === 'denied') {
        if (npcStatusIcon) npcStatusIcon.textContent = '✕';
        if (npcStatusTitle) npcStatusTitle.textContent = 'Notifications Blocked';
        if (npcStatusDesc) npcStatusDesc.textContent = 'Notifications were blocked. Please enable them in your browser site settings.';
        if (btnRequestNotifPermission) {
          btnRequestNotifPermission.textContent = 'Blocked in Browser';
          btnRequestNotifPermission.disabled = true;
          btnRequestNotifPermission.classList.remove('btn-gold');
          btnRequestNotifPermission.classList.add('btn-glass');
        }
      } else {
        if (npcStatusIcon) npcStatusIcon.textContent = '🔔';
        if (npcStatusTitle) npcStatusTitle.textContent = 'Browser Notifications Available';
        if (npcStatusDesc) npcStatusDesc.textContent = 'Click to allow Chichester Jamia Centre to send optional survey & milestone alerts.';
        if (btnRequestNotifPermission) {
          btnRequestNotifPermission.textContent = 'Enable in Browser';
          btnRequestNotifPermission.disabled = false;
          btnRequestNotifPermission.classList.add('btn-gold');
          btnRequestNotifPermission.classList.remove('btn-emerald');
        }
      }
    }

    function updateBrowserPermInSurveyStep() {
      const statusEl = document.getElementById('surveyBrowserPermissionStatus');
      if (!statusEl) return;
      if (!('Notification' in window)) {
        statusEl.textContent = 'Note: Web push not supported on this browser (Email updates available below).';
      } else if (Notification.permission === 'granted') {
        statusEl.textContent = '✓ Browser notifications are enabled on this device.';
      } else if (Notification.permission === 'denied') {
        statusEl.textContent = '⚠️ Browser notifications blocked in settings. Please leave your email below for updates.';
      } else {
        statusEl.textContent = '💡 Submitting will request permission to notify you of future consultations.';
      }
    }

    btnRequestNotifPermission?.addEventListener('click', () => {
      if ('Notification' in window) {
        Notification.requestPermission().then(() => {
          updateNotificationPermissionUI();
          if (Notification.permission === 'granted') {
            showToast('Notifications enabled! 🔔', 'success');
          }
        });
      }
    });

    btnTestNotification?.addEventListener('click', () => {
      showToast('Sample Alert: Community Consultation for 102 Bognor Rd is open! 📋', 'info');
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Chichester Jamia Centre 📋', {
            body: 'Sample notification: Community Consultation for 102 Bognor Rd is active. Thank you for your support!',
            icon: 'assets/real_qr_code.png'
          });
        } catch(e) {}
      }
    });

    // 3. Polite Flyout Trigger Logic
    const isSubmitted = localStorage.getItem('cjc_survey_submitted') === 'true';
    const snoozeUntil = parseInt(localStorage.getItem('cjc_survey_snooze') || '0', 10);
    const dismissedUntil = parseInt(localStorage.getItem('cjc_survey_dismissed') || '0', 10);
    const now = Date.now();

    if (isSubmitted && notifBadgeDot) {
      notifBadgeDot.style.display = 'none';
    }

    if (!isSubmitted && now > snoozeUntil && now > dismissedUntil) {
      let flyoutShown = false;

      function showSurveyPrompt() {
        if (flyoutShown) return;
        const splashOverlay = document.getElementById('languageSplash');
        // Wait until splash modal is dismissed
        if (splashOverlay && !splashOverlay.classList.contains('hidden')) {
          setTimeout(showSurveyPrompt, 2000);
          return;
        }
        flyoutShown = true;
        surveyPromptFlyout?.classList.remove('hidden');
      }

      // Delay trigger (12 seconds)
      const timerId = setTimeout(showSurveyPrompt, 12000);

      // Scroll trigger (25% scroll depth)
      function onScrollCheck() {
        if (flyoutShown) return;
        const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
        if (scrollPct > 0.25) {
          clearTimeout(timerId);
          showSurveyPrompt();
          window.removeEventListener('scroll', onScrollCheck);
        }
      }
      window.addEventListener('scroll', onScrollCheck, { passive: true });

      btnOpenSurveyFromPrompt?.addEventListener('click', () => {
        surveyPromptFlyout?.classList.add('hidden');
        openCommunitySurvey();
      });

      btnRemindSurveyLater?.addEventListener('click', () => {
        surveyPromptFlyout?.classList.add('hidden');
        try {
          localStorage.setItem('cjc_survey_snooze', String(Date.now() + 24 * 3600 * 1000));
        } catch (e) {}
        showToast('We\'ll remind you tomorrow! 📋', 'info');
      });

      closeSurveyPromptBtn?.addEventListener('click', () => {
        surveyPromptFlyout?.classList.add('hidden');
        try {
          localStorage.setItem('cjc_survey_dismissed', String(Date.now() + 7 * 24 * 3600 * 1000));
        } catch (e) {}
      });
    }
  }

  initSurveyAndNotifications();

  // ------------------------------------------------------------------
  // 30. Newsletter Form Submission & Remote Webhook Dispatch
  // ------------------------------------------------------------------
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();
    if (!email) return;
    try {
      const subs = JSON.parse(localStorage.getItem('cjc_newsletter_subs') || '[]');
      subs.push({ email, subscribedAt: new Date().toISOString() });
      localStorage.setItem('cjc_newsletter_subs', JSON.stringify(subs));
    } catch (err) {}
    submitToWebhook('newsletter', { email });
    newsletterForm.reset();
    showToast('JazakAllah Khair! You are subscribed to project updates.');
  });
});

