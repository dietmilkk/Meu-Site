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

  /* ================================================================
   *  SPECTRUM VISUALIZER — Matemática aplicada ao áudio
   *  ----------------------------------------------------------------
   *  Princípios:
   *  • Mapeamento psicoacústico: loudness (dB SPL) → brilho/energia
   *  • Análise espectral: 10 bandas bark → 48 barras via interpolação
   *  • Física de molas adaptativas: amortecimento = f(energia, frequência)
   *  • Ruído de Perlin 1D: movimento orgânico sem repetição óbvia
   *  • Série harmônica: visualização de parciais (fundamental + harmônicos)
   *  • Cor = f(energia, centroid espectral, fluxo espectral)
   *  • Fase instantânea → deslocamento horizontal (onda viajante)
   *  • Fluxo espectral → "brilho" e velocidade de propagação
   *  ================================================================ */

  /* ===== Constantes matemáticas ===== */
  const SPECTRUM = {
    N_BARS: 48,                    // barras visuais
    N_BARK_BANDS: 10,              // bandas bark (psicoacústica)
    SMOOTH_ATTACK: 0.35,           // ataque da mola (energia alta)
    SMOOTH_RELEASE: 0.12,          // release da mola (energia baixa)
    ENERGY_SMOOTH: 0.08,           // suavização da energia global
    PERLIN_OCTAVES: 4,             // oitavas do ruído de Perlin
    PERLIN_PERSISTENCE: 0.5,       // persistência do ruído
    HARMONIC_MAX: 8,               // harmônicos visualizados
    PHASE_SPEED_BASE: 0.02,        // velocidade base da fase
    ENERGY_FLOOR: 0.001,           // piso de energia (evita zero)
    CENTROID_WEIGHT: 0.6,          // peso do centroid espectral na cor
    FLUX_WEIGHT: 0.4               // peso do fluxo espectral na cor
  };

  /* ===== Estado do visualizador ===== */
  var _waveBars = [];
  var _waveN = SPECTRUM.N_BARS;
  var _waveSmooth = new Array(_waveN).fill(0);
  var _waveSmoothPrev = new Array(_waveN).fill(0);
  var _waveVelocity = new Array(_waveN).fill(0);        // velocidade para molas
  var _waveT = 0;                                        // tempo global
  var _waveLastLive = 0;
  var _waveLastFrame = performance.now();
  var _waveLastLive = 0;
  var _energyGlobal = 0;
  var _energyPrev = 0;
  var _phaseAccum = 0;
  var _phaseVelocity = 0;
  var _beatCooldown = 0;
  var _beatFlash = 0;
  var _beatFlashDecay = 0;
  var _lastPeak = 0;
  var _beatCooldown = 0;
  var _beatFlashDecay = 0;
  var _waveSmooth = new Array(SPECTRUM.N_BARS).fill(0);
  var _waveSmoothPrev = new Array(SPECTRUM.N_BARS).fill(0);
  var _waveVelocity = new Array(SPECTRUM.N_BARS).fill(0);
  var _eqAnimRunning = false;                            // flag de animação rodando
  var _eqDragging = false;                               // flag de arraste em controles
  var _trackEl = null;                                   // referência ao track element
  var _energyGlobal = 0;           // energia global suavizada (0..1)
  var _energyPrev = 0;             // frame anterior
  var _spectralCentroid = 0;       // centroid espectral normalizado (0..1)
  var _spectralFlux = 0;           // fluxo espectral (mudança entre frames)
  var _spectralFlatness = 0;       // planicidade espectral (tonal vs ruído)
  var _harmonicProfile = new Array(SPECTRUM.HARMONIC_MAX).fill(0); // perfil harmônico
  var _phaseAccum = 0;             // acumulador de fase global
  var _phaseVelocity = 0;          // velocidade de fase instantânea
  var _lastSpectrum = null;        // espectro do frame anterior

  /* Ruído de Perlin 1D para movimento orgânico */
  var _perlinPerm = [];
  var _perlinGrad = [];
  (function initPerlin() {
    for (var i = 0; i < 256; i++) _perlinPerm[i] = i;
    for (var i = 255; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = _perlinPerm[i]; _perlinPerm[i] = _perlinPerm[j]; _perlinPerm[j] = t;
    }
    for (var i = 0; i < 256; i++) {
      var angle = Math.random() * Math.PI * 2;
      _perlinGrad[i] = { x: Math.cos(angle), y: Math.sin(angle) };
    }
    _perlinPerm = _perlinPerm.concat(_perlinPerm);
    _perlinGrad = _perlinGrad.concat(_perlinGrad);
  })();

  function perlin1D(x) {
    var xi = Math.floor(x) & 255;
    var xf = x - Math.floor(x);
    var u = xf * xf * (3 - 2 * xf); // smoothstep
    var g0 = _perlinGrad[_perlinPerm[xi]];
    var g1 = _perlinGrad[_perlinPerm[(xi + 1) & 255]];
    var n0 = g0.x * xf;
    var n1 = g1.x * (xf - 1);
    return n0 * (1 - u) + n1 * u;
  }

  function fractalPerlin(x, octaves, persistence) {
    var total = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (var i = 0; i < octaves; i++) {
      total += perlin1D(x * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / maxValue;
  }

  /* ===== Interpolação suave (catmull-rom) ===== */
  function catmullRom(points, tension) {
    if (!points || points.length < 2) return '';
    var d = 'M ' + points[0].x.toFixed(2) + ' ' + points[0].y.toFixed(2);
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i > 0 ? i - 1 : 0];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];
      var cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
      var cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
      var cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
      var cp2y = p2.y - (p3.y - p1.y) / 6 * tension;
      d += ' C ' + cp1x.toFixed(2) + ' ' + cp1y.toFixed(2) +
           ' ' + cp2x.toFixed(2) + ' ' + cp2y.toFixed(2) +
           ' ' + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2);
    }
    return d;
  }

  /* ===== Mapeamento bark → frequência (psicoacústica) ===== */
  var BARK_CENTERS = [50, 150, 250, 350, 450, 570, 700, 840, 1000, 1170]; // Hz aproximados

  function hzToBark(hz) {
    return 13 * Math.atan(0.00076 * hz) + 3.5 * Math.atan(Math.pow(hz / 7500, 2));
  }

  function barkToHz(bark) {
    return 1960 * (bark + 0.53) / (26.28 - bark);
  }

  /* ===== Análise espectral avançada ===== */
  function analyzeSpectrum(levels) {
    if (!levels || !levels.length) return null;

    var n = levels.length;
    var totalEnergy = 0, weightedSum = 0, flux = 0;

    /* Energia total e centroid */
    for (var i = 0; i < n; i++) {
      var mag = levels[i];
      totalEnergy += mag * mag;
      weightedSum += mag * mag * (i / (n - 1));
    }

    var energy = Math.sqrt(totalEnergy / n);
    var centroid = totalEnergy > 1e-10 ? weightedSum / totalEnergy : 0;

    /* Fluxo espectral (diferença do frame anterior) */
    if (_lastSpectrum) {
      var fluxSum = 0;
      for (var i = 0; i < n; i++) {
        var diff = levels[i] - _lastSpectrum[i];
        if (diff > 0) fluxSum += diff * diff; // half-wave rectified flux
      }
      flux = Math.sqrt(fluxSum / n);
    }

    /* Planicidade espectral (tonalidade) */
    var geoMean = 0, arithMean = 0;
    var validCount = 0;
    for (var i = 0; i < n; i++) {
      if (levels[i] > 1e-10) {
        geoMean += Math.log(levels[i]);
        arithMean += levels[i];
        validCount++;
      }
    }
    var flatness = validCount > 0 ? Math.exp(geoMean / validCount) / (arithMean / validCount) : 0;

    /* Detecção harmônica simples (autocorrelação simplificada) */
    var harmonicProfile = new Array(SPECTRUM.HARMONIC_MAX).fill(0);
    var peakIdx = 0, peakVal = 0;
    for (var i = 1; i < n - 1; i++) {
      if (levels[i] > levels[i-1] && levels[i] > levels[i+1] && levels[i] > peakVal) {
        peakVal = levels[i];
        peakIdx = i;
      }
    }
    if (peakVal > 0.1) {
      var fundFreq = peakIdx / (n - 1);
      for (var h = 1; h <= SPECTRUM.HARMONIC_MAX; h++) {
        var hIdx = Math.round(h * peakIdx);
        if (hIdx < n) harmonicProfile[h-1] = levels[hIdx] / peakVal;
      }
    }

    return {
      energy: energy,
      centroid: centroid,           // 0..1 (grave → agudo)
      flux: flux,                   // 0..1 (mudança espectral)
      flatness: flatness,           // 0..1 (tonal=0, ruído=1)
      harmonicProfile: harmonicProfile,
      peakIdx: peakIdx,
      peakVal: peakVal
    };
  }

  /* ===== Conversão energia → parâmetros visuais ===== */
  function energyToVisualParams(analysis) {
    if (!analysis) return { brightness: 0.1, saturation: 0.3, hue: 220, speed: 0.5, turbulence: 0.1 };

    var e = Math.max(SPECTRUM.ENERGY_FLOOR, Math.min(1, analysis.energy * 3)); // escala energia
    var c = analysis.centroid;
    var f = Math.min(1, analysis.flux * 5);
    var flat = analysis.flatness;

    /* Brightness: energia + fluxo (ataques brilham mais) */
    var brightness = Math.min(1, e * 0.7 + f * 0.3);

    /* Saturation: inversa da planicidade (tons puros = mais saturado) */
    var saturation = Math.min(1, 0.3 + (1 - flat) * 0.7);

    /* Hue: centroid espectral (grave=azul 220°, médio=verde 120°, agudo=vermelho 0°/360°) */
    var hue = (220 - c * 220) % 360; // 220 (azul) → 0 (vermelho)

    /* Speed: energia + fluxo (mais energia = movimento mais rápido) */
    var speed = 0.3 + e * 0.7 + f * 0.5;

    /* Turbulence: planicidade (ruído = mais turbulento) */
    var turbulence = 0.1 + flat * 0.8 + f * 0.3;

    return { brightness, saturation, hue, speed, turbulence, energy: e, centroid: c, flux: f };
  }

  /* ===== Mola adaptativa (física de segunda ordem) ===== */
  function adaptiveSpring(current, target, velocity, dt, energy) {
    var attack = SPECTRUM.SMOOTH_ATTACK;
    var release = SPECTRUM.SMOOTH_RELEASE;
    var stiffness = 80 + energy * 120;        // mais energia = mola mais rígida
    var damping = energy > 0.5 ? 0.85 : 0.95; // mais energia = menos amortecimento

    var force = stiffness * (target - current);
    var accel = force - damping * velocity;
    velocity += accel * dt;
    current += velocity * dt;
    return { pos: current, vel: velocity };
  }

  /* ===== Cor HSL → CSS ===== */
  function hslToCss(h, s, l, a) {
    return 'hsla(' + Math.round(h) + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%, ' + a.toFixed(2) + ')';
  }

  /* ===== Gradiente de energia para barras ===== */
  function barColor(i, n, params, phase) {
    var pos = i / (n - 1);
    var h = (params.hue + pos * 30) % 360;
    var s = params.saturation * (0.7 + 0.3 * Math.sin(i * 0.5 + (params.phase || 0)));
    var l = 35 + params.brightness * 45 + 15 * Math.sin(i * 0.3 + (params.phase || 0) * 2);
    var a = 0.6 + params.brightness * 0.4;
    return hslToCss(h, s, l, a);
  }

  /* ================================================================
   *  buildEqWave — Construtor da visualização multi-camadas
   *  ================================================================ */
  function buildEqWave() {
    var track = document.getElementById("eqWaveTrack");
    if (!track) return;
    _trackEl = track;

    /* Limpa e reconstrói */
    track.innerHTML = '';
    _waveBars = [];
    _waveSmooth = new Array(_waveN).fill(0);
    _waveSmoothPrev = new Array(_waveN).fill(0);
    _waveVelocity = new Array(_waveN).fill(0);

    /* Camada 1: Barras espectrais (base) */
    var barsContainer = document.createElement('div');
    barsContainer.className = 'eq-bars-layer';
    barsContainer.style.cssText = 'position:absolute; inset:0; display:flex; align-items:flex-end; justify-content:space-between; gap:1px; padding:4px 4px 0; pointer-events:none;';
    for (var i = 0; i < _waveN; i++) {
      var bar = document.createElement("div");
      bar.className = "eq-wave-bar";
      bar.dataset.idx = i;
      bar.style.height = "4%";
      bar.style.flex = '1 1 0';
      bar.style.minWidth = '1px';
      bar.style.maxWidth = '100%';
      bar.style.transition = 'height 0.02s linear, background-color 0.04s ease, box-shadow 0.04s ease';
      bar.style.borderRadius = '1px 1px 0 0';
      bar.style.boxShadow = 'inset 0 -1px 0 rgba(0,0,0,0.2)';
      barsContainer.appendChild(bar);
    }
    var barsContainer = document.createElement('div');
    barsContainer.className = 'eq-bars-layer';
    barsContainer.style.cssText = 'position:absolute; inset:0; display:flex; align-items:flex-end; justify-content:space-between; gap:1px; padding:4px 4px 0; pointer-events:none;';
    for (var i = 0; i < _waveN; i++) {
      var bar = document.createElement("div");
      bar.className = "eq-wave-bar";
      bar.dataset.idx = i;
      bar.style.height = "4%";
      bar.style.flex = '1 1 0';
      bar.style.minWidth = '1px';
      bar.style.maxWidth = '100%';
      bar.style.transition = 'height 0.02s linear, background-color 0.04s ease, box-shadow 0.04s ease';
      bar.style.borderRadius = '1px 1px 0 0';
      bar.style.boxShadow = 'inset 0 -1px 0 rgba(0,0,0,0.2)';
      barsContainer.appendChild(bar);
    }
    track.appendChild(barsContainer);

    /* Camada 2: Linhas harmônicas (SVG) */
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "eqHarmonicLines";
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; overflow:visible;';

    var lineConfigs = [
      { id: 'fundamental', stroke: 'hsl(220, 80%, 55%)', width: 3, opacity: 0.9, z: 10 },
      { id: 'harmonic2', stroke: 'hsl(180, 70%, 50%)', width: 2, opacity: 0.6, z: 8 },
      { id: 'harmonic3', stroke: 'hsl(120, 70%, 50%)', width: 1.5, opacity: 0.5, z: 7 },
      { id: 'envelope', stroke: 'hsl(45, 90%, 60%)', width: 2.5, opacity: 0.7, z: 9, dash: '8 4' },
      { id: 'noise', stroke: 'hsl(320, 60%, 55%)', width: 1, opacity: 0.35, z: 5 },
      { id: 'phase', stroke: 'hsl(30, 80%, 60%)', width: 1.5, opacity: 0.5, z: 6, dash: '4 6' }
    ];

    var lineElements = {};
    lineConfigs.forEach(function (cfg) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("class", "eq-spectral-line eq-line-" + cfg.id);
      p.setAttribute("vector-effect", "non-scaling-stroke");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      p.style.stroke = cfg.stroke;
      p.style.strokeWidth = cfg.width + "px";
      p.style.opacity = cfg.opacity;
      if (cfg.dash) p.setAttribute("stroke-dasharray", cfg.dash);
      svg.appendChild(p);
      lineElements[cfg.id] = p;
    });

    svg.style.position = 'absolute';
    svg.style.inset = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.overflow = 'visible';
    track.appendChild(svg);

    /* Camada 3: Partículas de energia (canvas) */
    var canvas = document.createElement('canvas');
    canvas.id = 'eqParticles';
    canvas.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none;';
    track.appendChild(canvas);

    /* Camada 4: Brilho espectral (radial gradient overlay) */
    var glow = document.createElement('div');
    glow.id = 'eqSpectralGlow';
    glow.style.cssText = 'position:absolute; inset:0; pointer-events:none; opacity:0; border-radius:inherit; background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%);';
    track.appendChild(glow);

    /* Barras DOM atualizadas (re-selecionadas após rebuild) */
    _waveBars = Array.from(track.querySelectorAll('.eq-wave-bar'));

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

  /* ================================================================
   *  _waveHeights — Interpolação bark → barras visuais
   *  ================================================================ */
  function _waveHeights() {
    var music = typeof window._eqGetLevels === "function" ? window._eqGetLevels() : null;
    var site = typeof window._eqGetSiteLevels === "function" ? window._eqGetSiteLevels() : null;
    var bands = null;
    if (music || site) {
      var len = SPECTRUM.N_BARK_BANDS;
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

  /* ================================================================
   *  Cor HSL → CSS
   *  ================================================================ */
  function hslToCss(h, s, l, a) {
    return 'hsla(' + Math.round(h) + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%, ' + a.toFixed(2) + ')';
  }

  /* ================================================================
   *  Gradiente de energia para barras
   *  ================================================================ */
  function barColor(i, n, params, phase) {
    var pos = i / (n - 1);
    var h = (params.hue + pos * 30) % 360;
    var s = params.saturation * (0.7 + 0.3 * Math.sin(i * 0.5 + (params.phase || 0)));
    var l = 35 + params.brightness * 45 + 15 * Math.sin(i * 0.3 + (params.phase || 0) * 2);
    var a = 0.6 + params.brightness * 0.4;
    return hslToCss(h, s, l, a);
  }

  /* ================================================================
   *  updateEqWave — Loop principal de animação matemática
   *  ================================================================ */
  function updateEqWave(peak) {
    var now = performance.now();
    var dt = Math.min(0.05, (now - _waveLastFrame) / 1000); // dt em segundos, clamp 50ms
    _waveLastFrame = now;

    /* Debug counter */
    if (!window._eqDebug) window._eqDebug = { updates: 0, lastHeights: null, lastParams: null };
    window._eqDebug.updates++;

    var heights = _waveHeights();
    var live = document.getElementById("eqWaveLive");

    /* Análise espectral completa */
    var analysis = analyzeSpectrum(heights);
    var params = energyToVisualParams(analysis);

    /* Estado live/idle */
    var combinedPeak = peak;
    for (var k = 0; k < heights.length; k++) if (heights[k] > combinedPeak) combinedPeak = heights[k];
    var rawLive = combinedPeak >= 0.015;
    if (rawLive) _waveLastLive = Date.now();
    var liveOn = rawLive || (Date.now() - _waveLastLive < 3000);

    /* Atualiza energia global suavizada */
    _energyPrev = _energyGlobal;
    _energyGlobal += (params.energy - _energyGlobal) * SPECTRUM.ENERGY_SMOOTH;

    /* Fluxo espectral → velocidade de fase */
    _phaseVelocity = params.flux * 0.5 + params.energy * 0.3;
    _phaseAccum += _phaseVelocity * SPECTRUM.PHASE_SPEED_BASE * 60 * dt; // 60 = fps normalizado

    /* --- Atualização das barras (mola adaptativa) --- */
    var barsContainer = document.querySelector('.eq-bars-layer');
    var svg = document.getElementById('eqHarmonicLines');
    var canvas = document.getElementById('eqParticles');
    var glow = document.getElementById('eqSpectralGlow');
    var harmonicLines = svg ? svg.querySelectorAll('.eq-spectral-line') : null;

    if (!_waveSmooth.length) {
      for (var i = 0; i < _waveN; i++) {
        _waveSmooth[i] = 0;
        _waveSmoothPrev[i] = 0;
        _waveVelocity[i] = 0;
      }
    }

    /* Acumula fase global para ondas viajantes */
    _waveT += dt * 60 * params.speed;

    for (var i = 0; i < _waveN; i++) {
      var h = heights[i] || 0;

      /* Target height com curva psicoacústica (pow 0.8 = percepção loudness) */
      var target;
      if (liveOn) {
        target = 0.05 + Math.pow(h, 0.8) * 0.9;
      } else {
        /* Idle: ripple suave baseado em Perlin + harmônicos sutis */
        var idleBase = 0.04 + 0.03 * fractalPerlin(i * 0.15 + _waveT * 0.02, 3, 0.5);
        var idleHarm = 0.015 * Math.sin(_waveT * 1.7 + i * 0.4) * Math.sin(_waveT * 2.3 + i * 0.7);
        target = idleBase + idleHarm;
      }

      /* Mola adaptativa (física de 2ª ordem) */
      var spring = adaptiveSpring(_waveSmooth[i], target, _waveVelocity[i], dt, params.energy);
      _waveSmooth[i] = spring.pos;
      _waveVelocity[i] = spring.vel;

      /* Clamp e aplicação */
      var hPct = Math.max(3, Math.min(100, _waveSmooth[i] * 100));
      var bar = _waveBars[i];
      if (bar) {
        bar.style.height = hPct.toFixed(1) + "%";

        /* Cor dinâmica baseada em energia local + fase */
        var localEnergy = Math.min(1, h * 2);
        var colorParams = {
          brightness: params.brightness * (0.5 + localEnergy * 0.5),
          saturation: params.saturation,
          hue: (params.hue + i * 2) % 360,
          saturation: params.saturation * (0.6 + 0.4 * Math.sin(i * 0.3 + _waveT * 0.5)),
          phase: _phaseAccum
        };
        bar.style.backgroundColor = barColor(i, _waveN, colorParams, _phaseAccum);
        bar.style.boxShadow = '0 0 ' + Math.round(params.brightness * 8 + localEnergy * 12) + 'px ' + hslToCss(colorParams.hue, colorParams.saturation, 60, 0.4);
      }
    }

    /* Atualiza energia global no Live indicator */
    if (live) {
      if (liveOn) live.classList.add("active");
      else live.classList.remove("active");
    }

    /* --- Linhas harmônicas SVG --- */
    if (svg) {
      var lines = {
        fundamental: svg.querySelector('.eq-line-fundamental'),
        harmonic2: svg.querySelector('.eq-line-harmonic2'),
        harmonic3: svg.querySelector('.eq-line-harmonic3'),
        envelope: svg.querySelector('.eq-line-envelope'),
        noise: svg.querySelector('.eq-line-noise'),
        phase: svg.querySelector('.eq-line-phase')
      };

      /* Gera pontos para cada linha */
      var generateLine = function (type, amp, freqMul, phaseOffset, step, heightScale) {
        var pts = [];
        for (var i = 0; i < _waveN; i += step) {
          var x = (i / (_waveN - 1)) * 100;
          var baseH = _waveSmooth[i] || 0;
          var harmonic = 0;

          if (type === 'fundamental') {
            harmonic = Math.sin(_waveT * 0.8 + i * 0.15 + _phaseAccum) * 3 * params.brightness;
          } else if (type === 'harmonic2') {
            harmonic = Math.sin(_waveT * 1.6 + i * 0.3 + _phaseAccum * 2) * 2 * params.brightness * params.flux;
          } else if (type === 'harmonic3') {
            harmonic = Math.sin(_waveT * 2.4 + i * 0.45 + _phaseAccum * 3) * 1.5 * params.brightness * params.turbulence;
          } else if (type === 'envelope') {
            harmonic = Math.abs(Math.sin(_waveT * 0.4 + i * 0.08 + _phaseAccum * 0.5)) * 4 * params.energy;
          } else if (type === 'noise') {
            harmonic = fractalPerlin(i * 0.3 + _waveT * 1.2, 3, 0.5) * 2.5 * params.turbulence;
          } else if (type === 'phase') {
            harmonic = Math.sin(_waveT * 2.0 + i * 0.25 + _phaseAccum * 1.5) * 2.5 * params.brightness;
          }

          var y = 100 - (baseH * heightScale + harmonic * amp + fractalPerlin(i * 0.2 + _waveT * 0.15, 2, 0.5) * 1.5);
          pts.push({ x: x, y: Math.max(5, Math.min(95, y)) });
        }
        if ((_waveN - 1) % step !== 0) {
          var i = _waveN - 1;
          var x = 100;
          var baseH = _waveSmooth[i] || 0;
          var y = 100 - baseH * heightScale;
          pts.push({ x: x, y: Math.max(5, Math.min(95, y)) });
        }
        return catmullRom(pts, 0.5);
      };

      if (lines.fundamental) lines.fundamental.setAttribute('d', generateLine('fundamental', 1, 1, 0, 2, 1.0));
      if (lines.harmonic2) lines.harmonic2.setAttribute('d', generateLine('harmonic2', 0.7, 2, 0, 3, 0.9));
      if (lines.harmonic3) lines.harmonic3.setAttribute('d', generateLine('harmonic3', 0.5, 3, 0, 4, 0.8));
      if (lines.envelope) lines.envelope.setAttribute('d', generateLine('envelope', 1.2, 0.5, 0, 2, 1.1));
      if (lines.noise) lines.noise.setAttribute('d', generateLine('noise', 0.6, 1.5, 0, 1, 0.7));
      if (lines.phase) lines.phase.setAttribute('d', generateLine('phase', 0.8, 2, 0, 3, 0.9));
    }

    /* --- Canvas: Partículas de energia --- */
    if (canvas) {
      var ctx = canvas.getContext('2d');
      var rect = _trackEl.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (params.energy > 0.15) {
        var particleCount = Math.round(8 + params.energy * 25 + params.flux * 15);
        for (var p = 0; p < particleCount; p++) {
          var px = Math.random() * canvas.width;
          var py = canvas.height - (Math.random() * canvas.height * 0.7 + canvas.height * 0.15);
          var size = 1 + Math.random() * 3 * params.brightness;
          var alpha = 0.15 + Math.random() * 0.35 * params.brightness;
          var hue = (params.hue + Math.random() * 60 - 30) % 360;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = hslToCss(hue, 0.7, 60, alpha);
          ctx.fill();
        }
      }
    }

    /* --- Glow espectral --- */
    if (glow && params.energy > 0.3) {
      glow.style.opacity = Math.min(1, (params.energy - 0.3) * 1.5);
      var glowHue = (params.hue + 30) % 360;
      glow.style.background = 'radial-gradient(ellipse at center, ' +
        hslToCss(glowHue, params.saturation, 60, 0) + ' 0%, ' +
        hslToCss(glowHue, params.saturation * 0.8, 40, params.energy * 0.15) + ' 40%, ' +
        'transparent 70%)';
    }

    /* Atualiza espectro anterior para fluxo no próximo frame */
    _lastSpectrum = heights.slice();

    /* Debug: expõe contadores globalmente */
    if (window._eqDebug) {
      window._eqDebug.lastHeights = heights.slice(0, 5);
      window._eqDebug.lastParams = params ? { energy: params.energy, brightness: params.brightness, saturation: params.saturation, hue: params.hue, speed: params.speed, turbulence: params.turbulence } : null;
    }
  }

  /* ================================================================
   *  startEqAnimation — Inicia loop de animação
   *  ================================================================ */
  function startEqAnimation() {
    console.log('[EQ] startEqAnimation called');
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

    _waveLastFrame = performance.now();
    _waveT = 0;

    (function loop() {
      requestAnimationFrame(loop);
      if (_eqDragging) return;
      if (!win || win.offsetParent === null) return;

      var levels = typeof window._eqGetLevels === "function" ? window._eqGetLevels() : null;
      var peak = 0;
      if (levels) {
        for (var i = 0; i < levels.length; i++) if (levels[i] > peak) peak = levels[i];
      }

      /* Atualiza sliders do EQ */
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
