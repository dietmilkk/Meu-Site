(function () {
  "use strict";

  /* ================================================================
       TRAY — Clock, Calendar, Volume
       All tray / system-tray widgets in one module.
       ================================================================ */

  /* ===== Clock ===== */

  function updateClocks() {
    var now = new Date();
    var t =
      String(now.getHours() % 12 || 12).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");
    var el = document.getElementById("taskbarClock");
    if (el) el.textContent = t;
    document.querySelectorAll('.title-bar-clock').forEach(function(c) {
      c.textContent = t;
    });
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  /* Inject clock span into each window's title bar */
  function injectTitleBarClocks() {
    document.querySelectorAll('.title-bar').forEach(function(tb) {
      if (tb.querySelector('.title-bar-clock')) return;
      var btns = tb.querySelector('.title-bar-buttons');
      if (!btns) return;
      var clock = document.createElement('span');
      clock.className = 'title-bar-clock';
      var now = new Date();
      clock.textContent =
        String(now.getHours() % 12 || 12).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0");
      clock.style.cssText = 'margin-left: auto; margin-right: 6px; font-size: 14px; font-weight: 400; letter-spacing: 0.5px; opacity: 0.9; flex-shrink: 0;';
      tb.insertBefore(clock, btns);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTitleBarClocks);
  } else {
    injectTitleBarClocks();
  }

  /* ===== Helper: close other tray menus ===== */

  function closeNpMenu() {
    var m = document.getElementById("scNpMenu");
    if (m) m.classList.remove("visible");
  }
  function closeCalPanel() {
    if (calPanel && calPanel.style.display !== "none") {
      calPanel.classList.remove("cal-in");
      calPanel.classList.add("cal-out");
      setTimeout(function () {
        calPanel.style.display = "none";
        calPanel.classList.remove("cal-out");
      }, 240);
    }
  }
  function closeVolPanel() {
    if (volPanel && volPanel.style.display !== "none") {
      volPanel.classList.remove("vol-in");
      volPanel.classList.add("vol-out");
      setTimeout(function () {
        volPanel.style.display = "none";
        volPanel.classList.remove("vol-out");
      }, 220);
    }
  }

  /* ===== Calendar ===== */

  var clockEl = document.getElementById("taskbarClock");
  var calPanel = null;
  var calDate = new Date();

  var MONTHS = __('tray.months');
  var DAYS = __('tray.days');

  function buildCalendar() {
    var p = document.createElement("div");
    p.id = "calendarPanel";
    document.body.appendChild(p);
    return p;
  }

  function renderCalendar() {
    if (!calPanel) calPanel = buildCalendar();
    var y = calDate.getFullYear();
    var m = calDate.getMonth();
    var today = new Date();

    var firstDay = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    var html =
      '<div class="cal-header">' +
      '<span class="cal-nav-btn" id="calPrev">\u25C0</span>' +
      '<span class="cal-month-year">' + MONTHS[m] + " " + y + "</span>" +
      '<span class="cal-nav-btn" id="calNext">\u25B6</span>' +
      "</div>" +
      '<div class="cal-days-header">';
    for (var d = 0; d < 7; d++) {
      html += '<div class="cal-day-header">' + DAYS[d] + "</div>";
    }
    html +=
      "</div>" +
      '<div class="cal-grid">';
    for (var i = 0; i < firstDay; i++) {
      html += "<div></div>";
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var isToday =
        y === today.getFullYear() &&
        m === today.getMonth() &&
        day === today.getDate();
      html +=
        '<div class="cal-cell' +
        (isToday ? " cal-today" : "") +
        '">' +
        day +
        "</div>";
    }
    html += "</div>";

    calPanel.innerHTML = html;

    /* Stagger cell entrance animation */
    var cells = calPanel.querySelectorAll(".cal-cell");
    Array.prototype.forEach.call(cells, function (c, i) {
      c.style.animationDelay = (i * 18) + "ms";
    });

    var calPrev = document.getElementById("calPrev");
    var calNext = document.getElementById("calNext");
    if (calPrev)
      calPrev.addEventListener("click", function (e) {
        e.stopPropagation();
        calDate.setMonth(calDate.getMonth() - 1);
        renderCalendar();
        if (typeof playClickSnd === "function") playClickSnd();
      });
    if (calNext)
      calNext.addEventListener("click", function (e) {
        e.stopPropagation();
        calDate.setMonth(calDate.getMonth() + 1);
        renderCalendar();
        if (typeof playClickSnd === "function") playClickSnd();
      });

    /* ===== Scroll to change month (attach once) ===== */
    if (!calPanel._wheelAdded) {
      var _calWheelTimer = null;
      calPanel.addEventListener("wheel", function calWheel(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
          calDate.setMonth(calDate.getMonth() - 1);
        } else {
          calDate.setMonth(calDate.getMonth() + 1);
        }
        renderCalendar();
        if (!_calWheelTimer && typeof playClickSnd === "function") {
          playClickSnd();
          _calWheelTimer = setTimeout(function() { _calWheelTimer = null; }, 80);
        }
      }, { passive: false });
      calPanel._wheelAdded = true;
    }
  }

  if (clockEl) {
    clockEl.style.cursor = "pointer";
    clockEl.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!calPanel) {
        calPanel = buildCalendar();
        calDate = new Date();
      }
      closeVolPanel();
      closeNpMenu();

      /* cancel pending hide timer if any */
      if (calPanel._hideTimer) {
        clearTimeout(calPanel._hideTimer);
        calPanel._hideTimer = null;
      }
      calPanel.classList.remove("cal-in", "cal-out");

      var isHidden = calPanel.style.display === "none" || !calPanel.style.display;
      if (isHidden) {
        calDate = new Date();
        renderCalendar();
        calPanel.style.display = "block";
        void calPanel.offsetWidth;
        calPanel.classList.add("cal-in");
      } else {
        calPanel.classList.add("cal-out");
        calPanel._hideTimer = setTimeout(function () {
          calPanel.style.display = "none";
          calPanel.classList.remove("cal-out");
          calPanel._hideTimer = null;
        }, 240);
      }
    });
  }

  /* ================================================================
       VOLUME — state, persistence, public API
       ================================================================ */

  var _volume = 1;
  var _prevVolume = 1;
  var _audioCtx = null;

  function loadVolume() {
    try {
      var v = parseFloat(localStorage.getItem("win2k_volume"));
      _volume = !isNaN(v) ? Math.max(0, Math.min(1, v)) : 1;
    } catch (e) {
      _volume = 1;
    }
    _prevVolume = _volume;
  }

  function saveVolume() {
    try {
      localStorage.setItem(
        "win2k_volume",
        String(Math.round(_volume * 10000) / 10000),
      );
    } catch (e) {}
  }

  loadVolume();

  function getAudioCtx() {
    if (!_audioCtx)
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  window.getPageVolume = function () {
    return typeof _volume === "number" && !isNaN(_volume) ? _volume : 1;
  };

  window.setVolume = function (v) {
    if (typeof v !== "number" || isNaN(v)) return;
    v = Math.max(0, Math.min(1, v));
    if (Math.abs(v - _volume) < 0.00005) return;
    _volume = v;
    saveVolume();
    if (typeof window.setSoundCloudVolume === "function") {
      window.setSoundCloudVolume(v);
    }
    if (typeof window._volumeUIUpdate === "function") {
      window._volumeUIUpdate();
    }
  };

  window.resetVolume = function () {
    _volume = 0;
    _prevVolume = 1;
    saveVolume();
    if (typeof window.setSoundCloudVolume === "function") {
      window.setSoundCloudVolume(0);
    }
    if (typeof window._volumeUIUpdate === "function") {
      window._volumeUIUpdate();
    }
  };

  window.toggleMute = function () {
    if (_volume > 0) {
      _prevVolume = _volume;
      window.setVolume(0);
    } else {
      window.setVolume(_prevVolume > 0 ? _prevVolume : 1);
    }
  };

  /* ================================================================
       VOLUME PANEL
       ================================================================ */

  var volIcon = document.getElementById("trayVolume");
  var volPanel = null;

  function buildVolumePanel() {
    var p = document.createElement("div");
    p.id = "volumePanel";
    p.className = "volume-panel";
    p.style.display = "none";

    p.innerHTML =
      '<div class="volume-header">' +
      '<img src="system/assets/icons/tango2kde/16x16/apps/kmix.png" alt="" width="14" height="14">' +
      '<span class="volume-header-label">' + __('tray.volume') + '</span>' +
      "</div>" +
      '<div class="volume-body">' +
      '<div class="volume-row">' +
      '<span class="volume-mute-btn" id="volMuteBtn">' +
      '<img src="system/assets/icons/tango2kde/16x16/apps/kmix.png" alt="" width="12" height="12">' +
      "</span>" +
      '<div class="volume-slider-wrap" id="volSliderWrap">' +
      '<div class="volume-track">' +
      '<div class="volume-fill" id="volFill"></div>' +
      "</div>" +
      '<div class="volume-thumb" id="volThumb"></div>' +
      "</div>" +
      '<span class="volume-max-btn" id="volMaxBtn" title="' + __('tray.maxTitle') + '">' +
      '<img src="system/assets/icons/tango2kde/16x16/apps/kmix.png" alt="" width="14" height="14">' +
      "</span>" +
      "</div>" +
      '<div class="volume-gauge" id="volGauge">100%</div>' +
      '<div class="volume-reset-row">' +
      '<span class="volume-reset-btn" id="volResetBtn" title="' + __('tray.muteTitle') + '">' +
      '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 5h3l4-3v12L5 11H2V5z" fill="currentColor"/><line x1="10" y1="6" x2="14" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="14" y1="6" x2="10" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<span>' + __('tray.muteLabel') + '</span>' +
      "</span>" +
      "</div>" +
      "</div>";

    document.body.appendChild(p);

    var muteBtn = document.getElementById("volMuteBtn");
    var maxBtn = document.getElementById("volMaxBtn");
    var resetBtn = document.getElementById("volResetBtn");
    var sliderWrap = document.getElementById("volSliderWrap");
    var thumbEl = document.getElementById("volThumb");
    var fillEl = document.getElementById("volFill");
    function setSliderVisual(pct) {
      fillEl.style.width = pct + "%";
      thumbEl.style.left = pct + "%";
    }

    /* ===== Volume gauge ===== */
    var gaugeEl = document.getElementById("volGauge");

    function updateUI() {
      var pct = Math.round(_volume * 100);
      setSliderVisual(pct);
      gaugeEl.textContent = pct + "%";
      updateTrayIcon();
    }

    window._volumeUIUpdate = updateUI;

    var _dragging = false;
    var _dragStartX = 0;
    var _dragStartPct = 0;

    function sliderPointer(e) {
      var rect = sliderWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      window.setVolume(pct);
    }

    thumbEl.addEventListener("mousedown", function (e) {
      e.preventDefault();
      _dragging = true;
      _dragStartX = e.clientX;
      _dragStartPct = _volume;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    function onMove(e) {
      if (!_dragging) return;
      var rect = sliderWrap.getBoundingClientRect();
      var deltaPx = e.clientX - _dragStartX;
      var deltaPct = deltaPx / rect.width;
      var newVal = Math.max(0, Math.min(1, _dragStartPct + deltaPct));
      window.setVolume(newVal);
    }

    function onUp() {
      _dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    sliderWrap.addEventListener("mousedown", function (e) {
      if (e.target === thumbEl) return;
      sliderPointer(e);
    });

    muteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      window.toggleMute();
    });

    maxBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      window.setVolume(1);
    });

    resetBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      window.resetVolume();
    });

    updateUI();
    return p;
  }

  function updateTrayIcon() {
    if (!volIcon) return;
    volIcon.innerHTML = "";
    var img = document.createElement("img");
    img.src = "system/assets/icons/tango2kde/22x22/apps/kmix.png";
    img.alt = "";
    img.width = 18;
    img.height = 18;

    if (_volume === 0) {
      var wrap = document.createElement("span");
      wrap.style.cssText = "position:relative;display:inline-flex;";
      wrap.appendChild(img);
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 18 18");
      svg.style.cssText = "position:absolute;top:0;left:0;width:18px;height:18px;";
      var l1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l1.setAttribute("x1", "5");
      l1.setAttribute("y1", "5");
      l1.setAttribute("x2", "13");
      l1.setAttribute("y2", "13");
      l1.setAttribute("stroke", "#c00");
      l1.setAttribute("stroke-width", "2");
      l1.setAttribute("stroke-linecap", "square");
      svg.appendChild(l1);
      var l2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l2.setAttribute("x1", "13");
      l2.setAttribute("y1", "5");
      l2.setAttribute("x2", "5");
      l2.setAttribute("y2", "13");
      l2.setAttribute("stroke", "#c00");
      l2.setAttribute("stroke-width", "2");
      l2.setAttribute("stroke-linecap", "square");
      svg.appendChild(l2);
      wrap.appendChild(svg);
      volIcon.appendChild(wrap);
    } else {
      volIcon.appendChild(img);
    }
  }

  /* ===== Wire volume icon ===== */

  if (volIcon) {
    volPanel = buildVolumePanel();
    volIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      closeCalPanel();
      closeNpMenu();
      if (volPanel.style.display === "none" || !volPanel.style.display) {
        volPanel.classList.remove("vol-out");
        volPanel.style.display = "block";
        void volPanel.offsetWidth;
        volPanel.classList.add("vol-in");
      } else {
        volPanel.classList.remove("vol-in");
        volPanel.classList.add("vol-out");
        setTimeout(function () {
          volPanel.style.display = "none";
          volPanel.classList.remove("vol-out");
        }, 220);
      }
    });
  }

  /* ===== Close panels on outside click ===== */

  document.addEventListener(
    "click",
    function (e) {
      if (
        e.target &&
        e.target.closest &&
        (e.target.closest("#volumePanel") ||
          e.target.closest("#calendarPanel") ||
          e.target.closest("#taskbarClock") ||
          e.target.closest("#trayVolume"))
      )
        return;
      closeVolPanel();
      closeCalPanel();
      closeNpMenu();
    },
    true,
  );
})();
