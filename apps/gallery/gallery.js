(function () {
  "use strict";

  var _galleryList = null;
  var _galleryCache = {};
  var _shuffled = [];
  var _shufflePos = 0;

  function _reshuffle() {
    _shuffled = _galleryList.slice();
    for (var i = _shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = _shuffled[i];
      _shuffled[i] = _shuffled[j];
      _shuffled[j] = tmp;
    }
    _shufflePos = 0;
  }

  function _initGallery() {
    if (_galleryList) return Promise.resolve();
    return fetch("/api/gallery")
      .then(function (r) { return r.json(); })
      .then(function (list) {
        _galleryList = list;
        if (!_galleryList.length) return;
        _reshuffle();
      })
      .catch(function () {
        if (window._galleryData && window._galleryData.length) {
          _galleryList = window._galleryData;
          _reshuffle();
        } else {
          _galleryList = [];
        }
      });
  }

  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("randomgif", {
      label: __("gallery.title"),
      show: function () {
        window.openGallery();
      },
    });
  }

  function _showGalleryImage(name, total, pos) {
    var overlay = document.createElement("div");
    overlay.id = "galleryOverlay";
    overlay.classList.add("gallery-overlay");
    overlay.setAttribute("tabindex", "0");

    var img = document.createElement("img");
    img.classList.add("gallery-img");
    img.src = "assets/gallery/" + encodeURIComponent(name);
    overlay.appendChild(img);

    var info = document.createElement("div");
    info.id = "galleryInfo";
    info.classList.add("gallery-info");
    info.textContent = __("gallery.info") + (pos + 1) + "/" + total + __("gallery.infoEnd");
    overlay.appendChild(info);

    document.body.appendChild(overlay);
    overlay.focus();

    function preload(n) {
      var src = "assets/gallery/" + encodeURIComponent(n);
      if (!_galleryCache[src]) {
        _galleryCache[src] = new Image();
        _galleryCache[src].src = src;
      }
    }

    function preloadAhead(count) {
      for (var i = 1; i <= count; i++) {
        var fwd = (_shufflePos + i) % _shuffled.length;
        var rev = (_shufflePos - i + _shuffled.length) % _shuffled.length;
        preload(_shuffled[fwd]);
        preload(_shuffled[rev]);
      }
    }
    preload(name);
    preloadAhead(10);

    function update() {
      img.src = "assets/gallery/" + encodeURIComponent(name);
      info.textContent = __("gallery.info") + (pos + 1) + "/" + total + __("gallery.infoEnd");
      preload(name);
      preloadAhead(10);
    }

    function next() {
      if (typeof playGalleryNextSnd === 'function') playGalleryNextSnd();
      _shufflePos++;
      if (_shufflePos >= _shuffled.length) _reshuffle();
      pos = _shufflePos;
      name = _shuffled[_shufflePos];
      update();
    }

    function prev() {
      if (typeof playGalleryPrevSnd === 'function') playGalleryPrevSnd();
      _shufflePos--;
      if (_shufflePos < 0) _shufflePos = _shuffled.length - 1;
      pos = _shufflePos;
      name = _shuffled[_shufflePos];
      update();
    }

    overlay.addEventListener("keydown", function (e) {
      if (e.key === " ") {
        e.preventDefault();
        overlay.remove();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    });
    overlay.addEventListener("click", function () {
      overlay.remove();
    });
  }

  window.openGallery = function () {
    _initGallery().then(function () {
      if (!_galleryList || !_galleryList.length) return;
      if (_shufflePos >= _shuffled.length) _reshuffle();
      _showGalleryImage(_shuffled[_shufflePos], _galleryList.length, _shufflePos);
    });
  };
})();
