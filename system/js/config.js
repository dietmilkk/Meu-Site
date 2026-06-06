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
})(window);
