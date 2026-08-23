(function () {
  "use strict";

  // ============================================================
  // DOM references
  // ============================================================
  const win = document.getElementById("scWindow");
  const body = document.getElementById("scBody");
  const dragHandle = document.getElementById("scDragHandle");
  const btnClose = document.getElementById("scBtnClose");
  const btnMinimize = document.getElementById("scBtnMinimize");
  const btnMaximize = document.getElementById("scBtnMaximize");
  const scPlayer = document.getElementById("scPlayer");

  const $ = (id) => document.getElementById(id);

  const elArtImg = $("scArtImg");
  const elArtOv = $("scArtOverlay");
  const elTrackName = $("scTrackName");
  const elArtistName = $("scArtistName");
  const elBtnPlay = $("scBtnPlay");
  const elPlayIcon = $("scPlayIcon");
  const elPauseIcon = $("scPauseIcon");
  const elBtnNext = $("scBtnNext");
  const elBtnPrev = $("scBtnPrev");
  const elBtnShuffle = $("scBtnShuffle");
  const elBtnHidePl = $("scBtnHidePl");
  const elBtnHideArt = $("scBtnHideArt");
  const elProgressFill = $("scProgressFill");
  const elProgressThumb = $("scProgressThumb");
  const elProgressBar = $("scProgressBar");
  const elTimeCurrent = $("scTimeCurrent");
  const elTimeTotal = $("scTimeTotal");
  const elStatus = $("scStatus");
  const elPlaylistItems = $("scPlaylistItems");
  const elTrackCounter = $("scTrackCounter");
  const elTrackList = $("scTrackList");
  const elNowPlaying = $("scNowPlaying");

  // ============================================================
  // State
  // ============================================================
  let currentTrackIndex = 0;
  let totalTracks = 0;
  let trackList = [];
  let isPlaying = false;
  let duration = 0;
  let position = 0;
  let pollTimer = null;
  let activePlaylistId = null;
  let shuffle = false;
  let dragging = false;

  let playlists = [];
  let playlistData = {};
  let currentAudioUrl = null;
  let loadingPlaylist = false;
  let audio = null;

  let customPlaylists = [];
  let nextCustomId = 1;

  let _artModeActive = false;
  let _artModeTimer = null;
  let _artHeaderEl = null;
  let _artBarEl = null;

  const INDEX_URL = "assets/music/index.json";

  // ============================================================
  // Helpers
  // ============================================================
  function showStatus(msg) {
    if (elStatus) {
      elStatus.textContent = msg;
      elStatus.style.display = "block";
    }
  }

  function hideStatus() {
    if (elStatus) elStatus.style.display = "none";
  }

  function fmt(secs) {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function fmtCount(n) {
    if (!n || n <= 0) return "";
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function __(key) {
    if (typeof window._t === "function") return window._t(key);
    const fallback = {
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

  // ============================================================
  // Audio
  // ============================================================
  function initAudio() {
    audio = document.createElement("audio");
    audio.preload = "auto";
    audio.style.display = "none";
    body.appendChild(audio);

    audio.addEventListener("timeupdate", () => {
      position = audio.currentTime;
      elTimeCurrent.textContent = fmt(position);
      updateBar();
    });

    audio.addEventListener("loadedmetadata", () => {
      duration = audio.duration;
      elTimeTotal.textContent = fmt(duration);
    });

    audio.addEventListener("play", () => {
      isPlaying = true;
      updatePlayBtn();
      startPoll();
    });

    audio.addEventListener("pause", () => {
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
    });

    audio.addEventListener("ended", () => {
      nextTrack();
    });

    audio.addEventListener("error", () => {
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
    });

    if (typeof window._eqConnect === "function") {
      window._eqConnect(audio);
    }
  }

  // ============================================================
  // Playback
  // ============================================================
  async function playTrack(index) {
    if (!trackList[index]) return;
    currentTrackIndex = index;
    displayTrack();
    updateCounter();
    audio.src = trackList[index].file;
    audio.currentTime = 0;
    try {
      await audio.play();
    } catch (e) {}
  }

  function nextTrack() {
    if (totalTracks === 0) return;
    let idx;
    if (shuffle) idx = Math.floor(Math.random() * totalTracks);
    else idx = (currentTrackIndex + 1) % totalTracks;
    playTrack(idx);
  }

  function prevTrack() {
    if (totalTracks === 0) return;
    let idx;
    if (shuffle) idx = Math.floor(Math.random() * totalTracks);
    else idx = (currentTrackIndex - 1 + totalTracks) % totalTracks;
    playTrack(idx);
  }

  function skipTrack(idx) {
    if (idx < 0 || idx >= totalTracks) return;
    playTrack(idx);
  }

  // ============================================================
  // Index loading
  // ============================================================
  function processIndexData(data) {
    playlistData = data;
    playlists = [];
    for (const id in data) {
      playlists.push({ id, label: data[id].label, url: data[id].url });
    }
    for (let i = 0; i < customPlaylists.length; i++) {
      playlists.push(customPlaylists[i]);
    }
    renderPlaylists();
    hideStatus();
    if (playlists.length > 0) switchPlaylist(playlists[0].id);
  }

  async function loadIndexViaFetch() {
    const resp = await fetch(INDEX_URL);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.json();
  }

  function loadIndexViaScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = INDEX_URL.replace(".json", ".js");
      script.onload = () => {
        const data = window.__MUSIC_INDEX;
        delete window.__MUSIC_INDEX;
        if (data) resolve(data);
        else reject(new Error("Script loaded but no data"));
      };
      script.onerror = () => reject(new Error("Failed to load script"));
      document.head.appendChild(script);
    });
  }

  async function loadIndex() {
    showStatus(__("soundcloud.loading"));
    try {
      const data = await loadIndexViaFetch();
      processIndexData(data);
    } catch (e) {
      console.warn("Fetch failed, trying script fallback:", e);
      try {
        const data = await loadIndexViaScript();
        processIndexData(data);
      } catch (e2) {
        console.error("Failed to load index (both methods):", e, e2);
        showStatus(__("soundcloud.failed"));
      }
    }
  }

  // ============================================================
  // Playlist switching
  // ============================================================
  function switchPlaylist(id) {
    if (loadingPlaylist) return;
    if (isArtistFiltered) {
      isArtistFiltered = false;
      savedTrackList = null;
      const hdr = document.getElementById("scArtistFilterHeader");
      if (hdr) hdr.remove();
    }
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

    const pl = playlistData[id];
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

  // ============================================================
  // Volume sync
  // ============================================================
  window.setSoundCloudVolume = function (v) {
    if (typeof v !== "number" || isNaN(v)) return;
    v = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = v;
  };

  function syncActiveVolume() {
    let v = typeof window.getPageVolume === "function" ? window.getPageVolume() : 1;
    if (typeof v !== "number" || isNaN(v)) v = 1;
    v = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = v;
  }

  let _volInterval = null;
  function _startVolSync() {
    if (_volInterval) return;
    _volInterval = setInterval(() => syncActiveVolume(), 500);
  }
  function _stopVolSync() {
    if (_volInterval) {
      clearInterval(_volInterval);
      _volInterval = null;
    }
  }
  _startVolSync();

  // ============================================================
  // Playlist sidebar
  // ============================================================
  function renderPlaylists() {
    if (!elPlaylistItems) return;
    const items = elPlaylistItems.querySelectorAll(".sc-pl-item");
    for (let i = items.length - 1; i >= 0; i--) items[i].remove();

    for (let i = 0; i < playlists.length; i++) {
      const pl = playlists[i];
      const e = document.createElement("div");
      e.className = "sc-pl-item";
      if (pl.id === activePlaylistId) e.classList.add("sc-pl-item-active");
      e.textContent = pl.label;
      e.addEventListener("click", () => {
        if (typeof playClickSnd === "function") playClickSnd();
        switchPlaylist(pl.id);
      });
      elPlaylistItems.appendChild(e);
    }
    renderMobilePlaylists();
  }

  function renderMobilePlaylists() {
    const existing = document.querySelectorAll(".sc-mobile-pl-item");
    for (let i = existing.length - 1; i >= 0; i--) existing[i].remove();

    const bar = document.querySelector(".sc-mobile-playlist-bar");
    if (!bar) return;
    const isMobile = document.body.classList.contains("mobile-mode");
    bar.style.display = isMobile ? "flex" : "none";
    if (!isMobile) return;

    for (let i = 0; i < playlists.length; i++) {
      const pl = playlists[i];
      const e = document.createElement("span");
      e.className = "sc-mobile-pl-item";
      if (pl.id === activePlaylistId) e.classList.add("sc-mobile-pl-item-active");
      e.textContent = pl.label;
      e.addEventListener("click", () => switchPlaylist(pl.id));
      bar.appendChild(e);
    }
  }

  // ============================================================
  // Track list
  // ============================================================
  function renderTrackList() {
    if (!elTrackList) return;
    for (let i = elTrackList.children.length - 1; i >= 0; i--) {
      const c = elTrackList.children[i];
      if (!c.classList || !c.classList.contains("sc-status")) {
        elTrackList.removeChild(c);
      }
    }
    for (let i = 0; i < trackList.length; i++) {
      const idx = i;
      const e = document.createElement("div");
      e.className = "sc-track-item";
      const t = trackList[idx].title || __("soundcloud.trackPrefix") + (idx + 1);
      const pc = fmtCount(trackList[idx].play_count);
      if (pc) {
        const ts = document.createElement("span");
        ts.className = "sc-track-title";
        ts.textContent = t;
        ts.style.overflow = "hidden";
        ts.style.textOverflow = "ellipsis";
        ts.style.whiteSpace = "nowrap";
        const ps = document.createElement("span");
        ps.className = "sc-track-plays";
        ps.textContent = "\u25B6 " + pc;
        e.appendChild(ts);
        e.appendChild(ps);
        e.style.display = "flex";
        e.style.justifyContent = "space-between";
        e.style.alignItems = "center";
        e.style.gap = "8px";
      } else {
        e.textContent = t;
      }
      if (idx === currentTrackIndex) e.classList.add("sc-track-item-active");
      e.addEventListener("click", () => {
        if (typeof playClickSnd === "function") playClickSnd();
        skipTrack(idx);
      });
      e.addEventListener("dblclick", () => {
        if (typeof playLaunchSnd === "function") playLaunchSnd();
        skipTrack(idx);
        audio.play();
      });
      elTrackList.appendChild(e);
    }
    scrollActive();
  }

  function centerCurrentTrack() {
    if (!elTrackList) return;
    const a = elTrackList.querySelector(".sc-track-item-active");
    if (!a) return;
    const container = elTrackList;
    const cTop = container.getBoundingClientRect().top;
    const cH = container.clientHeight;
    const aTop = a.getBoundingClientRect().top;
    const aH = a.offsetHeight;
    container.scrollTop += aTop - cTop - cH / 2 + aH / 2;
  }

  function scrollActive() {
    centerCurrentTrack();
  }

  function refreshHighlight() {
    if (!elTrackList) return;
    const items = elTrackList.querySelectorAll(".sc-track-item");
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle("sc-track-item-active", i === currentTrackIndex);
    }
  }

  function updateCounter() {
    if (elTrackCounter) {
      elTrackCounter.textContent = totalTracks > 0 ? currentTrackIndex + 1 + "/" + totalTracks : "-/-";
    }
  }

  let isArtistFiltered = false;
  let savedTrackList = null;
  let savedPlaylistId = null;
  let savedTrackIndex = 0;

  function collectArtistTracks(artist) {
    if (!artist || artist === __("soundcloud.defaultArtist")) return [];
    const seen = new Set();
    const out = [];
    for (const pid in playlistData) {
      const pl = playlistData[pid];
      if (!pl || !pl.tracks) continue;
      for (const t of pl.tracks) {
        if (t.artist === artist) {
          const key = t.file || (t.title + "|" + t.artist);
          if (!seen.has(key)) {
            seen.add(key);
            out.push(t);
          }
        }
      }
    }
    return out;
  }

  // ============================================================
  // Display current track
  // ============================================================
  function displayTrack() {
    if (!trackList || !trackList[currentTrackIndex]) {
      setTimeout(displayTrack, 500);
      return;
    }
    const s = trackList[currentTrackIndex];
    elTrackName.textContent = s.title || __("soundcloud.trackPrefix") + (currentTrackIndex + 1);
    elArtistName.textContent = s.artist || __("soundcloud.defaultArtist");
    elArtistName.style.cursor = "pointer";
    elArtistName.title = "Clique para ver todas as músicas deste artista";
    let playsEl = document.getElementById("scTrackPlays");
    if (!playsEl) {
      playsEl = document.createElement("div");
      playsEl.id = "scTrackPlays";
      playsEl.className = "sc-track-plays-main";
      const info = document.querySelector(".sc-info");
      if (info) info.appendChild(playsEl);
    }
    const pc = fmtCount(s.play_count);
    playsEl.textContent = pc ? "\u25B6 " + pc + " reprodu\u00e7\u00f5es" : "";
    playsEl.style.display = pc ? "block" : "none";
    updateCounter();
    refreshHighlight();
    scrollActive();
    hideStatus();
    loadArt(currentTrackIndex);
    _updateNowPlaying();
    updateArtUI();
  }

  if (elArtistName) {
    elArtistName.addEventListener("click", function() {
      var cur = trackList[currentTrackIndex];
      var artist = cur ? cur.artist : "";
      if (!artist || artist === __("soundcloud.defaultArtist")) return;
      if (typeof playClickSnd === "function") playClickSnd();
      if (isArtistFiltered) {
        if (savedTrackList) {
          trackList = savedTrackList;
          activePlaylistId = savedPlaylistId;
          totalTracks = trackList.length;
          currentTrackIndex = savedTrackIndex;
          isArtistFiltered = false;
          savedTrackList = null;
          renderTrackList();
          var hdr = document.getElementById("scArtistFilterHeader");
          if (hdr) hdr.remove();
          displayTrack();
          updateCounter();
        }
        return;
      }
      var filtered = collectArtistTracks(artist);
      if (!filtered.length) return;
      savedTrackList = trackList.slice();
      savedPlaylistId = activePlaylistId;
      savedTrackIndex = currentTrackIndex;
      var newIdx = 0;
      for (var i = 0; i < filtered.length; i++) {
        if (filtered[i].file === cur.file) { newIdx = i; break; }
      }
      trackList = filtered;
      totalTracks = trackList.length;
      currentTrackIndex = newIdx;
      isArtistFiltered = true;
      renderTrackList();
      if (elTrackList) {
        var existing = document.getElementById("scArtistFilterHeader");
        if (existing) existing.remove();
        var hdr = document.createElement("div");
        hdr.id = "scArtistFilterHeader";
        hdr.style.cssText = "padding:6px 8px; font-size:13px; background:var(--clr-highlight); color:var(--clr-text-on-highlight); display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-bottom:2px solid #000; flex-shrink:0;";
        hdr.innerHTML = '<span>\u25B6 ' + artist.replace(/</g,"&lt;") + ' (' + filtered.length + ')</span><span style="font-size:11px; opacity:0.9;">\u2715 voltar</span>';
        hdr.addEventListener("click", function() { if (elArtistName) elArtistName.click(); });
        elTrackList.insertBefore(hdr, elTrackList.firstChild);
      }
      displayTrack();
      updateCounter();
    });
    elArtistName.addEventListener("mouseenter", function() { elArtistName.style.textDecoration = "underline"; });
    elArtistName.addEventListener("mouseleave", function() { elArtistName.style.textDecoration = "none"; });
  }

  // ============================================================
  // Artwork — com limitador de taxa para ver carregamento progressivo
  // ============================================================
  const ART_RATE_KBPS = 80;
  const ART_ESTIMATE_BYTES = 280 * 1024;
  let artLoadToken = 0;

  async function fetchWithThrottle(url, onProgress) {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error("fetch failed " + res.status);
    const reader = res.body.getReader();
    const chunks = [];
    let loaded = 0;
    let total = parseInt(res.headers.get("content-length") || "0", 10);
    if (!total) total = ART_ESTIMATE_BYTES;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (onProgress) onProgress(Math.min((loaded / total) * 100, loaded < total ? 95 : 100));
      // throttling: delay proporcional ao tamanho do chunk
      const delayMs = (value.length / (ART_RATE_KBPS * 1024)) * 1000;
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
    }
    const blob = new Blob(chunks);
    return URL.createObjectURL(blob);
  }

  function showArtProgress(pct) {
    let bar = document.getElementById("scArtProgress");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "scArtProgress";
      bar.style.cssText = "position:absolute; left:0; bottom:0; height:4px; background:var(--clr-highlight); width:0%; transition: width 0.08s linear; z-index:3; pointer-events:none;";
      const wrap = document.getElementById("scArtwork");
      if (wrap) wrap.appendChild(bar);
    }
    bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    bar.style.display = pct >= 100 ? "none" : "block";
  }

  function loadArt(idx) {
    const track = trackList && trackList[idx];
    if (!track || !track.artwork) {
      elArtImg.style.display = "none";
      showArtProgress(100);
      return;
    }
    const token = ++artLoadToken;
    elArtImg.style.display = "block";
    elArtImg.style.opacity = "0.35";
    elArtImg.style.filter = "blur(6px)";
    elArtImg.style.transition = "opacity 0.3s ease, filter 0.3s ease";
    showArtProgress(0);
    fetchWithThrottle(track.artwork, (pct) => {
      if (token !== artLoadToken) return;
      showArtProgress(pct);
    }).then(url => {
      if (token !== artLoadToken) return;
      elArtImg.onload = () => {
        elArtImg.style.opacity = "1";
        elArtImg.style.filter = "blur(0px)";
        showArtProgress(100);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      };
      elArtImg.onerror = () => {
        elArtImg.style.display = "none";
        showArtProgress(100);
      };
      elArtImg.src = url;
    }).catch(() => {
      if (token !== artLoadToken) return;
      // fallback direto sem throttle
      elArtImg.style.opacity = "1";
      elArtImg.style.filter = "blur(0px)";
      elArtImg.src = track.artwork;
      showArtProgress(100);
    });
  }

  function setArt(src) {
    if (!src) {
      elArtImg.style.display = "none";
      showArtProgress(100);
      return;
    }
    const token = ++artLoadToken;
    elArtImg.style.display = "block";
    elArtImg.style.opacity = "0.35";
    elArtImg.style.filter = "blur(6px)";
    showArtProgress(0);
    fetchWithThrottle(src, (pct) => {
      if (token !== artLoadToken) return;
      showArtProgress(pct);
    }).then(url => {
      if (token !== artLoadToken) return;
      elArtImg.onload = () => {
        elArtImg.style.opacity = "1";
        elArtImg.style.filter = "blur(0px)";
        showArtProgress(100);
      };
      elArtImg.onerror = () => {
        elArtImg.style.display = "none";
        showArtProgress(100);
      };
      elArtImg.src = url;
    }).catch(() => {
      if (token !== artLoadToken) return;
      elArtImg.style.opacity = "1";
      elArtImg.style.filter = "blur(0px)";
      elArtImg.src = src;
      showArtProgress(100);
    });
  }

  // ============================================================
  // Progress
  // ============================================================
  function startPoll() {
    stopPoll();
    pollTimer = setInterval(() => {
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
    let pct = duration > 0 ? (position / duration) * 100 : 0;
    if (pct > 100) pct = 100;
    if (pct < 0) pct = 0;
    elProgressFill.style.width = pct + "%";
    elProgressThumb.style.left = "calc(" + pct + "% - 4px)";
  }

  function seekPct(pct) {
    if (!audio || duration <= 0) return;
    audio.currentTime = pct * duration;
  }

  function seekFromEvent(e) {
    if (!audio || duration <= 0) return;
    const r = elProgressBar.getBoundingClientRect();
    let pct = (e.clientX - r.left) / r.width;
    seekPct(pct);
    const pctClamp = Math.max(0, Math.min(1, pct));
    elProgressFill.style.width = pctClamp * 100 + "%";
    elProgressThumb.style.left = "calc(" + pctClamp * 100 + "% - 4px)";
  }

  elProgressBar.addEventListener("mousedown", (e) => {
    if (e.target === elProgressThumb) return;
    dragging = true;
    seekFromEvent(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    seekFromEvent(e);
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });

  // ============================================================
  // Button press visual
  // ============================================================
  function wirePress(el) {
    if (!el) return;
    el.addEventListener("mousedown", () => el.classList.add("sc-pressed"));
    el.addEventListener("mouseup", () => el.classList.remove("sc-pressed"));
    el.addEventListener("mouseleave", () => el.classList.remove("sc-pressed"));
    el.addEventListener("touchstart", () => el.classList.add("sc-pressed"), { passive: true });
    el.addEventListener("touchend", () => el.classList.remove("sc-pressed"));
    el.addEventListener("touchcancel", () => el.classList.remove("sc-pressed"));
  }
  wirePress(elBtnPlay);
  wirePress(elBtnNext);
  wirePress(elBtnPrev);
  if (elBtnShuffle) wirePress(elBtnShuffle);
  if (elBtnHidePl) wirePress(elBtnHidePl);
  if (elBtnHideArt) wirePress(elBtnHideArt);

  // ============================================================
  // Controls
  // ============================================================
  elBtnPlay.addEventListener("click", () => {
    if (!audio) return;
    if (typeof playToggleOnSnd === "function") playToggleOnSnd();
    if (audio.paused) {
      if (!audio.src && trackList[currentTrackIndex]) playTrack(currentTrackIndex);
      else audio.play();
    } else {
      audio.pause();
    }
    syncActiveVolume();
  });

  elBtnNext.addEventListener("click", () => {
    if (typeof playClickSnd === "function") playClickSnd();
    nextTrack();
  });

  elBtnPrev.addEventListener("click", () => {
    if (typeof playClickSnd === "function") playClickSnd();
    prevTrack();
  });

  if (elBtnShuffle) {
    elBtnShuffle.addEventListener("click", () => {
      shuffle = !shuffle;
      elBtnShuffle.classList.toggle("sc-btn-shuffle-active", shuffle);
      if (typeof playToggleOnSnd === "function") {
        shuffle ? playToggleOnSnd() : playToggleOffSnd();
      }
    });
  }

  if (elBtnHidePl) {
    elBtnHidePl.addEventListener("click", () => {
      if (elBtnHidePl.disabled || scPlayer.classList.contains("sc-large")) return;
      const hidden = scPlayer.classList.toggle("sc-hide-playlists");
      elBtnHidePl.classList.toggle("sc-btn-hidepl-active", hidden);
      if (typeof playToggleOnSnd === "function") {
        hidden ? playToggleOnSnd() : playToggleOffSnd();
      }
    });
  }

  if (elBtnHideArt) {
    elBtnHideArt.addEventListener("click", () => {
      if (elBtnHideArt.disabled || scPlayer.classList.contains("sc-large")) return;
      if (scPlayer.classList.contains("sc-art-mode")) {
        exitArtMode();
      } else if (win.classList.contains("window-maximized")) {
        enterArtMode();
      } else {
        const hidden = scPlayer.classList.toggle("sc-hide-artwork");
        elBtnHideArt.classList.toggle("sc-btn-hideart-active", hidden);
        if (typeof playToggleOnSnd === "function") {
          hidden ? playToggleOnSnd() : playToggleOffSnd();
        }
      }
    });
  }

  if (elArtOv) {
    elArtOv.addEventListener("click", () => {
      if (!audio) return;
      if (typeof playToggleOnSnd === "function") playToggleOnSnd();
      if (audio.paused) {
        if (!audio.src && trackList[currentTrackIndex]) playTrack(currentTrackIndex);
        else audio.play();
      } else {
        audio.pause();
      }
    });
  }

  // ============================================================
  // Art mode (fullscreen album art view)
  // ============================================================
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

    const prevBtn = document.getElementById("artBtnPrev");
    const playBtn = document.getElementById("artBtnPlay");
    const nextBtn = document.getElementById("artBtnNext");

    if (prevBtn) {
      prevBtn.addEventListener("click", prevTrack);
      wirePress(prevBtn);
    }
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (typeof playToggleOnSnd === "function") playToggleOnSnd();
        if (audio.paused) {
          if (!audio.src && trackList[currentTrackIndex]) playTrack(currentTrackIndex);
          else audio.play();
        } else audio.pause();
        syncActiveVolume();
      });
      wirePress(playBtn);
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", nextTrack);
      wirePress(nextBtn);
    }
    updateArtUI();
  }

  function removeArtUI() {
    if (_artHeaderEl) {
      _artHeaderEl.remove();
      _artHeaderEl = null;
    }
    if (_artBarEl) {
      _artBarEl.remove();
      _artBarEl = null;
    }
  }

  function updateArtUI() {
    if (!_artModeActive) return;
    if (_artHeaderEl) _artHeaderEl.textContent = elTrackName ? elTrackName.textContent : "";
    if (_artBarEl) {
      const playIcon = _artBarEl.querySelector(".sc-np-play-icon");
      const pauseIcon = _artBarEl.querySelector(".sc-np-pause-icon");
      if (playIcon) playIcon.style.display = isPlaying ? "none" : "block";
      if (pauseIcon) pauseIcon.style.display = isPlaying ? "block" : "none";
    }
  }

  function showArtControlsTemporarily() {
    if (!_artModeActive) return;
    scPlayer.classList.add("sc-art-controls-show");
    clearTimeout(_artModeTimer);
    _artModeTimer = setTimeout(() => {
      scPlayer.classList.remove("sc-art-controls-show");
    }, 3000);
  }

  // ============================================================
  // MDI child panels: draggable windows inside topRow (<900)
  // ============================================================
  (function () {
    const topRow = document.getElementById("scTopRow");
    const plWin = document.getElementById("scPlaylistWin");
    const artWin = document.getElementById("scArtworkWin");
    if (!topRow || !plWin || !artWin) return;
    if (typeof window.createChildPanel !== "function") return;
    const plApi = window.createChildPanel(plWin, {
      parent: topRow,
      handle: document.getElementById("scPlaylistDrag"),
      obstacle: artWin,
      gap: 6,
      minW: 140,
      minH: 80,
    });
    const artApi = window.createChildPanel(artWin, {
      parent: topRow,
      handle: document.getElementById("scArtworkDrag"),
      obstacle: plWin,
      gap: 6,
      minW: 200,
      minH: 120,
      square: true,
    });
    window.__scMdiClamp = function () {
      try { plApi.clampIntoParent(); } catch (e) {}
      try { artApi.clampIntoParent(); } catch (e) {}
    };
    plWin.classList.add("active");
  })();

  // ============================================================
  // Large layout >900px: simple grid - track list left,
  // artwork 1x1 + playlist + meta on the right.
  // Pure CSS layout via .sc-large — no JS size calculations.
  // ============================================================
  (function () {
    const el = scPlayer;
    if (!el) return;
    const winEl = win;

    function applyLargeSizing() {
      if (!el.classList.contains("sc-large")) {
        el.style.removeProperty("--art-side");
        return;
      }
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const meta = document.getElementById("scMetaWindow");
          const pl = document.getElementById("scPlaylistWin");
          const gaps = 24; // 2 gaps de 6px entre as 3 linhas + folga
          const fixedH =
            (meta ? meta.offsetHeight : 0) + (pl ? pl.offsetHeight : 0) + gaps;
          const avail = el.clientHeight - 12 - fixedH;
          let side = Math.min(avail, Math.round(el.clientWidth * 0.5));
          side = Math.max(120, Math.round(side));
          el.style.setProperty("--art-side", side + "px");
        })
      );
    }

    function checkLarge() {
      const measure = winEl && winEl.getBoundingClientRect().width
        ? winEl.getBoundingClientRect().width
        : el.getBoundingClientRect().width;
      const large = measure >= 900;
      const prev = el.classList.contains("sc-large");
      el.classList.toggle("sc-large", large);
      if (large && !prev) {
        // limpa estilos inline do modo MDI para o grid assumir
        ["scPlaylistWin", "scArtworkWin"].forEach((id) => {
          const p = document.getElementById(id);
          if (p) ["width", "height", "left", "top", "right"].forEach((k) => (p.style[k] = ""));
        });
      }
      if (!large && prev && typeof window.__scMdiClamp === "function") {
        window.__scMdiClamp();
      }
      applyLargeSizing();
      if (elBtnHideArt) {
        elBtnHideArt.disabled = large;
        elBtnHideArt.classList.toggle("sc-hide-btn-disabled", large);
        if (large) {
          elBtnHideArt.classList.remove("sc-btn-hideart-active");
          el.classList.remove("sc-hide-artwork");
        }
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(checkLarge).observe(el);
      if (winEl) new ResizeObserver(checkLarge).observe(winEl);
    }
    window.addEventListener("resize", () => setTimeout(checkLarge, 50));
    document.addEventListener("fullscreenchange", () => setTimeout(checkLarge, 100));
    checkLarge();
  })();

  // ============================================================
  // Keyboard (when SC is the active window)
  // ============================================================
  document.addEventListener("keydown", (e) => {
    if (win.style.display === "none") return;
    if (!win.classList.contains("active")) return;
    const k = e.key;
    if (k === " " || k === "Space" || k === "k" || k === "K") {
      e.preventDefault();
      if (typeof playToggleOnSnd === "function") playToggleOnSnd();
      if (audio.paused) {
        if (!audio.src && trackList[currentTrackIndex]) playTrack(currentTrackIndex);
        else audio.play();
      } else audio.pause();
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

  // ============================================================
  // Window behavior
  // ============================================================
  let _scFirstShow = true;
  const behavior = new WindowBehavior(win, {
    dragHandle,
    btnClose,
    btnMinimize,
    btnMaximize,
    minW: 300,
    minH: 400,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/apps/kaudiocreator.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __("soundcloud.title"),
    taskbarAction: "soundcloud",
    appId: "soundcloud",
    onShow() {
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
        window.setSoundCloudVolume(typeof window.getPageVolume === "function" ? window.getPageVolume() : 1);
      }
    },
    onHide() {
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

  if (window.W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("soundcloud", {
      label: __("soundcloud.title"),
      show() {
        behavior.show();
      },
      minimize() {
        behavior.minimize();
      },
      hasEntry() {
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
    const hasTrack = audio && audio.src && trackList && trackList[currentTrackIndex];
    if (hasTrack && elTrackName && elTrackName.textContent) {
      const artSrc = elArtImg.style.display !== "none" ? elArtImg.src : "";
      elNowPlaying.innerHTML =
        '<span class="sc-now-playing-label">' +
        elTrackName.textContent +
        "</span>" +
        '<div class="sc-now-playing-menu" id="scNpMenu">' +
        (artSrc ? '<img class="sc-np-art" src="' + artSrc + '" alt="">' : "") +
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
    elNowPlaying.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) {
        if (btn.id === "scNpToggle") {
          if (typeof playToggleOnSnd === "function") playToggleOnSnd();
          if (audio.paused) {
            if (!audio.src && trackList[currentTrackIndex]) playTrack(currentTrackIndex);
            else audio.play();
          } else audio.pause();
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
      const menu = document.getElementById("scNpMenu");
      if (menu) {
        const willShow = !menu.classList.contains("visible");
        menu.classList.toggle("visible");
        if (willShow) {
          const cp = document.getElementById("calendarPanel");
          if (cp) {
            cp.style.display = "none";
            cp.classList.remove("cal-in", "cal-out");
          }
          const vp = document.getElementById("volumePanel");
          if (vp) {
            vp.style.display = "none";
            vp.classList.remove("vol-in", "vol-out");
          }
        }
      }
      if (typeof playClickSnd === "function") playClickSnd();
    });
    const _scObserver = new MutationObserver(() => {
      if (win.style.display === "none") {
        const m = document.getElementById("scNpMenu");
        if (m) m.classList.remove("visible");
      }
    });
    _scObserver.observe(win, { attributes: true, attributeFilter: ["style"] });
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("scNpMenu");
      if (menu && menu.classList.contains("visible") && !elNowPlaying.contains(e.target)) {
        if (win.style.display === "none") menu.classList.remove("visible");
      }
    });
  }

  // ============================================================
  // Custom playlists persistence
  // ============================================================
  function loadCustomPlaylists() {
    try {
      const d = JSON.parse(localStorage.getItem("scCustomPlaylists"));
      if (d && d.list) {
        customPlaylists = d.list;
        nextCustomId = d.nextId || 1;
      }
    } catch (e) {}
  }
  loadCustomPlaylists();

  // ============================================================
  // Init
  // ============================================================
  elArtImg.style.display = "none";

  const elMobilePlBar = document.createElement("div");
  elMobilePlBar.className = "sc-mobile-playlist-bar";
  const controlsRow = document.querySelector(".sc-controls-row");
  if (controlsRow && controlsRow.parentNode) {
    controlsRow.parentNode.insertBefore(elMobilePlBar, controlsRow.nextSibling);
  }

  renderPlaylists();
  _setupNowPlaying();

  if (scPlayer) {
    scPlayer.addEventListener("mousemove", () => {
      if (_artModeActive) showArtControlsTemporarily();
    });
  }

  const _artModeObserver = new MutationObserver(() => {
    if (_artModeActive && !win.classList.contains("window-maximized")) exitArtMode();
  });
  _artModeObserver.observe(win, { attributes: true, attributeFilter: ["class"] });

  let _scPrevMob = document.body.classList.contains("mobile-mode");
  const _scMobObserver = new MutationObserver(() => {
    const now = document.body.classList.contains("mobile-mode");
    if (now !== _scPrevMob) {
      _scPrevMob = now;
      renderMobilePlaylists();
    }
  });
  _scMobObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
