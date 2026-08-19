(function (global) {
  'use strict';

  global.W2K = global.W2K || {};
  if (global.W2K.Router) return;

  function readTarget() {
    var q = (global.location.search || '').replace(/^\?/, '');
    if (q) {
      var params = {};
      q.split('&').forEach(function (p) {
        var kv = p.split('=');
        if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
      if (params.app) return params.app;
    }
    var h = (global.location.hash || '').replace(/^#/, '');
    if (h.indexOf('/app/') === 0) return decodeURIComponent(h.slice(5));
    if (h.indexOf('app=') === 0) return decodeURIComponent(h.slice(4));
    return null;
  }

  function currentAppId() {
    if (global.getOpenApps) {
      var stack = global.getOpenApps();
      if (stack.length) return stack[stack.length - 1];
    }
    var wins = document.querySelectorAll('.window[data-app-id]');
    var best = null;
    var bestZ = -1;
    for (var i = 0; i < wins.length; i++) {
      var w = wins[i];
      if (!w || w.style.display === 'none') continue;
      var z = parseInt(w.style.zIndex, 10) || 0;
      if (z >= bestZ) {
        bestZ = z;
        best = w;
      }
    }
    return best ? best.getAttribute('data-app-id') : null;
  }

  function sync() {
    var id = currentAppId();
    var base = global.location.origin + global.location.pathname;
    var target = id ? base + '?app=' + encodeURIComponent(id) : base;
    var current = global.location.href.split('#')[0];
    if (current !== target) {
      try {
        global.history.replaceState({}, '', target);
      } catch (e) {}
    }
  }

  function dismissBootIfNeeded() {
    var bootScreen = document.getElementById('bootScreen');
    if (!bootScreen || !bootScreen.isConnected) return;
    if (bootScreen.style.opacity === '0') return;
    bootScreen.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    bootScreen.style.opacity = '0';
    bootScreen.style.transform = 'scale(1.02)';
    setTimeout(function () {
      if (bootScreen.isConnected) bootScreen.remove();
    }, 350);
  }

  function launchFromURL() {
    var target = readTarget();
    if (!target) return;
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (tries > 300) {
        clearInterval(timer);
        return;
      }
      var bootScreen = document.getElementById('bootScreen');
      var ready = global._bootReady === true;
      var dismissed =
        !bootScreen ||
        !bootScreen.isConnected ||
        bootScreen.parentNode === null ||
        bootScreen.style.opacity === '0';
      if (ready && dismissed) {
        clearInterval(timer);
        if (global.W2K && global.W2K.AppRegistry && global.W2K.AppRegistry.launch) {
          global.W2K.AppRegistry.launch(target);
        }
      }
    }, 200);
    // Skip the welcome for direct URL access
    var wTimer = setInterval(function () {
      if (global._bootReady) {
        clearInterval(wTimer);
        dismissBootIfNeeded();
      }
    }, 150);
  }

  global.W2K.Router = {
    readTarget: readTarget,
    sync: sync,
    launch: launchFromURL,
  };

  global.addEventListener('popstate', launchFromURL);
  global.addEventListener('hashchange', launchFromURL);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', launchFromURL);
  } else {
    launchFromURL();
  }
})(window);
