(function () {
  "use strict";

  var win = document.getElementById("feedWindow");
  var body = document.getElementById("feedBody");
  var dragHandle = document.getElementById("feedDragHandle");
  var btnClose = document.getElementById("feedBtnClose");
  var btnMinimize = document.getElementById("feedBtnMinimize");
  var btnMaximize = document.getElementById("feedBtnMaximize");

  var _profile = {
    username: "sillky",
    avatar: "",
    bio: "uma pessoa normal totalmente padrao e nada disfuncional :D | entusiasta de tecnologia e coisas antigas"
  };

  function _escape(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var _diary = [];

  function _loadDiary(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "apps/feed/diary.json", true);
    xhr.onload = function () {
      try {
        _diary = JSON.parse(xhr.responseText);
      } catch (e) {
        _diary = [];
      }
      if (callback) callback();
    };
    xhr.onerror = function () {
      _diary = [];
      if (callback) callback();
    };
    xhr.send();
  }

  function _render() {
    body.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'feed-profile';
    header.innerHTML =
      '<div class="feed-avatar">' +
        (_profile.avatar
          ? '<img src="' + _escape(_profile.avatar) + '" alt="" />'
          : _escape(_profile.username.charAt(0).toUpperCase())) +
      '</div>' +
      '<div class="feed-profile-info">' +
        '<div class="feed-username">@' + _escape(_profile.username) + '</div>' +
        '<div class="feed-bio">' + _escape(_profile.bio) + '</div>' +
        '<div class="feed-stats"><span><strong>' + _diary.length + '</strong> ' + __('feed.entries') + '</span></div>' +
      '</div>';
    body.appendChild(header);

    var list = document.createElement('div');
    list.className = 'feed-list';

    for (var i = 0; i < _diary.length; i++) {
      var entry = _diary[i];
      var el = document.createElement('div');
      el.className = 'feed-post';
      var html = '<div class="feed-post-header"><span>' + _escape(entry.date) + '</span></div>';

      if (entry.image) {
        html += '<div class="feed-post-media">' +
          '<img src="' + _escape(entry.image) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />' +
        '</div>';
      }
      if (entry.video) {
        html += '<div class="feed-post-media feed-post-video">' +
          '<iframe src="' + _escape(entry.video) + '" frameborder="0" allowfullscreen loading="lazy"></iframe>' +
        '</div>';
      }

      html += '<div class="feed-post-text">' + _escape(entry.text) + '</div>';
      el.innerHTML = html;
      list.appendChild(el);
    }

    body.appendChild(list);
    if (typeof playOpenSnd === 'function') playOpenSnd();
  }

  var behavior = new WindowBehavior(win, {
    dragHandle: dragHandle,
    btnClose: btnClose,
    btnMinimize: btnMinimize,
    btnMaximize: btnMaximize,
    minW: 480,
    minH: 520,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/apps/gwenview.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __('feed.title'),
    taskbarAction: 'feed',
    appId: 'feed',
    onShow: function () {
      if (_diary.length === 0) {
        _loadDiary(function () { _render(); });
      } else {
        _render();
      }
    },
    onHide: function () {},
  });

  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("feed", {
      label: __('feed.title'),
      show: function () { behavior.show(); },
      minimize: function () { behavior.minimize(); },
      hasEntry: function () { return behavior.hasTaskbarEntry(); },
    });
  }
})();
