(function () {
  "use strict";

  var win = document.getElementById("feedWindow");
  var body = document.getElementById("feedBody");
  var dragHandle = document.getElementById("feedDragHandle");
  var btnClose = document.getElementById("feedBtnClose");
  var btnMinimize = document.getElementById("feedBtnMinimize");
  var btnMaximize = document.getElementById("feedBtnMaximize");

  var _feedData = [];
  var _token = null;

  try { _token = localStorage.getItem("feed_token"); } catch (e) {}

  function _getFeed() {
    var headers = { "Content-Type": "application/json" };
    if (_token) headers["Authorization"] = "Bearer " + _token;
    return fetch("/api/feed", { headers: headers }).then(function (r) {
      if (r.status === 403 || r.status === 401) {
        _token = null;
        try { localStorage.removeItem("feed_token"); } catch (e) {}
        return Promise.reject(new Error("unauthorized"));
      }
      if (!r.ok) return Promise.reject(new Error("HTTP " + r.status));
      return r.json();
    }).then(function (data) {
      _feedData = data;
      _renderFeed();
    }).catch(function (err) {
      if (err.message === "unauthorized") {
        _showAuth();
      } else {
        _showError(err);
      }
    });
  }

  function _showAuth() {
    body.innerHTML =
      '<div class="feed-auth">' +
        '<div class="feed-auth-box">' +
          '<h3 data-i18n="feed.authTitle">Acesso Restrito</h3>' +
          '<p data-i18n="feed.authDesc">Digite a senha de administrador para acessar o feed.</p>' +
          '<input type="password" id="feedPassword" class="feed-auth-input" placeholder="' + __('feed.passwordPlaceholder') + '" />' +
          '<button id="feedAuthBtn" class="win-btn feed-auth-btn" data-i18n="feed.authBtn">Entrar</button>' +
          '<p id="feedAuthError" class="feed-auth-error" style="display:none" data-i18n="feed.authError">Senha incorreta.</p>' +
        '</div>' +
      '</div>';
    if (typeof playOpenSnd === 'function') playOpenSnd();
    document.getElementById("feedAuthBtn").addEventListener("click", _doAuth);
    document.getElementById("feedPassword").addEventListener("keydown", function (e) {
      if (e.key === "Enter") _doAuth();
    });
    setTimeout(function () {
      document.getElementById("feedPassword").focus();
    }, 100);
  }

  function _doAuth() {
    var pwd = document.getElementById("feedPassword").value;
    if (!pwd) return;
    fetch("/api/feed", {
      headers: { "Authorization": "Bearer " + pwd }
    }).then(function (r) {
      if (r.ok) {
        _token = pwd;
        try { localStorage.setItem("feed_token", _token); } catch (e) {}
        if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
        r.json().then(function (data) {
          _feedData = data;
          _renderFeed();
        });
      } else {
        var errEl = document.getElementById("feedAuthError");
        if (errEl) errEl.style.display = "block";
        if (typeof playErrorBeepSnd === 'function') playErrorBeepSnd();
      }
    }).catch(function () {
      var errEl = document.getElementById("feedAuthError");
      if (errEl) errEl.style.display = "block";
    });
  }

  function _showBlocked() {
    body.innerHTML =
      '<div class="feed-empty">' +
        '<p data-i18n="feed.blocked">Feed indisponível na sua região.</p>' +
      '</div>';
  }

  function _showError(err) {
    body.innerHTML =
      '<div class="feed-empty">' +
        '<p>' + __('feed.error') + ' ' + (err.message || __('feed.unknown')) + '</p>' +
      '</div>';
  }

  function _renderFeed() {
    if (!_feedData || !_feedData.length) {
      _showError({ message: __("feed.noPosts") });
      return;
    }
    var html = '<div class="feed-list">';
    for (var i = 0; i < _feedData.length; i++) {
      var post = _feedData[i];
      html +=
        '<div class="feed-post">' +
          '<div class="feed-post-header">' +
            '<span class="feed-post-date">' + _escape(post.date || "") + '</span>' +
          '</div>' +
          '<img class="feed-post-img" src="' + _escape(post.image) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />' +
          '<div class="feed-post-text">' + _escape(post.text || "") + '</div>' +
        '</div>';
    }
    html += '</div>';
    body.innerHTML = html;
    if (typeof playOpenSnd === 'function') playOpenSnd();
  }

  function _escape(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ===== Window ===== */
  var behavior = new WindowBehavior(win, {
    dragHandle: dragHandle,
    btnClose: btnClose,
    btnMinimize: btnMinimize,
    btnMaximize: btnMaximize,
    minW: 420,
    minH: 500,
    taskbarIcon:
      '<img src="assets/system/icons/tango2kde/16x16/apps/gwenview.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __('feed.title'),
    taskbarAction: 'feed',
    onShow: function () {
      if (_feedData.length) {
        _renderFeed();
      } else {
        _getFeed();
      }
    },
    onHide: function () {},
  });

  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("feed", {
      label: __('feed.title'),
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
})();
