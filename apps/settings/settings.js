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
    minW: 520,
    minH: 380,
    taskbarIcon:
      '<img src="assets/system/icons/tango2kde/16x16/categories/redhat-system_tools.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __('settings.title'),
    taskbarAction: 'settings',
    onShow: function () {
      win.style.width = "520px";
      win.style.height = "400px";
      refreshSystemInfo();
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
        if (cat.getAttribute("data-category") === "system") refreshSystemInfo();
      });
    })(categories[i]);
  }
})();
