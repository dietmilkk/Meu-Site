(function () {
  "use strict";

  var win = document.getElementById("settingsWindow");
  var dragHandle = document.getElementById("settingsDragHandle");
  var btnClose = document.getElementById("settingsBtnClose");
  var btnMinimize = document.getElementById("settingsBtnMinimize");
  var btnMaximize = document.getElementById("settingsBtnMaximize");

  var wallpaperInput = document.getElementById("wallpaperInput");
  var wallpaperFileName = document.getElementById("wallpaperFileName");
  var wallpaperPreview = document.getElementById("wallpaperPreview");
  var applyBtn = document.getElementById("settingsApplyBtn");
  var selectedFile = null;
  var eqWrap = document.getElementById("eqSliders");

  var _pageLoad = Date.now();

  function getOS() {
    var ua = navigator.userAgent || "";
    if (ua.indexOf("Windows NT 10") !== -1) return "Windows 10";
    if (ua.indexOf("Windows NT 6.3") !== -1) return "Windows 8.1";
    if (ua.indexOf("Windows NT 6.2") !== -1) return "Windows 8";
    if (ua.indexOf("Windows NT 6.1") !== -1) return "Windows 7";
    if (ua.indexOf("Windows NT 6.0") !== -1) return "Windows Vista";
    if (ua.indexOf("Windows NT 5.1") !== -1) return "Windows XP";
    if (ua.indexOf("Windows NT 5.0") !== -1) return "Windows 2000";
    if (ua.indexOf("Mac") !== -1) return "macOS";
    if (ua.indexOf("Linux") !== -1) return "Linux";
    if (ua.indexOf("Android") !== -1) return "Android";
    if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) return "iOS";
    return __("sys.unknown");
  }

  function getUptime() {
    var elapsed = Math.floor((Date.now() - _pageLoad) / 1000);
    var h = Math.floor(elapsed / 3600);
    var m = Math.floor((elapsed % 3600) / 60);
    var s = elapsed % 60;
    return h + "h " + m + "m " + s + "s";
  }

  function refreshSystemInfo() {
    var el = document.getElementById("systemInfoContent");
    if (!el) return;
    var now = new Date();
    var mem = navigator.deviceMemory ? navigator.deviceMemory + " GB" : __("sys.unknown");
    var cpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + __("sys.cores") : __("sys.unknown");
    var uaClean = navigator.userAgent ? navigator.userAgent.replace(/[\/][^\s]*/g, "").trim() : __("sys.unknown");
    el.innerHTML =
      __("sys.time") + now.toLocaleTimeString() + "<br>" +
      __("sys.os") + getOS() + "<br>" +
      __("sys.arch") + (navigator.platform || __("sys.unknown")) + "<br>" +
      __("sys.browser") + uaClean + "<br>" +
      __("sys.lang") + (navigator.language || "") + "<br>" +
      __("sys.tz") + Intl.DateTimeFormat().resolvedOptions().timeZone + "<br>" +
      __("sys.resolution") + screen.width + "x" + screen.height + "<br>" +
      __("sys.colorDepth") + screen.colorDepth + "-bit<br>" +
      __("sys.sessionDuration") + getUptime() + "<br>" +
      __("sys.cpu") + cpu + "<br>" +
      __("sys.ram") + mem + "<br><br>" +
      "<span id='geoInfo' style='color:#888;font-size:14px;'>" + __("sys.fetching") + "</span>";
    fetchGeo().then(function (d) {
      var geoEl = document.getElementById("geoInfo");
      if (!geoEl) return;
      var loc = (d.city || "?") + ", " + (d.region || "?") + ", " + (d.country || "?");
      var coords = '';
      if (d.lat != null && d.lon != null) coords = d.lat + ", " + d.lon;
      geoEl.innerHTML =
        __("sys.ip") + (d.ip || "?") + "<br>" +
        __("sys.location") + loc + "<br>" +
        __("sys.zip") + (d.postal || "?") + "<br>" +
        __("sys.isp") + (d.isp || d.org || "?") + "<br>" +
        __("sys.coords") + (coords || "?");
      geoEl.style.color = "#0a0";
    }).catch(function () {
      var geoEl = document.getElementById("geoInfo");
      if (geoEl) geoEl.textContent = __("sys.fetchFail");
    });
  }

  var behavior = new WindowBehavior(win, {
    dragHandle: dragHandle,
    btnClose: btnClose,
    btnMinimize: btnMinimize,
    btnMaximize: btnMaximize,
    minW: 580,
    minH: 460,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/categories/redhat-system_tools.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __('settings.title'),
    taskbarAction: 'settings',
    appId: 'settings',
    onShow: function () {
      win.style.width = "620px";
      win.style.height = "560px";
      refreshSystemInfo();
      initEqualizer();
      syncEqUI();
    },
    onHide: function () {
      selectedFile = null;
      wallpaperFileName.textContent = "";
      wallpaperPreview.innerHTML = "";
      wallpaperPreview.style.background = "";
    },
  });

  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("settings", {
      label: __('settings.title'),
      show: function () {
        behavior.show();
      },
      minimize: function () {
        behavior.minimize();
      },
      hasEntry: function () {
        return behavior.hasTaskbarEntry();
      },
    });
  }

  wallpaperInput.addEventListener("change", function () {
    var file = wallpaperInput.files[0];
    if (!file) return;
    selectedFile = file;
    wallpaperFileName.textContent = file.name;

    var reader = new FileReader();
    reader.onload = function (e) {
      wallpaperPreview.innerHTML =
        '<img src="' + e.target.result + '" class="settings-wallpaper-img">';
      wallpaperPreview.style.background = "none";
    };
    reader.readAsDataURL(file);
  });

  applyBtn.addEventListener("click", function () {
    if (!selectedFile) {
      xpDialog({
        title: __('settings.dialogTitle'),
        icon: "i",
        message: __('settings.selectFirst'),
      });
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var desktop = document.querySelector(".desktop");
      desktop.style.backgroundImage = 'url("' + e.target.result + '")';
      desktop.style.backgroundSize = "cover";
      desktop.style.backgroundPosition = "center";
      desktop.style.backgroundRepeat = "no-repeat";

      xpDialog({
        title: __('settings.dialogTitle'),
        icon: "i",
        message: __('settings.applySuccess'),
      });
    };
    reader.readAsDataURL(selectedFile);
  });

  /* ---- Theme ---- */
  var themePicker = document.getElementById("themeColorPicker");
  var themeApplyBtn = document.getElementById("themeApplyBtn");
  var themeResetBtn = document.getElementById("themeResetBtn");

  if (themePicker && typeof window.getThemeColor === "function") {
    themePicker.value = window.getThemeColor();
  }

  window._themeUIUpdate = function (hex) {
    if (themePicker) themePicker.value = hex;
  };

  if (themeApplyBtn && themePicker) {
    themeApplyBtn.addEventListener("click", function () {
      if (typeof window.setTheme === "function") {
        window.setTheme(themePicker.value);
      }
    });
  }

  if (themeResetBtn) {
    themeResetBtn.addEventListener("click", function () {
      if (typeof window.resetTheme === "function") {
        window.resetTheme();
      }
    });
  }

  function switchToSettingsCategory(cat) {
    if (!behavior.hasTaskbarEntry()) {
      behavior.show();
    }
    var cats = document.querySelectorAll(".settings-category");
    for (var j = 0; j < cats.length; j++) {
      cats[j].classList.remove("active");
    }
    var targetCat = document.querySelector('.settings-category[data-category="' + cat + '"]');
    if (targetCat) targetCat.classList.add("active");
    var panels = document.querySelectorAll(".settings-panel");
    for (var k = 0; k < panels.length; k++) {
      panels[k].classList.remove("active");
    }
    var target = document.querySelector('.settings-panel[data-category="' + cat + '"]');
    if (target) target.classList.add("active");
    if (cat === "system") refreshSystemInfo();
  }
  window.switchToSettingsCategory = switchToSettingsCategory;

  var categories = document.querySelectorAll(".settings-category");
  for (var i = 0; i < categories.length; i++) {
    (function (cat) {
      cat.addEventListener("click", function () {
        for (var j = 0; j < categories.length; j++) {
          categories[j].classList.remove("active");
        }
        cat.classList.add("active");

        var panels = document.querySelectorAll(".settings-panel");
        for (var k = 0; k < panels.length; k++) {
          panels[k].classList.remove("active");
        }
        var target = document.querySelector(
          '.settings-panel[data-category="' +
            cat.getAttribute("data-category") +
            '"]',
        );
        if (target) target.classList.add("active");
        if (cat.getAttribute("data-category") === "system") { refreshSystemInfo(); initEqualizer(); }
      });
    })(categories[i]);
  }

  /* ===== Equalizer ===== */
  function initEqualizer() {
    if (typeof window._eqGetBands !== "function") return;
    var wrap = eqWrap;
    if (!wrap || wrap.hasAttribute("data-eq-inited")) return;
    wrap.setAttribute("data-eq-inited", "1");

    var bands = window._eqGetBands();
    var freqLabels = ["32","64","125","250","500","1K","2K","4K","8K","16K"];

    for (var i = 0; i < bands.length; i++) {
      (function (idx) {
        var col = document.createElement("div");
        col.className = "eq-band";

        var valLabel = document.createElement("div");
        valLabel.className = "eq-band-value";
        valLabel.id = "eqVal" + idx;
        valLabel.textContent = bands[idx].toFixed(1) + "dB";

        var slider = document.createElement("input");
        slider.type = "range";
        slider.className = "eq-band-slider";
        slider.min = -12;
        slider.max = 12;
        slider.value = bands[idx];
        slider.step = 0.5;
        slider.id = "eqSlider" + idx;

        slider.addEventListener("input", function () {
          var v = parseFloat(this.value);
          if (typeof window._eqSetBand === "function") window._eqSetBand(idx, v);
          var vl = document.getElementById("eqVal" + idx);
          if (vl) vl.textContent = (v > 0 ? "+" : "") + v.toFixed(1) + "dB";
        });

        var label = document.createElement("div");
        label.className = "eq-band-label";
        label.textContent = freqLabels[idx];

        col.appendChild(valLabel);
        col.appendChild(slider);
        col.appendChild(label);
        wrap.appendChild(col);
      })(i);
    }

    // Presets (custom Win2000-style dropdown)
    var dropBtn = document.getElementById("eqPresetDropBtn");
    var dropList = document.getElementById("eqPresetDropList");
    var dropLabel = document.getElementById("eqPresetDropLabel");
    var presets = [];
    var selIdx = 0;
    var currentPreset = "flat";

    function setDropSelection() {
      if (!presets[selIdx]) return;
      currentPreset = presets[selIdx].id;
      dropLabel.textContent = presets[selIdx].label;
      var items = dropList.children;
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle("sel", i === selIdx);
      }
    }

    function applyPreset(name) {
      if (typeof window._eqSetPreset === "function") window._eqSetPreset(name);
      syncEqUI();
      if (typeof playToggleOnSnd === "function") playToggleOnSnd();
    }

    if (dropBtn && dropList && typeof window._eqGetPresets === "function") {
      presets = window._eqGetPresets();
      for (var i = 0; i < presets.length; i++) {
        (function (pr, idx) {
          var item = document.createElement("div");
          item.className = "eq-drop-item";
          item.textContent = pr.label;
          item.dataset.value = pr.id;
          item.addEventListener("mousedown", function (e) { e.preventDefault(); });
          item.addEventListener("click", function () {
            selIdx = idx;
            setDropSelection();
            closeEqDrop();
          });
          dropList.appendChild(item);
        })(presets[i], i);
      }
      document.body.appendChild(dropList);
      selIdx = 0;
      setDropSelection();
    }

    function openEqDrop() {
      if (!dropList || dropList.hidden === false) return;
      dropBtn.focus();
      var r = dropBtn.getBoundingClientRect();
      dropList.style.left = r.left + "px";
      dropList.style.top = r.bottom + 2 + "px";
      dropList.style.bottom = "auto";
      dropList.style.minWidth = Math.max(r.width, 150) + "px";
      dropList.hidden = false;
      dropBtn.setAttribute("aria-expanded", "true");
      var lh = dropList.offsetHeight;
      if (r.bottom + 2 + lh > window.innerHeight) {
        dropList.style.top = "auto";
        dropList.style.bottom = window.innerHeight - r.top + 2 + "px";
      }
    }

    function closeEqDrop() {
      if (!dropList || dropList.hidden === true) return;
      dropList.hidden = true;
      dropBtn.setAttribute("aria-expanded", "false");
    }

    if (dropBtn) {
      dropBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (dropList.hidden === true) openEqDrop();
        else closeEqDrop();
      });
      dropBtn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (dropList.hidden === true) { openEqDrop(); return; }
          var items = dropList.children;
          var d = e.key === "ArrowDown" ? 1 : -1;
          var idx = (selIdx + d + items.length) % items.length;
          selIdx = idx;
          for (var i = 0; i < items.length; i++) items[i].classList.remove("hl");
          items[selIdx].classList.add("hl");
          items[selIdx].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter" && dropList.hidden === false) {
          e.preventDefault();
          setDropSelection();
          closeEqDrop();
        } else if (e.key === "Escape") {
          closeEqDrop();
        }
      });
    }

    document.addEventListener("mousedown", function (e) {
      if (dropList && dropList.hidden === false && !e.target.closest(".eq-drop") && !e.target.closest("#eqPresetDropList")) {
        closeEqDrop();
      }
    });

    var applyBtn = document.getElementById("eqApplyPreset");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        closeEqDrop();
        applyPreset(currentPreset);
      });
    }

    var resetBtn = document.getElementById("eqResetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (typeof window._eqReset === "function") window._eqReset();
        syncEqUI();
        if (typeof playCloseSnd === "function") playCloseSnd();
      });
    }

    var bypassChk = document.getElementById("eqBypass");
    if (bypassChk) {
      bypassChk.checked = typeof window._eqIsBypassed === "function" ? window._eqIsBypassed() : false;
      bypassChk.addEventListener("change", function () {
        if (typeof window._eqBypass === "function") window._eqBypass(this.checked);
        syncEqUI();
        if (typeof playToggleOnSnd === "function") playToggleOnSnd();
      });
    }

    window._eqUIUpdate = syncEqUI;

    buildEqWave();
    startEqAnimation();
  }

  /* ===== Decorative live spectrum (moves with site + player audio) ===== */
  var _waveBars = [];
  var _waveN = 48;

  function buildEqWave() {
    var track = document.getElementById("eqWaveTrack");
    if (!track || _waveBars.length) return;
    for (var i = 0; i < _waveN; i++) {
      var bar = document.createElement("div");
      bar.className = "eq-wave-bar";
      bar.style.height = "4%";
      track.appendChild(bar);
      _waveBars.push(bar);
    }
    function sizeTrack() {
      if (!track || !win || win.offsetParent === null) return;
      var h = Math.max(72, Math.min(260, Math.round(win.offsetHeight * 0.4)));
      track.style.height = h + "px";
    }
    sizeTrack();
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(sizeTrack).observe(win);
    } else {
      window.addEventListener("resize", sizeTrack);
    }
  }

  /* Combine player spectrum + site-sound spectrum into N bar heights (0..1) */
  function _waveHeights() {
    var music = typeof window._eqGetLevels === "function" ? window._eqGetLevels() : null;
    var site = typeof window._eqGetSiteLevels === "function" ? window._eqGetSiteLevels() : null;
    var bands = null;
    if (music || site) {
      var len = 10;
      var merged = new Array(len).fill(0);
      if (music) for (var i = 0; i < len && i < music.length; i++) merged[i] = Math.max(merged[i], music[i]);
      if (site) for (var j = 0; j < len && j < site.length; j++) merged[j] = Math.max(merged[j], site[j]);
      bands = merged;
    }
    var out = new Array(_waveN).fill(0);
    if (!bands) return out;
    for (var k = 0; k < _waveN; k++) {
      var pos = (k / (_waveN - 1)) * (bands.length - 1);
      var lo = Math.floor(pos), hi = Math.min(lo + 1, bands.length - 1);
      var f = pos - lo;
      out[k] = bands[lo] * (1 - f) + bands[hi] * f;
    }
    return out;
  }

  /* ===== Live equalizer animation (moves with the music) ===== */
  var _eqAnimRunning = false;
  var _eqDragging = false;
  var _waveSmooth = [];
  var _waveT = 0;
  var _waveLastLive = 0;

  function startEqAnimation() {
    if (_eqAnimRunning) return;
    _eqAnimRunning = true;

    var w = eqWrap;
    if (!w) return;
    w.addEventListener("mousedown", function (e) {
      if (e.target && e.target.tagName === "INPUT") _eqDragging = true;
    });
    w.addEventListener("touchstart", function (e) {
      if (e.target && e.target.tagName === "INPUT") _eqDragging = true;
    });
    document.addEventListener("mouseup", function () { _eqDragging = false; });
    document.addEventListener("touchend", function () { _eqDragging = false; });

    (function loop() {
      requestAnimationFrame(loop);
      if (_eqDragging) return;
      if (!win || win.offsetParent === null) return;
      var levels = typeof window._eqGetLevels === "function" ? window._eqGetLevels() : null;
      var peak = 0;
      if (levels) {
        for (var i = 0; i < levels.length; i++) if (levels[i] > peak) peak = levels[i];
      }
      for (var i = 0; i < 10; i++) {
        var slider = document.getElementById("eqSlider" + i);
        if (!slider) continue;
        var base = typeof window._eqGetBand === "function" ? window._eqGetBand(i) : 0;
        var val;
        if (levels && peak >= 0.015) {
          val = base + (levels[i] * 2 - 1) * 6;
        } else {
          val = base;
        }
        val = Math.max(-12, Math.min(12, val));
        slider.value = val;
        var vl = document.getElementById("eqVal" + i);
        if (vl) vl.textContent = (val > 0 ? "+" : "") + val.toFixed(1) + "dB";
      }
      updateEqWave(peak);
    })();
  }

  function updateEqWave(peak) {
    var heights = _waveHeights();
    var live = document.getElementById("eqWaveLive");
    var combinedPeak = peak;
    for (var k = 0; k < heights.length; k++) if (heights[k] > combinedPeak) combinedPeak = heights[k];
    var rawLive = combinedPeak >= 0.015;
    if (rawLive) _waveLastLive = Date.now();
    var liveOn = rawLive || (Date.now() - _waveLastLive < 3000);
    if (!_waveSmooth.length) {
      for (var i = 0; i < _waveN; i++) _waveSmooth[i] = 0;
    }
    for (var i = 0; i < _waveBars.length; i++) {
      var target;
      if (liveOn) {
        target = 0.06 + Math.pow(heights[i], 0.8) * 0.94;
      } else {
        /* Gentle idle ripple — halved height, after 3s delay */
        target = 0.03 + 0.08 * (0.5 + 0.5 * Math.sin(_waveT * 2.4 + i * 0.55)) *
                 (0.5 + 0.5 * Math.sin(_waveT * 3.1 + i * 0.9));
      }
      _waveSmooth[i] += (target - _waveSmooth[i]) * 0.62;
      var h = Math.max(4, Math.min(100, _waveSmooth[i] * 100));
      var bar = _waveBars[i];
      if (bar) bar.style.height = h.toFixed(1) + "%";
    }
    _waveT += 0.03;
    var dbEl = document.getElementById("eqWaveDb");
    var fillEl = document.getElementById("eqWaveDbFill");
    if (dbEl && fillEl) {
      var musicDb = typeof window._eqGetDb === "function" ? window._eqGetDb() : null;
      var siteDb = typeof window._eqGetSiteDb === "function" ? window._eqGetSiteDb() : null;
      var db = null;
      if (musicDb && siteDb) db = musicDb.rms >= siteDb.rms ? musicDb : siteDb;
      else db = musicDb || siteDb;
      var audioEl = document.querySelector("audio");
      var musicActive = !!audioEl && !audioEl.paused && !audioEl.ended;
      var siteActive = !!siteDb && siteDb.peak >= -28;
      var original = musicActive || siteActive;
      var hasEqData = !!(musicDb && musicDb.rms > -60);
      // Custom EQ ativo quando algum ganho != 0
      var isCustomEq = false;
      if (typeof window._eqGetBands === "function") {
        var _bands = window._eqGetBands();
        for (var _i = 0; _i < _bands.length; _i++) if (_bands[_i] !== 0) { isCustomEq = true; break; }
      }
      var originalNow = original || hasEqData || (isCustomEq && liveOn);
      var liveNow = liveOn && originalNow;
      if (live) {
        if (liveNow) live.classList.add("active");
        else live.classList.remove("active");
      }
      if (originalNow && db) {
        var rms = db.rms;
        var peak = db.peak;
        var pct = Math.max(0, Math.min(1, (rms + 60) / 60));
        var now = Date.now();
        if (!window._eqLastDbUpdate || now - window._eqLastDbUpdate > 140) {
          window._eqLastDbUpdate = now;
          // Mostra 0-100 (0 silencio, 100 max) com valor real dB como tooltip
          var level = Math.round(pct * 100);
          dbEl.textContent = level;
          dbEl.title = rms.toFixed(1) + " dBFS (0 max, maior = mais alto)";
          var healthy = rms >= -30 && rms <= -6 && peak < -1 && peak > -60;
          dbEl.classList.toggle("ok", healthy);
          dbEl.classList.toggle("bad", !healthy);
          fillEl.classList.toggle("bad", !healthy);
        }
        fillEl.style.width = (pct * 100).toFixed(1) + "%";
        if (window._volumeLiveUpdate) window._volumeLiveUpdate(pct);
      } else {
        dbEl.textContent = "--";
        dbEl.title = "";
        dbEl.classList.remove("ok", "bad");
        fillEl.classList.remove("bad");
        fillEl.style.width = "0%";
        if (window._volumeLiveUpdate) window._volumeLiveUpdate(0);
      }
    }
  }

  function syncEqUI() {
    if (typeof window._eqGetBands !== "function") return;
    var bands = window._eqGetBands();
    for (var i = 0; i < bands.length; i++) {
      var slider = document.getElementById("eqSlider" + i);
      var valLabel = document.getElementById("eqVal" + i);
      if (slider) slider.value = bands[i];
      if (valLabel) valLabel.textContent = (bands[i] > 0 ? "+" : "") + bands[i].toFixed(1) + "dB";
    }
    var bypassChk = document.getElementById("eqBypass");
    if (bypassChk && typeof window._eqIsBypassed === "function") {
      bypassChk.checked = window._eqIsBypassed();
    }
  }
})();
