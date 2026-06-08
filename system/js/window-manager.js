(function(global) {
  'use strict';

  global.__domWrite = function (fn) {
    if (typeof fn === "function") fn();
  };

  /* ==================================================================
     SOUND SYSTEM — mechanical button & movement effects
     All sounds use the same building blocks for consistent character.
     ================================================================== */
  var _sndCtx = null;
  function _getSndCtx() {
    if (!_sndCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      _sndCtx = new AC();
    }
    return _sndCtx;
  }

  /* ---- low-level primitives ---- */
  function _tone(freq, endFreq, dur, type, vol) {
    var ctx = _getSndCtx();
    if (!ctx) return;
    try {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      if (endFreq !== undefined && endFreq !== freq)
        o.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 0.01), ctx.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }
  function _noise(dur, vol, sharpness) {
    var ctx = _getSndCtx();
    if (!ctx) return;
    try {
      var sr = ctx.sampleRate, len = Math.max(1, Math.floor(sr * dur));
      var b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0), e = sharpness || 4;
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, e);
      var s = ctx.createBufferSource(); s.buffer = b;
      var g = ctx.createGain();
      g.gain.setValueAtTime(vol || 0.03, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      s.connect(g); g.connect(ctx.destination); s.start();
    } catch (e) {}
  }
  function _sweepNoise(from, to, dur, vol, Q) {
    var ctx = _getSndCtx();
    if (!ctx) return;
    try {
      var sr = ctx.sampleRate, len = Math.max(1, Math.floor(sr * dur));
      var b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      var s = ctx.createBufferSource(); s.buffer = b;
      var f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(from || 200, ctx.currentTime);
      f.frequency.exponentialRampToValueAtTime(Math.max(to, 20) || 2000, ctx.currentTime + dur);
      f.Q.setValueAtTime(Q || 0.8, ctx.currentTime);
      var g = ctx.createGain();
      g.gain.setValueAtTime(vol || 0.03, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      s.connect(f); f.connect(g); g.connect(ctx.destination); s.start();
    } catch (e) {}
  }
  function _impact(freq, dur, vol, type) {
    var ctx = _getSndCtx();
    if (!ctx) return;
    try {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol || 0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + Math.max(dur, 0.005));
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + Math.max(dur, 0.005) + 0.01);
    } catch (e) {}
  }

  /* ---- multi-layer mechanical click (the core building block) ---- */
  function _mechClick(freqs, vols, durs, gap) {
    for (var i = 0; i < freqs.length; i++) {
      (function(f, v, d, o) {
        setTimeout(function() {
          _impact(f, d, v, 'sine');
          _impact(f * 0.7, d * 0.7, v * 0.5, 'sine');
          _noise(d * 0.6, v * 0.6, 4);
        }, o);
      })(freqs[i], vols[i], durs[i], (gap || 0) * i);
    }
  }

  /* ---- standardised mechanical sounds ---- */

  // Mechanical keyboard switch — sharp click + metallic reverb tail
  function playClickSnd() {
    _mechClick([3200, 2600, 2100], [0.045, 0.025, 0.015], [0.008, 0.006, 0.004], 3);
    _noise(0.004, 0.025, 6);
    setTimeout(function() {
      _tone(4800, 3600, 0.012, 'sine', 0.015);
      _tone(2400, 1800, 0.008, 'sine', 0.008);
    }, 8);
  }

  // Relay engage — spring tension building then latching
  function playToggleOnSnd() {
    _mechClick([2200, 1500, 1800, 2100], [0.02, 0.015, 0.025, 0.035], [0.006, 0.005, 0.012, 0.016], 6);
    _noise(0.003, 0.015, 6);
    setTimeout(function() {
      _impact(2800, 0.015, 0.005, 'sine');
      _noise(0.002, 0.01, 8);
    }, 40);
  }

  // Relay release — spring snap with falling thud
  function playToggleOffSnd() {
    _mechClick([2500, 1800, 900], [0.025, 0.02, 0.015], [0.007, 0.009, 0.006], 5);
    _noise(0.003, 0.015, 6);
    setTimeout(function() {
      _tone(700, 180, 0.04, 'triangle', 0.015);
    }, 15);
  }

  // Gear-driven mechanism — ratcheting clicks that accelerate, ending in a firm lock
  function playOpenSnd() {
    _impact(1400, 0.01, 0.012, 'sine');
    _noise(0.002, 0.012, 6);
    _mechClick([600, 700, 850, 1000, 1200], [0.012, 0.014, 0.018, 0.022, 0.028], [0.005, 0.005, 0.006, 0.008, 0.01], 6);
    setTimeout(function() {
      _tone(120, 480, 0.06, 'triangle', 0.02);
      _noise(0.003, 0.015, 3);
    }, 40);
    setTimeout(function() {
      _mechClick([1300, 1050, 1150], [0.03, 0.02, 0.025], [0.014, 0.01, 0.012], 8);
      _impact(2200, 0.015, 0.008, 'sine');
    }, 140);
  }

  // Heavy latch — thick thud, sliding lock, final click
  function playCloseSnd() {
    _impact(1200, 0.01, 0.015, 'sine');
    _mechClick([1100, 900, 750, 600], [0.018, 0.022, 0.028, 0.04], [0.006, 0.008, 0.01, 0.015], 5);
    _noise(0.003, 0.015, 5);
    setTimeout(function() {
      _tone(450, 40, 0.08, 'square', 0.015);
      _tone(280, 30, 0.06, 'triangle', 0.01);
    }, 15);
    setTimeout(function() {
      _mechClick([500, 400, 550], [0.04, 0.025, 0.035], [0.02, 0.012, 0.016], 12);
      _impact(150, 0.015, 0.03, 'square');
    }, 150);
  }

  // Slide down track — descending swoosh + slot click
  function playMinimizeSnd() {
    _tone(800, 60, 0.06, 'triangle', 0.025);
    _tone(550, 35, 0.05, 'sine', 0.015);
    _mechClick([600, 480, 400], [0.015, 0.02, 0.025], [0.006, 0.008, 0.01], 5);
    setTimeout(function() {
      _mechClick([380, 340, 360], [0.025, 0.015, 0.02], [0.01, 0.008, 0.01], 8);
      _impact(220, 0.01, 0.018, 'triangle');
    }, 80);
  }

  // Slide up track — ascending swoosh + slot click
  function playRestoreSnd() {
    _tone(40, 700, 0.06, 'triangle', 0.025);
    _tone(25, 450, 0.05, 'sine', 0.015);
    _mechClick([350, 420, 500], [0.015, 0.018, 0.022], [0.006, 0.007, 0.009], 5);
    setTimeout(function() {
      _mechClick([480, 550, 520], [0.025, 0.018, 0.022], [0.01, 0.009, 0.011], 8);
      _impact(380, 0.01, 0.015, 'triangle');
    }, 80);
  }

  // Expanding frame — telescoping rails locking into place
  function playMaximizeSnd() {
    _mechClick([300, 450, 600, 780], [0.012, 0.018, 0.025, 0.035], [0.005, 0.006, 0.008, 0.012], 6);
    _noise(0.003, 0.015, 5);
    setTimeout(function() {
      _tone(50, 580, 0.1, 'triangle', 0.03);
      _tone(30, 350, 0.08, 'sine', 0.018);
    }, 25);
    setTimeout(function() {
      _mechClick([850, 720, 780], [0.04, 0.022, 0.03], [0.016, 0.01, 0.014], 8);
      _impact(1500, 0.015, 0.01, 'sine');
    }, 150);
  }

  // HDD spin-up + head seek — low hum rising, then sharp click
  function playLaunchSnd() {
    _mechClick([200, 280, 380, 500], [0.008, 0.01, 0.014, 0.02], [0.004, 0.004, 0.005, 0.007], 8);
    _noise(0.004, 0.01, 4);
    setTimeout(function() {
      _tone(35, 400, 0.12, 'sawtooth', 0.025);
      _tone(50, 280, 0.1, 'sine', 0.015);
    }, 15);
    setTimeout(function() {
      _mechClick([900, 780, 850, 800], [0.04, 0.025, 0.035, 0.03], [0.018, 0.012, 0.015, 0.014], 6);
      _impact(3000, 0.015, 0.006, 'sine');
      _impact(2200, 0.01, 0.003, 'triangle');
    }, 180);
  }

  // Old terminal bell — clean metallic ping with decay
  function playNotificationSnd() {
    _impact(3200, 0.04, 0.035, 'sine');
    _impact(2800, 0.03, 0.02, 'sine');
    _tone(2400, 2100, 0.05, 'triangle', 0.018);
    _tone(3600, 3000, 0.03, 'sine', 0.01);
    setTimeout(function() {
      _impact(2600, 0.035, 0.025, 'sine');
      _impact(2200, 0.03, 0.015, 'sine');
      _tone(2800, 2500, 0.04, 'triangle', 0.015);
    }, 100);
    setTimeout(function() {
      _tone(1800, 1400, 0.03, 'sine', 0.008);
    }, 200);
  }

  // Harsh buzzer w/ FM texture — like an old PC speaker
  function playErrorSnd() {
    var ctx = _getSndCtx();
    if (!ctx) return;
    try {
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var g1 = ctx.createGain(), g2 = ctx.createGain();
      o1.type = 'square';
      o1.frequency.setValueAtTime(180, ctx.currentTime);
      o1.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.05);
      o1.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.1);
      o2.type = 'sawtooth';
      o2.frequency.setValueAtTime(90, ctx.currentTime);
      o2.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.05);
      o2.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.1);
      g1.gain.setValueAtTime(0.07, ctx.currentTime);
      g1.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      g2.gain.setValueAtTime(0.035, ctx.currentTime);
      g2.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o1.connect(g1); o2.connect(g2); g1.connect(ctx.destination); g2.connect(ctx.destination);
      o1.start(); o2.start(); o1.stop(ctx.currentTime + 0.16); o2.stop(ctx.currentTime + 0.16);
    } catch (e) {}
    _noise(0.03, 0.03, 2);
    _impact(100, 0.012, 0.04, 'square');
  }

  // Error beep — double buzz like old BIOS
  function playErrorBeepSnd() {
    _tone(220, 170, 0.05, 'square', 0.05);
    _tone(110, 85, 0.05, 'sawtooth', 0.025);
    _noise(0.015, 0.025, 3);
    _impact(50, 0.01, 0.035, 'square');
    setTimeout(function() {
      _tone(170, 120, 0.06, 'square', 0.045);
      _tone(85, 60, 0.06, 'sawtooth', 0.02);
      _noise(0.015, 0.025, 3);
      _impact(40, 0.01, 0.035, 'square');
    }, 100);
    setTimeout(function() {
      _mechClick([350, 280, 320], [0.025, 0.015, 0.02], [0.01, 0.007, 0.009], 6);
    }, 180);
  }

  // Film advance mechanism — ratcheting click for next
  function playGalleryNextSnd() {
    _mechClick([2800, 2200, 1700, 1400], [0.025, 0.02, 0.015, 0.01], [0.006, 0.005, 0.005, 0.004], 3);
    _noise(0.003, 0.015, 6);
    setTimeout(function() {
      _tone(3000, 2000, 0.008, 'sine', 0.01);
    }, 10);
  }
  // Film advance mechanism — ratcheting click for prev
  function playGalleryPrevSnd() {
    _mechClick([1700, 2200, 2800, 1400], [0.02, 0.022, 0.018, 0.01], [0.005, 0.006, 0.005, 0.004], 3);
    _noise(0.003, 0.015, 6);
    setTimeout(function() {
      _tone(2000, 3000, 0.008, 'sine', 0.01);
    }, 10);
  }

  global.playClickSnd = playClickSnd;
  global.playToggleOnSnd = playToggleOnSnd;
  global.playToggleOffSnd = playToggleOffSnd;
  global.playOpenSnd = playOpenSnd;
  global.playCloseSnd = playCloseSnd;
  global.playMinimizeSnd = playMinimizeSnd;
  global.playRestoreSnd = playRestoreSnd;
  global.playMaximizeSnd = playMaximizeSnd;
  global.playLaunchSnd = playLaunchSnd;
  global.playNotificationSnd = playNotificationSnd;
  global.playErrorSnd = playErrorSnd;
  global.playErrorBeepSnd = playErrorBeepSnd;
  global.playGalleryNextSnd = playGalleryNextSnd;
  global.playGalleryPrevSnd = playGalleryPrevSnd;

  /* ===== End Sound Effects ===== */

  var _winZIndex = 100;

  function createWindowControls(win, opts) {
    opts = opts || {};

    var dragHandle   = opts.dragHandle   || win.querySelector('.title-bar');
    var tbEntry      = opts.taskbarEntry || null;
    var btnClose     = opts.btnClose === false ? null : (opts.btnClose || win.querySelector('.win-btn[data-wbtn="close"]'));
    var btnMinimize  = opts.btnMinimize  || win.querySelector('.win-btn[data-wbtn="minimize"]');
    var btnMaximize  = opts.btnMaximize  || win.querySelector('.win-btn[data-wbtn="maximize"]');
    var minW         = opts.minW || 500;
    var minH         = opts.minH || 300;
    var onMinimize   = opts.onMinimize || null;
    var onRestore    = opts.onRestore || null;

    var minimized = false;
    var maximized = false;
    var snapped = false;
    var dragState = null;
    var resizeState = null;
    var prevRect = null;
    var minimizeTimer = null;
    var _taskbarCache = null;

    function getTb() { return tbEntry; }

    function saveRect() {
      var r = win.getBoundingClientRect();
      prevRect = {
        left: r.left + 'px',
        top: r.top + 'px',
        width: r.width + 'px',
        height: r.height + 'px',
      };
    }

    function bringToFront() {
      win.style.zIndex = ++_winZIndex;
      document.querySelectorAll('.window, .taskbar-item').forEach(function(el) {
        el.classList.remove('active');
      });
      win.classList.add('active');
      if (tbEntry) tbEntry.classList.add('active');

    }

    win.addEventListener('mousedown', bringToFront);

    function toggleMaximize() {
      if (maximized) {
        playRestoreSnd();
        if (prevRect) {
          win.style.transition = 'left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), border 0.28s ease, box-shadow 0.28s ease';
          win.style.left = prevRect.left;
          win.style.top = prevRect.top;
          win.style.width = prevRect.width;
          win.style.height = prevRect.height;
        }
        win.classList.remove('window-maximized');
        maximized = false;
        if (btnMaximize) {
          var svg = btnMaximize.querySelector('svg');
          if (svg) {
            svg.innerHTML = '<rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>';
          }
        }
        var onUnmaxEnd = function() {
          win.style.transition = '';
          win.removeEventListener('transitionend', onUnmaxEnd);
        };
        win.addEventListener('transitionend', onUnmaxEnd);
      } else {
        playMaximizeSnd();
        saveRect();
        var tb = document.querySelector('.taskbar');
        var th = tb ? tb.offsetHeight : 40;
        win.style.transition = 'left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), border 0.28s ease, box-shadow 0.28s ease';
        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - ' + th + 'px)';
        win.classList.add('window-maximized');
        maximized = true;
        if (btnMaximize) {
          var svg = btnMaximize.querySelector('svg');
          if (svg) {
            svg.innerHTML = '<rect x="1" y="4" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="1" width="11" height="11" fill="#d4d0c8" stroke="currentColor" stroke-width="1.2"/>';
          }
        }
        var onMaxEnd = function() {
          win.style.transition = '';
          win.removeEventListener('transitionend', onMaxEnd);
        };
        win.addEventListener('transitionend', onMaxEnd);
      }
    }

    if (dragHandle) {
      dragHandle.addEventListener('dblclick', function(e) {
        if (e.target.classList.contains('win-btn')) return;
        toggleMaximize();
      });
    }

    function minimize() {
      if (minimized) return;
      var tb = getTb();
      if (!tb) {
        minimized = true;
        win.style.display = 'none';
        return;
      }
      var winRect = win.getBoundingClientRect();
      var tbRect = tb.getBoundingClientRect();
      var sx = winRect.left, sy = winRect.top;
      var sw = winRect.width, sh = winRect.height;
      var tx = tbRect.left + 4, ty = tbRect.top + 2;
      var tw = Math.max(20, tbRect.width - 8), th = Math.max(4, tbRect.height - 4);
      minimized = true;
      saveRect();
      playMinimizeSnd();
      if (tb) tb.classList.remove('active');
      win.style.transition = 'none';
      win.style.left = sx + 'px';
      win.style.top = sy + 'px';
      win.style.width = sw + 'px';
      win.style.height = sh + 'px';
      win.style.opacity = '1';
      win.style.transform = 'scale(1)';
      win.style.boxShadow = '';
      requestAnimationFrame(function() {
        win.style.transition = 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
        win.style.left = tx + 'px';
        win.style.top = ty + 'px';
        win.style.width = tw + 'px';
        win.style.height = th + 'px';
        win.style.opacity = '0.4';
        win.style.transform = 'scale(0.95)';
        win.style.boxShadow = '0 0 0 rgba(0,0,128,0)';
        minimizeTimer = setTimeout(function() {
          minimizeTimer = null;
          if (!minimized) { win.style.transition = ''; return; }
          win.style.display = 'none';
          win.style.transition = '';
          win.style.opacity = '';
          win.style.transform = '';
          win.style.boxShadow = '';
          win.style.left = sx + 'px';
          win.style.top = sy + 'px';
          win.style.width = sw + 'px';
          win.style.height = sh + 'px';
          if (onMinimize) onMinimize();
        }, 400);
      });
    }

    function restore() {
      if (!minimized) return;
      if (minimizeTimer) { clearTimeout(minimizeTimer); minimizeTimer = null; }
      minimized = false;
      snapped = false;
      playRestoreSnd();
      var tb = getTb();
      if (tb) {
        var tbRect = tb.getBoundingClientRect();
        var tx = tbRect.left + 4, ty = tbRect.top + 2;
        var tw = Math.max(20, tbRect.width - 8), th = Math.max(4, tbRect.height - 4);
        var cx = prevRect ? parseInt(prevRect.left) : 200;
        var cy = prevRect ? parseInt(prevRect.top) : 80;
        var cw = prevRect ? parseInt(prevRect.width) : 600;
        var ch = prevRect ? parseInt(prevRect.height) : 400;
        win.style.display = '';
        win.style.transition = 'none';
        win.style.left = tx + 'px';
        win.style.top = ty + 'px';
        win.style.width = tw + 'px';
        win.style.height = th + 'px';
        win.style.opacity = '0.4';
        win.style.transform = 'scale(0.92)';
        win.style.boxShadow = '0 0 0 rgba(0,0,128,0)';
        win.classList.add('anim-win-restore');
        requestAnimationFrame(function() {
          win.style.transition = 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
          win.style.left = cx + 'px';
          win.style.top = cy + 'px';
          win.style.width = cw + 'px';
          win.style.height = ch + 'px';
          win.style.opacity = '1';
          win.style.transform = 'scale(1)';
          win.style.boxShadow = '1px 1px 0 #b0aca4 inset, -1px -1px 0 #f5f2ea inset, 0 0 0 rgba(0,0,128,0)';
          var onRestoreEnd = function() {
            win.removeEventListener('animationend', onRestoreEnd);
            win.classList.remove('anim-win-restore');
            win.style.transition = '';
            win.style.opacity = '';
            win.style.transform = '';
            win.style.boxShadow = '';
            bringToFront();
            if (onRestore) onRestore();
          };
          win.removeEventListener('animationend', onRestoreEnd);
          win.addEventListener('animationend', onRestoreEnd);
        });
      } else {
        win.style.display = '';
        win.classList.add('anim-win-open');
        var onOpenEnd = function() {
          win.removeEventListener('animationend', onOpenEnd);
          win.classList.remove('anim-win-open');
        };
        win.removeEventListener('animationend', onOpenEnd);
        win.addEventListener('animationend', onOpenEnd);
        bringToFront();
      }
    }

    function hide() {
      if (minimized) return;
      saveRect();
      win.classList.add('anim-win-close');
      playCloseSnd();
      if (tbEntry) tbEntry.classList.remove('active');
      setTimeout(function() {
        minimized = true;
        win.style.display = 'none';
        win.classList.remove('anim-win-close');
      }, 400);
    }

    if (btnClose) {
      btnClose.addEventListener('click', hide);
    }

    if (btnMinimize) {
      btnMinimize.addEventListener('click', function() {
        if (maximized) { toggleMaximize(); }
        minimize();
      });
    }

    if (btnMaximize) {
      btnMaximize.addEventListener('click', function() {
        if (minimized || win.style.display === 'none') {
          restore();
          document.dispatchEvent(new CustomEvent('w2k-exit-showdesktop'));
        } else {
          toggleMaximize();
        }
      });
    }

    if (tbEntry) {
      tbEntry.addEventListener('click', function() {
        if (document.body.classList.contains('mobile-mode')) {
          if (win.classList.contains('active')) {
            win.classList.remove('active');
            tbEntry.classList.remove('active');
          } else {
            document.querySelectorAll('.window').forEach(function(w) { w.classList.remove('active'); });
            document.querySelectorAll('.taskbar-item').forEach(function(t) { t.classList.remove('active'); });
            win.classList.add('active');
            tbEntry.classList.add('active');
            bringToFront();
          }
          return;
        }
        if (minimized || win.style.display === 'none') {
          restore();
          document.dispatchEvent(new CustomEvent('w2k-exit-showdesktop'));
        } else if (win.classList.contains('active')) {
          minimize();
        } else {
          bringToFront();
        }
      });
    }

    if (dragHandle) {
      dragHandle.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('win-btn')) return;
        if (snapped && prevRect) {
          snapped = false;
          win.style.left = prevRect.left;
          win.style.top = prevRect.top;
          win.style.width = prevRect.width;
          win.style.height = prevRect.height;
        }
        var rect = win.getBoundingClientRect();
        dragState = {
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
          startX: rect.left,
          startY: rect.top,
          minLeft: -win.offsetWidth + 60,
        };
        win.style.cursor = 'move';
      });
    }

    document.addEventListener('mousemove', function(e) {
      if (!dragState) return;
      if (!maximized) {
        if (e.clientY < 12) {
          toggleMaximize();
          dragState = null;
          win.style.cursor = '';
          return;
        }
        var _snapEdge = 60;
        var _th = (_taskbarCache || (_taskbarCache = document.querySelector('.taskbar'))) ? _taskbarCache.offsetHeight : 40;
        var _mh = window.innerHeight - _th;
        if (e.clientX < _snapEdge) {
          saveRect();
          snapped = true;
          win.style.transition = 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
          win.style.left = '0';
          win.style.top = '0';
          win.style.width = Math.round(window.innerWidth / 2) + 'px';
          win.style.height = _mh + 'px';
          dragState = null;
          win.style.cursor = '';
          setTimeout(function() { win.style.transition = ''; }, 280);
          return;
        }
        if (e.clientX > window.innerWidth - _snapEdge) {
          saveRect();
          snapped = true;
          var _hw = Math.round(window.innerWidth / 2);
          win.style.transition = 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
          win.style.left = _hw + 'px';
          win.style.top = '0';
          win.style.width = _hw + 'px';
          win.style.height = _mh + 'px';
          dragState = null;
          win.style.cursor = '';
          setTimeout(function() { win.style.transition = ''; }, 280);
          return;
        }
      } else {
        if (e.clientY > dragState.offsetY + 8) {
          toggleMaximize();
          dragState.offsetX = e.clientX - parseInt(win.style.left);
          dragState.offsetY = e.clientY - parseInt(win.style.top);
        }
      }
      var l = e.clientX - dragState.offsetX;
      var t = e.clientY - dragState.offsetY;
      var mw = win.offsetWidth, mh = win.offsetHeight;
      l = Math.max(0, Math.min(l, window.innerWidth - mw));
      t = Math.max(0, Math.min(t, window.innerHeight - mh));
      global.__domWrite(function() {
        win.style.left = l + 'px';
        win.style.top = t + 'px';
      });
    });

    document.addEventListener('mouseup', function() {
      if (dragState) {
        dragState = null;
        win.style.cursor = '';
      }
    });

    (function() {
      if (!win.querySelector('.resize-edge')) {
        var resizeHTML = '';
        var edges = ['t','b','l','r'];
        for (var ei = 0; ei < edges.length; ei++) {
          resizeHTML += '<div class="resize-edge" data-edge="' + edges[ei] + '"></div>';
        }
        var corners = ['tl','tr','bl','br'];
        for (var ci = 0; ci < corners.length; ci++) {
          resizeHTML += '<div class="resize-corner" data-edge="' + corners[ci] + '"></div>';
        }
        var frag = document.createElement('div');
        frag.innerHTML = resizeHTML;
        while (frag.firstChild) {
          win.appendChild(frag.firstChild);
        }
      }
      var edges = win.querySelectorAll('.resize-edge, .resize-corner');
      if (!edges.length) return;

      function startResize(e, edge) {
        e.preventDefault();
        e.stopPropagation();
        bringToFront();
        if (snapped && prevRect) {
          snapped = false;
          win.style.left = prevRect.left;
          win.style.top = prevRect.top;
          win.style.width = prevRect.width;
          win.style.height = prevRect.height;
        }
        var rect = win.getBoundingClientRect();
        resizeState = {
          edge: edge,
          startX: e.clientX,
          startY: e.clientY,
          startLeft: rect.left,
          startTop: rect.top,
          startW: rect.width,
          startH: rect.height,
        };
        win.classList.add('window-resizing');
      }

      function doResize(e) {
        if (!resizeState) return;
        var s = resizeState;
        var dx = e.clientX - s.startX;
        var dy = e.clientY - s.startY;
        var edge = s.edge;
        var newL = s.startLeft, newT = s.startTop;
        var newW = s.startW, newH = s.startH;

        if (edge.indexOf('l') !== -1) {
          newL = s.startLeft + dx;
          newW = s.startW - dx;
          if (newW < minW) { newW = minW; newL = s.startLeft + s.startW - minW; }
          newL = Math.max(0, newL);
          newW = Math.min(newW, window.innerWidth - newL);
        } else if (edge.indexOf('r') !== -1) {
          newW = s.startW + dx;
          newW = Math.max(minW, Math.min(newW, window.innerWidth - s.startLeft));
        }

        if (edge.indexOf('t') !== -1) {
          newT = s.startTop + dy;
          newH = s.startH - dy;
          if (newH < minH) { newH = minH; newT = s.startTop + s.startH - minH; }
          newT = Math.max(0, newT);
          newH = Math.min(newH, window.innerHeight - newT - 40);
        } else if (edge.indexOf('b') !== -1) {
          newH = s.startH + dy;
          newH = Math.max(minH, Math.min(newH, window.innerHeight - s.startTop - 40));
        }

        global.__domWrite(function() {
          win.style.left = newL + 'px';
          win.style.top = newT + 'px';
          win.style.width = newW + 'px';
          win.style.height = newH + 'px';
        });
      }

      function endResize() {
        if (resizeState) {
          resizeState = null;
          win.classList.remove('window-resizing');
          if (maximized) {
            maximized = false;
            win.classList.remove('window-maximized');
          }
        }
      }

      for (var i = 0; i < edges.length; i++) {
        (function(el) {
          el.addEventListener('mousedown', function(e) {
            startResize(e, el.getAttribute('data-edge'));
          });
        })(edges[i]);
      }

      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', endResize);
    })();

    return {
      minimize: minimize,
      restore: restore,
      toggleMaximize: toggleMaximize,
      bringToFront: bringToFront,
      isMinimized: function() { return minimized; },
      setMinimized: function(v) { minimized = v; },
      setTaskbarEntry: function(el) { tbEntry = el; },
      clearSavedRect: function() { prevRect = null; },
    };
  }

  global.createWindowControls = createWindowControls;

  /* ================================================================
     WindowBehavior — unified window lifecycle with lazy init,
     dynamic taskbar entry, and standard show/hide/close.

     opts:
       dragHandle, btnClose, btnMinimize, btnMaximize,
       taskbarIcon (SVG string for taskbar entry), taskbarLabel,
       minW, minH,
       startVisible (default false),
       onShow(behavior), onHide(behavior), onInit(controls)
  ================================================================ */

  function WindowBehavior(win, opts) {
    opts = opts || {};

    var _initialized = false;
    var tbEntry = null;
    var controls = null;
    var appId = opts.appId || null;

    function _init() {
      if (_initialized) return;
      _initialized = true;

      var ctrlOpts = {};
      for (var k in opts) {
        if (opts.hasOwnProperty(k)) ctrlOpts[k] = opts[k];
      }
      ctrlOpts.btnClose = false;
      controls = createWindowControls(win, ctrlOpts);

      if (!opts.startVisible) {
        win.style.display = "none";
        controls.setMinimized(true);
      }

      if (opts.onInit) opts.onInit(controls);
    }

    function _isPinned() {
      return appId && global.W2K && global.W2K.taskbarPins && global.W2K.taskbarPins.isPinned(appId);
    }

    function _setupTbEntryClick() {
      tbEntry.addEventListener("click", function (e) {
        if (typeof playClickSnd === "function") playClickSnd();
        if (tbEntry.classList.contains("active")) {
          if (opts.onTaskbarClick) {
            opts.onTaskbarClick(e);
          } else if (controls && controls.isMinimized()) {
            controls.restore();
          } else if (win.style.display === "none") {
            show();
          } else if (win.classList.contains("active")) {
            if (_isPinned()) {
              controls.bringToFront();
            } else {
              controls.minimize();
            }
          } else {
            controls.bringToFront();
          }
        } else {
          if (opts.onTaskbarClick) {
            opts.onTaskbarClick(e);
          } else {
            show();
          }
        }
      });
      tbEntry.addEventListener("dblclick", function () {
        if (controls) controls.bringToFront();
      });
    }

    function createTaskbarEntry() {
      if (tbEntry) return;
      var container = document.querySelector(".taskbar-items");
      if (!container) return;

      if (_isPinned()) {
        var existing = container.querySelector('[data-app-id="' + appId + '"]');
        if (existing) {
          tbEntry = existing;
          tbEntry.classList.add("active");
          if (controls) controls.setTaskbarEntry(tbEntry);
          return;
        }
      }

      tbEntry = document.createElement("div");
      tbEntry.className = "taskbar-item active";
      if (appId) {
        tbEntry.setAttribute("data-app-id", appId);
        win.setAttribute("data-app-id", appId);
      }
      tbEntry.innerHTML = (opts.taskbarIcon || "") + " " + (opts.taskbarLabel || "Window");
      if (opts.taskbarAction) tbEntry.setAttribute("data-action", opts.taskbarAction);
      container.appendChild(tbEntry);
      if (controls) controls.setTaskbarEntry(tbEntry);
      _setupTbEntryClick();
    }

    function removeTaskbarEntry() {
      if (tbEntry) {
        if (_isPinned()) {
          tbEntry.classList.remove("active");
        } else {
          tbEntry.remove();
          tbEntry = null;
        }
      }
    }

    function show() {
      _init();
      createTaskbarEntry();
      win.style.display = "";
      win.style.transition = "";
      win.style.opacity = "";
      win.style.transform = "";
      win.style.boxShadow = "";
      win.classList.remove("anim-win-close");
      win.classList.add("anim-win-open");
      playOpenSnd();
      if (tbEntry) tbEntry.classList.add("active");
      controls.bringToFront();
      controls.setMinimized(false);
      if (!opts._onShowFired) {
        opts._onShowFired = true;
        if (opts.onShow) {
          opts.onShow(this);
        }
        var w = parseInt(win.style.width) || win.offsetWidth || 600;
        var h = parseInt(win.style.height) || win.offsetHeight || 450;
        win.style.left = Math.max(0, Math.round((window.innerWidth - w) / 2)) + "px";
        win.style.top = Math.max(0, Math.round((window.innerHeight - h) / 2)) + "px";
      }
      var onOpenEnd = function () {
        win.removeEventListener("animationend", onOpenEnd);
        win.classList.remove("anim-win-open");
      };
      win.removeEventListener("animationend", onOpenEnd);
      win.addEventListener("animationend", onOpenEnd);
    }

    function hide() {
      if (controls && controls.isMinimized()) return;
      if (tbEntry) tbEntry.classList.remove("active");
      win.classList.remove("anim-win-open");
      playCloseSnd();
      var rect = win.getBoundingClientRect();
      win.style.transition = "none";
      win.style.opacity = "1";
      win.style.transform = "scale(1) translateY(0)";
      win.style.boxShadow = "";
      requestAnimationFrame(
        function () {
          win.style.transition =
            "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease";
          win.style.opacity = "0";
          win.style.transform = "scale(0.82) translateY(12px)";
          win.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
          var onCloseEnd = function () {
            win.removeEventListener("transitionend", onCloseEnd);
            win.style.transition = "";
            win.style.opacity = "";
            win.style.transform = "";
            win.style.boxShadow = "";
            win.style.display = "none";
            removeTaskbarEntry();
            opts._onShowFired = false;
            if (controls) controls.clearSavedRect();
            if (opts.onHide) opts.onHide(this);
          }.bind(this);
          win.addEventListener("transitionend", onCloseEnd);
          setTimeout(
            function () {
              if (win.style.opacity === "0") {
                onCloseEnd();
              }
            },
            450,
          );
        }.bind(this),
      );
    }

    function minimize() {
      _init();
      controls.minimize();
    }

    function restore() {
      _init();
      controls.restore();
    }

    function bringToFront() {
      _init();
      controls.bringToFront();
    }

    function isMinimized() {
      return controls ? controls.isMinimized() : true;
    }

    function setMinimized(v) {
      if (controls) controls.setMinimized(v);
    }

    function hasTaskbarEntry() {
      return tbEntry !== null;
    }

    // Wire close button to hide + remove taskbar
    (function () {
      var closeBtn = opts.btnClose || win.querySelector('.win-btn[data-wbtn="close"]');
      if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
          if (controls && controls.isMinimized()) return;
          hide();
        });
      }
    })();

    _init();

    // Create idle pinned entry if app is pinned but not visible
    if (!opts.startVisible && _isPinned()) {
      var container = document.querySelector(".taskbar-items");
      if (container && !container.querySelector('[data-app-id="' + appId + '"]')) {
        tbEntry = document.createElement("div");
        tbEntry.className = "taskbar-item pinned";
        tbEntry.setAttribute("data-app-id", appId);
        tbEntry.innerHTML = (opts.taskbarIcon || "") + " " + (opts.taskbarLabel || "Window");
        if (opts.taskbarAction) tbEntry.setAttribute("data-action", opts.taskbarAction);
        container.appendChild(tbEntry);
        _setupTbEntryClick();
      }
    }

    if (opts.startVisible) {
      show();
    }

    // React to pin/unpin changes
    if (appId && global.W2K && global.W2K.taskbarPins) {
      global.W2K.taskbarPins.onChanged(function (id, pinned) {
        if (id !== appId) return;
        if (pinned) {
          if (tbEntry) {
            tbEntry.classList.add("pinned");
          } else {
            var c = document.querySelector(".taskbar-items");
            if (c && !c.querySelector('[data-app-id="' + appId + '"]')) {
              tbEntry = document.createElement("div");
              tbEntry.className = "taskbar-item pinned";
              tbEntry.setAttribute("data-app-id", appId);
              tbEntry.innerHTML = (opts.taskbarIcon || "") + " " + (opts.taskbarLabel || "Window");
              if (opts.taskbarAction) tbEntry.setAttribute("data-action", opts.taskbarAction);
              c.appendChild(tbEntry);
              _setupTbEntryClick();
            }
          }
        } else {
          if (tbEntry) {
            tbEntry.classList.remove("pinned");
          }
        }
      });
    }

    return {
      show: show,
      hide: hide,
      minimize: minimize,
      restore: restore,
      bringToFront: bringToFront,
      isMinimized: isMinimized,
      setMinimized: setMinimized,
      hasTaskbarEntry: hasTaskbarEntry,
    };
  }

  global.windowRegistry = [];

  global.registerWindow = function(desc) {
    global.windowRegistry.push({
      minimize: desc.minimize,
      show: desc.show,
      hasEntry: desc.hasEntry,
    });
  };

  global.WindowBehavior = WindowBehavior;
})(window);
