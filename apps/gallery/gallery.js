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

  if (typeof W2K !== "undefined" && W2K.AppRegistry) {
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

    var isMobile = document.body.classList.contains('mobile-mode');
    var info = document.createElement("div");
    info.id = "galleryInfo";
    info.classList.add("gallery-info");
    info.textContent = (pos + 1) + "/" + total;
    overlay.appendChild(info);

    var closeBtn = document.createElement("button");
    closeBtn.className = "gallery-close-btn";
    closeBtn.textContent = "\u00D7";
    closeBtn.setAttribute("aria-label", "Fechar");
    overlay.appendChild(closeBtn);

    var pinBtn = document.createElement("button");
    pinBtn.className = "gallery-pin-btn";
    pinBtn.textContent = "Pinterest";
    pinBtn.setAttribute("aria-label", "Abrir Pinterest");
    pinBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      window.open("https://br.pinterest.com/sillky786/fufufuf~/", "_blank");
    });
    overlay.appendChild(pinBtn);

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

    function close() {
      overlay.remove();
    }

    function update() {
      img.src = "apps/gallery/media/" + encodeURIComponent(name);
      info.textContent = (pos + 1) + "/" + total;
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

    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      close();
    });

    overlay.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    });

    overlay.addEventListener("click", function (e) {
      var box = overlay.getBoundingClientRect();
      var x = e.clientX - box.left;
      var w = box.width;
      if (x < w * 0.4) {
        prev();
      } else if (x > w * 0.6) {
        next();
      }
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
