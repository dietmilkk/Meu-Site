(function() {
  'use strict';

  var bootScreen = document.getElementById('bootScreen');
  var bootWelcome = document.getElementById('bootWelcome');
  var startBtn = document.getElementById('welcomeStartBtn');

  function showBootWelcome() {
    bootScreen.classList.add('has-welcome');
    bootWelcome.style.display = 'flex';
  }

  function dismissBoot() {
    if (typeof playCloseSnd === 'function') playCloseSnd();
    bootScreen.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    bootScreen.style.opacity = '0';
    bootScreen.style.transform = 'scale(1.02)';
    setTimeout(function() { bootScreen.remove(); }, 600);
  }

  function loadPrefs() {
    var savedLang = null;
    var welcomed = null;
    try {
      savedLang = localStorage.getItem('w2kLang');
      welcomed = localStorage.getItem('w2kWelcomed');
    } catch (e) {}

    if (savedLang === 'en') {
      document.getElementById('welcomeLangEn').classList.add('active');
      document.getElementById('welcomeLangPt').classList.remove('active');
      setLanguage('en');
    } else {
      setLanguage('pt');
    }

    var checkBoot = setInterval(function() {
      if (window._bootReady) {
        clearInterval(checkBoot);
        if (welcomed !== 'true') {
          showBootWelcome();
        } else {
          dismissBoot();
        }
      }
    }, 100);
  }

  // Language toggle
  document.getElementById('welcomeLangPt').addEventListener('click', function() {
    document.getElementById('welcomeLangPt').classList.add('active');
    document.getElementById('welcomeLangEn').classList.remove('active');
    setLanguage('pt');
    if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
  });
  document.getElementById('welcomeLangEn').addEventListener('click', function() {
    document.getElementById('welcomeLangEn').classList.add('active');
    document.getElementById('welcomeLangPt').classList.remove('active');
    setLanguage('en');
    if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
  });

  // "Don't show again" + start
  startBtn.addEventListener('click', function() {
    if (document.getElementById('welcomeDontShow').checked) {
      try { localStorage.setItem('w2kWelcomed', 'true'); } catch (e) {}
    }
    if (typeof playLaunchSnd === 'function') playLaunchSnd();
    dismissBoot();
  });

  loadPrefs();
})();
