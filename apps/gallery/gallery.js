(function () {
  "use strict";

  var _galleryList = null;
  var _galleryCache = {};
  var _shuffled = [];
  var _shufflePos = 0;

  var _galleryFallback = [
    "seila1.jpg", "seila2.jpg", "seila3.jpg", "seila4.jpg", "seila5.jpg",
    "seila6.webp", "seila7.webp", "seila8.jpg", "seila9.gif", "seila10.jpg",
    "seila11.gif", "seila12.jpg", "seila13.gif", "seila14.gif", "seila15.gif",
    "seila16.gif", "seila17.gif", "seila18.jpg", "seila19.jpg", "seila20.jpg",
    "seila21.gif", "seila22.jpg", "seila23.jpg", "seila25.jpg", "seila26.jpg",
    "seila27.jpg", "seila28.jpg", "seila29.jpg", "seila30.jpg", "seila31.jpg",
    "seila32.jpg", "seila33.gif", "seila34.jpg", "seila35.jpg", "seila36.gif",
    "seila37.gif", "seila38.jpg", "seila39.webp", "seila40.gif", "seila41.jpg"
  ];

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
        if (_galleryFallback.length) {
          _galleryList = _galleryFallback;
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
    img.src = "apps/gallery/media/" + encodeURIComponent(name);
    overlay.appendChild(img);

    var info = document.createElement("div");
    info.id = "galleryInfo";
    info.classList.add("gallery-info");
    info.textContent = __("gallery.info") + (pos + 1) + "/" + total + __("gallery.infoEnd");
    overlay.appendChild(info);

    document.body.appendChild(overlay);
    overlay.focus();

    function preload(n) {
      var src = "apps/gallery/media/" + encodeURIComponent(n);
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
      img.src = "apps/gallery/media/" + encodeURIComponent(name);
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
    overlay.addEventListener("click", function (e) {
      if (_touchSwiped) { _touchSwiped = false; return; }
      overlay.remove();
    });

    var _touchStartX = 0, _touchSwiped = false;
    overlay.addEventListener("touchstart", function (e) {
      _touchStartX = e.touches[0].clientX;
      _touchSwiped = false;
    }, { passive: true });
    overlay.addEventListener("touchmove", function (e) {
      e.preventDefault();
    }, { passive: false });
    overlay.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - _touchStartX;
      if (Math.abs(dx) > 50) {
        _touchSwiped = true;
        if (dx > 0) prev();
        else next();
      }
    }, { passive: true });
  }

  window.openGallery = function () {
    _initGallery().then(function () {
      if (!_galleryList || !_galleryList.length) return;
      if (_shufflePos >= _shuffled.length) _reshuffle();
      _showGalleryImage(_shuffled[_shufflePos], _galleryList.length, _shufflePos);
    });
  };
})();
