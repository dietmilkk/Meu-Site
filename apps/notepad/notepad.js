(function () {
  "use strict";

  var win = document.getElementById("notepadWindow");
  var dragHandle = document.getElementById("notepadDragHandle");
  var btnClose = document.getElementById("notepadBtnClose");
  var btnMinimize = document.getElementById("notepadBtnMinimize");
  var btnMaximize = document.getElementById("notepadBtnMaximize");
  var textarea = document.getElementById("notepadTextarea");
  var status = document.getElementById("notepadStatus");
  var rendered = document.getElementById("notepadRendered");
  var menuFile = document.getElementById("notepadMenuFile");
  var menuEdit = document.getElementById("notepadMenuEdit");
  var menuFormat = document.getElementById("notepadMenuFormat");
  var filesWin = document.getElementById("filesWindow");
  var filesList = document.getElementById("filesList");
  var filesDragHandle = document.getElementById("filesDragHandle");
  var filesBtnClose = document.getElementById("filesBtnClose");
  var filesBtnMinimize = document.getElementById("filesBtnMinimize");
  var filesBtnMaximize = document.getElementById("filesBtnMaximize");
  var fmtOn = false;

  var NOTEPAD_TEXT =
    "# Um desabafo\n" +
    "\n" +
    "Um registro de como tenho enxergado as coisas. Não como verdade final, mas como um jeito de organizar o que sinto por escrito.\n" +
    "\n" +
    "Aprendemos desde cedo a prever o mundo: o que é seguro, o que machuca, o que dá afeto, o que cobra um preço. Prever protege, mas também prende. Quando padrões antigos se repetem sem perceber, como se fossem leis, a liberdade vira um roteiro invisível. **Parecer livre enquanto se obedece sem notar é uma forma silenciosa de prisão.**\n" +
    "\n" +
    "---\n" +
    "\n" +
    "# O que pesa\n" +
    "\n" +
    "A vida virou produto sem que ninguém percebesse. Presença vira audiência, corpo vira vitrine, tempo vira lucro. Passa-se a se medir pelo que entrega, não pelo que é. E isso machuca por dentro: ao descansar, culpa; ao errar, vergonha; ao não render, medo de não ter valor. **Não é defeito precisar de descanso, vínculo e sentido. Defeito é um sistema que transforma necessidade em fraqueza para vender solução.**\n" +
    "\n" +
    "O que ajuda é lembrar: cansaço, dúvida, marcas do tempo e lágrimas não tiram dignidade. São sinais de vida. E felicidade não precisa ser essa promessa infinita de comprar e conquistar — ela pode ser mais simples, no presente.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Tempo, ídolos e fé\n" +
    "\n" +
    "Dinheiro é útil, mas virou régua para tudo: quem merece respeito, descanso, futuro. Para quem tem pouco, dinheiro é tempo — e tempo é vida. **Roubar tempo é roubar vida.** Depois se vende caro o que foi tomado: descanso, silêncio, saúde.\n" +
    "\n" +
    "Também existem os ídolos discretos: fama, corpo perfeito, aprovação digital, sucesso a qualquer custo. Quando a aparência vale mais que a verdade, sobra performance. E há o extremo que preocupa: quando a fé vira arma para justificar ódio. O sagrado só faz sentido se amplia compaixão; quando humilha, já se perdeu.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Como nos prendem\n" +
    "\n" +
    "Tecnologia e linguagem fascinam e assustam. A mesma rede que cura e conecta também vigia e polariza. E palavras importam: chamar guerra de 'estratégia' tenta limpar o que, no chão, é casa destruída e gente com medo. **Se aceitamos as palavras deles, aceitamos o mundo deles.**\n" +
    "\n" +
    "O medo é outra ferramenta silenciosa. Ensina a se calar antes de ser silenciado, a aceitar menos por aprender que desejar é perigoso. Uma sociedade com medo aceita qualquer promessa de segurança, mesmo que venha de quem machuca. **Coragem não é ausência de medo, é não deixar o medo governar.**\n" +
    "\n" +
    "Vejo também a inversão de valores: quem sente e pede ajuda é chamado de fraco, enquanto quem humilha posa de forte. Uma armadilha para manter tudo como está. Fraco, aqui, é quem precisa diminuir o outro para se sentir grande.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Liberdade e chão\n" +
    "\n" +
    "Se somos condicionados, podemos nos recondicionar. Não se escolhe tudo que forma — família, classe, medos —, mas escolhe-se o que fazer com isso. **Liberdade real é tomar posição diante do que nos formou.** E ela precisa de chão: tempo, pão, casa, saúde, vínculo. Sem isso, vira só discurso.\n" +
    "\n" +
    "Aceitar a imperfeição como prova de vida alivia: um corpo cansado, uma rotina simples, uma dúvida sincera não tiram valor. Autenticidade tem sido recusar viver como personagem só para caber. E rebeldia é menos gritar e mais lucidez: perceber que obediência nem sempre é virtude, que normalidade nem sempre é saúde. **Se aprendemos a nos ver como mercadoria, podemos reaprender a nos ver como gente.**\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## O custo\n" +
    "\n" +
    "Liberdade custa, mas submissão custa mais. Acordar sendo quem não se é, trabalhar até esgotar sem ser visto, medir a vida só pelo que se produz — tudo isso tem preço. Sem proteger o próprio tempo e a própria verdade, alguém transforma tudo em produto e ocupa o lugar.\n" +
    "\n" +
    "A finitude devolve o presente: lembrar que o tempo é finito pede *viver agora, falar agora, escolher agora*. Não para romantizar o fim, mas para não viver no automático. **Existir com sentido** importa mais que apenas sobreviver — e sentido se constrói, não se compra.\n" +
    "\n" +
    "No fim, previsão pode ser prisão ou porta. Se abre a encontro, estudo, silêncio, natureza, cuidado — liberta. **A vida que está em nossas mãos segue em aberto**, sem resposta pronta, e tudo bem.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## A vida não se vende\n" +
    "\n" +
    "A vida não é produto. É tarefa, escolha, luta e vínculo. É finita, mas não é pequena. Pode ser dura, mas também pode ser bela. E só se torna verdadeiramente bela quando se deixa de ser mercadoria e se volta a ser gente.\n" +
    "\n" +
    "Gente com história no rosto. Gente com medo no peito, mas coragem nas mãos. Gente que erra, aprende, cai, levanta. Gente que ama. Que cuida. Que pensa. Que questiona. Que recusa ser vendida.\n" +
    "\n" +
    "**A vida não se vende.**\n" +
    "**A vida se vive.**\n";
  var LINKS_TEXT =
    "LINKS — plataformas onde estou ativo :)\n" +
    "\n" +
    "SoundCloud\n" +
    "https://soundcloud.com/cu11\n" +
    "\n" +
    "Discord\n" +
    "@sillllky\n" +
    "\n" +
    "Bilibili\n" +
    "https://space.bilibili.com/3706931485084517/dynamic\n" +
    "\n" +
    "WakaTime\n" +
    "https://wakatime.com/@pepsicoca\n";

  var FILES = {
    notas: { name: "notas.txt", icon: "system/assets/icons/tango2kde/16x16/apps/kwrite.png", text: NOTEPAD_TEXT },
    links: { name: "links.txt", icon: "system/assets/icons/tango2kde/16x16/apps/kwrite.png", text: LINKS_TEXT }
  };

  var PROGRAMS = {
    notepad: { name: "Bloco de Notas", icon: "system/assets/icons/tango2kde/16x16/apps/kwrite.png", action: "notepad" },
    files: { name: "Gerenciador de Arquivos", icon: "system/assets/icons/tango2kde/16x16/apps/dolphin.png", action: "files" },
    soundcloud: { name: "Music Player", icon: "system/assets/icons/tango2kde/16x16/apps/kaudiocreator.png", action: "soundcloud" },
    games: { name: "Jogos", icon: "system/assets/icons/tango2kde/16x16/categories/applications-games.png", action: "games" },
    gallery: { name: "Coleção de imgs", icon: "system/assets/icons/tango2kde/16x16/apps/gwenview.png", action: "randomgif" },
    terminal: { name: "Terminal", icon: "system/assets/icons/tango2kde/16x16/apps/terminal.png", action: "terminal" },
    settings: { name: "Configurações", icon: "system/assets/icons/tango2kde/16x16/categories/redhat-system_tools.png", action: "settings" }
  };
  var currentFile = "notas";

  function updateStatus() {
    if (status && textarea) {
      var lines = textarea.value.split("\n").length;
      var chars = textarea.value.length;
      var fname = (FILES[currentFile] && FILES[currentFile].name) ? FILES[currentFile].name : "";
      status.textContent = fname + " — Ln " + lines + ", " + chars + " caracteres";
    }
  }

  function escHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderMarkdown(src) {
    var lines = src.split("\n");
    var html = "";
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var t = line.trim();
      if (t === "---" || t === "___" || t === "***") {
        html += "<hr>";
      } else if (/^### /.test(t)) {
        html += "<h3>" + escHtml(t.replace(/^### /, "")) + "</h3>";
      } else if (/^## /.test(t)) {
        html += "<h2>" + escHtml(t.replace(/^## /, "")) + "</h2>";
      } else if (/^# /.test(t)) {
        html += "<h1>" + escHtml(t.replace(/^# /, "")) + "</h1>";
      } else if (/^[\-\*] /.test(t) || /^\d+\. /.test(t)) {
        if (!inList) { html += "<p>"; inList = true; }
        html += escHtml(t.replace(/^[\-\*] |^\d+\. /, "")) + "<br>";
      } else if (t === "") {
        if (inList) { html += "</p>"; inList = false; }
      } else {
        if (inList) { html += "</p>"; inList = false; }
        var p = escHtml(line);
        p = p.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        p = p.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
        html += "<p>" + p + "</p>";
      }
    }
    if (inList) html += "</p>";
    return html;
  }

  function setFormat(on) {
    fmtOn = on;
    if (!textarea || !rendered) return;
    if (on) {
      rendered.innerHTML = renderMarkdown(textarea.value);
      textarea.style.display = "none";
      rendered.style.display = "block";
    } else {
      rendered.style.display = "none";
      textarea.style.display = "";
    }
    if (menuEdit) menuEdit.classList.toggle("active", !on);
    if (menuFormat) menuFormat.classList.toggle("active", on);
  }

  function openFile(id) {
    if (!FILES[id]) return;
    if (textarea && FILES[currentFile]) {
      FILES[currentFile].text = textarea.value;
    }
    currentFile = id;
    if (textarea) {
      textarea.value = FILES[id].text;
    }
    if (fmtOn) {
      rendered.innerHTML = renderMarkdown(textarea.value);
    }
    updateStatus();
    if (typeof playClickSnd === "function") playClickSnd();
    if (window.notepadBehavior) window.notepadBehavior.bringToFront();
    buildFilesRows();
  }

  if (menuEdit) {
    menuEdit.addEventListener("click", function () {
      if (textarea && FILES[currentFile]) FILES[currentFile].text = textarea.value;
      setFormat(false);
      if (typeof playClickSnd === "function") playClickSnd();
    });
  }
  if (menuFormat) {
    menuFormat.addEventListener("click", function () {
      if (textarea && FILES[currentFile]) FILES[currentFile].text = textarea.value;
      setFormat(true);
      if (typeof playClickSnd === "function") playClickSnd();
    });
  }

  if (textarea) {
    textarea.value = FILES[currentFile].text;
    updateStatus();
    textarea.addEventListener("input", function () {
      if (FILES[currentFile]) FILES[currentFile].text = textarea.value;
      updateStatus();
    });
    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        var s = textarea.selectionStart;
        var v = textarea.value;
        textarea.value = v.slice(0, s) + "  " + v.slice(textarea.selectionEnd);
        textarea.selectionStart = textarea.selectionEnd = s + 2;
        if (FILES[currentFile]) FILES[currentFile].text = textarea.value;
        updateStatus();
      }
    });
  }

  /* ===== Files manager ===== */
  function buildFilesRows() {
    if (!filesList) return;
    filesList.innerHTML = "";
    var ids = ["notas", "links"];
    var titleFiles = document.createElement("div");
    titleFiles.className = "files-section-title";
    titleFiles.textContent = "Arquivos";
    filesList.appendChild(titleFiles);
    for (var i = 0; i < ids.length; i++) {
      (function (id) {
        var meta = FILES[id];
        var row = document.createElement("div");
        row.className = "files-row";
        if (id === currentFile) row.classList.add("active");
        row.dataset.file = id;
        var kb = (meta.text.length / 1024).toFixed(1);
        row.innerHTML =
          '<img src="' + meta.icon + '" alt="" width="20" height="20">' +
          '<span class="files-row-name">' + meta.name + '</span>' +
          '<span class="files-row-size">' + kb + ' KB</span>';
        row.addEventListener("click", function () {
          if (typeof playClickSnd === "function") playClickSnd();
          var rows = filesList.querySelectorAll(".files-row");
          for (var r = 0; r < rows.length; r++) rows[r].classList.remove("selected");
          row.classList.add("selected");
        });
        row.addEventListener("dblclick", function () {
          var npWin = document.getElementById("notepadWindow");
          var hidden = !npWin || npWin.style.display === "none" || !npWin.offsetParent;
          openFile(id);
          if (hidden && window.notepadBehavior) window.notepadBehavior.show();
        });
        filesList.appendChild(row);
      })(ids[i]);
    }
    var titleProg = document.createElement("div");
    titleProg.className = "files-section-title";
    titleProg.textContent = "Programas";
    filesList.appendChild(titleProg);
    var progIds = ["notepad", "files", "soundcloud", "games", "gallery", "terminal", "settings"];
    for (var j = 0; j < progIds.length; j++) {
      (function (pid) {
        var prog = PROGRAMS[pid];
        if (!prog) return;
        var prow = document.createElement("div");
        prow.className = "files-row";
        prow.innerHTML =
          '<img src="' + prog.icon + '" alt="" width="20" height="20">' +
          '<span class="files-row-name">' + prog.name + '</span>' +
          '<span class="files-row-size">▶</span>';
        prow.addEventListener("click", function () {
          if (typeof playClickSnd === "function") playClickSnd();
          if (W2K && W2K.AppRegistry) W2K.AppRegistry.launch(prog.action);
        });
        filesList.appendChild(prow);
      })(progIds[j]);
    }
  }

  function openFilesWindow() {
    buildFilesRows();
    if (window.filesBehavior) {
      window.filesBehavior.show();
    } else if (filesWin) {
      filesWin.style.display = "";
    }
    if (typeof playClickSnd === "function") playClickSnd();
  }

  if (menuFile) {
    menuFile.addEventListener("click", function () {
      openFilesWindow();
    });
  }

  if (typeof WindowBehavior !== "undefined" && win) {
    var behavior = new WindowBehavior(win, {
      dragHandle: dragHandle,
      btnClose: btnClose,
      btnMinimize: btnMinimize,
      btnMaximize: btnMaximize,
      minW: 420,
      minH: 300,
      taskbarIcon:
        '<img src="system/assets/icons/tango2kde/16x16/apps/kwrite.png" alt="" width="14" height="14" style="flex-shrink:0;">',
      taskbarLabel: __("notepad.title"),
      taskbarAction: "notepad",
      appId: "notepad",
      onShow: function () {
        if (win) {
          win.style.width = "720px";
          win.style.height = "560px";
        }
        updateStatus();
      },
      onHide: function () {},
    });
    window.notepadBehavior = behavior;
  }

  if (typeof WindowBehavior !== "undefined" && filesWin) {
    var filesBehavior = new WindowBehavior(filesWin, {
      dragHandle: filesDragHandle,
      btnClose: filesBtnClose,
      btnMinimize: filesBtnMinimize,
      btnMaximize: filesBtnMaximize,
      minW: 300,
      minH: 220,
      taskbarIcon:
        '<img src="system/assets/icons/tango2kde/16x16/apps/dolphin.png" alt="" width="14" height="14" style="flex-shrink:0;">',
      taskbarLabel: __("files.title"),
      taskbarAction: "files",
      appId: "files",
      onShow: function () {
        if (filesWin) {
          filesWin.style.width = "340px";
          filesWin.style.height = "300px";
        }
        buildFilesRows();
      },
    });
    window.filesBehavior = filesBehavior;
  }

  if (typeof W2K !== "undefined" && W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("notepad", {
      label: __("notepad.title"),
      show: function () {
        if (window.notepadBehavior) window.notepadBehavior.show();
      },
      minimize: function () {
        if (window.notepadBehavior) window.notepadBehavior.minimize();
      },
      hasEntry: function () {
        return window.notepadBehavior ? window.notepadBehavior.hasTaskbarEntry() : false;
      },
    });
    W2K.AppRegistry.register("files", {
      label: __("files.title"),
      show: function () {
        if (window.filesBehavior) window.filesBehavior.show();
        else if (filesWin) filesWin.style.display = "";
        buildFilesRows();
      },
      minimize: function () {
        if (window.filesBehavior) window.filesBehavior.minimize();
      },
      hasEntry: function () {
        return window.filesBehavior ? window.filesBehavior.hasTaskbarEntry() : false;
      },
    });
  }

  window.notepadOpenFile = openFile;
})();

