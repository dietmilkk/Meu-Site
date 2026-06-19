(function () {
  "use strict";

  var win = document.getElementById("pinsWindow");
  var body = document.getElementById("pinsBody");
  var dragHandle = document.getElementById("pinsDragHandle");
  var btnClose = document.getElementById("pinsBtnClose");
  var btnMinimize = document.getElementById("pinsBtnMinimize");
  var btnMaximize = document.getElementById("pinsBtnMaximize");
  var elGrid = document.getElementById("pinsGrid");
  var elCounter = document.getElementById("pinsCounter");
  var elAddBtn = document.getElementById("pinsAddBtn");

  var STORAGE_KEY = "w2k_pins";
  var pins = [];

  function loadPins() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && Array.isArray(d)) pins = d;
    } catch (e) {}
  }

  function savePins() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pins)); } catch (e) {}
  }

  function render() {
    if (!elGrid) return;
    if (pins.length === 0) {
      elGrid.innerHTML =
        '<div class="pins-empty">' +
        '<div class="pins-empty-icon">📌</div>' +
        '<div class="pins-empty-text">Nenhum pin ainda</div>' +
        '<div class="pins-empty-sub">Clique em "Adicionar Pin" para começar</div>' +
        '</div>';
      if (elCounter) elCounter.textContent = "0 pins";
      return;
    }
    var html = "";
    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      var img = p.image || "system/assets/icons/tango2kde/48x48/apps/gwenview.png";
      var title = p.title || "Sem título";
      var desc = p.desc || "";
      html +=
        '<div class="pins-card" data-index="' + i + '">' +
        '<img class="pins-card-img" src="' + img + '" alt="" loading="lazy" onerror="this.src=\'system/assets/icons/tango2kde/48x48/apps/gwenview.png\'">' +
        '<div class="pins-card-body">' +
        '<div class="pins-card-title">' + esc(title) + '</div>' +
        (desc ? '<div class="pins-card-desc">' + esc(desc) + '</div>' : "") +
        '</div>' +
        '<div class="pins-card-del" data-index="' + i + '">✕</div>' +
        '</div>';
    }
    elGrid.innerHTML = html;
    if (elCounter) elCounter.textContent = pins.length + " pin" + (pins.length !== 1 ? "s" : "");

    // Click to open URL
    Array.from(elGrid.querySelectorAll(".pins-card")).forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.classList.contains("pins-card-del")) return;
        var idx = parseInt(card.getAttribute("data-index"));
        var p = pins[idx];
        if (p && p.url) {
          if (typeof playLaunchSnd === "function") playLaunchSnd();
          window.open(p.url, "_blank");
        }
      });
    });

    // Delete button
    Array.from(elGrid.querySelectorAll(".pins-card-del")).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute("data-index"));
        pins.splice(idx, 1);
        savePins();
        render();
        if (typeof playCloseSnd === "function") playCloseSnd();
      });
    });
  }

  function esc(s) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  function showAddDialog() {
    if (typeof playClickSnd === "function") playClickSnd();

    var overlay = document.createElement("div");
    overlay.className = "pins-dialog-overlay";
    overlay.innerHTML =
      '<div class="pins-dialog">' +
      '<div class="pins-dialog-title">Adicionar Pin</div>' +
      '<label>URL (opcional)<input type="text" id="pinsDlgUrl" placeholder="https://..."></label>' +
      '<label>URL da Imagem<input type="text" id="pinsDlgImg" placeholder="https://... ou deixe vazio"></label>' +
      '<label>Título<input type="text" id="pinsDlgTitle" placeholder="Nome do pin"></label>' +
      '<label>Descrição (opcional)<textarea id="pinsDlgDesc" placeholder="Breve descrição"></textarea></label>' +
      '<div class="pins-dialog-actions">' +
      '<button class="pins-btn" id="pinsDlgCancel">Cancelar</button>' +
      '<button class="pins-btn" id="pinsDlgSave">Salvar</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var urlInput = document.getElementById("pinsDlgUrl");
    var imgInput = document.getElementById("pinsDlgImg");
    var titleInput = document.getElementById("pinsDlgTitle");
    var descInput = document.getElementById("pinsDlgDesc");
    var cancelBtn = document.getElementById("pinsDlgCancel");
    var saveBtn = document.getElementById("pinsDlgSave");

    setTimeout(function () { titleInput.focus(); }, 100);

    function close() {
      overlay.remove();
    }

    cancelBtn.addEventListener("click", close);

    saveBtn.addEventListener("click", function () {
      var url = urlInput.value.trim();
      var img = imgInput.value.trim();
      var title = titleInput.value.trim();
      var desc = descInput.value.trim();

      if (!title && !url) {
        titleInput.focus();
        return;
      }

      pins.push({
        url: url || "",
        image: img || "",
        title: title || "Sem título",
        desc: desc || "",
      });
      savePins();
      render();
      if (typeof playToggleOnSnd === "function") playToggleOnSnd();
      close();
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
  }

  if (elAddBtn) {
    elAddBtn.addEventListener("click", showAddDialog);
  }

  var behavior = new WindowBehavior(win, {
    dragHandle: dragHandle,
    btnClose: btnClose,
    btnMinimize: btnMinimize,
    btnMaximize: btnMaximize,
    minW: 400,
    minH: 300,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/apps/gwenview.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: "Pins",
    taskbarAction: "pins",
    appId: "pins",
    onShow: function () {
      if (!win.style.width || win.style.width === "") win.style.width = "640px";
      if (!win.style.height || win.style.height === "") win.style.height = "480px";
      loadPins();
      render();
    },
    onHide: function () {},
  });

  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("pins", {
      label: "Pins",
      show: function () { behavior.show(); },
      minimize: function () { behavior.minimize(); },
      hasEntry: function () { return behavior.hasTaskbarEntry(); },
    });
  }
})();
