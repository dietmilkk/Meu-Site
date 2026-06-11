(function () {
  "use strict";

  var win = document.getElementById("scWindow");
  var body = document.getElementById("scBody");
  var dragHandle = document.getElementById("scDragHandle");
  var btnClose = document.getElementById("scBtnClose");
  var btnMinimize = document.getElementById("scBtnMinimize");
  var btnMaximize = document.getElementById("scBtnMaximize");

  var $ = function (id) {
    return document.getElementById(id);
  };

  var elArtImg = $("scArtImg");
  var elArtOv = $("scArtOverlay");
  var elTrackName = $("scTrackName");
  var elArtistName = $("scArtistName");
  var elBtnPlay = $("scBtnPlay");
  var elPlayIcon = $("scPlayIcon");
  var elPauseIcon = $("scPauseIcon");
  var elBtnNext = $("scBtnNext");
  var elBtnPrev = $("scBtnPrev");
  var elBtnShuffle = $("scBtnShuffle");
  var elProgressFill = $("scProgressFill");
  var elProgressThumb = $("scProgressThumb");
  var elProgressBar = $("scProgressBar");
  var elTimeCurrent = $("scTimeCurrent");
  var elTimeTotal = $("scTimeTotal");
  var elStatus = $("scStatus");
  var elPlaylistItems = $("scPlaylistItems");
  var elTrackCounter = $("scTrackCounter");
  var elTrackList = $("scTrackList");
  var elIframeWrap = $("scIframeWrap");
  var elNowPlaying = $("scNowPlaying");

  var currentTrackIndex = 0;
  var totalTracks = 0;
  var trackList = [];
  var isPlaying = false;
  var duration = 0;
  var position = 0;
  var pollTimer = null;
  var activePlaylistId = null;
  var shuffle = false;
  var dragging = false;
  var artworkCache = {};
  var metaCache = {};
  var currentFullSound = null;
  var playlistStates = {};

  var playlists = [
    { id: "br", label: "br", url: "https://soundcloud.com/cu11/sets/lbo" },
    {
      id: "soundscape",
      label: "soundscape",
      url: "https://soundcloud.com/cu11/sets/zd2",
    },
    { id: "bass", label: "bass", url: "https://soundcloud.com/cu11/sets/3mk" },
    {
      id: "58v",
      label: "guitar",
      url: "https://soundcloud.com/cu11/sets/58v",
    },
    {
      id: "7kp",
      label: "emotion",
      url: "https://soundcloud.com/cu11/sets/7kp",
    },
    {
      id: "vv4",
      label: "energy",
      url: "https://soundcloud.com/cu11/sets/vv4",
    },
  ];

  var widgets = {};
  var widgetReadies = {};
  var loadingPlaylist = false;
  var customPlaylists = [];
  var nextCustomId = 1;

  function plURL(url) {
    return (
      "https://w.soundcloud.com/player/?url=" +
      encodeURIComponent(url) +
      "&auto_play=false&show_artwork=true&visual=false&hide_related=true&" +
      "show_comments=false&show_user=false&show_reposts=false&sharing=false&liking=false&download=false"
    );
  }

  function artworkSuffix() {
    var p = document.getElementById("scPlayer");
    if (p && p.getBoundingClientRect().width >= 700) return "-t250x250";
    return "-t120x120";
  }

  /* ===== Compatibility layer for Widget API method names ===== */
  var wMethods = {};

  function detectMethods(w) {
    var m = {};
    var checks = {
      getIdx: ["getCurrentTrackIndex", "getCurrentSoundIndex"],
      skip: ["skipTo", "skip"],
      next: ["next"],
      prev: ["prev"],
      play: ["play"],
      pause: ["pause"],
      toggle: ["toggle"],
      seekTo: ["seekTo"],
      getSounds: ["getSounds"],
      getCurrentSound: ["getCurrentSound"],
      getDuration: ["getDuration"],
      getPosition: ["getPosition"],
      isPaused: ["isPaused"],
      bind: ["bind"],
      toggleShuffle: ["toggleShuffle"],
      getShuffle: ["getShuffle"],
    };
    for (var key in checks) {
      for (var i = 0; i < checks[key].length; i++) {
        if (typeof w[checks[key][i]] === "function") {
          m[key] = checks[key][i];
          break;
        }
      }
    }
    wMethods = m;
  }

  function callWidgetMethod(w, methodKey) {
    var args = Array.prototype.slice.call(arguments, 2);
    var methodName = wMethods[methodKey];
    if (methodName && typeof w[methodName] === "function") {
      try { return w[methodName].apply(w, args); } catch (e) {}
      return;
    }
    var checks = {
      getIdx: ["getCurrentTrackIndex", "getCurrentSoundIndex"],
      skip: ["skipTo", "skip"],
      next: ["next"],
      prev: ["prev"],
      play: ["play"],
      pause: ["pause"],
      toggle: ["toggle"],
      seekTo: ["seekTo"],
      getSounds: ["getSounds"],
      getCurrentSound: ["getCurrentSound"],
      getDuration: ["getDuration"],
      getPosition: ["getPosition"],
      isPaused: ["isPaused"],
      bind: ["bind"],
      toggleShuffle: ["toggleShuffle"],
      getShuffle: ["getShuffle"],
    };
    var candidates = checks[methodKey] || [methodKey];
    for (var i = 0; i < candidates.length; i++) {
      if (typeof w[candidates[i]] === "function") {
        try { return w[candidates[i]].apply(w, args); } catch (e) {}
        return;
      }
    }
  }

  function wCall(methodKey) {
    if (!widgets[activePlaylistId]) return;
    var w = widgets[activePlaylistId];
    var args = [w, methodKey];
    for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
    callWidgetMethod.apply(null, args);
  }

  function wCallCb(methodKey, callback) {
    if (!widgets[activePlaylistId] || typeof callback !== "function") return;
    var w = widgets[activePlaylistId];
    var methodName = wMethods[methodKey];
    if (methodName && typeof w[methodName] === "function") {
      try { w[methodName](callback); } catch (e) {}
      return;
    }
    var checks = {
      getIdx: ["getCurrentTrackIndex", "getCurrentSoundIndex"],
      skip: ["skipTo", "skip"],
      next: ["next"],
      prev: ["prev"],
      play: ["play"],
      pause: ["pause"],
      toggle: ["toggle"],
      seekTo: ["seekTo"],
      getSounds: ["getSounds"],
      getCurrentSound: ["getCurrentSound"],
      getDuration: ["getDuration"],
      getPosition: ["getPosition"],
      isPaused: ["isPaused"],
      bind: ["bind"],
      toggleShuffle: ["toggleShuffle"],
      getShuffle: ["getShuffle"],
    };
    var candidates = checks[methodKey] || [methodKey];
    for (var i = 0; i < candidates.length; i++) {
      if (typeof w[candidates[i]] === "function") {
        try { w[candidates[i]](callback); } catch (e) {}
        return;
      }
    }
  }

  function _loadSCAPI(cb) {
    if (typeof SC !== "undefined") { cb(); return; }
    var s = document.createElement("script");
    s.src = "https://w.soundcloud.com/player/api.js";
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  function showStatus(msg) {
    if (elStatus) elStatus.textContent = msg;
  }
  function hideStatus() {
    if (elStatus) elStatus.textContent = "";
  }

  function fmt(ms) {
    if (!ms || ms < 0) return "0:00";
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ===== Playlist sidebar ===== */
  function renderPlaylists() {
    if (!elPlaylistItems) return;
    elPlaylistItems.innerHTML = "";

    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var e = document.createElement("div");
        e.className =
          "sc-playlist-item" +
          (pl.id === activePlaylistId ? " sc-playlist-item-active" : "");
        var label = document.createElement("span");
        label.className = "sc-playlist-item-label";
        label.textContent = pl.label;
        e.appendChild(label);
        var rm = document.createElement("span");
        rm.className = "sc-playlist-remove";
        rm.innerHTML =
          '<svg viewBox="0 0 10 10" width="10" height="10"><line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.2"/><line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.2"/></svg>';
        rm.addEventListener("click", function (e) {
          e.stopPropagation();
          removePlaylist(pl.id);
        });
        if (pl.id && pl.id.indexOf("custom_") === 0) {
          e.appendChild(rm);
        }
        e.addEventListener("click", function () {
          if (typeof playClickSnd === 'function') playClickSnd();
          switchPlaylist(pl.id);
        });
        elPlaylistItems.appendChild(e);
      })(playlists[i]);
    }

    var addBtn = document.createElement("button");
    addBtn.className = "sc-playlist-add";
    addBtn.title = __('soundcloud.addPlaylist');
    addBtn.innerHTML =
      '<svg viewBox="0 0 10 10" width="10" height="10"><line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5"/></svg>';
    addBtn.addEventListener("click", showAddDialog);
    elPlaylistItems.appendChild(addBtn);

    renderMobilePlaylists();
  }

  function renderMobilePlaylists() {
    var bar = document.querySelector(".sc-mobile-playlist-bar");
    if (!bar) return;
    bar.innerHTML = "";
    var isMob = document.body.classList.contains("mobile-mode");
    bar.style.display = isMob ? "" : "none";
    if (!isMob) return;

    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var btn = document.createElement("button");
        btn.className =
          "sc-mobile-playlist-btn" +
          (pl.id === activePlaylistId ? " sc-mobile-playlist-btn-active" : "");
        btn.textContent = pl.label;
        btn.addEventListener("click", function () {
          if (typeof playClickSnd === 'function') playClickSnd();
          switchPlaylist(pl.id);
        });
        bar.appendChild(btn);
      })(playlists[i]);
    }
  }

  function showAddDialog() {
    xpDialog({
      title: __('soundcloud.addTitle'),
      icon: '<img src="system/assets/icons/tango2kde/32x32/filesystems/folder_sound_blue.png" alt="" width="32" height="32">',
      type: "prompt",
      message: __('soundcloud.addMsg'),
      defaultValue: "",
      width: "400px",
      callback: function (val) {
        if (val) {
          var safe = false;
          try {
            var u = new URL(val);
            safe = u.protocol === "https:" && u.hostname === "soundcloud.com";
          } catch (e) {}
          if (safe) addPlaylist(val);
        }
      },
    });
  }

  function addPlaylist(url) {
    var id = "custom_" + nextCustomId++;
    var label =
      url.split("/sets/")[1] ||
      url.split("/").pop() ||
      __('soundcloud.playlistPrefix') + nextCustomId;
    if (label.length > 20) label = label.substring(0, 20);
    var pl = { id: id, label: label, url: url, "default": false };
    customPlaylists.push(pl);
    playlists.push(pl);
    saveCustomPlaylists();
    createWidgetForPlaylist(pl);
    renderPlaylists();
  }

  function removePlaylist(id) {
    var pl = null;
    var idx = -1;
    for (var i = 0; i < playlists.length; i++) {
      if (playlists[i].id === id) {
        pl = playlists[i];
        idx = i;
        break;
      }
    }
    if (!pl) return;
    if (pl.default !== false) {
      for (var i = 0; i < customPlaylists.length; i++) {
        if (customPlaylists[i].id === id) {
          customPlaylists.splice(i, 1);
          break;
        }
      }
    }
    playlists.splice(idx, 1);
    if (widgets[id]) {
      var iframe =
        elIframeWrap &&
        elIframeWrap.querySelector('iframe[data-pl-id="' + id + '"]');
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
      delete widgets[id];
      delete widgetReadies[id];
    }
    if (id === activePlaylistId) {
      activePlaylistId = null;
      for (var i = 0; i < playlists.length; i++) {
        if (widgets[playlists[i].id] && widgetReadies[playlists[i].id]) {
          switchPlaylist(playlists[i].id);
          break;
        }
      }
    }
    if (pl.default === false) saveCustomPlaylists();
    renderPlaylists();
  }

  function saveCustomPlaylists() {
    try {
      localStorage.setItem(
        "scCustomPlaylists",
        JSON.stringify({ list: customPlaylists, nextId: nextCustomId }),
      );
    } catch (e) {}
  }

  function createWidgetForPlaylist(pl) {
    if (!elIframeWrap) return;
    var iframe = document.createElement("iframe");
    iframe.src = plURL(pl.url);
    iframe.width = "100%";
    iframe.height = "166";
    iframe.frameBorder = "no";
    iframe.scrolling = "no";
    iframe.style.position = "absolute";
    iframe.style.left = "0";
    iframe.style.top = "0";
    iframe.style.width = "400px";
    iframe.style.height = "166px";
    iframe.dataset.plId = pl.id;
    elIframeWrap.appendChild(iframe);
    detectMethods(SC.Widget(iframe));
    var w = SC.Widget(iframe);
    widgets[pl.id] = w;
    widgetReadies[pl.id] = false;
    w.bind(SC.Widget.Events.READY, function () {
      widgetReadies[pl.id] = true;
      applyVolumeToWidget(pl.id);
      (function poll() {
        var tries = arguments[0] || 0;
        w.getSounds(function (sounds) {
          if (sounds && sounds.length > 0) {
            playlistStates[pl.id] = {
              trackList: sounds,
              currentTrackIndex: 0,
              currentFullSound: null,
              metaCache: {},
              artworkCache: {},
              isPlaying: false,
            };
            if (pl.id === activePlaylistId) {
              trackList = sounds;
              totalTracks = sounds.length;
              updateCounter();
              renderTrackList();
              preloadArtwork();
              hideStatus();
              setTimeout(refreshFromWidget, 500);
              w.getCurrentSound(function (s) {
                if (s && s.title) updateFromSound(s);
              });
            }
          } else if (tries < 30) {
            setTimeout(function () {
              poll(tries + 1);
            }, 500);
          }
        });
      })(0);
    });
    w.bind(SC.Widget.Events.PLAY, function () {
      if (pl.id !== activePlaylistId) return;
      isPlaying = true;
      updatePlayBtn();
      startPoll();
      applyVolumeToWidget(pl.id);
      w.getCurrentSound(function (s) {
        if (s && s.title) updateFromSound(s);
      });
      setTimeout(refreshFromWidget, 200);
      setTimeout(function () { applyVolumeToWidget(pl.id); }, 100);
      setTimeout(function () { applyVolumeToWidget(pl.id); }, 500);
    });
    try { w.bind(SC.Widget.Events.ERROR, function (e) {
      if (pl.id !== activePlaylistId) return;
    }); } catch (e) {}
    try { w.bind(SC.Widget.Events.LOAD_PROGRESS, function () {
      if (pl.id !== activePlaylistId) return;
      applyVolumeToWidget(pl.id);
    }); } catch (e) {}
    w.bind(SC.Widget.Events.PAUSE, function () {
      if (pl.id !== activePlaylistId) return;
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
    });
    w.bind(SC.Widget.Events.FINISH, function () {
      if (pl.id !== activePlaylistId) return;
      applyVolumeToWidget(pl.id);
      if (!shuffle) {
        currentTrackIndex = (currentTrackIndex + 1) % totalTracks;
        currentFullSound = null;
        displayTrack();
      }
      // When shuffle is on the widget auto-advances; PLAY event syncs the UI
    });
  }

  function switchPlaylist(id) {
    if (id === activePlaylistId) return;
    if (loadingPlaylist) return;
    if (!widgets[id] || !widgetReadies[id]) {
      loadingPlaylist = true;
      showStatus(__('soundcloud.loading'));
      var checkTimer = setInterval(function () {
        if (widgets[id] && widgetReadies[id]) {
          clearInterval(checkTimer);
          loadingPlaylist = false;
          hideStatus();
          switchPlaylist(id);
        }
      }, 200);
      setTimeout(function () {
        clearInterval(checkTimer);
        loadingPlaylist = false;
        hideStatus();
        if (!widgets[id] || !widgetReadies[id]) {
          showStatus(__('soundcloud.failed'));
        }
      }, 10000);
      return;
    }

    if (activePlaylistId) {
      playlistStates[activePlaylistId] = {
        trackList: trackList.slice(),
        currentTrackIndex: currentTrackIndex,
        currentFullSound: currentFullSound,
        metaCache: Object.assign({}, metaCache),
        artworkCache: Object.assign({}, artworkCache),
        isPlaying: isPlaying,
      };
    }

    activePlaylistId = id;
    syncActiveVolume();
    renderPlaylists();
    stopPoll();
    showAllIframes();
    detectMethods(widgets[activePlaylistId]);

    var saved = playlistStates[id];
    if (saved) {
      trackList = saved.trackList;
      currentTrackIndex = saved.currentTrackIndex;
      currentFullSound = saved.currentFullSound;
      metaCache = saved.metaCache;
      artworkCache = saved.artworkCache;
      totalTracks = trackList.length;
      renderTrackList();
      displayTrack();
      updateCounter();
      preloadArtwork();
      refreshHighlight();
      isPlaying = saved.isPlaying || false;
      updatePlayBtn();
      if (isPlaying) startPoll();

      wCallCb("isPaused", function (paused) {
        if (paused === false) {
          if (!isPlaying) {
            isPlaying = true;
            updatePlayBtn();
            startPoll();
          }
        } else if (paused === true) {
          if (isPlaying) {
            isPlaying = false;
            updatePlayBtn();
            stopPoll();
          }
        }
      });
      wCallCb("getPosition", function (p) {
        if (p >= 0) {
          position = p;
          elTimeCurrent.textContent = fmt(p);
        }
      });
      wCallCb("getDuration", function (d) {
        if (d > 0) {
          duration = d;
          elTimeTotal.textContent = fmt(d);
        }
      });
      wCallCb("getCurrentSound", function (s) {
        if (s && s.title) updateFromSound(s);
      });
      wCallCb("getIdx", function (idx) {
        if (idx >= 0 && idx < totalTracks) {
          currentTrackIndex = idx;
          displayTrack();
          refreshHighlight();
          updateCounter();
        }
      });
    } else {
      trackList = [];
      totalTracks = 0;
      currentTrackIndex = -1;
      artworkCache = {};
      metaCache = {};
      currentFullSound = null;
      isPlaying = false;
      updatePlayBtn();
      position = 0;
      duration = 0;
      elTimeCurrent.textContent = "0:00";
      elTimeTotal.textContent = "0:00";
      updateBar();
      renderTrackList();
      updateCounter();
      elTrackName.textContent = __('soundcloud.loadingTrack');
      elArtistName.textContent = "";
      setArt(null);
      refreshHighlight();
      var tries = 0;
      var loadTimer = setTimeout(function () {
        elTrackName.textContent = __('soundcloud.failedTrack');
      }, 15000);

      (function poll() {
        tries++;
        wCallCb("getSounds", function (sounds) {
          if (sounds && sounds.length > 0) {
            clearTimeout(loadTimer);
            trackList = sounds;
            totalTracks = sounds.length;
            currentTrackIndex = 0;
            updateCounter();
            renderTrackList();
            preloadArtwork();
            displayTrack();
          } else if (tries < 30) {
            setTimeout(poll, 500);
          }
        });
      })();
    }
  }

  /* ===== Volume sync ===== */
  function syncActiveVolume() {
    applyVolumeToWidget(activePlaylistId);
  }

  window.setSoundCloudVolume = function (v) {
    if (typeof v !== "number" || isNaN(v)) return;
    var boost = 3.0;
    v = Math.max(0, Math.min(boost, v * boost));
    for (var id in widgets) {
      if (widgets[id]) {
        try {
          widgets[id].setVolume(v);
        } catch (e) {}
      }
    }
  };

  function applyVolumeToWidget(id) {
    if (!widgets[id]) return;
    var v = typeof window.getPageVolume === "function" ? window.getPageVolume() : 1;
    if (typeof v !== "number" || isNaN(v)) v = 1;
    var boost = 3.0;
    try {
      widgets[id].setVolume(Math.max(0, Math.min(boost, v * boost)));
    } catch (e) {}
  }

  setInterval(function () { syncActiveVolume(); }, 500);

  function showAllIframes() {
    if (!elIframeWrap) return;
    for (var i = 0; i < elIframeWrap.children.length; i++) {
      var c = elIframeWrap.children[i];
      if (c.tagName === "IFRAME") {
        c.style.visibility =
          c.dataset.plId === activePlaylistId ? "visible" : "hidden";
      }
    }
  }

  function initWidgets() {
    _loadSCAPI(function() {
    if (typeof SC === "undefined") {
      setTimeout(initWidgets, 500);
      return;
    }
    elIframeWrap = elIframeWrap || document.getElementById("scIframeWrap");
    if (!elIframeWrap) {
      setTimeout(initWidgets, 500);
      return;
    }

    var anyReady = false;
    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var iframe = document.createElement("iframe");
        iframe.src = plURL(pl.url);
        iframe.width = "100%";
        iframe.height = "166";
        iframe.frameBorder = "no";
        iframe.scrolling = "no";
        iframe.style.position = "absolute";
        iframe.style.left = "0";
        iframe.style.top = "0";
        iframe.style.width = "400px";
        iframe.style.height = "166px";
        iframe.dataset.plId = pl.id;
        elIframeWrap.appendChild(iframe);

        var w = SC.Widget(iframe);
        widgets[pl.id] = w;
        widgetReadies[pl.id] = false;

        w.bind(SC.Widget.Events.READY, function () {
          widgetReadies[pl.id] = true;
          applyVolumeToWidget(pl.id);
          if (!anyReady) {
            anyReady = true;
            activePlaylistId = pl.id;
            renderPlaylists();
            (function poll() {
              var tries = arguments[0] || 0;
              w.getSounds(function (sounds) {
                if (sounds && sounds.length > 0) {
                  trackList = sounds;
                  totalTracks = sounds.length;
                  updateCounter();
                  renderTrackList();
                  preloadArtwork();
                  hideStatus();
                  setTimeout(refreshFromWidget, 500);
                } else if (tries < 30) {
                  setTimeout(function () {
                    poll(tries + 1);
                  }, 500);
                }
              });
            })(0);
            w.getCurrentSound(function (s) {
              if (s && s.title) updateFromSound(s);
            });
          }
        });

    w.bind(SC.Widget.Events.PLAY, function () {
      if (pl.id !== activePlaylistId) return;
      isPlaying = true;
      updatePlayBtn();
      startPoll();
      syncActiveVolume();
      w.getCurrentSound(function (s) {
        if (s && s.title) updateFromSound(s);
      });
      setTimeout(refreshFromWidget, 200);
      setTimeout(function () { syncActiveVolume(); }, 100);
      setTimeout(function () { syncActiveVolume(); }, 500);
    });
    try { w.bind(SC.Widget.Events.ERROR, function (e) {
      if (pl.id !== activePlaylistId) return;
    }); } catch (e) {}
    try { w.bind(SC.Widget.Events.LOAD_PROGRESS, function () {
      if (pl.id !== activePlaylistId) return;
      syncActiveVolume();
    }); } catch (e) {}
    w.bind(SC.Widget.Events.PAUSE, function () {
      if (pl.id !== activePlaylistId) return;
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
    });
    w.bind(SC.Widget.Events.FINISH, function () {
      if (pl.id !== activePlaylistId) return;
      syncActiveVolume();
      if (!shuffle) {
        currentTrackIndex = (currentTrackIndex + 1) % totalTracks;
        currentFullSound = null;
        displayTrack();
      }
    });
      })(playlists[i]);
    }

    // Timeout fallback
    var checkReady = setInterval(function () {
      for (var k in widgetReadies) {
        if (widgetReadies[k]) {
          clearInterval(checkReady);
          return;
        }
      }
    }, 1000);
    setTimeout(function () {
      clearInterval(checkReady);
    }, 30000);
  });
  }

  /* ===== Track list ===== */
  function renderTrackList() {
    if (!elTrackList) return;
    for (var i = elTrackList.children.length - 1; i >= 0; i--) {
      var c = elTrackList.children[i];
      if (!c.classList || !c.classList.contains("sc-status")) {
        elTrackList.removeChild(c);
      }
    }
    for (var i = 0; i < trackList.length; i++) {
      (function (idx) {
        var e = document.createElement("div");
        var t = trackList[idx].title;
        if (!t && metaCache[idx]) t = metaCache[idx].title;
        e.textContent = t || __('soundcloud.trackPrefix') + (idx + 1);
        e.className = "sc-track-item";
        if (idx === currentTrackIndex) e.classList.add("sc-track-item-active");
        e.addEventListener("click", function () {
          if (typeof playClickSnd === 'function') playClickSnd();
          skipTrack(idx);
        });
        e.addEventListener("dblclick", function () {
          if (typeof playLaunchSnd === 'function') playLaunchSnd();
          skipTrack(idx);
          wCall("play");
        });
        elTrackList.appendChild(e);
      })(i);
    }
    scrollActive();
  }

  function updateTrackItem(idx) {
    if (!elTrackList || idx < 0) return;
    var items = elTrackList.querySelectorAll(".sc-track-item");
    if (idx < items.length) {
      var t = trackList[idx] && trackList[idx].title;
      if (!t && metaCache[idx]) t = metaCache[idx].title;
      items[idx].textContent = t || __('soundcloud.trackPrefix') + (idx + 1);
    }
  }

  function centerCurrentTrack() {
    if (!elTrackList) return;
    var a = elTrackList.querySelector(".sc-track-item-active");
    if (!a) return;
    var container = elTrackList;
    var cTop = container.getBoundingClientRect().top;
    var cH = container.clientHeight;
    var aTop = a.getBoundingClientRect().top;
    var aH = a.offsetHeight;
    container.scrollTop += aTop - cTop - cH / 2 + aH / 2;
  }

  function scrollActive() {
    centerCurrentTrack();
  }

  function refreshHighlight() {
    if (!elTrackList) return;
    var items = elTrackList.querySelectorAll(".sc-track-item");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle(
        "sc-track-item-active",
        i === currentTrackIndex,
      );
    }
  }

  function updateCounter() {
    if (elTrackCounter) {
      elTrackCounter.textContent =
        totalTracks > 0 ? currentTrackIndex + 1 + "/" + totalTracks : "-/-";
    }
  }

  /* ===== Display current track from trackList ===== */
  function displayTrack() {
    if (!trackList || !trackList[currentTrackIndex]) {
      setTimeout(displayTrack, 500);
      return;
    }
    var s = currentFullSound || trackList[currentTrackIndex];
    var mc = metaCache[currentTrackIndex];
    var title = s.title;
    if (!title && mc && mc.title) title = mc.title;
    elTrackName.textContent = title || __('soundcloud.trackPrefix') + (currentTrackIndex + 1);
    var artist = s.user && s.user.username;
    if (!artist && mc && mc.author_name) artist = mc.author_name;
    elArtistName.textContent = artist || __('soundcloud.defaultArtist');
    updateCounter();
    refreshHighlight();
    scrollActive();
    hideStatus();
    loadArt(currentTrackIndex);
    _updateNowPlaying();
  }

  function updateFromSound(s) {
    if (!s) return;
    currentFullSound = s;
    if (s.title) {
      elTrackName.textContent = s.title;
    }
    if (s.user && s.user.username) {
      elArtistName.textContent = s.user.username;
    }
    if (s.artwork_url) {
      var originalUrl = s.artwork_url;
      var n = s.artwork_url.replace(
        /-(large|t\d+x\d+)(\.\w+)$/,
        artworkSuffix() + "$2",
      );
      setArt(n, originalUrl);
      artworkCache[s.id || n] = n;
    }
    _updateNowPlaying();
  }

  function refreshFromWidget() {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) {
      setTimeout(refreshFromWidget, 500);
      return;
    }
    detectMethods(widgets[activePlaylistId]);
    wCallCb("getIdx", function (idx) {
      if (idx !== null && idx !== undefined && idx !== currentTrackIndex) {
        currentTrackIndex = idx;
        currentFullSound = null;
        displayTrack();
      }
    });
    wCallCb("getDuration", function (d) {
      if (d > 0) {
        duration = d;
        elTimeTotal.textContent = fmt(d);
      }
    });
    wCallCb("getPosition", function (p) {
      if (p >= 0) {
        position = p;
        elTimeCurrent.textContent = fmt(p);
      }
    });
  }

  /* ===== Manual track tracking ===== */
  function nextTrack() {
    if (totalTracks === 0) return;
    if (shuffle) {
      currentFullSound = null;
      wCall("next");
      return;
    }
    currentTrackIndex = (currentTrackIndex + 1) % totalTracks;
    currentFullSound = null;
    wCall("next");
    displayTrack();
  }

  function prevTrack() {
    if (totalTracks === 0) return;
    if (shuffle) {
      currentFullSound = null;
      wCall("prev");
      return;
    }
    currentTrackIndex = (currentTrackIndex - 1 + totalTracks) % totalTracks;
    currentFullSound = null;
    wCall("prev");
    displayTrack();
  }

  function skipTrack(idx) {
    if (idx < 0 || idx >= totalTracks) return;
    currentTrackIndex = idx;
    currentFullSound = null;
    detectMethods(widgets[activePlaylistId]);
    wCall("skip", idx);
    displayTrack();
  }

  /* ===== Artwork & Metadata ===== */
  function trackPermalink(s) {
    if (!s) return null;
    if (s.permalink_url) return s.permalink_url;
    if (s.user && s.user.username && s.permalink)
      return "https://soundcloud.com/" + s.user.username + "/" + s.permalink;
    if (s.id) return "https://api.soundcloud.com/tracks/" + s.id;
    return null;
  }

  function oembedJsonp(trackId, idx) {
    var cb = "sco" + idx;
    window[cb] = function (d) {
      delete window[cb];
      if (!d || !d.title) return;
      if (!metaCache[idx]) metaCache[idx] = {};
      metaCache[idx].title = d.title;
      if (d.author_name) metaCache[idx].author_name = d.author_name;
      updateTrackItem(idx);
      if (idx === currentTrackIndex) displayTrack();
    };
    var s = document.createElement("script");
    s.src =
      "https://soundcloud.com/oembed?format=js&callback=" +
      cb +
      "&url=" +
      encodeURIComponent("https://api.soundcloud.com/tracks/" + trackId);
    document.head.appendChild(s);
  }

  function preloadArtwork() {
    if (!trackList) return;
    for (var pi = 0; pi < trackList.length; pi++) {
      var snd = trackList[pi];
      var pl = trackPermalink(snd);
      if (!pl || artworkCache[pl]) continue;
      var au = snd.artwork_url;
      if (au) {
        var n = au.replace(/-(large|t\d+x\d+)(\.\w+)$/, artworkSuffix() + "$2");
        artworkCache[pl] = n;
      }
      if (snd.title) {
        if (!metaCache[pi]) metaCache[pi] = {};
        metaCache[pi].title = snd.title;
      } else if (snd.id) {
        oembedJsonp(snd.id, pi);
      }
    }
  }

  function loadArt(idx) {
    var sound = currentFullSound || (trackList && trackList[idx]) || null;
    if (!sound) {
      if (trackList && trackList.length === 0) {
        setTimeout(function () {
          loadArt(idx);
        }, 800);
      }
      elArtImg.style.display = "none";
      return;
    }

    if (sound.id && artworkCache[sound.id]) {
      setArt(artworkCache[sound.id]);
      return;
    }

    var pl = trackPermalink(sound);
    if (pl && artworkCache[pl]) {
      setArt(artworkCache[pl]);
      return;
    }

    var artUrl = sound.artwork_url;
    if (artUrl) {
      var originalUrl = artUrl;
      var norm = artUrl.replace(
        /-(large|t\d+x\d+)(\.\w+)$/,
        artworkSuffix() + "$2",
      );
      if (sound.id) artworkCache[sound.id] = norm;
      else if (pl) artworkCache[pl] = norm;
      setArt(norm, originalUrl);
      return;
    }

    if (!currentFullSound) {
      setTimeout(function () { loadArt(idx); }, 600);
      return;
    }

    elArtImg.style.display = "none";
  }

  var _artFallbackSrc = null;
  function setArt(src, fallback) {
    if (!src) {
      elArtImg.style.display = "none";
      return;
    }
    _artFallbackSrc = fallback || null;
    elArtImg.onerror = function () {
      if (_artFallbackSrc) {
        var fb = _artFallbackSrc;
        _artFallbackSrc = null;
        elArtImg.onerror = null;
        setArt(fb);
        return;
      }
      elArtImg.style.display = "none";
    };
    elArtImg.onload = function () {};
    elArtImg.src = src;
    elArtImg.style.display = "block";
  }

  /* ===== Progress ===== */
  function startPoll() {
    stopPoll();
    pollTimer = setInterval(function () {
      if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId])
        return;
      detectMethods(widgets[activePlaylistId]);
      wCallCb("getPosition", function (p) {
        if (p >= 0) {
          position = p;
          elTimeCurrent.textContent = fmt(p);
        }
      });
      wCallCb("getDuration", function (d) {
        if (d > 0) {
          duration = d;
          elTimeTotal.textContent = fmt(d);
        }
      });
      updateBar();
    }, 150);
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function updateBar() {
    var pct = duration > 0 ? (position / duration) * 100 : 0;
    if (pct > 100) pct = 100;
    if (pct < 0) pct = 0;
    elProgressFill.style.width = pct + "%";
    elProgressThumb.style.left = "calc(" + pct + "% - 4px)";
  }

  function seekPct(pct) {
    if (
      !widgets[activePlaylistId] ||
      !widgetReadies[activePlaylistId] ||
      duration <= 0
    )
      return;
    wCall("seekTo", pct * duration);
  }

  /* ===== Draggable seek ===== */
  function seekFromEvent(e) {
    if (
      !widgets[activePlaylistId] ||
      !widgetReadies[activePlaylistId] ||
      duration <= 0
    )
      return;
    var r = elProgressBar.getBoundingClientRect();
    var pct = (e.clientX - r.left) / r.width;
    seekPct(pct);
    var pctClamp = Math.max(0, Math.min(1, pct));
    elProgressFill.style.width = pctClamp * 100 + "%";
    elProgressThumb.style.left = "calc(" + pctClamp * 100 + "% - 4px)";
  }

  elProgressBar.addEventListener("mousedown", function (e) {
    if (e.target === elProgressThumb) return;
    dragging = true;
    seekFromEvent(e);
  });

  document.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    seekFromEvent(e);
  });

  document.addEventListener("mouseup", function () {
    dragging = false;
  });

  /* ===== Force button press/release (reliable :active replacement) ===== */
  function wirePress(el) {
    if (!el) return;
    el.addEventListener('mousedown', function() { el.classList.add('sc-pressed'); });
    el.addEventListener('mouseup', function() { el.classList.remove('sc-pressed'); });
    el.addEventListener('mouseleave', function() { el.classList.remove('sc-pressed'); });
    el.addEventListener('touchstart', function() { el.classList.add('sc-pressed'); }, { passive: true });
    el.addEventListener('touchend', function() { el.classList.remove('sc-pressed'); });
    el.addEventListener('touchcancel', function() { el.classList.remove('sc-pressed'); });
  }
  wirePress(elBtnPlay);
  wirePress(elBtnNext);
  wirePress(elBtnPrev);
  if (elBtnShuffle) wirePress(elBtnShuffle);

  /* ===== Buttons ===== */
  elBtnPlay.addEventListener("click", function () {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) return;
    detectMethods(widgets[activePlaylistId]);
    if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
    wCall("toggle");
    syncActiveVolume();
  });

  elBtnNext.addEventListener("click", function () {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) return;
    if (typeof playClickSnd === 'function') playClickSnd();
    nextTrack();
  });

  elBtnPrev.addEventListener("click", function () {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) return;
    if (typeof playClickSnd === 'function') playClickSnd();
    prevTrack();
  });

  if (elBtnShuffle) {
    elBtnShuffle.addEventListener("click", function () {
      shuffle = !shuffle;
      elBtnShuffle.classList.toggle("sc-btn-shuffle-active", shuffle);
      detectMethods(widgets[activePlaylistId]);
      wCall("toggleShuffle");
      if (typeof playToggleOnSnd === 'function') {
        shuffle ? playToggleOnSnd() : playToggleOffSnd();
      }
    });
  }

  if (elArtOv) {
    elArtOv.addEventListener("click", function () {
      if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId])
        return;
      wCall("toggle");
      if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
    });
  }

  /* ===== Wide layout detection ===== */
  (function () {
    var el = document.getElementById("scPlayer");
    if (!el) return;
    function checkWidth() {
      el.classList.toggle("sc-wide", el.getBoundingClientRect().width >= 700);
    }
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(checkWidth).observe(el);
    }
    window.addEventListener("resize", function () {
      setTimeout(checkWidth, 50);
    });
    document.addEventListener("fullscreenchange", function () {
      setTimeout(checkWidth, 100);
    });
    checkWidth();
  })();

  /* ===== Keyboard ===== */
  document.addEventListener("keydown", function (e) {
    if (win.style.display === "none") return;
    if (!win.classList.contains("active")) return;
    if (!e.target.closest || !e.target.closest("#scWindow")) return;
    var k = e.key;
    if (k === " " || k === "Space") {
      e.preventDefault();
      if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
      wCall("toggle");
    }
    if (k === "ArrowRight") {
      e.preventDefault();
      if (typeof playClickSnd === 'function') playClickSnd();
      nextTrack();
    }
    if (k === "ArrowLeft") {
      e.preventDefault();
      if (typeof playClickSnd === 'function') playClickSnd();
      prevTrack();
    }
  });

  /* ===== Window ===== */
  var _scFirstShow = true;
  var behavior = new WindowBehavior(win, {
    dragHandle: dragHandle,
    btnClose: btnClose,
    btnMinimize: btnMinimize,
    btnMaximize: btnMaximize,
    minW: 300,
    minH: 400,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/apps/kaudiocreator.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __('soundcloud.title'),
    taskbarAction: 'soundcloud',
    appId: 'soundcloud',
    onShow: function () {
      if (!window._scWidgetsReady) {
        window._scWidgetsReady = true;
        initWidgets();
      }
      if (_scFirstShow) {
        _scFirstShow = false;
        if (!win.style.width || win.style.width === "") win.style.width = "444.5px";
        if (!win.style.height || win.style.height === "") win.style.height = "666px";
      }
      showAllIframes();
      if (typeof window.setSoundCloudVolume === 'function') {
        window.setSoundCloudVolume(typeof window.getPageVolume === 'function' ? window.getPageVolume() : 1);
      }
      if (activePlaylistId && widgets[activePlaylistId] && widgetReadies[activePlaylistId]) {
        if (isPlaying) startPoll();
        setTimeout(refreshFromWidget, 500);
        return;
      }
      if (!activePlaylistId) {
        for (var i = 0; i < playlists.length; i++) {
          if (widgetReadies[playlists[i].id]) {
            switchPlaylist(playlists[i].id);
            return;
          }
        }
      }
      setTimeout(refreshFromWidget, 500);
    },
    onHide: function () {
      stopPoll();
      if (elNowPlaying) elNowPlaying.classList.remove("visible");
      for (var _id in widgets) {
        if (widgets[_id] && widgetReadies[_id]) {
          try {
            var _w = widgets[_id];
            var _p = wMethods.pause || "pause";
            if (typeof _w[_p] === "function") _w[_p]();
            var _v = wMethods.setVolume || "setVolume";
            if (typeof _w[_v] === "function") _w[_v](0);
          } catch (e) {}
        }
      }
      isPlaying = false;
      if (typeof updatePlayBtn === 'function') updatePlayBtn();
    },

  });

  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("soundcloud", {
      label: __('soundcloud.title'),
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

  function updatePlayBtn() {
    if (isPlaying) {
      elPlayIcon.style.display = "none";
      elPauseIcon.style.display = "block";
      elBtnPlay.classList.add("sc-btn-play-active");
    } else {
      elPlayIcon.style.display = "block";
      elPauseIcon.style.display = "none";
      elBtnPlay.classList.remove("sc-btn-play-active");
    }
    _updateNowPlaying();
  }

  function _updateNowPlaying() {
    if (!elNowPlaying) return;
    if (isPlaying && elTrackName && elTrackName.textContent && elTrackName.textContent !== __('soundcloud.defaultTrack')) {
      var artSrc = elArtImg.style.display !== "none" ? elArtImg.src : '';
      elNowPlaying.innerHTML =
        '<span class="sc-now-playing-label">' + elTrackName.textContent + '</span>' +
        '<div class="sc-now-playing-menu" id="scNpMenu">' +
          (artSrc ? '<img class="sc-np-art" src="' + artSrc + '" alt="">' : '') +
          '<div class="sc-np-body">' +
            '<div class="sc-np-track" id="scNpTrack">' + elTrackName.textContent + '</div>' +
            '<div class="sc-np-buttons">' +
              '<button class="sc-np-btn" id="scNpPrev"><svg viewBox="0 0 16 16"><polygon points="3,8 13,2 13,14" fill="currentColor"/></svg></button>' +
              '<button class="sc-np-btn" id="scNpToggle">' +
                '<svg class="sc-np-play-icon" viewBox="0 0 16 16" style="display:' + (isPlaying ? 'none' : 'block') + '"><polygon points="4,2 14,8 4,14" fill="currentColor"/></svg>' +
                '<svg class="sc-np-pause-icon" viewBox="0 0 16 16" style="display:' + (isPlaying ? 'block' : 'none') + '"><rect x="3" y="2" width="4" height="12" fill="currentColor"/><rect x="9" y="2" width="4" height="12" fill="currentColor"/></svg>' +
              '</button>' +
              '<button class="sc-np-btn" id="scNpNext"><svg viewBox="0 0 16 16"><polygon points="13,8 3,2 3,14" fill="currentColor"/></svg></button>' +
            '</div>' +
          '</div>' +
        '</div>';
      elNowPlaying.classList.add("visible");
    } else {
      elNowPlaying.innerHTML = '';
      elNowPlaying.classList.remove("visible");
    }
  }

  function _setupNowPlaying() {
    if (!elNowPlaying) return;
    elNowPlaying.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (btn) {
        if (btn.id === "scNpToggle") {
          if (typeof playToggleOnSnd === 'function') playToggleOnSnd();
          wCall("toggle");
          syncActiveVolume();
        } else if (btn.id === "scNpNext") {
          if (typeof playClickSnd === 'function') playClickSnd();
          nextTrack();
        } else if (btn.id === "scNpPrev") {
          if (typeof playClickSnd === 'function') playClickSnd();
          prevTrack();
        }
        return;
      }
      var menu = document.getElementById("scNpMenu");
      if (menu) {
        var willShow = !menu.classList.contains("visible");
        menu.classList.toggle("visible");
        if (willShow) {
          var cp = document.getElementById("calendarPanel");
          if (cp) { cp.style.display = "none"; cp.classList.remove("cal-in", "cal-out"); }
          var vp = document.getElementById("volumePanel");
          if (vp) { vp.style.display = "none"; vp.classList.remove("vol-in", "vol-out"); }
        }
      }
      if (typeof playClickSnd === 'function') playClickSnd();
    });
    var _scObserver = new MutationObserver(function () {
      if (win.style.display === "none") {
        var m = document.getElementById("scNpMenu");
        if (m) m.classList.remove("visible");
      }
    });
    _scObserver.observe(win, { attributes: true, attributeFilter: ["style"] });
    document.addEventListener("click", function (e) {
      var menu = document.getElementById("scNpMenu");
      if (menu && menu.classList.contains("visible") && !elNowPlaying.contains(e.target)) {
        if (win.style.display === "none") {
          menu.classList.remove("visible");
        }
      }
    });
  }

  /* ===== Taskbar popup menu (removed — menu now lives in tray widget) ===== */

  /* ===== Custom playlists persistence ===== */
  function loadCustomPlaylists() {
    try {
      var d = JSON.parse(localStorage.getItem("scCustomPlaylists"));
      if (d && d.list) {
        customPlaylists = d.list;
        nextCustomId = d.nextId || 1;
      }
    } catch (e) {}
    for (var i = 0; i < customPlaylists.length; i++) {
      playlists.push(customPlaylists[i]);
    }
  }
  loadCustomPlaylists();

  /* ===== Init ===== */
  elArtImg.style.display = "none";

  var elMobilePlBar = document.createElement("div");
  elMobilePlBar.className = "sc-mobile-playlist-bar";
  var controlsRow = document.querySelector(".sc-controls-row");
  if (controlsRow && controlsRow.parentNode) {
    controlsRow.parentNode.insertBefore(elMobilePlBar, controlsRow.nextSibling);
  }

  renderPlaylists();
  _setupNowPlaying();
})();
