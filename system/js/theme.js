(function () {
  "use strict";

  var _key = "win2k_theme";

  function hex2rgb(h) {
    var r = parseInt(h.slice(1, 3), 16),
        g = parseInt(h.slice(3, 5), 16),
        b = parseInt(h.slice(5, 7), 16);
    return [r, g, b];
  }

  function rgb2hex(r, g, b) {
    return "#" + [r, g, b].map(function (c) {
      return Math.max(0, Math.min(255, Math.round(c)))
        .toString(16).padStart(2, "0");
    }).join("");
  }

  function mix(col1, col2, t) {
    var a = hex2rgb(col1), b = hex2rgb(col2);
    return rgb2hex(
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    );
  }

  /* Fixed base palette — classic Win99 silver/3D */
  var _base = {
    windowBg:  "#c0c0c0",
    panelBg:   "#c0c0c0",
    surface:   "#ffffff",
    taskbarBg: "#c0c0c0",
    borderDark:  "#808080",
    borderLight: "#ffffff",
    text:         "#000000",
    textSecondary: "#444444",
    textOnHighlight: "#ffffff",
    titleText: "#ffffff",
    titleBarInactive: "#808080",
    btnBg:        "#c0c0c0",
    btnBgActive:  "#c0c0c0",
    btnBd:        "#fff #808080 #808080 #fff",
    btnBdActive:  "#808080 #fff #fff #808080",
  };

  function generatePalette(hex) {
    var w = "#ffffff", k = "#000000";
    var isDefault = hex === "#000080";

    /* Surface colors: use base, but subtle-tint toward accent for non-default */
    var tint = isDefault ? 0 : 0.06;
    var windowBg  = isDefault ? _base.windowBg  : mix(_base.windowBg,  hex, tint);
    var panelBg   = isDefault ? _base.panelBg   : mix(_base.panelBg,   hex, tint);
    var surface   = isDefault ? _base.surface   : mix(_base.surface,   hex, tint);
    var taskbarBg = isDefault ? _base.taskbarBg : mix(_base.taskbarBg, hex, tint);

    /* Button face: flat silver, subtle tint for non-default */
    var btnFace = _base.btnBg;
    if (!isDefault) btnFace = mix(_base.btnBg, hex, 0.10);

    /* Accent colors */
    var titleBar = isDefault ? "#000080" : hex;
    var highlight = isDefault ? "#000080" : hex;
    var highlightHover = isDefault ? "#0000a0" : mix(hex, w, 0.15);
    var highlightBg = isDefault ? "#e0e0f0" : mix(hex, w, 0.75);

    /* Start menu header */
    var startHdr;
    if (isDefault) {
      startHdr = "linear-gradient(90deg, #000080 0%, #1084d0 100%)";
    } else {
      startHdr = "linear-gradient(90deg, " + hex + " 0%, " + mix(hex, w, 0.30) + " 100%)";
    }

    return {
      theme: hex,
      titleBar: titleBar,
      titleText: "#ffffff",
      titleBarInactive: _base.titleBarInactive,
      titleTextInactive: "#d8d8d8",
      highlight: highlight,
      highlightHover: highlightHover,
      highlightBg: highlightBg,
      windowBg: windowBg,
      panelBg: panelBg,
      surface: surface,
      taskbarBg: taskbarBg,
      borderDark: isDefault ? "#808080" : mix("#808080", hex, 0.12),
      borderLight: "#ffffff",
      text: "#000000",
      textSecondary: "#444444",
      textOnHighlight: "#ffffff",
      startMenuHeader: startHdr,
      btnBg: btnFace,
      btnBgActive: btnFace,
      btnBd: "#fff " + (isDefault ? "#808080" : mix("#808080", hex, 0.12)) + " " + (isDefault ? "#808080" : mix("#808080", hex, 0.12)) + " #fff",
      btnBdActive: (isDefault ? "#808080" : mix("#808080", hex, 0.12)) + " #fff #fff " + (isDefault ? "#808080" : mix("#808080", hex, 0.12)),
    };
  }

  function applyTheme(p) {
    var s = document.documentElement.style;
    s.setProperty("--clr-theme", p.theme);
    s.setProperty("--clr-highlight", p.highlight);
    s.setProperty("--clr-highlight-bg", p.highlightBg);
    s.setProperty("--clr-highlight-hover", p.highlightHover);
    s.setProperty("--clr-title-bar", p.titleBar);
    s.setProperty("--clr-title-text", p.titleText);
    s.setProperty("--clr-title-bar-inactive", p.titleBarInactive);
    s.setProperty("--clr-title-text-inactive", p.titleTextInactive);
    s.setProperty("--clr-window-bg", p.windowBg);
    s.setProperty("--clr-panel-bg", p.panelBg);
    s.setProperty("--clr-surface", p.surface);
    s.setProperty("--clr-taskbar-bg", p.taskbarBg);
    s.setProperty("--clr-border-dark", p.borderDark);
    s.setProperty("--clr-border-light", p.borderLight);
    s.setProperty("--clr-text", p.text);
    s.setProperty("--clr-text-secondary", p.textSecondary);
    s.setProperty("--clr-text-on-highlight", p.textOnHighlight);
    s.setProperty("--clr-start-menu-header", p.startMenuHeader);
    s.setProperty("--btn-bg", p.btnBg);
    s.setProperty("--btn-bg-active", p.btnBgActive);
    s.setProperty("--btn-bd", p.btnBd);
    s.setProperty("--btn-bd-active", p.btnBdActive);
  }

  function saveTheme(p) {
    try { localStorage.setItem(_key, JSON.stringify(p)); } catch (e) {}
  }

  function loadTheme() {
    try {
      var raw = localStorage.getItem(_key);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.theme) return p;
      }
    } catch (e) {}
    return null;
  }

  window.setTheme = function (hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    var p = generatePalette(hex);
    applyTheme(p);
    saveTheme(p);
    if (typeof window._themeUIUpdate === "function") window._themeUIUpdate(hex);
  };

  window.resetTheme = function () {
    var p = generatePalette("#000080");
    applyTheme(p);
    saveTheme(p);
    if (typeof window._themeUIUpdate === "function") window._themeUIUpdate("#000080");
  };

  window.getThemeColor = function () {
    var p = loadTheme();
    return p ? p.theme : "#000080";
  };

  /* Restore saved theme on load */
  var saved = loadTheme();
  applyTheme(saved ? generatePalette(saved.theme) : generatePalette("#000080"));
})();
