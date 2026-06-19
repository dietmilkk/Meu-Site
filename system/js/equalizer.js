(function () {
  "use strict";

  var ctx = null;
  var source = null;
  var filters = [];
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
    filters = [];
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
    if (bypassed) {
      source.connect(ctx.destination);
    } else {
      var chain = [source];
      for (var i = 0; i < filters.length; i++) {
        chain.push(filters[i]);
      }
      chain.push(ctx.destination);
      for (var i = 0; i < chain.length - 1; i++) {
        chain[i].connect(chain[i+1]);
      }
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
    filters = [];
  };
})();
