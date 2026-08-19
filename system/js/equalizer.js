(function () {
  "use strict";

  var ctx = null;
  var source = null;
  var filters = [];
  var analyser = null;
  var bypassed = false;

  var BANDS = [
    { freq: 32,   label: "32" },
    { freq: 64,   label: "64" },
    { freq: 125,  label: "125" },
    { freq: 250,  label: "250" },
    { freq: 500,  label: "500" },
    { freq: 1000, label: "1K" },
    { freq: 2000, label: "2K" },
    { freq: 4000, label: "4K" },
    { freq: 8000, label: "8K" },
    { freq: 16000,label: "16K" },
  ];

  var gains = [];
  for (var i = 0; i < BANDS.length; i++) gains[i] = 0;

  var PRESETS = {
    flat:     { label: "Flat", gains: [0,0,0,0,0,0,0,0,0,0] },
    rock:     { label: "Rock", gains: [4,3,2,1,0,0,1,2,3,4] },
    pop:      { label: "Pop",  gains: [3,2,1,0,-1,0,1,2,2,2] },
    jazz:     { label: "Jazz", gains: [3,2,1,1,0,0,1,2,3,3] },
    classical:{ label: "Classical", gains: [4,3,2,1,0,-1,0,1,2,3] },
    vocal:    { label: "Vocal", gains: [-2,-1,0,1,3,3,1,0,-1,-2] },
    bassboost:{ label: "Bass Boost", gains: [6,5,4,2,0,-1,-2,-2,-1,0] },
  };

  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function buildFilters() {
    var c = ensureCtx();
    for (var i = 0; i < filters.length; i++) {
      try { filters[i].disconnect(); } catch(e) {}
    }
    if (analyser) {
      try { analyser.disconnect(); } catch(e) {}
    }
    filters = [];
    analyser = c.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.78;
    for (var i = 0; i < BANDS.length; i++) {
      var f = c.createBiquadFilter();
      f.type = "peaking";
      f.frequency.value = BANDS[i].freq;
      f.Q.value = 1.4;
      f.gain.value = gains[i];
      filters.push(f);
    }
  }

  function reconnect() {
    if (!source || !ctx) return;
    try {
      source.disconnect();
    } catch(e) {}
    var chain = [source];
    if (analyser) chain.push(analyser);
    if (!bypassed) {
      for (var i = 0; i < filters.length; i++) {
        chain.push(filters[i]);
      }
    }
    chain.push(ctx.destination);
    for (var i = 0; i < chain.length - 1; i++) {
      chain[i].connect(chain[i+1]);
    }
  }

  /* ===== Public API ===== */

  window._eqConnect = function (audioEl) {
    if (!audioEl) return;
    try {
      var c = ensureCtx();
      if (source) {
        try { source.disconnect(); } catch(e) {}
        source = null;
      }
      source = c.createMediaElementSource(audioEl);
      buildFilters();
      reconnect();
    } catch (e) {
      console.warn("EQ: could not connect audio element:", e);
    }
  };

  window._eqSetBand = function (idx, val) {
    if (idx < 0 || idx >= gains.length) return;
    gains[idx] = Math.max(-12, Math.min(12, val));
    if (filters[idx]) filters[idx].gain.value = gains[idx];
  };

  window._eqGetBand = function (idx) {
    if (idx < 0 || idx >= gains.length) return 0;
    return gains[idx];
  };

  window._eqGetBands = function () {
    return gains.slice();
  };

  /* Live per-band levels (0..1), grouped like a real spectrum */
  window._eqGetLevels = function () {
    if (!analyser || !ctx) return null;
    var data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    var n = data.length;
    var out = [];
    var bands = BANDS.length;
    for (var i = 0; i < bands; i++) {
      var a = Math.floor(Math.pow(i / bands, 2) * n);
      var b = Math.floor(Math.pow((i + 1) / bands, 2) * n);
      if (b <= a) b = Math.min(a + 1, n);
      if (a >= n) { out.push(0); continue; }
      var sum = 0;
      for (var j = a; j < b; j++) sum += data[j];
      out.push(sum / (b - a) / 255);
    }
    return out;
  };

  window._eqSetPreset = function (name) {
    var p = PRESETS[name];
    if (!p) return;
    for (var i = 0; i < p.gains.length; i++) {
      window._eqSetBand(i, p.gains[i]);
    }
    if (typeof window._eqUIUpdate === "function") window._eqUIUpdate();
  };

  window._eqGetPresets = function () {
    var list = [];
    for (var k in PRESETS) {
      list.push({ id: k, label: PRESETS[k].label });
    }
    return list;
  };

  window._eqReset = function () {
    window._eqSetPreset("flat");
  };

  window._eqBypass = function (on) {
    bypassed = !!on;
    reconnect();
  };

  window._eqIsBypassed = function () {
    return bypassed;
  };

  window._eqDisconnect = function () {
    if (source) {
      try { source.disconnect(); } catch(e) {}
      source = null;
    }
    if (analyser) {
      try { analyser.disconnect(); } catch(e) {}
      analyser = null;
    }
    filters = [];
  };
})();
