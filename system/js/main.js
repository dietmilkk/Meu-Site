(function () {
  "use strict";

  /* ================================================================
       WINDOW SETUP
       ================================================================ */

  var win = document.getElementById("mainWindow");
  var handle = document.getElementById("dragHandle");

  (function center() {
    var w = Math.min(820, Math.max(520, window.innerWidth * 0.55));
    var h = Math.min(window.innerHeight * 0.82, window.innerHeight - 60);
    var leftPos = Math.round((window.innerWidth - w) / 2);
    win.style.left = leftPos + "px";
    win.style.top = "16px";
    win.style.width = w + "px";
    win.style.height = h + "px";
  })();

  var winBehavior = new WindowBehavior(win, {
    dragHandle: handle,
    btnClose: document.getElementById("btnClose"),
    btnMinimize: document.getElementById("btnMinimize"),
    btnMaximize: document.getElementById("btnMaximize"),
    minW: 500,
    minH: 500,
    startVisible: false,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/apps/dolphin.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __('links.title'),
    taskbarAction: 'links',
    appId: 'links',
    onInit: function (controls) {
      // Ensure initial position
      controls.setMinimized(false);
    },
  });

  /* ================================================================
       FULLSCREEN TOGGLE
       ================================================================ */

  var _isFullscreen = false;
  var _fsItem = document.querySelector(
    '.start-menu-item[data-action="fullscreen"]',
  );
  var _fsIcon = _fsItem ? _fsItem.querySelector("img") : null;
  var _fsLabel = _fsItem ? _fsItem.querySelector("span") : null;
  var _fsEnterIcon =
    "system/assets/icons/tango2kde/16x16/actions/view-fullscreen.png";
  var _fsExitIcon =
    "system/assets/icons/tango2kde/16x16/actions/window_nofullscreen.png";

  onLanguageChange(function(lang) {
    if (_fsLabel) {
      _fsLabel.textContent = _isFullscreen ? __('fullscreen.exit') : __('fullscreen.enter');
      _fsLabel.setAttribute('data-i18n', _isFullscreen ? 'fullscreen.exit' : 'fullscreen.enter');
    }
  });

  function _updateFS() {
    if (_fsIcon) _fsIcon.src = _isFullscreen ? _fsExitIcon : _fsEnterIcon;
    if (_fsLabel)
      _fsLabel.textContent = _isFullscreen ? __('fullscreen.exit') : __('fullscreen.enter');
  }

  window.toggleFullscreen = function () {
    if (!document.fullscreenElement) {
      if (typeof playMaximizeSnd === 'function') playMaximizeSnd();
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      if (typeof playRestoreSnd === 'function') playRestoreSnd();
      document.exitFullscreen().catch(function () {});
    }
  };

  function _closeTopWindow() {
    var wins = document.querySelectorAll('.window');
    var top = null;
    var topZ = -1;
    for (var i = 0; i < wins.length; i++) {
      if (wins[i].style.display === 'none') continue;
      var z = parseInt(wins[i].style.zIndex, 10);
      if (z > topZ) { topZ = z; top = wins[i]; }
    }
    if (!top) return;
    var btn = top.querySelector('[data-wbtn="close"]');
    if (btn) { btn.click(); return; }
    top.style.display = 'none';
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "F11") {
      e.preventDefault();
      window.toggleFullscreen();
    }
    if (e.altKey && e.key === "1") {
      e.preventDefault();
      _closeTopWindow();
    }
    if (e.key === "Meta") {
      e.preventDefault();
      startBtn.click();
    }
    if (!e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace" || e.key === "Tab" || e.key === "Escape" || e.key === "Delete") {
        if (typeof playClickSnd === "function") playClickSnd();
      }
    }
  });

  document.addEventListener("fullscreenchange", function () {
    _isFullscreen = !!document.fullscreenElement;
    document.body.classList.toggle("is-fullscreen", _isFullscreen);
    _updateFS();
  });

  /* ================================================================
       SHOW DESKTOP
       ================================================================ */

  // Register main window for show-desktop
  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("links", {
      label: __('links.title'),
      show: function () {
        winBehavior.show();
      },
      minimize: function () {
        winBehavior.minimize();
      },
      hasEntry: function () {
        return winBehavior.hasTaskbarEntry();
      },
    });
  }
  // Legacy registry (for showDesktop fallback path)
  if (window.windowRegistry) {
    window.windowRegistry.push({
      minimize: function () {
        winBehavior.minimize();
      },
      show: function () {
        winBehavior.show();
      },
      hasEntry: function () {
        return winBehavior.hasTaskbarEntry();
      },
    });
  }

  var _showDesktop = false;
  var _sdState = [];

  function toggleShowDesktop() {
    _showDesktop = !_showDesktop;
    var ql = document.getElementById("qlShowDesktop");
    if (_showDesktop) {
      _sdState = [];
      var appList = [];
      (W2K && W2K.AppRegistry
        ? W2K.AppRegistry.forEach
        : function (fn) {
            (window.windowRegistry || []).forEach(function (w, i) {
              fn({ hasEntry: w.hasEntry }, "reg" + i);
            });
          })(function (app, id) {
        var z = 0;
        if (id.indexOf("reg") === 0) {
          var idx = parseInt(id.replace("reg", ""));
          var wins = document.querySelectorAll('.window');
          if (wins[idx]) z = parseInt(wins[idx].style.zIndex) || 0;
        } else {
          var winEl = document.querySelector('.window[data-app-id="' + id + '"]');
          if (winEl) z = parseInt(winEl.style.zIndex) || 0;
        }
        _sdState.push({
          id: id,
          zIndex: z,
          wasOpen: app.hasEntry ? app.hasEntry() : false,
        });
        if (app.minimize) appList.push(app);
      });
      appList.forEach(function (app, i) {
        setTimeout(function () { app.minimize(); }, i * 50);
      });
      if (ql) ql.classList.add("active");
    } else {
      var toShow = _sdState.filter(function (s) { return s.wasOpen; });
      toShow.sort(function (a, b) { return a.zIndex - b.zIndex; });
      toShow.forEach(function (s, i) {
        setTimeout(function () {
          if (W2K && W2K.AppRegistry) {
            var app = W2K.AppRegistry.get(s.id);
            if (app) app.show();
          } else {
            var reg = window.windowRegistry || [];
            var idx = parseInt(s.id.replace("reg", ""));
            if (reg[idx]) reg[idx].show();
          }
        }, i * 60);
      });
      _sdState = [];
      if (ql) ql.classList.remove("active");
    }
  }

  document
    .getElementById("qlShowDesktop")
    .addEventListener("click", function (e) {
      if (typeof playMinimizeSnd === 'function') playMinimizeSnd();
      var img = this.querySelector("img");
      if (img) {
        img.classList.remove("anim-desktop-click");
        void img.offsetWidth;
        img.classList.add("anim-desktop-click");
      }
      toggleShowDesktop();
    });

  document.addEventListener("w2k-exit-showdesktop", function () {
    if (_showDesktop) {
      _showDesktop = false;
      _sdState = [];
      var ql = document.getElementById("qlShowDesktop");
      if (ql) ql.classList.remove("active");
    }
  });

  /* ================================================================
       DESKTOP ICONS
       ================================================================ */

  var deskIcons = document.querySelectorAll(".desk-icon");
  var selectedIcon = null;

  function deselectAllIcons() {
    for (var i = 0; i < deskIcons.length; i++) {
      deskIcons[i].classList.remove("selected");
    }
    selectedIcon = null;
  }

  function openDesktopIcon(action) {
    trackUse(action);
    switch (action) {
      case "wakatime":
        window.open(
          "https://wakatime.com/@530e7be4-0c7e-40cf-9389-1017373810c3",
          "_blank",
        );
        break;
      default:
        if (W2K && W2K.AppRegistry) {
          W2K.AppRegistry.launch(action);
        }
        break;
    }
  }

  for (var i = 0; i < deskIcons.length; i++) {
    (function (icon) {
      icon.addEventListener("click", function (e) {
        deselectAllIcons();
        icon.classList.add("selected");
        selectedIcon = icon;
        e.stopPropagation();
      });
      icon.addEventListener("dblclick", function () {
        deselectAllIcons();
        playLaunchSnd();
        openDesktopIcon(icon.getAttribute("data-action"));
      });
    })(deskIcons[i]);
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".desk-icon")) {
      deselectAllIcons();
    }
  });

  /* ===== Desktop icon drag with snap-to-grid ===== */
  var GRID_X = 80;
  var GRID_Y = 90;
  var GRID_OFFSET_X = 14;
  var GRID_OFFSET_Y = 14;
  var TASKBAR_H = 40;
  var ICON_W = 78;
  var ICON_H = 78;

  var _hiddenShortcuts = null;
  function _loadHiddenShortcuts() {
    if (_hiddenShortcuts) return;
    try { _hiddenShortcuts = JSON.parse(localStorage.getItem('w2k_hidden_shortcuts') || '[]'); }
    catch(e) { _hiddenShortcuts = []; }
  }
  function _saveHiddenShortcuts() {
    try { localStorage.setItem('w2k_hidden_shortcuts', JSON.stringify(_hiddenShortcuts)); } catch(e) {}
  }
  function _isIconVisible(icon) {
    return !icon.classList.contains('hidden-shortcut');
  }
  function _syncHiddenIcons() {
    _loadHiddenShortcuts();
    for (var i = 0; i < deskIcons.length; i++) {
      if (_hiddenShortcuts.indexOf(deskIcons[i].getAttribute('data-action')) !== -1)
        deskIcons[i].classList.add('hidden-shortcut');
    }
  }

  function _loadDynamicIcons() {
    try { return JSON.parse(localStorage.getItem('w2k_dynamic_icons') || '[]'); }
    catch(e) { return []; }
  }
  function _saveDynamicIcons(arr) {
    try { localStorage.setItem('w2k_dynamic_icons', JSON.stringify(arr)); } catch(e) {}
  }

  function _ensureDynamicIcons() {
    var dynamic = _loadDynamicIcons();
    for (var i = 0; i < dynamic.length; i++) {
      var action = dynamic[i];
      if (!_hasDeskIcon(action) && _deskIconMap[action]) {
        _createDeskIcon(action);
      }
    }
  }

  function _dim(icon) {
    return {
      w: icon.offsetWidth || 78,
      h: icon.offsetHeight || 78
    };
  }

  function snapToGrid(x, y) {
    return {
      x: Math.round((x - GRID_OFFSET_X) / GRID_X) * GRID_X + GRID_OFFSET_X,
      y: Math.round((y - GRID_OFFSET_Y) / GRID_Y) * GRID_Y + GRID_OFFSET_Y
    };
  }

  function setDefaultPositions() {
    var cols = 1;
    var vi = 0;
    for (var i = 0; i < deskIcons.length; i++) {
      if (!_isIconVisible(deskIcons[i])) continue;
      var col = vi % cols;
      var row = Math.floor(vi / cols);
      deskIcons[i].style.left = (GRID_OFFSET_X + col * GRID_X) + "px";
      deskIcons[i].style.top = (GRID_OFFSET_Y + row * GRID_Y) + "px";
      vi++;
    }
  }

  function loadIconPositions() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem('w2k_desktop_icons') || '{}'); } catch(e) { saved = {}; }
    var keys = Object.keys(saved);
    if (keys.length === 0) {
      setDefaultPositions();
      return;
    }
    for (var i = 0; i < deskIcons.length; i++) {
      var icon = deskIcons[i];
      if (!_isIconVisible(icon)) continue;
      var action = icon.getAttribute('data-action');
      if (action && saved[action]) {
        icon.style.left = saved[action].x + 'px';
        icon.style.top = saved[action].y + 'px';
      } else {
        var free = findFreeGridCell(GRID_OFFSET_X, GRID_OFFSET_Y, icon);
        icon.style.left = free.x + 'px';
        icon.style.top = free.y + 'px';
      }
    }
  }

  function saveIconPositions() {
    var data = {};
    for (var i = 0; i < deskIcons.length; i++) {
      var icon = deskIcons[i];
      if (!_isIconVisible(icon)) continue;
      var action = icon.getAttribute("data-action");
      var l = parseInt(icon.style.left, 10);
      var t = parseInt(icon.style.top, 10);
      if (!isNaN(l) && !isNaN(t)) {
        data[action] = { x: l, y: t };
      }
    }
    try {
      localStorage.setItem("w2k_desktop_icons", JSON.stringify(data));
    } catch (e) {}
  }

  function getIconRect(icon) {
    var l = parseInt(icon.style.left, 10);
    var t = parseInt(icon.style.top, 10);
    if (isNaN(l) || isNaN(t)) return null;
    var d = _dim(icon);
    return { x: l, y: t, w: d.w, h: d.h };
  }

  function iconsOverlap(a, b) {
    var ra = getIconRect(a);
    var rb = getIconRect(b);
    if (!ra || !rb) return false;
    return ra.x < rb.x + rb.w && ra.x + ra.w > rb.x &&
           ra.y < rb.y + rb.h && ra.y + ra.h > rb.y;
  }

  function _buildOccupancyGrid(exclude) {
    var viewW = window.innerWidth;
    var viewH = window.innerHeight;
    var cols = Math.ceil((viewW - GRID_OFFSET_X) / GRID_X) + 2;
    var rows = Math.ceil((viewH - GRID_OFFSET_Y) / GRID_Y) + 2;
    if (cols < 10) cols = 10;
    if (rows < 10) rows = 10;
    var grid = [];
    for (var c = 0; c < cols; c++) {
      grid[c] = [];
      for (var r = 0; r < rows; r++) grid[c][r] = false;
    }
    for (var k = 0; k < deskIcons.length; k++) {
      var icon = deskIcons[k];
      if (icon === exclude || !_isIconVisible(icon)) continue;
      var l = parseInt(icon.style.left, 10);
      var t = parseInt(icon.style.top, 10);
      if (isNaN(l) || isNaN(t)) continue;
      var gc = Math.round((l - GRID_OFFSET_X) / GRID_X);
      var gr = Math.round((t - GRID_OFFSET_Y) / GRID_Y);
      if (gc >= 0 && gc < cols && gr >= 0 && gr < rows) grid[gc][gr] = true;
    }
    return { grid: grid, cols: cols, rows: rows };
  }
  function resolveIconCollisions() {
    var changed = true;
    var maxPasses = 50;
    while (changed && maxPasses-- > 0) {
      changed = false;
      for (var i = 0; i < deskIcons.length; i++) {
        if (!_isIconVisible(deskIcons[i])) continue;
        for (var j = i + 1; j < deskIcons.length; j++) {
          if (!_isIconVisible(deskIcons[j])) continue;
          if (iconsOverlap(deskIcons[i], deskIcons[j])) {
            var l = parseInt(deskIcons[j].style.left, 10);
            var t = parseInt(deskIcons[j].style.top, 10);
            if (isNaN(l) || isNaN(t)) continue;
            var free = findFreeGridCell(l, t, deskIcons[j]);
            deskIcons[j].style.left = free.x + "px";
            deskIcons[j].style.top = free.y + "px";
            changed = true;
          }
        }
      }
    }
    for (var a = 0; a < deskIcons.length; a++) {
      if (!_isIconVisible(deskIcons[a])) continue;
      for (var b = a + 1; b < deskIcons.length; b++) {
        if (!_isIconVisible(deskIcons[b])) continue;
        if (iconsOverlap(deskIcons[a], deskIcons[b])) {
          var free = findFreeGridCell(GRID_OFFSET_X, GRID_OFFSET_Y, deskIcons[b]);
          deskIcons[b].style.left = free.x + "px";
          deskIcons[b].style.top = free.y + "px";
        }
      }
    }
  }
  resolveIconCollisions();

  function repositionOutOfBounds() {
    var viewW = window.innerWidth;
    var viewH = window.innerHeight;
    var pad = 10;
    for (var i = 0; i < deskIcons.length; i++) {
      var icon = deskIcons[i];
      if (!_isIconVisible(icon)) continue;
      var r = getIconRect(icon);
      if (!r) continue;
      var x = r.x, y = r.y;
      if (x + r.w > viewW - pad) x = GRID_OFFSET_X;
      if (y + r.h > viewH - pad) y = GRID_OFFSET_Y;
      if (x !== r.x || y !== r.y) {
        var s = snapToGrid(x, y);
        icon.style.left = s.x + "px";
        icon.style.top = s.y + "px";
      }
    }
    resolveIconCollisions();
  }

  var dragIcon = null;
  var dragOffX = 0, dragOffY = 0;
  var _rubber = null; /* { startX, startY, endX, endY, el } */

  document.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    var icon = e.target.closest(".desk-icon");
    if (icon) {
      if (typeof playClickSnd === 'function') playClickSnd();
      dragIcon = icon;
      var r = icon.getBoundingClientRect();
      dragOffX = e.clientX - r.left;
      dragOffY = e.clientY - r.top;
      icon.classList.add("dragging");
      icon.style.transition = 'left 0.06s ease, top 0.06s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
      deselectAllIcons();
      e.preventDefault();
      return;
    }
    /* Start rubber band selection on desktop background */
    if (e.target.closest('.desktop-icons')) {
      deselectAllIcons();
      var el = document.createElement('div');
      el.className = 'desktop-rubber';
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
      el.style.width = '0px';
      el.style.height = '0px';
      document.querySelector('.desktop-icons').appendChild(el);
      _rubber = { startX: e.clientX, startY: e.clientY, el: el };
      e.preventDefault();
    }
  });

  document.addEventListener("mousemove", function (e) {
    if (dragIcon) {
      var parentRect = dragIcon.parentElement.getBoundingClientRect();
      var x = e.clientX - parentRect.left - dragOffX;
      var y = e.clientY - parentRect.top - dragOffY;
      var minX = GRID_OFFSET_X;
      var maxX = window.innerWidth - GRID_OFFSET_X - ICON_W;
      var minY = GRID_OFFSET_Y;
      var maxY = window.innerHeight - TASKBAR_H - GRID_OFFSET_Y - ICON_H;
      x = Math.max(minX, Math.min(x, maxX));
      y = Math.max(minY, Math.min(y, maxY));
      var snapped = snapToGrid(x, y);
      dragIcon.style.left = snapped.x + "px";
      dragIcon.style.top = snapped.y + "px";
      e.preventDefault();
      return;
    }
    if (_rubber) {
      var sx = _rubber.startX, sy = _rubber.startY;
      var ex = e.clientX, ey = e.clientY;
      var l = Math.min(sx, ex), t = Math.min(sy, ey);
      var w = Math.abs(ex - sx), h = Math.abs(ey - sy);
      _rubber.el.style.left = l + 'px';
      _rubber.el.style.top = t + 'px';
      _rubber.el.style.width = w + 'px';
      _rubber.el.style.height = h + 'px';
      _rubber.endX = ex;
      _rubber.endY = ey;
      e.preventDefault();
    }
  });

  function findFreeGridCell(x, y, exclude) {
    var px = parseInt(x, 10), py = parseInt(y, 10);
    if (isNaN(px)) px = GRID_OFFSET_X;
    if (isNaN(py)) py = GRID_OFFSET_Y;
    var occ = _buildOccupancyGrid(exclude);
    var maxCol = Math.max(0, Math.floor((window.innerWidth - GRID_OFFSET_X - ICON_W) / GRID_X));
    var maxRow = Math.max(0, Math.floor((window.innerHeight - TASKBAR_H - GRID_OFFSET_Y - ICON_H) / GRID_Y));
    var ccol = Math.round((px - GRID_OFFSET_X) / GRID_X);
    var crow = Math.round((py - GRID_OFFSET_Y) / GRID_Y);
    if (ccol < 0) ccol = 0;
    if (crow < 0) crow = 0;
    if (ccol > maxCol) ccol = maxCol;
    if (crow > maxRow) crow = maxRow;
    var maxRadius = Math.max(occ.cols, occ.rows);
    for (var r = 0; r <= maxRadius; r++) {
      for (var dx = -r; dx <= r; dx++) {
        var cx = ccol + dx, cy = crow - r;
        if (cx >= 0 && cx <= maxCol && cy >= 0 && cy <= maxRow && !occ.grid[cx][cy])
          return { x: GRID_OFFSET_X + cx * GRID_X, y: GRID_OFFSET_Y + cy * GRID_Y };
      }
      for (var dy = -r + 1; dy <= r; dy++) {
        var cx = ccol + r, cy = crow + dy;
        if (cx >= 0 && cx <= maxCol && cy >= 0 && cy <= maxRow && !occ.grid[cx][cy])
          return { x: GRID_OFFSET_X + cx * GRID_X, y: GRID_OFFSET_Y + cy * GRID_Y };
      }
      for (var dx = r - 1; dx >= -r; dx--) {
        var cx = ccol + dx, cy = crow + r;
        if (cx >= 0 && cx <= maxCol && cy >= 0 && cy <= maxRow && !occ.grid[cx][cy])
          return { x: GRID_OFFSET_X + cx * GRID_X, y: GRID_OFFSET_Y + cy * GRID_Y };
      }
      for (var dy = r - 1; dy >= -r + 1; dy--) {
        var cx = ccol - r, cy = crow + dy;
        if (cx >= 0 && cx <= maxCol && cy >= 0 && cy <= maxRow && !occ.grid[cx][cy])
          return { x: GRID_OFFSET_X + cx * GRID_X, y: GRID_OFFSET_Y + cy * GRID_Y };
      }
    }
    for (var c = 0; c <= maxCol; c++)
      for (var rr = 0; rr <= maxRow; rr++)
        if (!occ.grid[c][rr])
          return { x: GRID_OFFSET_X + c * GRID_X, y: GRID_OFFSET_Y + rr * GRID_Y };
    return { x: GRID_OFFSET_X, y: GRID_OFFSET_Y };
  }

  document.addEventListener("mouseup", function (e) {
    if (dragIcon) {
      dragIcon.classList.remove("dragging");
      var l = parseInt(dragIcon.style.left, 10);
      var t = parseInt(dragIcon.style.top, 10);
      if (!isNaN(l) && !isNaN(t)) {
        var free = findFreeGridCell(l, t, dragIcon);
        dragIcon.style.left = free.x + "px";
        dragIcon.style.top = free.y + "px";
      }
      resolveIconCollisions();
      saveIconPositions();
      if (typeof playToggleOffSnd === 'function') playToggleOffSnd();
      dragIcon = null;
      return;
    }
    if (_rubber) {
      if (_rubber.el && _rubber.el.parentNode) _rubber.el.parentNode.removeChild(_rubber.el);
      var sx = _rubber.startX, sy = _rubber.startY;
      var ex = _rubber.endX !== undefined ? _rubber.endX : sx;
      var ey = _rubber.endY !== undefined ? _rubber.endY : sy;
      var rl = Math.min(sx, ex), rt = Math.min(sy, ey);
      var rr = Math.max(sx, ex), rb = Math.max(sy, ey);
      for (var i = 0; i < deskIcons.length; i++) {
        var icon = deskIcons[i];
        if (!_isIconVisible(icon)) continue;
        var ir = icon.getBoundingClientRect();
        if (ir.right > rl && ir.left < rr && ir.bottom > rt && ir.top < rb) {
          icon.classList.add("selected");
        }
      }
      _rubber = null;
      e.preventDefault();
    }
  });

  window.addEventListener("resize", function () {
    repositionOutOfBounds();
  });

  /* ================================================================
       START BUTTON
       ================================================================ */

  var startMenu = document.getElementById("startMenu");
  var startBtn = document.getElementById("startBtn");

  startBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    startMenu.classList.toggle("open");
    startBtn.classList.toggle("active", startMenu.classList.contains("open"));
    if (typeof playClickSnd === 'function') playClickSnd();
    if (startMenu.classList.contains("open")) sortMostUsed();
  });

  /* ================================================================
       MOST USED (frequência de uso)
       ================================================================ */

  var mostUsed = {};
  try {
    mostUsed = JSON.parse(localStorage.getItem("w2kMostUsed") || "{}");
  } catch (e) {
    mostUsed = {};
  }

  function trackUse(action) {
    if (!action) return;
    mostUsed[action] = (mostUsed[action] || 0) + 1;
    try {
      localStorage.setItem("w2kMostUsed", JSON.stringify(mostUsed));
    } catch (e) {}
  }

  function sortMostUsed() {
    var body = document.getElementById("startMenuBody");
    if (!body) return;
    var sep = body.querySelector(".start-menu-separator");
    if (!sep) return;
    var items = Array.from(body.querySelectorAll(".start-menu-item"));
    var appItems = items.filter(function (el) {
      var action = el.getAttribute("data-action");
      return action && action !== "fullscreen" && action !== "shutdown";
    });
    appItems.sort(function (a, b) {
      var aFreq = mostUsed[a.getAttribute("data-action")] || 0;
      var bFreq = mostUsed[b.getAttribute("data-action")] || 0;
      if (bFreq !== aFreq) return bFreq - aFreq;
      var aLabel = (a.textContent || "").trim();
      var bLabel = (b.textContent || "").trim();
      return aLabel.localeCompare(bLabel, "pt");
    });
    var frag = document.createDocumentFragment();
    for (var i = 0; i < appItems.length; i++) {
      frag.appendChild(appItems[i]);
    }
    body.insertBefore(frag, sep);
  }

  /* ================================================================
       START MENU ITEMS
       ================================================================ */

  var _lastMenuItem = null;
  startMenu.addEventListener("mouseover", function (e) {
    var item = e.target.closest(".start-menu-item");
    if (!item || item === _lastMenuItem) return;
    _lastMenuItem = item;
    if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
  });

  startMenu.addEventListener("click", function (e) {
    var item = e.target.closest(".start-menu-item");
    if (!item) return;
    startMenu.classList.remove("open");
    startBtn.classList.remove("active");
    var action = item.getAttribute("data-action");
    trackUse(action);
    switch (action) {
      case "links":
        if (winBehavior.isMinimized() || win.style.display === "none") {
          winBehavior.show();
        }
        winBehavior.bringToFront();
        break;
      case "fullscreen":
        window.toggleFullscreen();
        break;
      case "shutdown":
        xpDialog({
          title: __('shutdown.title'),
          icon: "!",
          type: "confirm",
          message: __('shutdown.msg'),
          callback: function (ok) {
            if (ok) {
              document.body.innerHTML =
                '<div style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:24px;">' + __('shutdown.done') + '</div>';
            }
          },
        });
        break;
      default:
        if (W2K && W2K.AppRegistry) {
          W2K.AppRegistry.launch(action);
        }
        break;
    }
  });

  /* ================================================================
       DESKTOP RIGHT-CLICK CONTEXT MENU
       ================================================================ */

  var ctxMenu = document.getElementById("ctxMenu");

  document
    .querySelector(".desktop")
    .addEventListener("contextmenu", function (e) {
      e.preventDefault();
      if (typeof playClickSnd === 'function') playClickSnd();
      var mw2 = ctxMenu.offsetWidth || 180, mh2 = ctxMenu.offsetHeight || 160;
      ctxMenu.style.left = Math.max(0, Math.min(e.clientX, window.innerWidth - mw2)) + "px";
      ctxMenu.style.top = Math.max(0, Math.min(e.clientY, window.innerHeight - mh2)) + "px";
      ctxMenu.classList.add("open");
    });

  ctxMenu.addEventListener("click", function (e) {
    var item = e.target.closest(".ctx-menu-item");
    if (!item) return;
    ctxMenu.classList.remove("open");
    ctxMenu.style.display = "";
    var action = item.getAttribute("data-action");
    switch (action) {
      case "arrange":
        if (typeof playRestoreSnd === 'function') playRestoreSnd();
        setDefaultPositions();
        saveIconPositions();
        for (var i = 0; i < deskIcons.length; i++) {
          deskIcons[i].classList.remove("selected");
        }
        break;
      case "refresh":
        if (typeof playClickSnd === 'function') playClickSnd();
        location.reload();
        break;
      case "showdesktop":
        if (typeof playMinimizeSnd === 'function') playMinimizeSnd();
        toggleShowDesktop();
        break;
      case "properties":
        if (typeof playClickSnd === 'function') playClickSnd();
        if (typeof window.switchToSettingsCategory === "function") {
          window.switchToSettingsCategory("about");
        }
        break;
    }
  });

  /* ================================================================
       TASKBAR RIGHT-CLICK CONTEXT
       ================================================================ */

  document
    .querySelector(".taskbar")
    .addEventListener("contextmenu", function (e) {
      e.preventDefault();
      var tItem = e.target.closest('.taskbar-item');
      if (tItem && tItem.getAttribute('data-action')) {
        _showActionMenu(e, tItem.getAttribute('data-action'));
        return;
      }
    });

  /* ================================================================
       CLOSE MENUS ON OUTSIDE CLICK
       ================================================================ */

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#startBtn") && !e.target.closest("#startMenu")) {
      startMenu.classList.remove("open");
      startBtn.classList.remove("active");
    }
    if (!e.target.closest("#ctxMenu")) {
      ctxMenu.classList.remove("open");
      ctxMenu.style.display = "";
    }
    if (!e.target.closest("#scActionMenu")) {
      var m = document.getElementById("scActionMenu");
      if (m) m.remove();
    }
  });

  /* ================================================================
       ADD / REMOVE DESKTOP SHORTCUT
       ================================================================ */

  var _eligibleActions = ['terminal','wakatime','games','soundcloud','chat','randomgif','links','settings','feed'];

  var _deskIconMap = {
    terminal: { icon: 'system/assets/icons/tango2kde/48x48/apps/terminal.png', labelKey: 'desktop.terminal' },
    wakatime: { icon: 'system/assets/icons/tango2kde/48x48/apps/redhat-web-browser.png', labelKey: 'desktop.wakatime' },
    games: { icon: 'system/assets/icons/tango2kde/48x48/categories/applications-games.png', labelKey: 'desktop.games' },
    soundcloud: { icon: 'system/assets/icons/tango2kde/48x48/apps/kaudiocreator.png', labelKey: 'desktop.soundcloud' },
    chat: { icon: 'system/assets/icons/tango2kde/48x48/apps/internet-group-chat.png', labelKey: 'desktop.chat' },
    randomgif: { icon: 'system/assets/icons/tango2kde/48x48/apps/gwenview.png', labelKey: 'desktop.randomgif' },
    links: { icon: 'system/assets/icons/tango2kde/48x48/apps/redhat-web-browser.png', labelKey: 'desktop.links' },
    settings: { icon: 'system/assets/icons/tango2kde/48x48/categories/redhat-system_tools.png', labelKey: 'desktop.settings' },
    feed: { icon: 'system/assets/icons/tango2kde/48x48/apps/gwenview.png', labelKey: 'desktop.feed' },
    gallery: { icon: 'system/assets/icons/tango2kde/48x48/apps/gwenview.png', labelKey: 'desktop.gallery' },
  };

  _ensureDynamicIcons();
  loadIconPositions();
  resolveIconCollisions();
  saveIconPositions();
  _syncHiddenIcons();

  function _createDeskIcon(action) {
    var info = _deskIconMap[action];
    if (!info) return null;
    var div = document.createElement('div');
    div.className = 'desk-icon';
    div.setAttribute('data-action', action);
    div.style.position = 'absolute';
    div.style.cursor = 'pointer';
    var imgSrc = info.icon || 'system/assets/icons/tango2kde/48x48/apps/gwenview.png';
    var labelHtml = __('info.label') || action;
    try { labelHtml = __(info.labelKey); } catch(e) {}
    div.innerHTML =
      '<span class="di-icon"><img src="' + imgSrc + '" alt="" width="36" height="36"></span>' +
      '<span class="di-label">' + labelHtml + '</span>';
    div.addEventListener('click', function() {
      deselectAllIcons();
      div.classList.add('selected');
      selectedIcon = div;
    });
    div.addEventListener('dblclick', function() {
      deselectAllIcons();
      if (typeof playLaunchSnd === 'function') playLaunchSnd();
      openDesktopIcon(action);
    });
    document.querySelector('.desktop-icons').appendChild(div);
    deskIcons = document.querySelectorAll('.desk-icon');
    var dynamic = _loadDynamicIcons();
    if (dynamic.indexOf(action) === -1) {
      dynamic.push(action);
      _saveDynamicIcons(dynamic);
    }
    return div;
  }

  function _removeDeskIcon(action) {
    var el = _hasDeskIcon(action);
    if (!el) return;
    el.remove();
    deskIcons = document.querySelectorAll('.desk-icon');
    var dynamic = _loadDynamicIcons();
    var idx = dynamic.indexOf(action);
    if (idx !== -1) {
      dynamic.splice(idx, 1);
      _saveDynamicIcons(dynamic);
    }
    var hidx = _hiddenShortcuts.indexOf(action);
    if (hidx !== -1) {
      _hiddenShortcuts.splice(hidx, 1);
      _saveHiddenShortcuts();
    }
    resolveIconCollisions();
    saveIconPositions();
  }

  function _hasDeskIcon(action) {
    var icons = document.querySelectorAll(".desk-icon");
    for (var i = 0; i < icons.length; i++)
      if (icons[i].getAttribute('data-action') === action) return icons[i];
    return null;
  }

  function _showActionMenu(e, action) {
    e.preventDefault();
    e.stopPropagation();
    if (_eligibleActions.indexOf(action) === -1) return;
    var old = document.getElementById("scActionMenu");
    if (old) old.remove();
    var icon = _hasDeskIcon(action);
    var menu = document.createElement('div');
    menu.id = 'scActionMenu';
    menu.className = 'ctx-menu open';
    menu.style.left = Math.min(e.clientX, window.innerWidth - 220) + 'px';
    menu.style.top = Math.min(e.clientY, window.innerHeight - 120) + 'px';
    menu.style.position = 'fixed';
    menu.style.zIndex = '999999';

    var isPinned = W2K && W2K.taskbarPins && W2K.taskbarPins.isPinned(action);
    var pinLabel = isPinned ? __('ctx.unpin') : __('ctx.pin');
    var shortcutLabel = icon ? __('ctx.removeDesktop') : __('ctx.addDesktop');

    var html =
      '<div class="ctx-menu-item" data-inner-action="pin">' + pinLabel + '</div>' +
      '<div class="ctx-menu-item" data-inner-action="shortcut">' + shortcutLabel + '</div>';

    menu.innerHTML = html;
    document.body.appendChild(menu);

    Array.from(menu.querySelectorAll('.ctx-menu-item')).forEach(function(item) {
      item.addEventListener('click', function() {
        menu.remove();
        var innerAct = item.getAttribute('data-inner-action');
        if (innerAct === 'pin') {
          if (W2K && W2K.taskbarPins) W2K.taskbarPins.toggle(action);
        } else if (innerAct === 'shortcut') {
          var existing = _hasDeskIcon(action);
          if (existing) {
            _removeDeskIcon(action);
          } else {
            var newIcon = _createDeskIcon(action);
            if (newIcon) {
              var free = findFreeGridCell(GRID_OFFSET_X, GRID_OFFSET_Y, newIcon);
              newIcon.style.left = free.x + "px";
              newIcon.style.top = free.y + "px";
              resolveIconCollisions();
              saveIconPositions();
            }
          }
        }
      });
    });
  }

  document.querySelector('.desktop-icons').addEventListener('contextmenu', function(e) {
    var icon = e.target.closest('.desk-icon');
    if (!icon) return;
    _showActionMenu(e, icon.getAttribute('data-action'));
  });

  startMenu.addEventListener('contextmenu', function(e) {
    var item = e.target.closest('.start-menu-item');
    if (!item) return;
    var action = item.getAttribute('data-action');
    if (action && _eligibleActions.indexOf(action) !== -1) {
      _showActionMenu(e, action);
    }
  });

  /* ================================================================
       BOOT SCREEN
       ================================================================ */

  (function () {
    var boot = document.getElementById("bootScreen");
    if (!boot) return;

    var bar = document.getElementById("bootBarFill");
    var msg = document.getElementById("bootMsg");
    if (!bar || !msg) return;

    function tryFS() {
      try {
        if (typeof playClickSnd === 'function') playClickSnd();
        document.documentElement.requestFullscreen().catch(function () {});
      } catch (e) {}
    }
    boot.addEventListener("click", tryFS);

    var stages = [
      { pct: 8, txt: __("boot.stage1") },
      { pct: 18, txt: __("boot.stage2") },
      { pct: 33, txt: __("boot.stage3") },
      { pct: 54, txt: __("boot.stage4") },
      { pct: 90, txt: __("boot.stage5") },
      { pct: 100, txt: __("boot.stage6") },
    ];

    var idx = 0;
    var done = false;

    function advance() {
      if (done) return;
      if (idx >= stages.length) {
        finish();
        return;
      }
      var s = stages[idx];
      bar.style.width = s.pct + "%";
      msg.textContent = s.txt;
      idx++;
      if (idx < stages.length) {
        setTimeout(advance, 100 + Math.random() * 3000);
      }
    }

    function fastForward() {
      idx = stages.length;
      bar.style.width = "100%";
      msg.textContent = __("boot.done");
    }

    function finish() {
      if (done) return;
      done = true;
      fastForward();
      window._bootReady = true;
    }

    // Wait for welcome.js to load preferences and show welcome
    var loadTimer = setTimeout(finish, 5000);

    window.addEventListener("load", function () {
      clearTimeout(loadTimer);
      setTimeout(finish, 8000);
    });

    advance();
  })();

  /* ================================================================
       BUTTON RIPPLE / SOUND FEEDBACK
       ================================================================ */

  var _pressedBtn = null;
  var _clickSndSelectors = '.win-btn, .xp-dialog-btn, .start-btn, .ql-icon, .settings-btn, .settings-file-btn, .ctx-menu-item, .tray-icon, .tray-clock, .project-card';
  document.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    var btn = e.target.closest(_clickSndSelectors);
    if (btn) {
      _pressedBtn = btn;
      btn.style.transition = 'transform 0.08s ease';
      btn.style.transform = 'scale(0.93)';
    }
  });
  document.addEventListener('mouseup', function() {
    if (_pressedBtn) {
      _pressedBtn.style.transform = 'scale(1)';
      var el = _pressedBtn;
      setTimeout(function() { el.style.transition = ''; }, 100);
      _pressedBtn = null;
    }
  });
  document.addEventListener('click', function(e) {
    if (e.button !== 0) return;
    var t = e.target.closest(_clickSndSelectors + ', .desk-icon, .start-menu-item, .settings-category, .games-block, .sc-playlist-item, .sc-playlist-add, .sc-playlist-remove, .sc-np-btn, #scBtnShuffle, #scBtnPrev, #scBtnNext, #scBtnPlay, #welcomeLangPt, #welcomeLangEn, #welcomeStartBtn');
    if (t) playClickSnd();
  });

})();
