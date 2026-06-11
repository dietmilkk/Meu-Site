(function () {
  "use strict";

  var win = document.getElementById("dopaminaWindow");
  var body = document.getElementById("dopaminaBody");
  var dragHandle = document.getElementById("dopaminaDragHandle");
  var btnClose = document.getElementById("dopaminaBtnClose");
  var btnMinimize = document.getElementById("dopaminaBtnMinimize");
  var btnMaximize = document.getElementById("dopaminaBtnMaximize");

  var score = 0;
  var hitCount = 0;
  var combo = 0;
  var tankFill = 0;
  var _pressTimeout = null;

  var _scrollLock = false;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function playSnd(fn, delay) {
    if (typeof fn !== 'function') return;
    if (delay) {
      setTimeout(function () { try { fn(); } catch (e) {} }, delay);
    } else {
      try { fn(); } catch (e) {}
    }
  }

  // Throttled sound — prevents accumulation on fast scroll/click
  var _soundThrottle = false;
  function playHitSound(comboLevel) {
    if (_soundThrottle) return;
    _soundThrottle = true;
    setTimeout(function () { _soundThrottle = false; }, 25);

    playSnd(window.playGalleryNextSnd);
    playSnd(window.playClickSnd);
    if (comboLevel >= 6) playSnd(window.playToggleOnSnd);
    if (comboLevel >= 12) playSnd(window.playGalleryPrevSnd);
  }

  function spawnSmoke(x, y, intensity) {
    var count = 4 + Math.floor(intensity * 0.4);
    for (var i = 0; i < count; i++) {
      var p = document.createElement("div");
      p.className = "dopamina-smoke";
      var size = rand(8 + intensity * 0.3, 22 + intensity * 0.4);
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = (x + rand(-30 - intensity * 0.5, 30 + intensity * 0.5)) + "px";
      p.style.top = (y + rand(-12, 12)) + "px";
      p.style.setProperty("--dx", rand(-50 - intensity, 50 + intensity) + "px");
      p.style.animationDuration = rand(0.6, 1.2) + "s";
      body.appendChild(p);
      setTimeout(function () { p.remove(); }, 1300);
    }
  }

  function spawnTrails(x, y, intensity) {
    var count = 3 + Math.floor(intensity * 0.2);
    for (var i = 0; i < count; i++) {
      var t = document.createElement("div");
      t.className = "dopamina-trail";
      var size = rand(4, 10);
      t.style.width = size + "px";
      t.style.height = size + "px";
      t.style.left = (x + rand(-20, 20)) + "px";
      t.style.top = (y + rand(-8, 8)) + "px";
      t.style.setProperty("--tx", rand(-30, 30) + "px");
      t.style.animationDuration = rand(0.5, 0.9) + "s";
      t.style.animationDelay = "0s";
      body.appendChild(t);
      setTimeout(function () { t.remove(); }, 1100);
    }
  }

  function spawnRings(cx, cy, intensity) {
    var count = 1 + Math.floor(intensity * 0.05);
    if (count > 4) count = 4;
    for (var i = 0; i < count; i++) {
      var r = document.createElement("div");
      r.className = "dopamina-ring";
      r.style.left = (cx - 2 + i * 8) + "px";
      r.style.top = (cy - 2 + i * 8) + "px";
      r.style.animationDuration = (0.4 + i * 0.08) + "s";
      if (i > 0) r.style.borderColor = "rgba(212, 196, 176, 0.35)";
      body.appendChild(r);
      setTimeout(function () { r.remove(); }, 900);
    }
  }

  function spawnRipple(cx, cy) {
    var r = document.createElement("div");
    r.className = "dopamina-ripple";
    r.style.left = (cx - 1) + "px";
    r.style.top = (cy - 1) + "px";
    body.appendChild(r);
    setTimeout(function () { r.remove(); }, 850);
  }

  function spawnPointsPop(x, y, points) {
    var el = document.createElement("div");
    el.className = "dopamina-points-pop";
    el.textContent = "+" + points;
    el.style.left = (x + rand(-25, 25)) + "px";
    el.style.top = (y + rand(-25, 0)) + "px";
    body.appendChild(el);
    setTimeout(function () { el.remove(); }, 750);
  }

  function spawnFlash() {
    var f = document.createElement("div");
    f.className = "dopamina-flash";
    body.appendChild(f);
    setTimeout(function () { f.remove(); }, 160);
  }

  function pressVape() {
    var v = document.querySelector(".dopamina-vape-3d");
    var s = document.querySelector(".dopamina-shadow");
    if (v) v.classList.add("dopamina-press");
    if (s) s.classList.add("dopamina-press");
    if (_pressTimeout) clearTimeout(_pressTimeout);
    _pressTimeout = setTimeout(function () {
      if (v) v.classList.remove("dopamina-press");
      if (s) s.classList.remove("dopamina-press");
      _pressTimeout = null;
    }, 80);
  }

  function shakeVape(intensity) {
    var v = document.querySelector(".dopamina-vape-3d");
    if (!v) return;
    v.classList.remove("dopamina-shake");
    void v.offsetWidth;
    v.style.animationDuration = Math.max(0.06, 0.15 - intensity * 0.005) + "s";
    v.classList.add("dopamina-shake");
    setTimeout(function () {
      v.classList.remove("dopamina-shake");
    }, 200);
  }

  function updateComboGlow(comboLevel) {
    var frame = document.querySelector(".dopamina-glow-frame");
    if (!frame) return;
    if (comboLevel <= 1) {
      frame.classList.remove("active", "level-1", "level-2", "level-3", "level-4");
      return;
    }
    frame.classList.add("active");
    var lv = comboLevel <= 3 ? "level-1" : comboLevel <= 6 ? "level-2" : comboLevel <= 10 ? "level-3" : "level-4";
    frame.className = "dopamina-glow-frame active " + lv;
  }

  function updateLED(comboLevel) {
    var led = document.querySelector(".dopamina-glow");
    if (!led) return;
    var lv = comboLevel <= 1 ? "level-0" : comboLevel <= 3 ? "level-1" : comboLevel <= 6 ? "level-2" : comboLevel <= 10 ? "level-3" : "level-4";
    led.className = "dopamina-glow " + lv;
  }

  function updateTank(slosh) {
    var liquid = document.getElementById("dopaminaTankLiquid");
    if (!liquid) return;
    var pct = Math.min(tankFill, 100);
    liquid.style.height = (pct * 0.4) + "px";
    if (slosh) {
      var inner = liquid.querySelector(".dopamina-tank-liquid-inner");
      if (inner) {
        inner.classList.remove("dopamina-slosh");
        void inner.offsetWidth;
        inner.classList.add("dopamina-slosh");
      }
    }
  }

  function doHit(x, y, intensity, scrollSpeed) {
    hitCount++;
    combo++;
    if (combo > 20) combo = 20;

    tankFill = Math.min(100, tankFill + 2);

    var points = 1 + Math.floor(combo / 2);
    if (hitCount % 10 === 0) points += 8;
    if (hitCount % 50 === 0) points += 25;
    if (hitCount % 100 === 0) points += 50;
    if (hitCount % 250 === 0) points += 100;
    score += points;

    updateScore(points);
    playHitSound(combo, scrollSpeed);
    pressVape();
    if (combo >= 8) shakeVape(intensity);
    spawnSmoke(x, y, intensity);
    spawnTrails(x, y, intensity);
    spawnRings(x, y, intensity);
    spawnRipple(x, y);
    spawnPointsPop(x, y, points);
    spawnFlash();
    updateComboGlow(combo);
    updateLED(combo);
    updateTank(true);
  }

  function handleHit(e) {
    var rect = body.getBoundingClientRect();
    var x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    var y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    if (x === undefined) {
      x = rect.width / 2;
      y = rect.height / 2;
    }
    doHit(x, y, combo * 5, 1);
  }

  // Scroll handler — instant, no delay
  function handleWheel(e) {
    e.preventDefault();
    if (_scrollLock) return;
    _scrollLock = true;
    requestAnimationFrame(function () { _scrollLock = false; });

    var rect = body.getBoundingClientRect();
    var x = rect.width / 2 + rand(-20, 20);
    var y = rect.height / 2 + rand(-10, 10);
    var speed = Math.min(Math.abs(e.deltaY) / 30, 4);
    var intensity = combo * 5 + speed * 8;

    doHit(x, y, intensity, speed);
  }

  function updateScore(points) {
    var el = document.getElementById("dopaminaScoreVal");
    if (el) {
      el.textContent = score;
      el.classList.remove("dopamina-score-flip");
      void el.offsetWidth;
      el.classList.add("dopamina-score-flip");
      el.style.transition = "none";
      el.style.transform = "scale(1.5)";
      el.style.color = combo >= 8 ? "#f0e0d0" : combo >= 4 ? "#e4d4c0" : "#d4c4b0";
      setTimeout(function () {
        el.style.transition = "transform 0.12s ease, color 0.4s ease";
        el.style.transform = "scale(1)";
        el.style.color = "#d4c4b0";
      }, 50);
    }
    var elCombo = document.getElementById("dopaminaCombo");
    if (elCombo) {
      var prev = elCombo.textContent;
      elCombo.textContent = combo > 1 ? "x" + combo : "";
      if (combo > 1 && prev !== elCombo.textContent) {
        elCombo.classList.remove("dopamina-combo-pop");
        void elCombo.offsetWidth;
        elCombo.classList.add("dopamina-combo-pop");
      }
    }
  }

  setInterval(function () {
    if (combo > 0) {
      combo = Math.max(0, combo - 1);
      var elCombo = document.getElementById("dopaminaCombo");
      if (elCombo) elCombo.textContent = combo > 1 ? "x" + combo : "";
      updateComboGlow(combo);
      updateLED(combo);
    }
    if (tankFill > 0) {
      tankFill = Math.max(0, tankFill - 0.3);
      updateTank(false);
    }
  }, 2000);

  function buildContent() {
    body.innerHTML =
      '<div class="dopamina-bg">' +
        '<div class="dopamina-bg-wave"></div>' +
        '<div class="dopamina-bg-wave"></div>' +
      '</div>' +
      '<div class="dopamina-vape-area" id="dopaminaArea">' +
        '<div class="dopamina-surface"></div>' +
        '<div class="dopamina-glow-frame"></div>' +
        '<div class="dopamina-shadow"></div>' +
        '<div class="dopamina-vape-3d">' +
          '<div class="dopamina-glow level-0"></div>' +
          '<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="22" y="28" width="16" height="44" fill="#d4c4b0" stroke="#c4b4a0" stroke-width="0.5"/>' +
            '<rect x="24" y="30" width="12" height="40" fill="#c8b8a4"/>' +
            '<rect x="22" y="62" width="16" height="16" fill="#c4b4a0" stroke="#b4a490" stroke-width="0.5"/>' +
            '<rect x="24" y="64" width="12" height="12" fill="#b8a898"/>' +
            '<rect x="22" y="68" width="16" height="10" fill="#b8a898" stroke="#a49480" stroke-width="0.3"/>' +
            '<rect x="18" y="56" width="24" height="4" fill="#b4a490"/>' +
            '<rect x="20" y="60" width="20" height="2" fill="#a49480"/>' +
            '<rect x="24" y="78" width="12" height="6" fill="#c4b4a0"/>' +
            '<rect x="22" y="84" width="16" height="6" fill="#b4a490" stroke="#a49480" stroke-width="0.3"/>' +
            '<rect x="28" y="16" width="4" height="12" fill="#d4c4b0" stroke="#c4b4a0" stroke-width="0.3"/>' +
            '<rect x="27" y="14" width="6" height="4" fill="#c8b8a4"/>' +
            '<rect x="25" y="8" width="10" height="6" fill="#d4b8c8" stroke="#c4a8b8" stroke-width="0.3"/>' +
            '<rect x="26" y="9" width="8" height="4" fill="#c8b0c0"/>' +
            '<polygon points="30,4 34,8 30,12 26,8" fill="#d4b8c8" stroke="#c4a8b8" stroke-width="0.3"/>' +
            '<rect x="23" y="72" width="14" height="6" fill="#b8c8d4" stroke="#a8b8c4" stroke-width="0.3"/>' +
            '<rect x="24" y="73" width="4" height="4" fill="#c8d8e4"/>' +
            '<rect x="30" y="73" width="4" height="4" fill="#c8d8e4"/>' +
            '<line x1="20" y1="86" x2="12" y2="91" stroke="#c4b4a0" stroke-width="1"/>' +
            '<line x1="40" y1="86" x2="48" y2="91" stroke="#c4b4a0" stroke-width="1"/>' +
          '</svg>' +
          '<div class="dopamina-tank-liquid" id="dopaminaTankLiquid" style="position:absolute;left:24px;bottom:30px;width:12px;height:0;">' +
            '<div class="dopamina-tank-liquid-inner"></div>' +
          '</div>' +
        '</div>' +
        '<div class="dopamina-scroll-hint">' +
          '<svg viewBox="0 0 16 16" width="16" height="16"><line x1="8" y1="2" x2="8" y2="10" stroke="#4a4455" stroke-width="1.5"/><polygon points="8,14 4,10 12,10" fill="#4a4455"/></svg>' +
        '</div>' +
        '<div class="dopamina-score">' +
          '<span class="dopamina-score-val" id="dopaminaScoreVal">0</span>' +
          '<span class="dopamina-combo" id="dopaminaCombo"></span>' +
        '</div>' +
        '<div class="dopamina-divider"></div>' +
        '<div class="dopamina-footer">gire a rodinha</div>' +
        '<div class="dopamina-hit-area" id="dopaminaHitArea"></div>' +
      '</div>';
  }

  var behavior = new WindowBehavior(win, {
    dragHandle: dragHandle,
    btnClose: btnClose,
    btnMinimize: btnMinimize,
    btnMaximize: btnMaximize,
    minW: 320,
    minH: 360,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/apps/energy.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __('dopamina.title'),
    taskbarAction: 'dopamina',
    appId: 'dopamina',
    onShow: function () {
      win.style.width = "380px";
      win.style.height = "420px";
    },
    onHide: function () {},
  });

  if (typeof W2K !== "undefined" && W2K.AppRegistry) {
    W2K.AppRegistry.register("dopamina", {
      label: __('dopamina.title'),
      show: function () { behavior.show(); },
      minimize: function () { behavior.minimize(); },
      hasEntry: function () { return behavior.hasTaskbarEntry(); },
    });
  }

  buildContent();

  var hitArea = document.getElementById("dopaminaHitArea");
  if (hitArea) {
    hitArea.addEventListener("click", handleHit);
    hitArea.addEventListener("wheel", handleWheel, { passive: false });
    hitArea.addEventListener("touchstart", function (e) {
      e.preventDefault();
      handleHit(e);
    });
  }
})();
