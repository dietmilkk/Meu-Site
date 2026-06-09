(function(global) {
  'use strict';

  var _appList = [];

  function isMobile() {
    return document.body.classList.contains('mobile-mode');
  }

  function registerApp(appId, label, icon) {
    _appList.push({ id: appId, label: label, icon: icon });
  }

  function openDrawer() {
    var drawer = document.getElementById('mobileAppDrawer');
    var body = document.getElementById('mobileAppDrawerBody');
    if (!drawer || !body) return;
    body.innerHTML = '';

    _appList.forEach(function(app) {
      var item = document.createElement('div');
      item.className = 'mobile-app-drawer-item';
      item.innerHTML = (app.icon || '') + ' ' + app.label;
      item.addEventListener('click', function() {
        closeDrawer();
        var a = global.W2K && global.W2K.AppRegistry && global.W2K.AppRegistry.get(app.id);
        if (a && a.show) a.show();
      });
      body.appendChild(item);
    });

    var div = document.createElement('div');
    div.className = 'mobile-app-drawer-divider';
    body.appendChild(div);

    var settingsItem = document.createElement('div');
    settingsItem.className = 'mobile-app-drawer-item';
    settingsItem.innerHTML = '<img src="system/assets/icons/tango2kde/16x16/categories/redhat-system_tools.png" alt="" width="22" height="22"> Config';
    settingsItem.addEventListener('click', function() {
      closeDrawer();
      global.W2K.AppRegistry.launch('settings');
    });
    body.appendChild(settingsItem);

    drawer.classList.add('open');
  }

  function closeDrawer() {
    var drawer = document.getElementById('mobileAppDrawer');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.style.display = 'none';
    }
  }

  document.addEventListener('click', function(e) {
    var drawer = document.getElementById('mobileAppDrawer');
    if (!drawer || !drawer.classList.contains('open')) return;
    if (!e.target.closest('.mobile-app-drawer') && !e.target.closest('.win-btn[data-wbtn="menu"]')) {
      closeDrawer();
    }
  });

  function injectTitleBarMenuBtns() {
    document.querySelectorAll('.title-bar').forEach(function(tb) {
      if (tb.querySelector('.win-btn[data-wbtn="menu"]')) return;
      var btns = tb.querySelector('.title-bar-buttons');
      if (!btns) return;
      var menuBtn = document.createElement('span');
      menuBtn.className = 'win-btn';
      menuBtn.setAttribute('data-wbtn', 'menu');
      menuBtn.textContent = '≡';
      menuBtn.style.fontSize = '20px';
      menuBtn.style.fontWeight = '700';
      menuBtn.style.lineHeight = '1';
      menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var drawer = document.getElementById('mobileAppDrawer');
        if (drawer && drawer.classList.contains('open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
      btns.insertBefore(menuBtn, btns.firstChild);
    });
  }

  function updateViewport() {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    if (isMobile()) {
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    } else {
      meta.content = 'width=1200';
    }
  }

  function fixWindowStyles() {
    document.querySelectorAll('.window').forEach(function(w) {
      if (w.style.left) w.style.left = '';
      if (w.style.top) w.style.top = '';
      if (w.style.width) w.style.width = '';
      if (w.style.height) w.style.height = '';
    });
  }

  function disableAnimations() {
    var style = document.getElementById('mobile-no-anim');
    if (!style && isMobile()) {
      var s = document.createElement('style');
      s.id = 'mobile-no-anim';
      s.textContent = '.anim-win-open,.anim-win-close{animation:none!important}';
      document.head.appendChild(s);
    }
  }

  function initMobile() {
    if (!isMobile()) return;

    updateViewport();
    fixWindowStyles();
    disableAnimations();
    injectTitleBarMenuBtns();

    document.addEventListener('touchstart', function(e) {
      if (!isMobile()) return;
      var titleBar = e.target.closest('.title-bar');
      if (titleBar && !e.target.closest('.win-btn')) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('mousedown', function(e) {
      if (isMobile() && e.target.closest('.desktop-icons')) {
        e.preventDefault();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobile);
  } else {
    initMobile();
  }

  global.MobileMenu = {
    registerApp: registerApp,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    isMobile: isMobile,
  };

  registerApp('links', 'Links', '<img src="system/assets/icons/tango2kde/16x16/apps/redhat-web-browser.png" alt="" width="22" height="22">');
  registerApp('soundcloud', 'SoundCloud', '<img src="system/assets/icons/tango2kde/16x16/apps/kaudiocreator.png" alt="" width="22" height="22">');
  registerApp('feed', 'Diário', '<img src="system/assets/icons/tango2kde/16x16/apps/gwenview.png" alt="" width="22" height="22">');
  registerApp('games', 'Jogos', '<img src="system/assets/icons/tango2kde/16x16/categories/applications-games.png" alt="" width="22" height="22">');
  registerApp('terminal', 'Terminal', '<img src="system/assets/icons/tango2kde/16x16/apps/terminal.png" alt="" width="22" height="22">');
  registerApp('randomgif', 'Galeria', '<img src="system/assets/icons/tango2kde/16x16/apps/gwenview.png" alt="" width="22" height="22">');
})(window);
