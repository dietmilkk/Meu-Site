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

  /* Fixed base palette — classic Win2K warm beige/gray */
  var _base = {
    windowBg:  "#ece9e0",
    panelBg:   "#d4d0c8",
    surface:   "#faf8f4",
    taskbarBg: "#d4d0c8",
    borderDark:  "#5a5a5a",
    borderLight: "#ffffff",
    text:         "#000000",
    textSecondary: "#444444",
    textOnHighlight: "#ffffff",
    titleText: "#ffffff",
    btnBg:        "linear-gradient(180deg, #e0dcd4, #d4d0c8 40%, #c8c4bc)",
    btnBgActive:  "linear-gradient(180deg, #c8c4bc, #d4d0c8)",
    btnBd:        "#fff #5a5a5a #5a5a5a #fff",
    btnBdActive:  "#5a5a5a #fff #fff #5a5a5a",
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

    /* Button gradients: use base, subtle tint for non-default */
    var btnGrad1 = "#e0dcd4", btnGrad2 = "#d4d0c8", btnGrad3 = "#c8c4bc";
    if (!isDefault) {
      btnGrad1 = mix("#e0dcd4", hex, 0.10);
      btnGrad2 = mix("#d4d0c8", hex, 0.10);
      btnGrad3 = mix("#c8c4bc", hex, 0.10);
    }

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
      highlight: highlight,
      highlightHover: highlightHover,
      highlightBg: highlightBg,
      windowBg: windowBg,
      panelBg: panelBg,
      surface: surface,
      taskbarBg: taskbarBg,
      borderDark: isDefault ? "#5a5a5a" : mix("#5a5a5a", hex, 0.12),
      borderLight: "#ffffff",
      text: "#000000",
      textSecondary: "#444444",
      textOnHighlight: "#ffffff",
      startMenuHeader: startHdr,
      btnBg: "linear-gradient(180deg, " + btnGrad1 + ", " + btnGrad2 + " 40%, " + btnGrad3 + ")",
      btnBgActive: "linear-gradient(180deg, " + btnGrad3 + ", " + btnGrad2 + ")",
      btnBd: "#fff " + (isDefault ? "#5a5a5a" : mix("#5a5a5a", hex, 0.12)) + " " + (isDefault ? "#5a5a5a" : mix("#5a5a5a", hex, 0.12)) + " #fff",
      btnBdActive: (isDefault ? "#5a5a5a" : mix("#5a5a5a", hex, 0.12)) + " #fff #fff " + (isDefault ? "#5a5a5a" : mix("#5a5a5a", hex, 0.12)),
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
