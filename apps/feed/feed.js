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
  var _cryptoKey = null;

  /* ===== Fallback data — restricted post texts are AES-256-CBC encrypted ===== */
  var _feedFallback = [
    {
      "date": "2026-01-15",
      "image": "",
      "text": "Primeira postagem do ano! Finalmente organizei meu setup do jeito que eu queria. CRT + thinkpad + café = combinação perfeita.",
      "restricted": false
    },
    {
      "date": "2026-01-10",
      "image": "",
      "text": "Mais um dia de coding. O terminal nunca me abandona ❤️",
      "restricted": false
    },
    {
      "date": "2026-01-05",
      "image": "",
      "text": "Final de semana de jogos retrô e nostalgia. DOOM eternalmente no coração.",
      "restricted": false
    },
    {
      "date": "2025-12-28",
      "image": "",
      "text": "e44660ed6062585027ec691681677858:f77da686b7ad2d5fffc082c23857611fd6b2a03b22f18373df171c43066bbf594259a17ce20d616891afdc3f1b2fbcddde6c1497d3f8b380889a9671cf7c22c543bc13990bea5aed2a9a81986a792a03f61c094525af6fd39c7c2d0b88a28ba3",
      "restricted": true
    },
    {
      "date": "2025-12-20",
      "image": "",
      "text": "1a3e4d5677933fbd76cc87bb7c27c77e:d1ce2e99475b5ccbd85a7105ac1c0eb19ae9764c8a71195fe32f0975bd72df0063b095afd7e71afe35f54cbf2c0cbcbcb5c6a6cb19874dbf1989661c47aaf492bf97441d796d7db7cc067347ab55c02a",
      "restricted": true
    },
    {
      "date": "2025-12-15",
      "image": "",
      "text": "Paisagem dahora que eu fotografei. A natureza é linda demais.",
      "restricted": false
    },
    {
      "date": "2025-12-10",
      "image": "",
      "text": "9af95ab676fcbaf7c0df711a20670154:eacef5301fab7dfa2cb60008d68847b5db6f08bb008a142c9e5ac3f2400e332cfe48150d3e2fe9ca53f26c3ccd1f2ff6",
      "restricted": true
    },
    {
      "date": "2025-12-05",
      "image": "",
      "text": "Comida aleatória que eu fiz. Ficou bonita pelo menos.",
      "restricted": false
    }
  ];

  /* ===== Geo / Location helpers ===== */
  function _isInBrazil() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz.indexOf("America/") === 0) {
        var brZones = [
          "Sao_Paulo","Manaus","Belem","Noronha","Boa_Vista",
          "Campo_Grande","Cuiaba","Eirunepe","Fortaleza",
          "Maceio","Porto_Velho","Recife","Rio_Branco","Santarem"
        ];
        for (var i = 0; i < brZones.length; i++) {
          if (tz === "America/" + brZones[i]) return true;
        }
      }
    } catch (e) {}
    try {
      var lang = navigator.language || navigator.userLanguage || "";
      if (lang.indexOf("pt-") === 0) {
        var parts = lang.split("-");
        if (parts.length > 1 && parts[1] === "BR") return true;
      }
    } catch (e) {}
    return false;
  }

  function _isRestrictedBlocked() {
    return _isInBrazil() && !_token;
  }

  /* ===== Web Crypto — AES-256-CBC decrypt for restricted posts ===== */
  function _hexToBytes(hex) {
    var len = hex.length / 2;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    return bytes;
  }

  function _deriveKey(password) {
    try {
      var encoder = new TextEncoder();
      return crypto.subtle.digest("SHA-256", encoder.encode(password)).then(function(hash) {
        return crypto.subtle.importKey("raw", hash, { name: "AES-CBC" }, false, ["decrypt"]);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function _decryptText(cipherhex, key) {
    try {
      var parts = cipherhex.split(":");
      var iv = _hexToBytes(parts[0]);
      var enc = _hexToBytes(parts[1]);
      return crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, key, enc).then(function(dec) {
        return new TextDecoder().decode(dec);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /* ===== Decrypt all restricted posts in-place using stored key ===== */
  function _decryptRestrictedPosts(data) {
    if (!_cryptoKey) return Promise.resolve(data);
    var pending = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].restricted && data[i].text.indexOf(":") > 0) {
        pending.push(
          _decryptText(data[i].text, _cryptoKey).then(function(decryptedText, idx) {
            return function() { data[idx].text = decryptedText; };
          }(i))
        );
      }
    }
    if (!pending.length) return Promise.resolve(data);
    return Promise.all(pending).then(function() { return data; });
  }

  /* ===== Age verification state ===== */
  var _currentRestrictedPost = null;

  /* ===== Profile ===== */
  var _profile = {
    username: "sillky",
    avatar: "",
    bio: "uma pessoa normal totalmente padrao e nada disfuncional :D | entusiasta de tecnologia e coisas antigas",
    posts: 0
  };

  /* ===== Render ===== */
  function _renderFeed() {
    var data = _feedData.length ? _feedData : _feedFallback;
    var restrictedBlocked = _isRestrictedBlocked();

    _decryptRestrictedPosts(data).then(function(decryptedData) {
      if (!decryptedData || !decryptedData.length) {
        body.innerHTML =
          '<div class="feed-empty">' +
            '<div class="feed-empty-icon">📭</div>' +
            '<p>' + __('feed.noPosts') + '</p>' +
          '</div>';
        return;
      }

      _profile.posts = decryptedData.length;

      var html = '';

      html += '<div class="feed-profile">';
      html += '<div class="feed-avatar">';
      if (_profile.avatar) {
        html += '<img src="' + _escape(_profile.avatar) + '" alt="" />';
      } else {
        html += _escape(_profile.username.charAt(0).toUpperCase());
      }
      html += '</div>';
      html += '<div class="feed-profile-info">';
      html += '<div class="feed-username">@' + _escape(_profile.username) + '</div>';
      html += '<div class="feed-bio">' + _escape(_profile.bio) + '</div>';
      html += '<div class="feed-stats">';
      html += '<span><strong>' + _profile.posts + '</strong> postagens</span>';
      html += '<span><strong>' + decryptedData.filter(function(p){return p.restricted;}).length + '</strong> restritas</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';

      html += '<div class="feed-list">';
      for (var i = 0; i < decryptedData.length; i++) {
        var post = decryptedData[i];
        var restrictedClass = post.restricted ? ' restricted' : '';
        html += '<div class="feed-post' + restrictedClass + '" data-index="' + i + '">';
        html += '<div class="feed-post-header">';
        html += '<span>' + _escape(post.date || "") + '</span>';
        if (post.restricted) {
          html += '<span class="feed-post-badge">' + __('feed.restricted') + '</span>';
        }
        html += '</div>';
        if (post.image) {
          html += '<div class="feed-post-img-wrap">';
          html += '<img src="' + _escape(post.image) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />';
          if (post.restricted) {
            if (restrictedBlocked) {
              html += '<div class="feed-post-censor feed-post-censor-br" data-index="' + i + '">';
              html += '<div class="feed-post-censor-icon">🔒</div>';
              html += '<div class="feed-post-censor-label">' + __('feed.brBlocked') + '</div>';
              html += '</div>';
            } else {
              html += '<div class="feed-post-censor" data-index="' + i + '">';
              html += '<div class="feed-post-censor-icon">⚠️</div>';
              html += '<div class="feed-post-censor-label">' + __('feed.censorLabel') + '</div>';
              html += '<div class="feed-post-censor-sub">' + __('feed.censorSub') + '</div>';
              html += '</div>';
            }
          }
          html += '</div>';
        } else {
          if (post.restricted) {
            if (restrictedBlocked) {
              html += '<div class="feed-post-img-wrap" style="min-height:80px;display:flex;align-items:center;justify-content:center;background:#666;">';
              html += '<div class="feed-post-censor feed-post-censor-br" data-index="' + i + '" style="position:relative;inset:auto;background:transparent;">';
              html += '<div class="feed-post-censor-icon">🔒</div>';
              html += '<div class="feed-post-censor-label">' + __('feed.brBlocked') + '</div>';
              html += '</div>';
              html += '</div>';
            } else {
              html += '<div class="feed-post-img-wrap" style="min-height:80px;display:flex;align-items:center;justify-content:center;background:#666;">';
              html += '<div class="feed-post-censor" data-index="' + i + '" style="position:relative;inset:auto;background:transparent;">';
              html += '<div class="feed-post-censor-icon">⚠️</div>';
              html += '<div class="feed-post-censor-label">' + __('feed.censorLabel') + '</div>';
              html += '<div class="feed-post-censor-sub">' + __('feed.censorSub') + '</div>';
              html += '</div>';
              html += '</div>';
            }
          }
        }
        html += '<div class="feed-post-text">' + _escape(post.text || "") + '</div>';
        html += '</div>';
      }
      html += '</div>';

      body.innerHTML = html;
      if (typeof playOpenSnd === 'function') playOpenSnd();

      var censors = body.querySelectorAll('.feed-post-censor:not(.feed-post-censor-br)');
      for (var j = 0; j < censors.length; j++) {
        censors[j].addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(this.getAttribute('data-index'));
          var post = (_feedData.length ? _feedData : _feedFallback)[idx];
          if (post && post.restricted) {
            _currentRestrictedPost = post;
            _showAgeCheck(post);
          }
        });
      }
    }).catch(function() {
      body.innerHTML =
        '<div class="feed-empty">' +
          '<div class="feed-empty-icon">⚠️</div>' +
          '<p>' + __('feed.error') + '</p>' +
        '</div>';
    });
  }

  /* ===== Age Verification Flow ===== */
  function _showAgeCheck(post) {
    if (typeof playToggleOnSnd === 'function') playToggleOnSnd();

    var overlay = document.createElement('div');
    overlay.className = 'feed-age-overlay';
    overlay.innerHTML =
      '<div class="feed-age-box">' +
        '<div class="feed-age-title">' +
          '<span class="feed-age-title-icon">🔞</span>' +
          '<span>' + __('feed.ageTitle') + '</span>' +
        '</div>' +
        '<div class="feed-age-body">' +
          '<p>' + __('feed.ageQ1') + '</p>' +
          '<div class="feed-age-btn-row">' +
            '<button class="feed-age-btn feed-age-btn-primary" id="feedAgeYes">' + __('feed.ageYes') + '</button>' +
            '<button class="feed-age-btn" id="feedAgeNo">' + __('feed.ageNo') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    if (typeof playOpenSnd === 'function') playOpenSnd();

    document.getElementById('feedAgeYes').focus();

    document.getElementById('feedAgeYes').addEventListener('click', function() {
      _showIdRequest(overlay, post);
    });
    document.getElementById('feedAgeNo').addEventListener('click', function() {
      _dismissOverlay(overlay);
      if (typeof playCloseSnd === 'function') playCloseSnd();
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        _dismissOverlay(overlay);
        if (typeof playCloseSnd === 'function') playCloseSnd();
      }
    });
  }

  function _showIdRequest(prevOverlay, post) {
    if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
    prevOverlay.innerHTML =
      '<div class="feed-age-box">' +
        '<div class="feed-age-title">' +
          '<span class="feed-age-title-icon">🪪</span>' +
          '<span>' + __('feed.idTitle') + '</span>' +
        '</div>' +
        '<div class="feed-age-body">' +
          '<p>' + __('feed.idMsg') + '</p>' +
          '<p class="feed-age-sub" id="feedIdTimer">' + __('feed.idWait') + '</p>' +
          '<div class="feed-age-btn-row">' +
            '<button class="feed-age-btn" id="feedIdCancel" disabled>' + __('feed.idCancel') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var countdown = 5;
    var timerEl = document.getElementById('feedIdTimer');
    var interval = setInterval(function() {
      countdown--;
      if (timerEl) {
        timerEl.textContent = __('feed.idAnalyzing') + ' ' + countdown + 's...';
      }
      if (countdown <= 0) {
        clearInterval(interval);
        if (timerEl) timerEl.textContent = __('feed.idDone');
        if (typeof playToggleOffSnd === 'function') playToggleOffSnd();
        setTimeout(function() {
          _dismissOverlay(prevOverlay);
          _unlockPost(post);
        }, 800);
      }
    }, 1000);
  }

  function _unlockPost(post) {
    if (typeof playOpenSnd === 'function') playOpenSnd();

    var msgBox = document.createElement('div');
    msgBox.className = 'feed-age-overlay';
    msgBox.innerHTML =
      '<div class="feed-age-box">' +
        '<div class="feed-age-title">' +
          '<span class="feed-age-title-icon">✅</span>' +
          '<span>' + __('feed.unlockTitle') + '</span>' +
        '</div>' +
        '<div class="feed-age-body">' +
          '<p>' + __('feed.unlockMsg') + '</p>' +
          '<div class="feed-age-btn-row">' +
            '<button class="feed-age-btn feed-age-btn-primary" id="feedUnlockOk">' + __('feed.unlockOk') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(msgBox);
    if (typeof playToggleOnSnd === 'function') playToggleOnSnd();

    document.getElementById('feedUnlockOk').focus();
    document.getElementById('feedUnlockOk').addEventListener('click', function() {
      _dismissOverlay(msgBox);
      if (typeof playCloseSnd === 'function') playCloseSnd();
    });
    msgBox.addEventListener('click', function(e) {
      if (e.target === msgBox) {
        _dismissOverlay(msgBox);
        if (typeof playCloseSnd === 'function') playCloseSnd();
      }
    });

    var data = _feedData.length ? _feedData : _feedFallback;
    var idx = -1;
    for (var k = 0; k < data.length; k++) {
      if (data[k] === post) { idx = k; break; }
    }
    var posts = body.querySelectorAll('.feed-post.restricted');
    for (var i = 0; i < posts.length; i++) {
      var pIdx = parseInt(posts[i].getAttribute('data-index'));
      if (pIdx === idx) {
        var el = posts[i];
        el.classList.remove('restricted');
        var censor = el.querySelector('.feed-post-censor');
        if (censor) {
          censor.style.transition = 'opacity 0.3s ease';
          censor.style.opacity = '0';
          setTimeout(function() {
            censor.style.display = 'none';
          }, 300);
        }
        break;
      }
    }
  }

  function _dismissOverlay(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* ===== Legacy API fetch (keep for Vercel) ===== */
  function _getFeed() {
    body.innerHTML =
      '<div class="feed-empty">' +
        '<div class="feed-empty-icon">⏳</div>' +
        '<p>' + __('feed.loading') + '</p>' +
      '</div>';

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
      if (!data) return;
      _feedData = data;
      _renderFeed();
    }).catch(function (err) {
      if (err.message === "unauthorized") {
        _showAuth();
      } else {
        _renderFeed();
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
        _deriveKey(pwd).then(function(key) {
          _cryptoKey = key;
        }).catch(function() {});
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
        '<div class="feed-empty-icon">🚫</div>' +
        '<p data-i18n="feed.blocked">' + __('feed.blocked') + '</p>' +
      '</div>';
  }

  function _showError(err) {
    body.innerHTML =
      '<div class="feed-empty">' +
        '<div class="feed-empty-icon">⚠️</div>' +
        '<p>' + __('feed.error') + ' ' + (err.message || __('feed.unknown')) + '</p>' +
      '</div>';
  }

  function _escape(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ===== Try to restore token and derive key on boot ===== */
  function _boot() {
    try {
      var saved = localStorage.getItem("feed_token");
      if (saved) {
        _token = saved;
        _deriveKey(saved).then(function(key) {
          _cryptoKey = key;
        }).catch(function() {});
      }
    } catch (e) {}
  }
  _boot();

  /* ===== Window ===== */
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
