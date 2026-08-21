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
  var elBtnHidePl = $("scBtnHidePl");
  var elBtnHideArt = $("scBtnHideArt");
  var elProgressFill = $("scProgressFill");
  var elProgressThumb = $("scProgressThumb");
  var elProgressBar = $("scProgressBar");
  var elTimeCurrent = $("scTimeCurrent");
  var elTimeTotal = $("scTimeTotal");
  var elStatus = $("scStatus");
  var elPlaylistItems = $("scPlaylistItems");
  var elTrackCounter = $("scTrackCounter");
  var elTrackList = $("scTrackList");
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

  var playlists = [];
  var playlistData = {};
  var currentAudioUrl = null;
  var loadingPlaylist = false;
  var audio = null;

  var customPlaylists = [];
  var nextCustomId = 1;

  var _artModeActive = false;
  var _artModeTimer = null;
  var _artHeaderEl = null;
  var _artBarEl = null;
  var scPlayer = document.getElementById("scPlayer");

  var INDEX_URL = "assets/music/index.json";
  var BASE_MUSIC = "assets/music";

  function showStatus(msg) {
    if (elStatus) { elStatus.textContent = msg; elStatus.style.display = "block"; }
  }

  function hideStatus() {
    if (elStatus) { elStatus.style.display = "none"; }
  }

  function fmt(secs) {
    if (isNaN(secs) || secs < 0) return "0:00";
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function __(key) {
    if (typeof window._t === "function") return window._t(key);
    var fallback = {
      "soundcloud.title": "Music Player",
      "soundcloud.loading": "Loading...",
      "soundcloud.failed": "Failed to load",
      "soundcloud.loadingTrack": "Loading track...",
      "soundcloud.failedTrack": "Failed to load track",
      "soundcloud.defaultArtist": "Unknown artist",
      "soundcloud.trackPrefix": "Track ",
      "soundcloud.addPlaylist": "+ Add Playlist",
      "soundcloud.deletePlaylist": "Delete",
    };
    return fallback[key] || key;
  }

  /* ===== Audio element setup ===== */
  function initAudio() {
    audio = document.createElement("audio");
    audio.preload = "auto";
    audio.style.display = "none";
    body.appendChild(audio);

    audio.addEventListener("timeupdate", function () {
      position = audio.currentTime;
      elTimeCurrent.textContent = fmt(position);
      updateBar();
    });

    audio.addEventListener("loadedmetadata", function () {
      duration = audio.duration;
      elTimeTotal.textContent = fmt(duration);
    });

    audio.addEventListener("play", function () {
      isPlaying = true;
      updatePlayBtn();
      startPoll();
    });

    audio.addEventListener("pause", function () {
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
    });

    audio.addEventListener("ended", function () {
      nextTrack();
    });

    audio.addEventListener("error", function () {
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
      var track = trackList[currentTrackIndex];
      var isLocalFile = track && track.file && audio.src && audio.src.indexOf("assets/music/tracks") !== -1;
      if (isLocalFile && track && track.url) {
        // Tenta fallback via SoundCloud widget quando arquivo local não existe (Vercel sem .m4a)
        tryFallbackSoundCloud(track);
      }
    });

    // Connect equalizer if available
    if (typeof window._eqConnect === "function") {
      window._eqConnect(audio);
    }
  }

  function tryFallbackSoundCloud(track) {
    if (!track || !track.url) return;
    var wrap = document.getElementById("scIframeWrap");
    if (!wrap) return;
    if (wrap.dataset.fallbackFor === String(currentTrackIndex)) return;
    wrap.dataset.fallbackFor = String(currentTrackIndex);
    wrap.innerHTML = "";
    wrap.style.left = "0";
    wrap.style.top = "auto";
    wrap.style.bottom = "0";
    wrap.style.width = "100%";
    wrap.style.height = "166px";
    wrap.style.zIndex = "5";
    wrap.style.overflow = "hidden";
    var iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "166";
    iframe.scrolling = "no";
    iframe.frameBorder = "no";
    iframe.allow = "autoplay";
    iframe.src = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(track.url) + "&color=%23000080&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false";
    wrap.appendChild(iframe);
    isPlaying = true;
    updatePlayBtn();
  }

  /* ===== Playback ===== */

  async function playTrack(index) {
    if (!trackList[index]) return;

    var track = trackList[index];
    currentTrackIndex = index;
    displayTrack();
    updateCounter();

    audio.src = track.file;
    audio.currentTime = 0;
    try { await audio.play(); } catch (e) {
      var isLocalFile = track.file && track.file.indexOf("assets/music/tracks") !== -1;
      if (isLocalFile && track.url) {
        tryFallbackSoundCloud(track);
      }
    }
  }

  /* ===== Load index ===== */
  function processIndexData(data) {
    playlistData = data;
    playlists = [];
    for (var id in data) {
      playlists.push({ id: id, label: data[id].label, url: data[id].url });
    }

    for (var i = 0; i < customPlaylists.length; i++) {
      playlists.push(customPlaylists[i]);
    }

    renderPlaylists();
    hideStatus();

    if (playlists.length > 0) {
      switchPlaylist(playlists[0].id);
    }
  }

  async function loadIndexViaFetch() {
    var resp = await fetch(INDEX_URL);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.json();
  }

  function loadIndexViaScript() {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = INDEX_URL.replace(".json", ".js");
      script.onload = function () {
        var data = window.__MUSIC_INDEX;
        delete window.__MUSIC_INDEX;
        if (data) resolve(data);
        else reject(new Error("Script loaded but no data"));
      };
      script.onerror = function () {
        reject(new Error("Failed to load script"));
      };
      document.head.appendChild(script);
    });
  }

  async function loadIndex() {
    showStatus(__("soundcloud.loading"));
    try {
      var data = await loadIndexViaFetch();
      processIndexData(data);
    } catch (e) {
      console.warn("Fetch failed, trying script fallback:", e);
      try {
        var data = await loadIndexViaScript();
        processIndexData(data);
      } catch (e2) {
        console.error("Failed to load index (both methods):", e, e2);
        showStatus(__("soundcloud.failed"));
      }
    }
  }

  /* ===== Playlist switching ===== */
  function switchPlaylist(id) {
    if (loadingPlaylist) return;

    if (activePlaylistId && activePlaylistId !== id) {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      currentAudioUrl = null;
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
    }

    activePlaylistId = id;
    renderPlaylists();

    var pl = playlistData[id];
    if (pl && pl.tracks) {
      trackList = pl.tracks;
      totalTracks = trackList.length;
      currentTrackIndex = 0;
      position = 0;
      duration = 0;
      elTimeCurrent.textContent = "0:00";
      elTimeTotal.textContent = "0:00";
      updateBar();
      renderTrackList();
      displayTrack();
      updateCounter();
      refreshHighlight();
      hideStatus();
    } else {
      trackList = [];
      totalTracks = 0;
      currentTrackIndex = -1;
      renderTrackList();
      updateCounter();
      elTrackName.textContent = __("soundcloud.loadingTrack");
      elArtistName.textContent = "";
      setArt(null);
    }
  }

  /* ===== Volume sync ===== */
  window.setSoundCloudVolume = function (v) {
    if (typeof v !== "number" || isNaN(v)) return;
    v = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = v;
  };

  function syncActiveVolume() {
    var v = typeof window.getPageVolume === "function" ? window.getPageVolume() : 1;
    if (typeof v !== "number" || isNaN(v)) v = 1;
    v = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = v;
  }

  var _volInterval = null;
  function _startVolSync() {
    if (_volInterval) return;
    _volInterval = setInterval(function () { syncActiveVolume(); }, 500);
  }
  function _stopVolSync() {
    if (_volInterval) {
      clearInterval(_volInterval);
      _volInterval = null;
    }
  }
  _startVolSync();

  /* ===== Playlist sidebar ===== */
  function renderPlaylists() {
    if (!elPlaylistItems) return;
    var items = elPlaylistItems.querySelectorAll(".sc-pl-item");
    for (var i = items.length - 1; i >= 0; i--) items[i].remove();

    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var e = document.createElement("div");
        e.className = "sc-pl-item";
        if (pl.id === activePlaylistId) e.classList.add("sc-pl-item-active");
        e.textContent = pl.label;
        e.addEventListener("click", function () {
          if (typeof playClickSnd === "function") playClickSnd();
          switchPlaylist(pl.id);
        });
        elPlaylistItems.appendChild(e);
      })(playlists[i]);
    }
    renderMobilePlaylists();
  }

  function renderMobilePlaylists() {
    var existing = document.querySelectorAll(".sc-mobile-pl-item");
    for (var i = existing.length - 1; i >= 0; i--) existing[i].remove();

    var bar = document.querySelector(".sc-mobile-playlist-bar");
    if (!bar) return;
    var isMobile = document.body.classList.contains("mobile-mode");
    bar.style.display = isMobile ? "flex" : "none";
    if (!isMobile) return;

    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var e = document.createElement("span");
        e.className = "sc-mobile-pl-item";
        if (pl.id === activePlaylistId) e.classList.add("sc-mobile-pl-item-active");
        e.textContent = pl.label;
        e.addEventListener("click", function () {
          switchPlaylist(pl.id);
        });
        bar.appendChild(e);
      })(playlists[i]);
    }
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
        e.textContent = t || __("soundcloud.trackPrefix") + (idx + 1);
        e.className = "sc-track-item";
        if (idx === currentTrackIndex) e.classList.add("sc-track-item-active");
        e.addEventListener("click", function () {
          if (typeof playClickSnd === "function") playClickSnd();
          skipTrack(idx);
        });
        e.addEventListener("dblclick", function () {
          if (typeof playLaunchSnd === "function") playLaunchSnd();
          skipTrack(idx);
          audio.play();
        });
        elTrackList.appendChild(e);
      })(i);
    }
    scrollActive();
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
      items[i].classList.toggle("sc-track-item-active", i === currentTrackIndex);
    }
  }

  function updateCounter() {
    if (elTrackCounter) {
      elTrackCounter.textContent =
        totalTracks > 0 ? currentTrackIndex + 1 + "/" + totalTracks : "-/-";
    }
  }

  /* ===== Display current track ===== */
  function displayTrack() {
    if (!trackList || !trackList[currentTrackIndex]) {
      setTimeout(displayTrack, 500);
      return;
    }
    var s = trackList[currentTrackIndex];
    elTrackName.textContent = s.title || __("soundcloud.trackPrefix") + (currentTrackIndex + 1);
    elArtistName.textContent = s.artist || __("soundcloud.defaultArtist");
    updateCounter();
    refreshHighlight();
    scrollActive();
    hideStatus();
    loadArt(currentTrackIndex);
    _updateNowPlaying();
    updateArtUI();
  }

  /* ===== Navigation ===== */
  function nextTrack() {
    if (totalTracks === 0) return;
    var idx;
    if (shuffle) {
      idx = Math.floor(Math.random() * totalTracks);
    } else {
      idx = (currentTrackIndex + 1) % totalTracks;
    }
    playTrack(idx);
  }

  function prevTrack() {
    if (totalTracks === 0) return;
    var idx;
    if (shuffle) {
      idx = Math.floor(Math.random() * totalTracks);
    } else {
      idx = (currentTrackIndex - 1 + totalTracks) % totalTracks;
    }
    playTrack(idx);
  }

  function skipTrack(idx) {
    if (idx < 0 || idx >= totalTracks) return;
    playTrack(idx);
  }

  /* ===== Artwork ===== */
  function loadArt(idx) {
    var track = trackList && trackList[idx];
    if (!track || !track.artwork) {
      elArtImg.style.display = "none";
      return;
    }
    elArtImg.onload = function () {};
    elArtImg.onerror = function () {
      elArtImg.style.display = "none";
    };
    elArtImg.src = track.artwork;
    elArtImg.style.display = "block";
  }

  function setArt(src) {
    if (!src) {
      elArtImg.style.display = "none";
      return;
    }
    elArtImg.onerror = function () {
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
      if (!audio) return;
      position = audio.currentTime;
      elTimeCurrent.textContent = fmt(position);
      duration = audio.duration || 0;
      elTimeTotal.textContent = fmt(duration);
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
    if (!audio || duration <= 0) return;
    audio.currentTime = pct * duration;
  }

  /* ===== Draggable seek ===== */
  function seekFromEvent(e) {
    if (!audio || duration <= 0) return;
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

  /* ===== Force button press/release ===== */
  function wirePress(el) {
    if (!el) return;
    el.addEventListener("mousedown", function () { el.classList.add("sc-pressed"); });
    el.addEventListener("mouseup", function () { el.classList.remove("sc-pressed"); });
    el.addEventListener("mouseleave", function () { el.classList.remove("sc-pressed"); });
    el.addEventListener("touchstart", function () { el.classList.add("sc-pressed"); }, { passive: true });
    el.addEventListener("touchend", function () { el.classList.remove("sc-pressed"); });
    el.addEventListener("touchcancel", function () { el.classList.remove("sc-pressed"); });
  }
  wirePress(elBtnPlay);
  wirePress(elBtnNext);
  wirePress(elBtnPrev);
  if (elBtnShuffle) wirePress(elBtnShuffle);
  if (elBtnHidePl) wirePress(elBtnHidePl);
  if (elBtnHideArt) wirePress(elBtnHideArt);

  /* ===== Buttons ===== */
  elBtnPlay.addEventListener("click", function () {
    if (!audio) return;
    if (typeof playToggleOnSnd === "function") playToggleOnSnd();
    if (audio.paused) {
      if (!audio.src && trackList[currentTrackIndex]) {
        playTrack(currentTrackIndex);
      } else {
        audio.play();
      }
    } else {
      audio.pause();
    }
    syncActiveVolume();
  });

  elBtnNext.addEventListener("click", function () {
    if (typeof playClickSnd === "function") playClickSnd();
    nextTrack();
  });

  elBtnPrev.addEventListener("click", function () {
    if (typeof playClickSnd === "function") playClickSnd();
    prevTrack();
  });

  if (elBtnShuffle) {
    elBtnShuffle.addEventListener("click", function () {
      shuffle = !shuffle;
      elBtnShuffle.classList.toggle("sc-btn-shuffle-active", shuffle);
      if (typeof playToggleOnSnd === "function") {
        shuffle ? playToggleOnSnd() : playToggleOffSnd();
      }
    });
  }

  if (elBtnHidePl) {
    elBtnHidePl.addEventListener("click", function () {
      if (elBtnHidePl.disabled || scPlayer.classList.contains("sc-wide")) return;
      var hidden = scPlayer.classList.toggle("sc-hide-playlists");
      elBtnHidePl.classList.toggle("sc-btn-hidepl-active", hidden);
      if (typeof playToggleOnSnd === "function") {
        hidden ? playToggleOnSnd() : playToggleOffSnd();
      }
    });
  }

  if (elBtnHideArt) {
    elBtnHideArt.addEventListener("click", function () {
      if (elBtnHideArt.disabled || scPlayer.classList.contains("sc-wide")) return;
      if (scPlayer.classList.contains("sc-art-mode")) {
        exitArtMode();
      } else if (win.classList.contains("window-maximized")) {
        enterArtMode();
      } else {
        var hidden = scPlayer.classList.toggle("sc-hide-artwork");
        elBtnHideArt.classList.toggle("sc-btn-hideart-active", hidden);
        if (typeof playToggleOnSnd === "function") {
          hidden ? playToggleOnSnd() : playToggleOffSnd();
        }
      }
    });
  }

  if (elArtOv) {
    elArtOv.addEventListener("click", function () {
      if (!audio) return;
      if (typeof playToggleOnSnd === "function") playToggleOnSnd();
      if (audio.paused) {
        if (!audio.src && trackList[currentTrackIndex]) {
          playTrack(currentTrackIndex);
        } else {
          audio.play();
        }
      } else {
        audio.pause();
      }
    });
  }

  /* ===== Art mode (fullscreen album art view) ===== */
  function enterArtMode() {
    _artModeActive = true;
    scPlayer.classList.add("sc-art-mode");
    elBtnHideArt.classList.add("sc-btn-hideart-active");
    createArtUI();
    showArtControlsTemporarily();
    if (typeof playToggleOnSnd === "function") playToggleOnSnd();
  }

  function exitArtMode() {
    _artModeActive = false;
    scPlayer.classList.remove("sc-art-mode");
    scPlayer.classList.remove("sc-art-controls-show");
    elBtnHideArt.classList.remove("sc-btn-hideart-active");
    removeArtUI();
    clearTimeout(_artModeTimer);
    if (typeof playToggleOffSnd === "function") playToggleOffSnd();
  }

  function createArtUI() {
    removeArtUI();

    _artHeaderEl = document.createElement("div");
    _artHeaderEl.className = "sc-art-mode-header";
    _artHeaderEl.textContent = elTrackName ? elTrackName.textContent : "";
    scPlayer.appendChild(_artHeaderEl);

    _artBarEl = document.createElement("div");
    _artBarEl.className = "sc-art-mode-bar";
    _artBarEl.innerHTML =
      '<button class="sc-btn sc-btn-sm sc-art-prev" id="artBtnPrev">' +
      '<svg viewBox="0 0 16 16" width="11" height="11"><polygon points="3,8 13,2 13,14" fill="currentColor"/></svg></button>' +
      '<button class="sc-btn sc-btn-play" id="artBtnPlay">' +
      '<svg class="sc-np-play-icon" viewBox="0 0 16 16" width="13" height="13"><polygon points="4,2 14,8 4,14" fill="currentColor"/></svg>' +
      '<svg class="sc-np-pause-icon" viewBox="0 0 16 16" width="13" height="13" style="display:none"><rect x="3" y="2" width="4" height="12" fill="currentColor"/><rect x="9" y="2" width="4" height="12" fill="currentColor"/></svg></button>' +
      '<button class="sc-btn sc-btn-sm sc-art-next" id="artBtnNext">' +
      '<svg viewBox="0 0 16 16" width="11" height="11"><polygon points="13,8 3,2 3,14" fill="currentColor"/></svg></button>';
    scPlayer.appendChild(_artBarEl);

    var prevBtn = document.getElementById("artBtnPrev");
    var playBtn = document.getElementById("artBtnPlay");
    var nextBtn = document.getElementById("artBtnNext");

    if (prevBtn) { prevBtn.addEventListener("click", prevTrack); wirePress(prevBtn); }
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (typeof playToggleOnSnd === "function") playToggleOnSnd();
        if (audio.paused) {
          if (!audio.src && trackList[currentTrackIndex]) {
            playTrack(currentTrackIndex);
          } else { audio.play(); }
        } else { audio.pause(); }
        syncActiveVolume();
      });
      wirePress(playBtn);
    }
    if (nextBtn) { nextBtn.addEventListener("click", nextTrack); wirePress(nextBtn); }

    updateArtUI();
  }

  function removeArtUI() {
    if (_artHeaderEl) { _artHeaderEl.remove(); _artHeaderEl = null; }
    if (_artBarEl) { _artBarEl.remove(); _artBarEl = null; }
  }

  function updateArtUI() {
    if (!_artModeActive) return;
    if (_artHeaderEl) {
      _artHeaderEl.textContent = elTrackName ? elTrackName.textContent : "";
    }
    if (_artBarEl) {
      var playIcon = _artBarEl.querySelector(".sc-np-play-icon");
      var pauseIcon = _artBarEl.querySelector(".sc-np-pause-icon");
      if (playIcon) playIcon.style.display = isPlaying ? "none" : "block";
      if (pauseIcon) pauseIcon.style.display = isPlaying ? "block" : "none";
    }
  }

  function showArtControlsTemporarily() {
    if (!_artModeActive) return;
    scPlayer.classList.add("sc-art-controls-show");
    clearTimeout(_artModeTimer);
    _artModeTimer = setTimeout(function () {
      scPlayer.classList.remove("sc-art-controls-show");
    }, 3000);
  }

  /* ===== MDI child panels (movable/resizable, never overlapping) ===== */
  (function () {
    var topRow = document.getElementById("scTopRow");
    var plWin = document.getElementById("scPlaylistWin");
    var artWin = document.getElementById("scArtworkWin");
    if (!topRow || !plWin || !artWin) return;
    if (typeof window.createChildPanel !== "function") return;
    window.createChildPanel(plWin, {
      parent: topRow,
      handle: document.getElementById("scPlaylistDrag"),
      obstacle: artWin,
      gap: 6,
      minW: 140,
      minH: 80,
    });
    window.createChildPanel(artWin, {
      parent: topRow,
      handle: document.getElementById("scArtworkDrag"),
      obstacle: plWin,
      gap: 6,
      minW: 200,
      minH: 120,
    });
    plWin.classList.add("active");
  })();

  /* ===== Adaptive layout: desativado — sempre MDI janela-dentro-de-janela em todas as larguras ===== */
  (function () {
    var player = document.getElementById("scPlayer");
    var topRow = document.getElementById("scTopRow");
    var plWin = document.getElementById("scPlaylistWin");
    var artWin = document.getElementById("scArtworkWin");
    if (!player || !topRow || !plWin || !artWin) return;
    // janelas internas MDI ativas em qualquer largura (~389px e demais)
    return;

    var stacked = false;

    function blocked() {
      return (
        document.body.classList.contains("mobile-mode") ||
        player.classList.contains("sc-wide") ||
        player.classList.contains("sc-art-mode")
      );
    }

    function enterStacked() {
      stacked = true;
      player.classList.add("sc-stacked");
      var H = topRow.getBoundingClientRect().height;
      var h = Math.max(48, Math.min(H * 0.5, H - 132));
      artWin.style.height = h + "px";
    }

    function exitStacked() {
      stacked = false;
      player.classList.remove("sc-stacked");
      plWin.style.left = "";
      plWin.style.top = "";
      plWin.style.width = "";
      plWin.style.height = "";
      artWin.style.left = "";
      artWin.style.top = "";
      artWin.style.width = "";
      artWin.style.height = "";
    }

    function updateMode() {
      if (blocked()) {
        if (stacked) exitStacked();
        return;
      }
      var pr = topRow.getBoundingClientRect();
      var W = pr.width;
      if (!W) return;
      if (getComputedStyle(win).transform !== "none") return;
      if (!stacked) {
        var pl = plWin.getBoundingClientRect();
        var art = artWin.getBoundingClientRect();
        var need = pl.width + art.width + 18;
        if (need > W) {
          if (W < 450) {
            enterStacked();
            return;
          }
          var room = W - 18 - pl.width;
          if (room < 200) {
            artWin.style.width = Math.max(200, room) + "px";
            plWin.style.width = Math.max(140, W - 18 - Math.max(200, room)) + "px";
          }
        }
        var maxR = pr.left + W - 6;
        if (art.right > maxR) artWin.style.width = Math.max(200, maxR - art.left) + "px";
        if (pl.right > maxR) plWin.style.width = Math.max(140, maxR - pl.left) + "px";
      } else if (W >= 450) {
        exitStacked();
      }
    }

    function clampStack() {
      if (!stacked) return;
      var H = topRow.getBoundingClientRect().height;
      var h = Math.max(48, Math.min(parseFloat(artWin.style.height) || H * 0.5, H - 132));
      artWin.style.height = h + "px";
    }

    var splitter = document.createElement("div");
    splitter.className = "sc-splitter";
    topRow.insertBefore(splitter, plWin);
    var splitting = false;
    splitter.addEventListener("mousedown", function (e) {
      if (e.button !== 0 || !stacked) return;
      e.preventDefault();
      splitting = true;
    });
    document.addEventListener("mousemove", function (e) {
      if (!splitting) return;
      var r = topRow.getBoundingClientRect();
      var h = Math.max(48, Math.min(e.clientY - r.top - 6, r.height - 132));
      artWin.style.height = h + "px";
    });
    document.addEventListener("mouseup", function () {
      splitting = false;
    });
    document.addEventListener("mouseup", function () {
      setTimeout(updateMode, 60);
    });

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () {
        updateMode();
        clampStack();
      }).observe(topRow);
      window.addEventListener("resize", function () {
        setTimeout(function () {
          updateMode();
          clampStack();
        }, 60);
      });
    }
    updateMode();
  })();

  /* ===== Large layout >900px: track list ocupa esquerda, artwork 1x1 fixo ===== */
  (function () {
    var el = document.getElementById("scPlayer");
    if (!el) return;
    var winEl = document.getElementById("scWindow");
    function checkLarge() {
      var measure = winEl && winEl.getBoundingClientRect().width
        ? winEl.getBoundingClientRect().width
        : el.getBoundingClientRect().width;
      var large = measure >= 900;
      el.classList.toggle("sc-large", large);
    }
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(checkLarge).observe(el);
      if (winEl) new ResizeObserver(checkLarge).observe(winEl);
    }
    window.addEventListener("resize", function () {
      setTimeout(checkLarge, 50);
    });
    document.addEventListener("fullscreenchange", function () {
      setTimeout(checkLarge, 100);
    });
    checkLarge();
  })();

  /* ===== Keyboard (works when SC is the active window) ===== */
  document.addEventListener("keydown", function (e) {
    if (win.style.display === "none") return;
    if (!win.classList.contains("active")) return;
    var k = e.key;
    if (k === " " || k === "Space" || k === "k" || k === "K") {
      e.preventDefault();
      if (typeof playToggleOnSnd === "function") playToggleOnSnd();
      if (audio.paused) {
        if (!audio.src && trackList[currentTrackIndex]) {
          playTrack(currentTrackIndex);
        } else {
          audio.play();
        }
      } else {
        audio.pause();
      }
      return;
    }
    if (k === "ArrowRight" || k === "l" || k === "L") {
      e.preventDefault();
      if (typeof playClickSnd === "function") playClickSnd();
      nextTrack();
      return;
    }
    if (k === "ArrowLeft" || k === "j" || k === "J") {
      e.preventDefault();
      if (typeof playClickSnd === "function") playClickSnd();
      prevTrack();
      return;
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
    taskbarLabel: __("soundcloud.title"),
    taskbarAction: "soundcloud",
    appId: "soundcloud",
    onShow: function () {
      if (!audio) {
        initAudio();
        loadIndex();
      }
      if (_scFirstShow) {
        _scFirstShow = false;
        if (!win.style.width || win.style.width === "") win.style.width = "500px";
        if (!win.style.height || win.style.height === "") win.style.height = "800px";
      }
      if (typeof window.setSoundCloudVolume === "function") {
        window.setSoundCloudVolume(
          typeof window.getPageVolume === "function" ? window.getPageVolume() : 1
        );
      }
    },
    onHide: function () {
      stopPoll();
      if (_artModeActive) exitArtMode();
      if (elNowPlaying) elNowPlaying.classList.remove("visible");
      if (audio) {
        audio.pause();
        isPlaying = false;
        if (typeof updatePlayBtn === "function") updatePlayBtn();
      }
    },
  });

  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("soundcloud", {
      label: __("soundcloud.title"),
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
    updateArtUI();
  }

  function _updateNowPlaying() {
    if (!elNowPlaying) return;
    var hasTrack = audio && audio.src && trackList && trackList[currentTrackIndex];
    if (
      hasTrack &&
      elTrackName &&
      elTrackName.textContent
    ) {
      var artSrc =
        elArtImg.style.display !== "none" ? elArtImg.src : "";
      elNowPlaying.innerHTML =
        '<span class="sc-now-playing-label">' +
        elTrackName.textContent +
        '</span>' +
        '<div class="sc-now-playing-menu" id="scNpMenu">' +
        (artSrc
          ? '<img class="sc-np-art" src="' +
            artSrc +
            '" alt="">'
          : "") +
        '<div class="sc-np-body">' +
        '<div class="sc-np-track" id="scNpTrack">' +
        elTrackName.textContent +
        "</div>" +
        '<div class="sc-np-buttons">' +
        '<button class="sc-np-btn" id="scNpPrev"><svg viewBox="0 0 16 16"><polygon points="3,8 13,2 13,14" fill="currentColor"/></svg></button>' +
        '<button class="sc-np-btn" id="scNpToggle">' +
        '<svg class="sc-np-play-icon" viewBox="0 0 16 16" style="display:' +
        (isPlaying ? "none" : "block") +
        '"><polygon points="4,2 14,8 4,14" fill="currentColor"/></svg>' +
        '<svg class="sc-np-pause-icon" viewBox="0 0 16 16" style="display:' +
        (isPlaying ? "block" : "none") +
        '"><rect x="3" y="2" width="4" height="12" fill="currentColor"/><rect x="9" y="2" width="4" height="12" fill="currentColor"/></svg>' +
        "</button>" +
        '<button class="sc-np-btn" id="scNpNext"><svg viewBox="0 0 16 16"><polygon points="13,8 3,2 3,14" fill="currentColor"/></svg></button>' +
        "</div>" +
        "</div>" +
        "</div>";
      elNowPlaying.classList.add("visible");
    } else {
      elNowPlaying.innerHTML = "";
      elNowPlaying.classList.remove("visible");
    }
  }

  function _setupNowPlaying() {
    if (!elNowPlaying) return;
    elNowPlaying.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (btn) {
        if (btn.id === "scNpToggle") {
          if (typeof playToggleOnSnd === "function") playToggleOnSnd();
          if (audio.paused) {
            if (!audio.src && trackList[currentTrackIndex]) {
              playTrack(currentTrackIndex);
            } else {
              audio.play();
            }
          } else {
            audio.pause();
          }
          syncActiveVolume();
        } else if (btn.id === "scNpNext") {
          if (typeof playClickSnd === "function") playClickSnd();
          nextTrack();
        } else if (btn.id === "scNpPrev") {
          if (typeof playClickSnd === "function") playClickSnd();
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
          if (cp) {
            cp.style.display = "none";
            cp.classList.remove("cal-in", "cal-out");
          }
          var vp = document.getElementById("volumePanel");
          if (vp) {
            vp.style.display = "none";
            vp.classList.remove("vol-in", "vol-out");
          }
        }
      }
      if (typeof playClickSnd === "function") playClickSnd();
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
      if (
        menu &&
        menu.classList.contains("visible") &&
        !elNowPlaying.contains(e.target)
      ) {
        if (win.style.display === "none") {
          menu.classList.remove("visible");
        }
      }
    });
  }

  /* ===== Custom playlists persistence ===== */
  function loadCustomPlaylists() {
    try {
      var d = JSON.parse(localStorage.getItem("scCustomPlaylists"));
      if (d && d.list) {
        customPlaylists = d.list;
        nextCustomId = d.nextId || 1;
      }
    } catch (e) {}
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

  /* ---- Art mode mouse move handler ---- */
  if (scPlayer) {
    scPlayer.addEventListener("mousemove", function () {
      if (_artModeActive) showArtControlsTemporarily();
    });
  }

  /* ---- Exit art mode when window is un-maximized ---- */
  var _artModeObserver = new MutationObserver(function () {
    if (_artModeActive && !win.classList.contains("window-maximized")) {
      exitArtMode();
    }
  });
  _artModeObserver.observe(win, { attributes: true, attributeFilter: ["class"] });

  /* Watch for mobile-mode toggle and re-render mobile playlists */
  var _scPrevMob = document.body.classList.contains("mobile-mode");
  var _scMobObserver = new MutationObserver(function () {
    var now = document.body.classList.contains("mobile-mode");
    if (now !== _scPrevMob) {
      _scPrevMob = now;
      renderMobilePlaylists();
    }
  });
  _scMobObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
