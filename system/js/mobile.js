(function(global) {
  'use strict';

  var _appList = [];

  function isMobile() {
    return document.body.classList.contains('mobile-mode');
  }

  function registerApp(appId, label, icon) {
    _appList.push({ id: appId, label: label, icon: icon });
  }

  function rebuildMobileMenu() {
    var container = document.getElementById('mobileAppItems');
    if (!container) return;
    container.innerHTML = '';
    var openWindows = document.querySelectorAll('.window:not([style*="display: none"])');
    var shown = [];
    openWindows.forEach(function(w) {
      var id = w.getAttribute('data-app-id');
      if (id && shown.indexOf(id) === -1) {
        shown.push(id);
        var label = w.querySelector('.title-bar-text') ? w.querySelector('.title-bar-text').textContent.trim() : id;
        var item = document.createElement('div');
        item.className = 'mobile-app-item' + (w.classList.contains('active') ? ' active' : '');
        item.textContent = label;
        item.addEventListener('click', function() {
          var app = global.W2K && global.W2K.AppRegistry && global.W2K.AppRegistry.get(id);
          if (app) {
            if (w.classList.contains('active')) {
              if (app.minimize) app.minimize();
              else w.style.display = 'none';
            } else {
              app.show();
            }
          }
          closeDrawer();
        });
        container.appendChild(item);
      }
    });
  }

  function openDrawer() {
    var drawer = document.getElementById('mobileAppDrawer');
    var body = document.getElementById('mobileAppDrawerBody');
    if (!drawer || !body) return;
    body.innerHTML = '';

    _appList.forEach(function(app) {
      if (app.id === 'menu') return;
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

    // Settings
    var div = document.createElement('div');
    div.className = 'mobile-app-drawer-divider';
    body.appendChild(div);
    var settingsItem = document.createElement('div');
    settingsItem.className = 'mobile-app-drawer-item';
    settingsItem.innerHTML = '<img src="system/assets/icons/tango2kde/16x16/categories/redhat-system_tools.png" alt="" width="20" height="20"> Configurações';
    settingsItem.addEventListener('click', function() {
      closeDrawer();
      var a = global.W2K && global.W2K.AppRegistry && global.W2K.AppRegistry.get('settings');
      if (a && a.show) a.show();
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
    if (!e.target.closest('.mobile-app-drawer') && !e.target.closest('#mobileMenuBtn')) {
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

  function initMobile() {
    if (!isMobile()) return;

    var menuBtn = document.getElementById('mobileMenuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var drawer = document.getElementById('mobileAppDrawer');
        if (drawer && drawer.classList.contains('open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    injectTitleBarMenuBtns();
    rebuildMobileMenu();

    document.addEventListener('touchstart', function(e) {
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

  var _pendingRebuild = false;
  function _queueRebuild() {
    if (_pendingRebuild) return;
    _pendingRebuild = true;
    setTimeout(function() {
      _pendingRebuild = false;
      if (isMobile()) rebuildMobileMenu();
    }, 50);
  }

  function _patchAppRegistry() {
    if (!global.W2K || !global.W2K.AppRegistry) {
      setTimeout(_patchAppRegistry, 100);
      return;
    }
    var origRegister = global.W2K.AppRegistry.register;
    global.W2K.AppRegistry.register = function(id, app) {
      origRegister.call(this, id, app);
      var origShow = app.show;
      if (origShow) {
        app.show = function() {
          origShow.call(this);
          _queueRebuild();
        };
      }
    };
  }
  _patchAppRegistry();

  global.__mobileOnShow = function() {
    _queueRebuild();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobile);
  } else {
    initMobile();
  }

  global.MobileMenu = {
    registerApp: registerApp,
    rebuild: rebuildMobileMenu,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    isMobile: isMobile,
  };

  registerApp('links', 'Links', '<img src="system/assets/icons/tango2kde/16x16/apps/redhat-web-browser.png" alt="" width="20" height="20">');
  registerApp('soundcloud', 'SoundCloud', '<img src="system/assets/icons/tango2kde/16x16/apps/kaudiocreator.png" alt="" width="20" height="20">');
  registerApp('feed', 'Diário', '<img src="system/assets/icons/tango2kde/16x16/apps/gwenview.png" alt="" width="20" height="20">');
  registerApp('games', 'Jogos', '<img src="system/assets/icons/tango2kde/16x16/categories/applications-games.png" alt="" width="20" height="20">');
  registerApp('terminal', 'Terminal', '<img src="system/assets/icons/tango2kde/16x16/apps/terminal.png" alt="" width="20" height="20">');
  registerApp('randomgif', 'Galeria', '<img src="system/assets/icons/tango2kde/16x16/apps/gwenview.png" alt="" width="20" height="20">');
})(window);
