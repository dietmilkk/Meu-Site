/* ============================================================
   cursor.js — Retro cursor effects
   ============================================================ */

(function () {
  "use strict";

  /* ================================================================
     RETRO CURSOR — embedded PNG, 60fps smooth
     ================================================================ */

  if (!("ontouchstart" in window)) {
    (function () {
      var el = document.createElement("div");
      el.id = "retroCursor";
      el.innerHTML =
        '<img src="assets/system/cursors/Normal%20Select.cur" class="rc-img"><img src="assets/system/cursors/Link%20Select.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Text%20Select.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Move.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Vertical%20Resize.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Horizontal%20Resize.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Diagonal%20Resize%201.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Diagonal%20Resize%202.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Busy.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Working%20in%20Background.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Unavailable.cur" class="rc-img" style="display:none"><img src="assets/system/cursors/Help%20Select.cur" class="rc-img" style="display:none">';
      document.body.appendChild(el);

      var ss = document.createElement("style");
      ss.textContent =
        "*{cursor:none!important}#retroCursor{pointer-events:none;position:fixed;z-index:1999999;filter:drop-shadow(0 0 2px rgba(0,0,0,0.3))}.rc-img{display:block}";
      document.head.appendChild(ss);

      var imgs = el.querySelectorAll(".rc-img");
      var arr = imgs[0],
        hand = imgs[1],
        text = imgs[2],
        move = imgs[3],
        vresize = imgs[4],
        hresize = imgs[5],
        d1 = imgs[6],
        d2 = imgs[7],
        busy = imgs[8],
        work = imgs[9],
        unavailable = imgs[10],
        help = imgs[11];

      var offsets = {
        arrow: { x: -10, y: -10 },
        hand: { x: -10, y: -10 },
        text: { x: -8, y: -9 },
        move: { x: -10, y: -10 },
        vresize: { x: -10, y: -10 },
        hresize: { x: -10, y: -10 },
        d1: { x: -10, y: -10 },
        d2: { x: -11, y: -10 },
        busy: { x: -10, y: -10 },
        work: { x: -10, y: -10 },
        unavailable: { x: -10, y: -10 },
        help: { x: -10, y: -10 },
      };

      var cursorMap = {
        arrow: arr,
        hand: hand,
        text: text,
        move: move,
        vresize: vresize,
        hresize: hresize,
        d1: d1,
        d2: d2,
        busy: busy,
        work: work,
        unavailable: unavailable,
        help: help,
      };

      var mx = -100,
        my = -100,
        cur = "arrow";
      var selHand =
        "button,a,input,select,textarea,[role=button],[onclick],.desk-icon,.win-btn,.start-btn,.ql-icon,.taskbar-item,.start-menu-item,.ctx-menu-item,.xp-dialog-close,.xp-dialog-btn,.mobile-btn";
      var selText = "pre,code,.terminal-output,.terminal-input";
      var selResizeV =
        '.resize-edge[data-edge="t"],.resize-edge[data-edge="b"]';
      var selResizeH =
        '.resize-edge[data-edge="l"],.resize-edge[data-edge="r"]';
      var selResizeD1 =
        '.resize-corner[data-edge="tl"],.resize-corner[data-edge="br"]';
      var selResizeD2 =
        '.resize-corner[data-edge="tr"],.resize-corner[data-edge="bl"]';
      var selMove = '[data-move="true"],.dragging,.window-moving';
      var selBusy = ".loading,.busy";
      var selWork = ".working";
      var selUnavailable = ".disabled,[disabled]";

      var inside = false;

      document.addEventListener("mousemove", function (e) {
        mx = e.clientX;
        my = e.clientY;
        if (!inside) {
          inside = true;
          el.style.visibility = "visible";
        }
      });

      document.documentElement.addEventListener("mouseleave", function () {
        inside = false;
        el.style.visibility = "hidden";
      });

      document.documentElement.addEventListener("mouseenter", function () {
        inside = true;
        el.style.visibility = "visible";
      });

      var cursorEl = el;
      var cursorImg = arr;
      var _tickFrame = 0;
      var _lastWant = "";

      function tick(now) {
        _tickFrame++;
        if (!inside) {
          cursorEl.style.visibility = "hidden";
          requestAnimationFrame(tick);
          return;
        }
        cursorEl.style.transform = "translate(" + mx + "px," + my + "px)";
        if (_tickFrame & 1) {
          requestAnimationFrame(tick);
          return;
        }
        var want = "arrow";
        cursorEl.style.visibility = "hidden";
        var t = document.elementFromPoint(mx, my);
        cursorEl.style.visibility = "visible";
        if (t && t.closest) {
          if (t.closest(selUnavailable)) want = "unavailable";
          else if (t.closest(selWork)) want = "work";
          else if (t.closest(selBusy)) want = "busy";
          else if (t.closest(selMove)) want = "move";
          else if (t.closest(selText)) want = "text";
          else if (t.closest(selHand)) want = "hand";
          else if (t.closest(".resize-corner")) {
            var edge = t.closest(".resize-corner").getAttribute("data-edge");
            if (edge === "tl" || edge === "br") want = "d1";
            else want = "d2";
          } else if (t.closest(".resize-edge")) {
            var edge = t.closest(".resize-edge").getAttribute("data-edge");
            if (edge === "l" || edge === "r") want = "hresize";
            else want = "vresize";
          }
        } else if (!t) {
          cursorEl.style.visibility = "hidden";
        }
        if (want !== cur) {
          cur = want;
          if (cursorMap[want]) {
            for (var k in cursorMap) {
              cursorMap[k].style.display = k === want ? "" : "none";
            }
            var o = offsets[want];
            cursorMap[want].style.marginLeft = o.x + "px";
            cursorMap[want].style.marginTop = o.y + "px";
          }
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })();
  }

})();
