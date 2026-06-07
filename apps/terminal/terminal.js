(function () {
  "use strict";

  // Mapeamento dos elementos do DOM
  var termWin = document.getElementById("termWindow");
  var termBody = document.getElementById("termBody");
  var termDragHandle = document.getElementById("termDragHandle");
  var termOutput = document.getElementById("termOutput");
  var termInput = document.getElementById("termInput");
  var termBtnClose = document.getElementById("termBtnClose");
  var termBtnMinimize = document.getElementById("termBtnMinimize");
  var termBtnMaximize = document.getElementById("termBtnMaximize");

  // Estado do Terminal
  var currentDir = "C:\\";
  var cmdHistory = [];
  var historyIndex = -1;
  var terminalFirstOpen = true;
  var _pageLoad = Date.now();

  // Detecta se o script está rodando incorretamente via arquivo local
  function checkProtocol() {
    if (window.location.protocol === "file:") {
      printPre(__('terminal.fileWarn'));
      printPre(__('terminal.fileWarn2'));
      printPre(__('terminal.fileWarn3'));
    }
  }

  function getUptime() {
    var elapsed = Math.floor((Date.now() - _pageLoad) / 1000);
    var h = Math.floor(elapsed / 3600);
    var m = Math.floor((elapsed % 3600) / 60);
    var s = elapsed % 60;
    return h + "h " + m + "m " + s + "s";
  }

  function getOS() {
    var ua = navigator.userAgent || "";
    if (ua.indexOf("Windows NT 10") !== -1) return "Windows 10";
    if (ua.indexOf("Windows NT 6.3") !== -1) return "Windows 8.1";
    if (ua.indexOf("Windows NT 6.2") !== -1) return "Windows 8";
    if (ua.indexOf("Windows NT 6.1") !== -1) return "Windows 7";
    if (ua.indexOf("Windows NT 6.0") !== -1) return "Windows Vista";
    if (ua.indexOf("Windows NT 5.1") !== -1) return "Windows XP";
    if (ua.indexOf("Windows NT 5.0") !== -1) return "Windows 2000";
    if (ua.indexOf("Mac") !== -1) return "macOS";
    if (ua.indexOf("Linux") !== -1) return "Linux";
    if (ua.indexOf("Android") !== -1) return "Android";
    if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) return "iOS";
    return __('terminal.osUnknown');
  }

  // Lista de comandos suportados
  var commands = {
    help: function () {
      return __('terminal.help');
    },
    clear: function () {
      if (termOutput) termOutput.innerHTML = "";
      return "";
    },
    uptime: function () {
      return __('terminal.uptime') + getUptime();
    },
    data: function () {
      const now = new Date();
      const mem = navigator.deviceMemory
        ? navigator.deviceMemory + " GB"
        : __("sys.unknown");
      const cpu = navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency + __("sys.cores")
        : __("sys.unknown");
      const uaClean = navigator.userAgent
        ? navigator.userAgent.replace(/[\/][^\s]*/g, "").trim()
        : __("sys.unknown");

      var info = "\n" + __('terminal.dataHeader') + "\n\n" +
        __("sys.time") + now.toLocaleTimeString() + "\n" +
        __("sys.os") + getOS() + "\n" +
        __("sys.arch") + (navigator.platform || __("sys.unknown")) + "\n" +
        __("sys.browser") + uaClean + "\n" +
        __("sys.lang") + (navigator.language || "") + "\n" +
        __("sys.tz") + Intl.DateTimeFormat().resolvedOptions().timeZone + "\n" +
        __("sys.resolution") + screen.width + "x" + screen.height + "\n" +
        __("sys.colorDepth") + screen.colorDepth + "-bit\n" +
        __("sys.sessionDuration") + getUptime() + "\n" +
        __("sys.cpu") + cpu + "\n" +
        __("sys.ram") + mem;

      printPre(info);

      fetchGeo().then(function (d) {
        var loc = (d.city || "?") + ", " + (d.region || "?") + ", " + (d.country || "?");
        var coords = '';
        if (d.lat != null && d.lon != null) coords = d.lat + ", " + d.lon;
        printPre(
          __("sys.ip") + (d.ip || "?") + "\n" +
          __("sys.location") + loc + "\n" +
          __("sys.zip") + (d.postal || "?") + "\n" +
          __("sys.isp") + (d.isp || d.org || "?") + "\n" +
          __("sys.coords") + (coords || "?")
        );
      }).catch(function () {
        printPre(__("sys.fetchFail"));
      });
      return "";
    },
    whereami: function () {
      var out = __('terminal.whereami.header') + '\n\n';
      var now = new Date();
      var days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
      var months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      out += '  ' + __('terminal.ipLocation') + navigator.language + '\n';
      out += '  ' + __('terminal.whereami.tz') + Intl.DateTimeFormat().resolvedOptions().timeZone + '\n';
      out += '  ' + __('terminal.whereami.localTime') + days[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear() + ' ' + now.toLocaleTimeString() + '\n';
      out += '  ' + __('terminal.whereami.agent') + navigator.userAgent.substring(0, 80) + '\n';
      out += '  ' + __('terminal.whereami.platform') + (navigator.platform || __('terminal.unknown')) + '\n';
      out += '\n' + __('terminal.whereami.fetchGeo');
      printPre(out);

      fetchGeo().then(function (d) {
        var coordStr = '';
        if (d.lat != null && d.lon != null) coordStr = '\n  Coord: ' + d.lat + ', ' + d.lon;
        printPre(
          '  IP: ' + (d.ip || '?') + '\n' +
          '  ' + __('terminal.ipLocation') + d.city + ', ' + d.region + ', ' + d.country +
          coordStr + '\n' +
          '  ' + __('terminal.ipISP') + (d.isp || d.org || __('terminal.ipUnknown')) + '\n' +
          '  ' + __('terminal.ipTZ') + (d.timezone || __('terminal.ipUnknown'))
        );
      }).catch(function () {
        printPre(__('terminal.whereami.geoFail'));
      });
      return "";
    },

  };

  var _termMaxLines = 500;

  function _trimOutput() {
    while (termOutput && termOutput.children.length > _termMaxLines) {
      termOutput.removeChild(termOutput.firstChild);
    }
  }

  // Funções de Renderização na Tela
  function printLine(text) {
    if (!termOutput) return;
    var div = document.createElement("div");
    div.className = "term-line";
    div.textContent = text;
    termOutput.appendChild(div);
    _trimOutput();
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function printPre(text) {
    if (!text) return;
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      printLine(lines[i]);
    }
  }

  // Interpretador de comandos executados
  function processCommand(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;

    cmdHistory.push(cmd);
    if (cmdHistory.length > 1000) cmdHistory.shift();
    historyIndex = cmdHistory.length;

    var parts = cmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [cmd];
    var command = parts[0].toLowerCase();
    var args = parts.slice(1).join(" ").replace(/"/g, "");

    printLine(currentDir + ">" + cmd);

    if (command === "exit" || command === "quit") {
      if (typeof termBehavior !== "undefined" && termBehavior.hide) {
        termBehavior.hide();
      }
      return;
    }

    var handler = commands[command];
    if (handler) {
      var result = handler(args);
      if (result) printPre(result);
    } else {
      if (typeof playErrorBeepSnd === 'function') playErrorBeepSnd();
      printLine(
        '"' + command + '" ' + __('terminal.unknownCmd'),
      );
    }
  }

  // Ouvintes de Eventos de Teclado e Foco
  if (termInput) {
    termInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        if (typeof playClickSnd === 'function') playClickSnd();
        processCommand(termInput.value);
        termInput.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          termInput.value = cmdHistory[historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          termInput.value = cmdHistory[historyIndex];
        } else {
          historyIndex = cmdHistory.length;
          termInput.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        termInput.value += "  ";
      }
    });

    termInput.addEventListener("click", function () {
      termInput.focus();
    });
  }

  function termReset() {
    if (termOutput) termOutput.innerHTML = "";
    if (termInput) termInput.value = "";
    currentDir = "C:\\";
    cmdHistory = [];
    historyIndex = -1;
    terminalFirstOpen = true;
  }

  // Instanciação e controle da janela do terminal
  if (typeof WindowBehavior !== "undefined") {
    var termBehavior = new WindowBehavior(termWin, {
      dragHandle: termDragHandle,
      btnClose: termBtnClose,
      btnMinimize: termBtnMinimize,
      btnMaximize: termBtnMaximize,
      minW: 500,
      minH: 300,
      taskbarIcon:
        '<img src="system/assets/icons/tango2kde/16x16/apps/terminal.png" alt="" width="14" height="14" style="flex-shrink:0;">',
      taskbarLabel: __('desktop.terminal'),
      taskbarAction: 'terminal',
      appId: 'terminal',
      onShow: function () {
        if (termWin) {
          termWin.style.width = "580px";
          termWin.style.height = "380px";
        }
        if (termInput) termInput.focus();
        if (terminalFirstOpen) {
          terminalFirstOpen = false;
          var bootText =
            __('terminal.boot1') + '\n' +
            __('terminal.boot2') + '\n\n' +
            commands.help();
          var lines = bootText.split("\n");
          for (var i = 0; i < lines.length; i++) {
            if (termOutput) {
              var div = document.createElement("div");
              div.className = "term-line";
              div.textContent = lines[i];
              termOutput.appendChild(div);
            }
          }
          if (termOutput) termOutput.scrollTop = termOutput.scrollHeight;
        }
      },
      onHide: function () {
        termReset();
      },
    });

  }

  // Registro no sistema operacional simulado W2K
  if (
    typeof W2K !== "undefined" &&
    W2K &&
    W2K.AppRegistry &&
    typeof termBehavior !== "undefined"
  ) {
    W2K.AppRegistry.register("terminal", {
      label: __('desktop.terminal'),
      show: function () {
        termBehavior.show();
      },
      minimize: function () {
        termBehavior.minimize();
      },
      hasEntry: function () {
        return termBehavior.hasTaskbarEntry();
      },
    });
  }
})();
