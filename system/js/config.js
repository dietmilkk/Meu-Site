(function (global) {
  "use strict";

  global.W2K = {};

  /* ================================================================
       AppRegistry — application registration and launch system
       ================================================================ */

  var apps = {};

  function safe(fn, fallback) {
    try {
      return fn();
    } catch (e) {
      console.error("AppRegistry:", e);
      if (typeof fallback === "function") fallback(e);
      return null;
    }
  }

  function registerApp(id, desc) {
    if (!id || !desc || typeof desc.show !== "function") return;
    apps[id] = desc;

    if (desc.minimize && desc.hasEntry && global.windowRegistry) {
      global.registerWindow({
        minimize: desc.minimize,
        show: desc.show,
        hasEntry: desc.hasEntry,
      });
    }
  }

  function getApp(id) {
    return apps[id] || null;
  }

  function launchApp(id) {
    var app = apps[id];
    if (!app) return false;

    safe(function () {
      app.show();
      if (typeof trackUse === "function") trackUse(id);
    }, function (err) {
      if (app.onError) {
        app.onError(err);
      } else if (typeof xpDialog === "function") {
        xpDialog({
          title: __("dialog.errorTitle"),
          icon: "!",
          message: __("dialog.errorOpen") + (app.label || id) + ":\n" + (err.message || err),
        });
      }
    });

    return true;
  }

  function launchSafe(id) {
    try {
      return launchApp(id);
    } catch (e) {
      console.error("AppRegistry: fatal error launching", id, e);
      return false;
    }
  }

  function forEachApp(fn) {
    for (var id in apps) {
      if (apps.hasOwnProperty(id)) {
        fn(apps[id], id);
      }
    }
  }

  global.W2K.AppRegistry = {
    register: registerApp,
    get: getApp,
    launch: launchSafe,
    forEach: forEachApp,
  };

  /* ================================================================
       TaskbarPins — pin / unpin apps from the taskbar
       ================================================================ */

  var PIN_KEY = "w2k_pinned";
  var _pinListeners = [];

  function _getPinned() {
    try {
      return JSON.parse(localStorage.getItem(PIN_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function _savePinned(arr) {
    try {
      localStorage.setItem(PIN_KEY, JSON.stringify(arr));
    } catch (e) {}
  }
  function _firePinChange(id, pinned) {
    for (var i = 0; i < _pinListeners.length; i++) {
      try {
        _pinListeners[i](id, pinned);
      } catch (e) {}
    }
  }

  global.W2K.taskbarPins = {
    add: function (id) {
      var arr = _getPinned();
      if (arr.indexOf(id) === -1) {
        arr.push(id);
        _savePinned(arr);
        _firePinChange(id, true);
      }
    },
    remove: function (id) {
      var arr = _getPinned().filter(function (i) {
        return i !== id;
      });
      _savePinned(arr);
      _firePinChange(id, false);
    },
    toggle: function (id) {
      if (this.isPinned(id)) this.remove(id);
      else this.add(id);
    },
    isPinned: function (id) {
      return _getPinned().indexOf(id) !== -1;
    },
    getAll: function () {
      return _getPinned();
    },
    onChanged: function (fn) {
      _pinListeners.push(fn);
    },
  };

  // Default pinned apps on first run
  if (localStorage.getItem(PIN_KEY) === null) {
    var defaults = ["soundcloud"];
    for (var d = 0; d < defaults.length; d++) {
      W2K.taskbarPins.add(defaults[d]);
    }
  }
})(window);
