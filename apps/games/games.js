(function () {
  "use strict";

  var gamesWin = document.getElementById("gamesWindow");
  var gamesBody = document.getElementById("gamesBody");
  var gamesDragHandle = document.getElementById("gamesDragHandle");
  var gamesBtnClose = document.getElementById("gamesBtnClose");
  var gamesBtnMinimize = document.getElementById("gamesBtnMinimize");
  var gamesBtnMaximize = document.getElementById("gamesBtnMaximize");

  var SNAKE_CELL = 28;
  var MAZE_CELL_SIZE = 44;
  var gameState = {};

  /* ================================================================
      Achievements & Stats System
     ================================================================ */
  var _ACH = {
    firstFood:   { label: null, done: false },
    food50:      { label: null, done: false },
    food100:     { label: null, done: false },
    food200:     { label: null, done: false },
    firstMaze:   { label: null, done: false },
    maze5:       { label: null, done: false },
    maze10:      { label: null, done: false },
    mazeMaster:  { label: null, done: false },
    snake20:     { label: null, done: false },
    bigEater:    { label: null, done: false },
    snakeMaster: { label: null, done: false },
    speedRunner: { label: null, done: false },
    speedDemon:  { label: null, done: false },
    goldenGobbler: { label: null, done: false },
    poisonEater: { label: null, done: false },
    mazeExplorer: { label: null, done: false },
    mazeNoDeath: { label: null, done: false },
    mazeLevel5:  { label: null, done: false },
    mazeLevel10: { label: null, done: false },
  };
  try {
    var _achSaved = JSON.parse(localStorage.getItem('w2k_ach') || '{}');
    for (var _ak in _achSaved) { if (_ACH[_ak]) _ACH[_ak].done = _achSaved[_ak]; }
  } catch (e) {}
  function _achSave() {
    var o = {};
    for (var _ak in _ACH) o[_ak] = _ACH[_ak].done;
    try { localStorage.setItem('w2k_ach', JSON.stringify(o)); } catch (e) {}
  }
  function _achUnlock(id) {
    if (!_ACH[id] || _ACH[id].done) return;
    _ACH[id].done = true;
    _achSave();
    var label = _ACH[id].label;
    if (!label) {
      var key = 'games.ach.' + id;
      label = __(key);
      _ACH[id].label = label;
    }
    var c = document.getElementById('achToast');
    if (!c) {
      c = document.createElement('div');
      c.id = 'achToast';
      c.style.cssText = 'position:fixed;bottom:52px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;font-family:monospace;';
      document.body.appendChild(c);
    }
    var el = document.createElement('div');
    el.style.cssText = 'background:rgba(0,0,0,0.92);border:2px solid #ffd700;color:#ffd700;padding:8px 20px;font-size:13px;text-align:center;white-space:nowrap;box-shadow:0 0 24px rgba(255,215,0,0.35);text-shadow:0 0 8px rgba(255,215,0,0.5);opacity:0;transform:translateY(16px) scale(0.85);transition:opacity 0.3s cubic-bezier(0.34,1.56,0.64,1),transform 0.3s cubic-bezier(0.34,1.56,0.64,1);';
    el.textContent = label;
    c.appendChild(el);
    requestAnimationFrame(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    });
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px) scale(0.9)';
      setTimeout(function () { el.remove(); }, 300);
    }, 3500);
  }
  var _GSTATS = { snakePlayed:0, mazePlayed:0, totalFood:0, totalMazeSteps:0, maxMazeLevel:0, mazeCompleted:0, totalCoins:0, totalPoisons:0, totalBonusFood:0 };
  try {
    var _gsSaved = JSON.parse(localStorage.getItem('w2k_gstats') || '{}');
    for (var _gk in _gsSaved) _GSTATS[_gk] = _gsSaved[_gk] || 0;
  } catch (e) {}
  function _gsSave() {
    try { localStorage.setItem('w2k_gstats', JSON.stringify(_GSTATS)); } catch (e) {}
  }

  if (gamesBody) {
    gamesBody.style.padding = "0";
  }

  // FUNÇÃO CORRIGIDA: Limpa o container principal antes de renderizar novas telas
  function clearBody() {
    if (gamesBody) {
      gamesBody.innerHTML = "";
    }
  }

  function gamesReset() {
    if (gameState.cleanup) gameState.cleanup();
    gameState = {};
    showSelector();
  }

  var gamesBehavior = new WindowBehavior(gamesWin, {
    dragHandle: gamesDragHandle,
    btnClose: gamesBtnClose,
    btnMinimize: gamesBtnMinimize,
    btnMaximize: gamesBtnMaximize,
    minW: 520,
    minH: 400,
    taskbarIcon:
      '<img src="system/assets/icons/tango2kde/16x16/categories/applications-games.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: __("games.title"),
    taskbarAction: 'games',
    onShow: function () {
      gamesWin.style.width = "780px";
      gamesWin.style.height = "660px";
    },
    onHide: function () {
      gamesReset();
    },
  });

  window.gamesMinimizeWindow = function () {
    gamesBehavior.minimize();
  };

  if (typeof W2K !== "undefined" && W2K.AppRegistry) {
    W2K.AppRegistry.register("games", {
      label: __("games.title"),
      show: function () {
        gamesBehavior.show();
      },
      minimize: function () {
        gamesBehavior.minimize();
      },
      hasEntry: function () {
        return gamesBehavior.hasTaskbarEntry();
      },
    });
  }

  var _selectorIdx = 0;
  var _gamesData = [
    {
      id: "snake",
      label: __("games.snake"),
      desc: __("games.snake.desc"),
      icon: "S",
      controls: __("games.snake.controls"),
      color: "#0f0",
    },
    {
      id: "labirinto",
      label: __("games.maze"),
      desc: __("games.maze.desc"),
      icon: "M",
      controls: __("games.maze.controls"),
      color: "#0cf",
    },
    {
      id: "typing",
      label: __("games.typing"),
      desc: __("games.typing.desc"),
      icon: "T",
      controls: __("games.typing.controls"),
      color: "#f80",
    },
  ];

  function showSelector() {
    clearBody();
    gameState = {};
    _selectorIdx = 0;
    var c = document.createElement("div");
    c.className = "games-container";
    c.style.cssText =
      "height:100%;box-sizing:border-box;display:flex;flex-direction:column;padding:12px;gap:10px;";

    var grid = document.createElement("div");
    grid.style.cssText =
      "display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;flex:1;align-content:start;";

    for (var i = 0; i < _gamesData.length; i++) {
      (function (g, idx) {
        var block = document.createElement("div");
        block.className = "games-block";
        block.style.cssText =
          "background:#000080;color:#fff;font-family:'Courier New',monospace;font-size:14px;font-weight:bold;padding:20px 12px;text-align:center;cursor:pointer;border:2px solid;border-color:#0000c0 #000040 #000040 #0000c0;display:flex;align-items:center;justify-content:center;aspect-ratio:1;user-select:none;opacity:0;";
        block.textContent = g.label;
        block.style.animationDelay = (idx * 0.06) + "s";
        setTimeout(function(el) {
          return function() { el.classList.add("anim-block-enter"); };
        }(block), 10);
        block.addEventListener("click", function () {
          launchGame(g.id);
        });
        block.addEventListener("dblclick", function () {
          launchGame(g.id);
        });
        grid.appendChild(block);
      })(_gamesData[i], i);
    }

    c.appendChild(grid);

    var foot = document.createElement("div");
    foot.style.cssText =
      "font-family:'Courier New',monospace;font-size:11px;color:#888;text-align:center;padding:4px 0;";
    foot.textContent = __("games.footer") + "  |  " + _GSTATS.snakePlayed + " " + __("games.ach.snakePlayed") + "  |  " + _GSTATS.totalFood + " " + __("games.ach.totalFood") + "  |  " + _GSTATS.totalCoins + " " + __("games.ach.totalCoins") + "  |  " + _GSTATS.mazeCompleted + " " + __("games.ach.mazesDone") + "  |  " + __("games.ach.maxLvl") + " " + _GSTATS.maxMazeLevel;
    c.appendChild(foot);

    gamesBody.appendChild(c);

    document.addEventListener("keydown", selKeyHandler);
    gameState.cleanup = function () {
      document.removeEventListener("keydown", selKeyHandler);
    };
  }

  function setSelector(idx) {
    _selectorIdx = idx;
    var blocks = document.querySelectorAll(".games-block");
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].style.outline = i === idx ? "3px solid #fff" : "none";
      blocks[i].style.outlineOffset = i === idx ? "-3px" : "0";
    }
  }

  function launchGame(id) {
    if (typeof playLaunchSnd === 'function') playLaunchSnd();
    document.removeEventListener("keydown", selKeyHandler);
    if (id === "snake") { _GSTATS.snakePlayed++; _gsSave(); startSnake(); }
    else if (id === "labirinto") { _GSTATS.mazePlayed++; _gsSave(); startLabirinto(); }
    else if (id === "typing") { startTypingChaos(); }
  }

  function selKeyHandler(e) {
    var k = e.key;
    if (
      k === "ArrowUp" ||
      k === "ArrowDown" ||
      k === "ArrowLeft" ||
      k === "ArrowRight"
    ) {
      e.preventDefault();
      var cols = Math.floor(gamesBody.clientWidth / 160);
      if (cols < 1) cols = 1;
      var d = 0;
      if (k === "ArrowRight") d = 1;
      else if (k === "ArrowLeft") d = -1;
      else if (k === "ArrowDown") d = cols;
      else if (k === "ArrowUp") d = -cols;
      var next =
        (_selectorIdx + d + _gamesData.length * 10) % _gamesData.length;
      setSelector(next);
    } else if (k === "Enter") {
      e.preventDefault();
      launchGame(_gamesData[_selectorIdx].id);
    } else if (k === "Escape") {
      e.preventDefault();
      var w = gamesWin;
      // CORREÇÃO: Adicionado os parênteses () para executar a função de minimizar
      if (w && window.gamesMinimizeWindow) window.gamesMinimizeWindow();
    }
  }

  /* ================================================================
      Shared 3D Board Builder
     ================================================================ */
  function create3DBoard(rows, cols, getCellClass, cellSize) {
    if (!cellSize) cellSize = 18;
    var wrap = document.createElement("div");
    wrap.className = "games-board-3d";
    var grid = document.createElement("div");
    grid.className = "games-board-3d-inner";
    grid.id = "gameGrid";
    _gameGridRef = grid;
    grid.style.gridTemplateColumns = "repeat(" + cols + "," + cellSize + "px)";
    grid.style.gridTemplateRows = "repeat(" + rows + "," + cellSize + "px)";
    grid.style.transform = "translate(0,0) rotateX(28deg)";
    _cellCache = [];
    for (var y = 0; y < rows; y++) {
      _cellCache[y] = [];
      for (var x = 0; x < cols; x++) {
        var cell = document.createElement("div");
        cell.className =
          "games-cell " + (getCellClass(x, y) || "games-cell-empty");
        cell.id = "gc-" + x + "-" + y;
        _cellCache[y][x] = cell;
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);
    return wrap;
  }

  function update3DBoard(rows, cols, getCellClass) {
    var cc = _cellCache;
    for (var y = 0; y < rows; y++) {
      var row = cc[y];
      for (var x = 0; x < cols; x++) {
        var el = row[x];
        if (el)
          el.className =
            "games-cell " + (getCellClass(x, y) || "games-cell-empty");
      }
    }
  }

  /* ================================================================
      Smooth Camera System — player at bottom-center, looks ahead
      framerate-independent, two-stage smoothing
     ================================================================ */
  var _camX = 0,
    _camY = 0;
  var _camTX = 0,
    _camTY = 0;
  var _camRunning = false;
  var _camBoardId = "";
  var _camCellSize = 18;
  var _lastCamTime = 0;

  var _lookX = 0,
    _lookY = 0;
  var _camSpeed = 10;
  var _gameGridRef = null;
  var _cellCache = [];

  function startCamera(boardId, cellSize) {
    _camBoardId = boardId;
    _camCellSize = cellSize;
    _camX = 0;
    _camY = 0;
    _camTX = 0;
    _camTY = 0;
    _lookX = 0;
    _lookY = 0;
    _lastCamTime = performance.now();
    if (!_camRunning) {
      _camRunning = true;
      requestAnimationFrame(cameraTick);
    }
  }

  function stopCamera() {
    _camRunning = false;
  }

  function setCameraTarget(px, py, dirX, dirY) {
    var vp = _gameGridRef ? _gameGridRef.parentElement : null;
    if (!vp) return;
    var vpW = vp.clientWidth || 400;
    var vpH = vp.clientHeight || 300;
    var cs = _camCellSize;
    var lookAhead = cs * 3.5;
    var playerScreenX = vpW / 2;
    var playerScreenY = vpH / 2;

    _lookX += ((dirX || 0) - _lookX) * 0.25;
    _lookY += ((dirY || 0) - _lookY) * 0.25;
    _camTX = playerScreenX - px * cs - cs / 2 - _lookX * lookAhead;
    _camTY = playerScreenY - py * cs - cs / 2 - _lookY * lookAhead;
  }

  function cameraTick(now) {
    if (!_camRunning) return;
    var dt = Math.min(now - (_lastCamTime || now), 50);
    _lastCamTime = now;

    var f = Math.min(1, 1 - Math.exp((-_camSpeed * dt) / 1000));
    _camX += (_camTX - _camX) * f;
    _camY += (_camTY - _camY) * f;
    if (_gameGridRef) {
      _gameGridRef.style.transform =
        "translate(" +
        _camX.toFixed(1) +
        "px," +
        _camY.toFixed(1) +
        "px) rotateX(28deg)";
    }
    requestAnimationFrame(cameraTick);
  }

  /* ================================================================
      SNAKE
     ================================================================ */
  function startSnake() {
    clearBody();
    var size = 18;
    var cellSize = SNAKE_CELL;
    var snake = [{ x: 9, y: 9 }];
    var dir = { x: 1, y: 0 };
    var nextDir = { x: 1, y: 0 };
    var food = { x: 5, y: 5 };
    var score = 0;
    var highScore = 0;
    try {
      highScore = parseInt(localStorage.getItem("snakeHigh") || "0", 10);
    } catch (e) {}
    var running = true;
    var interval = null;
    var paused = false;
    var gameOverFlag = false;
    var foodType = 1;
    var _occ = [];
    for (var y = 0; y < size; y++) {
      _occ[y] = [];
      for (var x = 0; x < size; x++) _occ[y][x] = 0;
    }
    _occ[9][9] = 1;

    function placeFood() {
      var free = [];
      for (var y = 0; y < size; y++)
        for (var x = 0; x < size; x++) {
          if (!_occ[y][x]) free.push({ x: x, y: y });
        }
      if (free.length > 0) {
        food = free[Math.floor(Math.random() * free.length)];
        var r = Math.random();
        if (r < 0.45) foodType = 1;
        else if (r < 0.60) foodType = 2;
        else if (r < 0.75) foodType = 3;
        else if (r < 0.90) foodType = 4;
        else foodType = 5;
      }
    }

    function getCellClass(x, y) {
      if (gameOverFlag) return "games-cell-empty";
      if (x === snake[0].x && y === snake[0].y) return "games-cell-snake-head";
      if (_occ[y][x]) return "games-cell-snake-body";
      if (x === food.x && y === food.y) {
        if (foodType === 3) return "games-cell-food-gold";
        if (foodType === 4) return "games-cell-food-poison";
        if (foodType === 2) return "games-cell-food-speed";
        if (foodType === 5) return "games-cell-food-bonus";
        return "games-cell-food";
      }
      return "games-cell-empty";
    }

    function tick() {
      if (!running || paused) return;
      dir = { x: nextDir.x, y: nextDir.y };
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size) {
        endGame();
        return;
      }
      for (var i = 0; i < snake.length; i++)
        if (snake[i].x === head.x && snake[i].y === head.y) {
          endGame();
          return;
        }
      snake.unshift(head);
      _occ[head.y][head.x] = 1;
      if (head.x === food.x && head.y === food.y) {
        var prevScore = score;
        var prevFood = _GSTATS.totalFood;
        if (foodType === 4) {
          score = Math.max(0, score - 1);
          _GSTATS.totalPoisons++;
        } else if (foodType === 5) {
          score += 5;
          _GSTATS.totalBonusFood++;
        } else if (foodType === 2) {
          score += foodType;
        } else {
          score += foodType;
        }
        _GSTATS.totalFood++;
        _gsSave();
        if (_GSTATS.totalFood === 1) _achUnlock("firstFood");
        if (foodType === 3) _achUnlock("goldenGobbler");
        if (foodType === 4) _achUnlock("poisonEater");
        if (_GSTATS.totalFood >= 50) _achUnlock("food50");
        if (_GSTATS.totalFood >= 100) _achUnlock("food100");
        if (_GSTATS.totalFood >= 200) _achUnlock("food200");
        if (score >= 20) _achUnlock("snake20");
        if (score >= 50) _achUnlock("bigEater");
        if (score >= 100) _achUnlock("snakeMaster");
        var ccRow = _cellCache[food.y];
        var foodEl = ccRow ? ccRow[food.x] : null;
        if (foodEl) {
          foodEl.className = "games-cell anim-food-eat";
          setTimeout(function () { foodEl.className = "games-cell games-cell-empty"; }, 350);
        }
        placeFood();
        if (foodType === 2) {
          if (interval) {
            clearInterval(interval);
            interval = setInterval(tick, Math.max(40, 100 - score * 2));
          }
          if (Math.max(40, 100 - score * 2) <= 50) _achUnlock("speedDemon");
        }
      } else {
        var tail = snake.pop();
        _occ[tail.y][tail.x] = 0;
      }
      update3DBoard(size, size, getCellClass);
      setCameraTarget(snake[0].x, snake[0].y, dir.x, dir.y);
      var scEl = document.getElementById("snakeScore");
      if (scEl) {
        scEl.textContent = score;
        scEl.classList.remove("anim-score-pop");
        requestAnimationFrame(function() { scEl.classList.add("anim-score-pop"); });
      }
    }

    function endGame() {
      if (!running) return;
      running = false;
      gameOverFlag = true;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (score > highScore) {
        highScore = score;
        try {
          localStorage.setItem("snakeHigh", score);
        } catch (e) {}
      }
      update3DBoard(size, size, getCellClass);
      showSnakeOverlay();
      _gsSave();
    }

    function showSnakeOverlay() {
      var boardEl = document.querySelector("#snakeBoard .games-board-3d");
      if (!boardEl) return;
      var ov = document.createElement("div");
      ov.className = "anim-overlay-in";
      ov.style.cssText =
        "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
      ov.innerHTML =
        '<div style="text-align:center;">' +
        '<div class="anim-neon-flicker" style="font-size:28px;font-weight:bold;color:#c00;font-family:monospace;text-shadow:0 0 4px #c00,0 0 12px #c00,0 0 24px #c00;margin-bottom:8px;letter-spacing:2px;">' + __("games.gameover") + '</div>' +
        (score >= highScore && score > 0
          ? '<div style="color:#ff0;font-size:12px;margin:6px 0;font-family:monospace;">' + __("games.newrecord") + '</div>'
          : "") +
        '<div style="color:#0f0;font-size:13px;margin:4px 0;font-family:monospace;">' + __("games.score") + '<span style="color:#0ff;">' +
        score +
        "</span></div>" +
        '<div style="color:#0f0;font-size:13px;margin:4px 0;font-family:monospace;">' + __("games.highscore") + '<span style="color:#ff0;">' +
        highScore +
        "</span></div>" +
        '<div style="margin-top:14px;font-size:11px;color:#888;font-family:monospace;">' + __("games.replay") + '</div></div>';
      boardEl.appendChild(ov);
    }

    function keyHandler(e) {
      var k = e.key;
      if (k === "Enter" && gameOverFlag) {
        cleanup();
        startSnake();
        e.preventDefault();
        return;
      }
      if (k === "`") {
        cleanup();
        showSelector();
        e.preventDefault();
        return;
      }
      if (!running) return;
      switch (k) {
        case "ArrowUp":
          if (dir.y !== 1 && nextDir.y !== 1) {
            nextDir = { x: 0, y: -1 };
          }
          e.preventDefault();
          break;
        case "ArrowDown":
          if (dir.y !== -1 && nextDir.y !== -1) {
            nextDir = { x: 0, y: 1 };
          }
          e.preventDefault();
          break;
        case "ArrowLeft":
          if (dir.x !== 1 && nextDir.x !== 1) {
            nextDir = { x: -1, y: 0 };
          }
          e.preventDefault();
          break;
        case "ArrowRight":
          if (dir.x !== -1 && nextDir.x !== -1) {
            nextDir = { x: 1, y: 0 };
          }
          e.preventDefault();
          break;
        case "w":
        case "W":
          if (dir.y !== 1 && nextDir.y !== 1) {
            nextDir = { x: 0, y: -1 };
          }
          e.preventDefault();
          break;
        case "s":
        case "S":
          if (dir.y !== -1 && nextDir.y !== -1) {
            nextDir = { x: 0, y: 1 };
          }
          e.preventDefault();
          break;
        case "a":
        case "A":
          if (dir.x !== 1 && nextDir.x !== 1) {
            nextDir = { x: -1, y: 0 };
          }
          e.preventDefault();
          break;
        case "d":
        case "D":
          if (dir.x !== -1 && nextDir.x !== -1) {
            nextDir = { x: 1, y: 0 };
          }
          e.preventDefault();
          break;
        case "Escape":
        case " ":
        case "p":
        case "P":
          if (gameOverFlag) break;
          paused = !paused;
          if (paused) {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else {
            interval = setInterval(tick, Math.max(60, 200 - score * 3));
          }
          showPause(paused, "#snakeBoard");
          e.preventDefault();
          break;
      }
    }

    function showPause(p, boardId) {
      var boardEl = document.querySelector(boardId + " .games-board-3d");
      if (!boardEl) return;
      var ov = document.getElementById("pauseOverlay");
      if (p && !ov) {
        var d = document.createElement("div");
        d.id = "pauseOverlay";
        d.className = "anim-overlay-in";
        d.style.cssText =
          "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
        d.innerHTML =
          '<div class="anim-neon-flicker" style="font-size:28px;font-weight:bold;color:#ff0;font-family:monospace;text-shadow:0 0 4px #ff0,0 0 12px #ff0,0 0 24px #ff0;letter-spacing:3px;">' + __("games.pause") + '</div>';
        boardEl.appendChild(d);
      } else if (!p) {
        var d = document.getElementById("pauseOverlay");
        if (d) d.remove();
      }
    }

    function cleanup() {
      stopCamera();
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      clearInterval(speedCheck);
      document.removeEventListener("keydown", keyHandler);
    }

    var c = document.createElement("div");
    c.className = "games-container";
    c.style.cssText =
      "height:100%;box-sizing:border-box;display:flex;flex-direction:column;";

    var topBar = document.createElement("div");
    topBar.className = "games-hud";
    topBar.innerHTML =
      '<span class="games-hud-label">' + __("games.snake.hud") + '</span><span class="games-hud-sep">|</span>' + __("games.score") + '<span class="games-hud-val" id="snakeScore">0</span><span class="games-hud-sep">|</span>' + __("games.highscore") + '<span class="games-hud-high" id="snakeHigh">' +
      highScore +
      "</span>";
    c.appendChild(topBar);

    var boardWrap = document.createElement("div");
    boardWrap.id = "snakeBoard";
    boardWrap.style.cssText =
      "flex:1;display:flex;align-items:stretch;background:#000;min-height:0;";
    var grid = create3DBoard(size, size, getCellClass, cellSize);
    boardWrap.appendChild(grid);
    c.appendChild(boardWrap);

    gamesBody.appendChild(c);

    document.addEventListener("keydown", keyHandler);
    placeFood();
    startCamera("snakeBoard", cellSize);
    setCameraTarget(snake[0].x, snake[0].y, 1, 0);

    interval = setInterval(tick, Math.max(60, 200 - score * 3));
    var speedCheck = setInterval(function () {
      if (!running && interval) {
        clearInterval(speedCheck);
        return;
      }
      if (interval && !paused) {
        clearInterval(interval);
        interval = setInterval(tick, Math.max(60, 200 - score * 3));
      }
    }, 500);

    gameState.cleanup = function () {
      stopCamera();
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      clearInterval(speedCheck);
      document.removeEventListener("keydown", keyHandler);
    };
  }

  /* ================================================================
      DIGITAÇÃO CAÓTICA
     ================================================================ */
  function startTypingChaos() {
    clearBody();
    var words = [
      "SINERGIA", "BRAINSTORM", "ASAP", "MINDSET", "DELIVERY",
      "PROATIVO", "FEEDBACK", "BENCHMARK", "AGILE", "FLEX",
      "TRAVA-LINGUA", "PARALELEPIPEDO", "INCONSTITUCIONAL",
      "OTORRINOLARINGOLOGISTA", "BICICLETA", "CIRCUNFERENCIA",
      "PERPENDICULAR", "HIDROELETRICA", "CATASTROFE", "VULNERAVEL"
    ];
    var patience = 5;
    var destroyed = 0;
    var falling = [];
    var running = true;
    var paused = false;
    var interval = null;
    var spawnInterval = null;
    var currentInput = "";
    var activeWordIdx = -1;
    var baseSpeed = 1.2;

    function randWord() { return words[Math.floor(Math.random() * words.length)]; }

    function spawnWord() {
      if (!running || paused) return;
      falling.push({
        word: randWord(),
        x: Math.random() * 80 + 10,
        y: -8,
        speed: baseSpeed + Math.random() * 0.4,
        matched: "",
        done: false,
      });
    }

    function keyHandler(e) {
      if (e.key === "`") { cleanup(); showSelector(); e.preventDefault(); return; }
      if (e.key === "Escape") { cleanup(); showSelector(); e.preventDefault(); return; }
      if (!running || paused) return;
      var k = e.key;
      if (k === "Backspace") {
        if (currentInput.length > 0) currentInput = currentInput.slice(0, -1);
        activeWordIdx = -1;
        if (currentInput.length > 0) {
          for (var bi = 0; bi < falling.length; bi++) {
            if (!falling[bi].done && falling[bi].word.indexOf(currentInput) === 0) {
              activeWordIdx = bi; break;
            }
          }
        }
        e.preventDefault();
        return;
      }
      if (k.length === 1 && /[a-zA-Z0-9]/.test(k)) {
        currentInput += k.toUpperCase();
        var matched = false;
        for (var i = 0; i < falling.length; i++) {
          var f = falling[i];
          if (f.done) continue;
          if (f.word.indexOf(currentInput) === 0) {
            activeWordIdx = i;
            matched = true;
            if (currentInput === f.word) {
              destroyed++;
              f.done = true;
              currentInput = "";
              activeWordIdx = -1;
            }
            break;
          }
        }
        if (!matched) {
          currentInput = "";
          activeWordIdx = -1;
        }
        e.preventDefault();
      }
    }

    function tick() {
      if (!running || paused) return;
      for (var i = falling.length - 1; i >= 0; i--) {
        var f = falling[i];
        if (f.done) {
          falling.splice(i, 1);
          continue;
        }
        f.y += f.speed * 0.12;
        if (f.y > 92) {
          patience--;
          falling.splice(i, 1);
          if (patience <= 0) { endGame(); return; }
        }
      }
      render();
    }

    function render() {
      var boardEl = document.getElementById("typingBoard");
      if (!boardEl) return;
      var html = "";
      for (var i = 0; i < falling.length; i++) {
        var f = falling[i];
        var isActive = (i === activeWordIdx);
        var matchedPart = currentInput;
        var remaining = f.word.slice(currentInput.length);
        html += '<div class="tw-word" style="left:' + f.x + '%;top:' + f.y + '%;' +
          (isActive ? 'color:#ff0;text-shadow:0 0 12px #ff0,0 0 24px #f80;transform:scale(1.15);' : '') +
          '"><span class="tw-matched">' + matchedPart + '</span><span class="tw-remaining">' + remaining + '</span></div>';
      }
      boardEl.innerHTML = html;
      var pEl = document.getElementById("typingPatience");
      if (pEl) {
        pEl.textContent = patience;
        pEl.style.color = patience <= 2 ? "#f44" : "#0f0";
      }
      var dEl = document.getElementById("typingDestroyed");
      if (dEl) dEl.textContent = destroyed;
      var inpEl = document.getElementById("typingInput");
      if (inpEl) inpEl.textContent = currentInput;
    }

    function endGame() {
      running = false;
      if (interval) { clearInterval(interval); interval = null; }
      if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null; }
      render();
      var boardEl = document.querySelector("#typingBoard");
      if (!boardEl) return;
      var ov = document.createElement("div");
      ov.className = "anim-overlay-in";
      ov.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
      ov.innerHTML =
        '<div style="text-align:center;">' +
        '<div class="anim-neon-flicker" style="font-size:28px;font-weight:bold;color:#c00;font-family:monospace;text-shadow:0 0 4px #c00,0 0 12px #c00,0 0 24px #c00;margin-bottom:8px;letter-spacing:2px;">' + __("games.gameover") + '</div>' +
        '<div style="color:#0f0;font-size:13px;margin:4px 0;font-family:monospace;">' + __("games.score") + '<span style="color:#0ff;">' + destroyed + '</span></div>' +
        '<div style="margin-top:14px;font-size:11px;color:#888;font-family:monospace;">ENTER / R = ' + __("games.replay") + '</div></div>';
      boardEl.appendChild(ov);
    }

    function replayKeyHandler(e) {
      if ((e.key === "Enter" || e.key === "r") && !running) {
        cleanup(); startTypingChaos(); e.preventDefault();
      }
    }
    document.addEventListener("keydown", replayKeyHandler);

    function cleanup() {
      running = false;
      if (interval) { clearInterval(interval); interval = null; }
      if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null; }
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("keydown", replayKeyHandler);
    }

    var c = document.createElement("div");
    c.className = "games-container";
    c.style.cssText = "height:100%;box-sizing:border-box;display:flex;flex-direction:column;";

    var topBar = document.createElement("div");
    topBar.className = "games-hud";
    topBar.innerHTML =
      '<span class="games-hud-label">' + __("games.typing.hud") + '</span><span class="games-hud-sep">|</span>' +
      __("games.typing.patience") + '<span class="games-hud-val" id="typingPatience">' + patience + '</span><span class="games-hud-sep">|</span>' +
      __("games.typing.destroyed") + '<span class="games-hud-val" id="typingDestroyed">0</span>';
    c.appendChild(topBar);

    var boardWrap = document.createElement("div");
    boardWrap.id = "typingBoard";
    boardWrap.style.cssText = "flex:1;position:relative;background:#0a0a1a;overflow:hidden;min-height:0;";
    c.appendChild(boardWrap);

    var inputLine = document.createElement("div");
    inputLine.style.cssText = "background:#111;color:#0f0;font-family:monospace;font-size:18px;padding:6px 12px;text-align:center;border-top:2px solid #333;letter-spacing:2px;min-height:22px;";
    inputLine.id = "typingInput";
    inputLine.textContent = "";
    c.appendChild(inputLine);

    gamesBody.appendChild(c);

    document.addEventListener("keydown", keyHandler);
    spawnInterval = setInterval(spawnWord, 2000);
    interval = setInterval(tick, 40);

    gameState.cleanup = function () {
      cleanup();
    };
  }

  /* ================================================================
      LABIRINTO
     ================================================================ */
  function genMaze(w, h) {
    var cols = Math.floor(w / 2);
    var rows = Math.floor(h / 2);
    var grid = [];
    for (var y = 0; y < rows * 2 + 1; y++) {
      grid[y] = [];
      for (var x = 0; x < cols * 2 + 1; x++) grid[y][x] = 1;
    }
    var visited = [];
    function carve(cx, cy) {
      visited[cy * cols + cx] = true;
      grid[cy * 2 + 1][cx * 2 + 1] = 0;
      var dirs = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ];
      for (var i = dirs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = dirs[i];
        dirs[i] = dirs[j];
        dirs[j] = tmp;
      }
      for (var d = 0; d < dirs.length; d++) {
        var nx = cx + dirs[d][0],
          ny = cy + dirs[d][1];
        if (
          nx >= 0 &&
          nx < cols &&
          ny >= 0 &&
          ny < rows &&
          !visited[ny * cols + nx]
        ) {
          grid[cy * 2 + 1 + dirs[d][1]][cx * 2 + 1 + dirs[d][0]] = 0;
          carve(nx, ny);
        }
      }
    }
    carve(0, 0);
    grid[1][0] = 0;
    grid[rows * 2 - 1][cols * 2] = 0;
    return {
      grid: grid,
      cols: cols,
      rows: rows,
      width: cols * 2 + 1,
      height: rows * 2 + 1,
    };
  }

  function startLabirinto(level) {
    level = level || 1;
    clearBody();
    var lastDir = { x: 0, y: 0 };

    function initMaze() {
      var w = 15 + (level - 1) * 6;
      var h = 11 + (level - 1) * 4;
      var m = genMaze(w, h);
      var visited = {};
      var coins = [];
      var freeCells = [];
      for (var y = 0; y < m.height; y++) {
        for (var x = 0; x < m.width; x++) {
          if (m.grid[y][x] === 0 && !(x === 0 && y === 1) && !(x === m.cols * 2 && y === m.rows * 2 - 1)) {
            freeCells.push({ x: x, y: y });
          }
        }
      }
      for (var i = freeCells.length - 1; i > 0; i--) {
        var j2 = Math.floor(Math.random() * (i + 1));
        var tmp = freeCells[i];
        freeCells[i] = freeCells[j2];
        freeCells[j2] = tmp;
      }
      var numCoins = Math.min(5 + level, Math.floor(freeCells.length * 0.1));
      for (var ci = 0; ci < numCoins && ci < freeCells.length; ci++) {
        coins.push(freeCells[ci]);
      }
      var teleportCells = [];
      var pathCount = freeCells.length;
      if (pathCount > 10) {
        var t1 = freeCells[Math.floor(Math.random() * numCoins)];
        var t2 = freeCells[Math.floor(Math.random() * (freeCells.length - numCoins)) + numCoins];
        if (t1 && t2) {
          teleportCells.push(t1, t2);
        }
      }
      var st = {
        maze: m,
        px: 0,
        py: 1,
        level: level,
        ex: m.cols * 2,
        ey: m.rows * 2 - 1,
        steps: 0,
        startTime: Date.now(),
        won: false,
        dead: false,
        coins: coins,
        coinsCollected: 0,
        teleports: teleportCells,
        revealed: {},
        noDeath: true,
      };
      return { m: m, visited: visited, st: st };
    }

    var g = initMaze();
    g.cellSize = MAZE_CELL_SIZE;
    var mazePaused = false;
    var mazeOverlayActive = false;

    function getCellClass(x, y) {
      var key = x + "," + y;
      if (g.st.dead || g.st.won) {
        if (g.st.maze.grid[y][x] === 1) return "games-cell-wall";
        return "games-cell-path";
      }
      if (x === g.st.px && y === g.st.py) return "games-cell-player";
      if (x === g.st.ex && y === g.st.ey) return "games-cell-exit";
      if (g.st.maze.grid[y][x] === 1) return "games-cell-wall";
      if (g.visited[key]) {
        for (var ti = 0; ti < g.st.teleports.length; ti++) {
          if (g.st.teleports[ti].x === x && g.st.teleports[ti].y === y) return "games-cell-teleport";
        }
        return "games-cell-visited";
      }
      for (var ci = 0; ci < g.st.coins.length; ci++) {
        if (g.st.coins[ci].x === x && g.st.coins[ci].y === y) return "games-cell-coin";
      }
      for (var ti2 = 0; ti2 < g.st.teleports.length; ti2++) {
        if (g.st.teleports[ti2].x === x && g.st.teleports[ti2].y === y) return "games-cell-teleport";
      }
      if (g.st.revealed[key]) return "games-cell-revealed";
      return "games-cell-path";
    }

    function renderMaze() {
      update3DBoard(g.st.maze.height, g.st.maze.width, getCellClass);
      setCameraTarget(g.st.px, g.st.py, lastDir.x, lastDir.y);
      var stEl = document.getElementById("mazeStatus");
      var tiEl = document.getElementById("mazeTime");
      var coinEl = document.getElementById("mazeCoins");
      if (stEl) {
      stEl.innerHTML =
        __("games.maze.steps") + '<span class="games-hud-val">' + g.st.steps + "</span>";
      }
      if (coinEl) {
        coinEl.innerHTML = __("games.maze.coins") + '<span style="color:#ffd700;font-weight:bold">' + g.st.coinsCollected + "/" + g.st.coins.length + "</span>";
      }
      if (tiEl) {
        var elapsed = Math.floor((Date.now() - g.st.startTime) / 1000);
        if (g.st.won) {
          var min = Math.floor(elapsed / 60);
          var sec = elapsed % 60;
          tiEl.innerHTML =
            __("games.maze.time") + '<span style="color:#0c0;font-weight:bold">' +
            min +
            "m" +
            (sec < 10 ? "0" : "") +
            sec +
            "s</span>";
        } else {
          tiEl.innerHTML =
            __("games.maze.time") + '<span style="color:#0c0;font-weight:bold">' +
            elapsed +
            "s</span>";
        }
      }
    }

    function showMazeOverlay(msg, sub, nextLevel) {
      var boardEl = document.querySelector("#mazeBoard .games-board-3d");
      if (!boardEl) return;
      var nextText = "";
      var action = __('games.maze.reenter');
      if (nextLevel) {
        nextText =
          '<div style="margin-top:6px;color:#0f0;font-size:12px;font-family:monospace;">' + __("games.maze.nextLevel") + ' ' +
          nextLevel +
          "</div>";
        action = __("games.maze.nextEnter");
      }
      var ov = document.createElement("div");
      ov.id = "mazeOverlay";
      ov.className = "anim-overlay-in";
      ov.style.cssText =
        "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
      ov.innerHTML =
        '<div style="text-align:center;">' +
        '<div class="anim-neon-flicker" style="font-size:26px;font-weight:bold;color:#0f0;font-family:monospace;text-shadow:0 0 4px #0f0,0 0 12px #0f0,0 0 24px #0f0;margin-bottom:8px;letter-spacing:2px;">' +
        msg +
        "</div>" +
        nextText +
        '<div style="margin-top:8px;font-size:11px;color:#aaa;font-family:monospace;">' +
        sub +
        "</div>" +
        '<div style="margin-top:14px;font-size:11px;color:#888;font-family:monospace;">' +
        action +
        "</div></div>";
      boardEl.appendChild(ov);
    }

    function removeOverlay() {
      var ov = document.getElementById("mazeOverlay");
      if (ov) ov.remove();
    }

    function resetToStart() {
      g.st.noDeath = false;
      g.st.px = 0;
      g.st.py = 1;
      g.st.steps = 0;
      g.st.dead = true;
      g.visited = {};
      renderMaze();
      showMazeOverlay(__("games.maze.wall"), __("games.maze.wallContinue"));
    }

    function showMazePause(show) {
      var boardEl = document.querySelector("#mazeBoard .games-board-3d");
      if (!boardEl) return;
      var ov = document.getElementById("mazePauseOverlay");
      if (show && !ov) {
        var d = document.createElement("div");
        d.id = "mazePauseOverlay";
        d.className = "anim-overlay-in";
        d.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
        d.innerHTML = '<div class="anim-neon-flicker" style="font-size:28px;font-weight:bold;color:#ff0;font-family:monospace;text-shadow:0 0 4px #ff0,0 0 12px #ff0,0 0 24px #ff0;letter-spacing:3px;">' + __("games.pause") + '</div>';
        boardEl.appendChild(d);
      } else if (!show) {
        var d = document.getElementById("mazePauseOverlay");
        if (d) d.remove();
      }
    }

    function keyHandler(e) {
      var k = e.key;
      if (k === "Escape") {
        if (g.st.won || g.st.dead) return;
        mazePaused = !mazePaused;
        showMazePause(mazePaused);
        e.preventDefault();
        return;
      }
      if (k === "Enter") {
        if (g.st.won) {
          cleanup();
          startLabirinto(g.st.level + 1);
          e.preventDefault();
          return;
        }
        if (g.st.dead) {
          g.st.dead = false;
          g.visited = {};
          removeOverlay();
          rebuildMazeBoard();
          renderMaze();
          e.preventDefault();
          return;
        }
        e.preventDefault();
        return;
      }
      if (k === "`") {
        cleanup();
        showSelector();
        e.preventDefault();
        return;
      }
      if (g.st.won || g.st.dead || mazePaused) return;
      if (k === "r" || k === "R") {
        cleanup();
        startLabirinto();
        e.preventDefault();
        return;
      }
      var cmd = k.toUpperCase();
      if (cmd === "W" || cmd === "A" || cmd === "S" || cmd === "D") {
        var dx = 0,
          dy = 0;
        if (cmd === "W") dy = -1;
        else if (cmd === "S") dy = 1;
        else if (cmd === "A") dx = -1;
        else if (cmd === "D") dx = 1;
        lastDir = { x: dx, y: dy };
        var nx = g.st.px + dx,
          ny = g.st.py + dy;
        if (
          nx < 0 ||
          nx >= g.st.maze.width ||
          ny < 0 ||
          ny >= g.st.maze.height ||
          g.st.maze.grid[ny][nx] === 1
        ) {
          resetToStart();
          e.preventDefault();
          return;
        }
        g.st.px = nx;
        g.st.py = ny;
        g.st.steps++;
        _GSTATS.totalMazeSteps++;
        _gsSave();
        g.visited[nx + "," + ny] = true;

        for (var ci = 0; ci < g.st.coins.length; ci++) {
          if (g.st.coins[ci].x === nx && g.st.coins[ci].y === ny) {
            g.st.coins.splice(ci, 1);
            g.st.coinsCollected++;
            _GSTATS.totalCoins++;
            _gsSave();
            break;
          }
        }

        for (var ti = 0; ti < g.st.teleports.length; ti++) {
          if (g.st.teleports[ti].x === nx && g.st.teleports[ti].y === ny) {
            var freeTele = [];
            for (var ty = 0; ty < g.st.maze.height; ty++) {
              for (var tx = 0; tx < g.st.maze.width; tx++) {
                if (g.st.maze.grid[ty][tx] === 0 && !(tx === g.st.ex && ty === g.st.ey)) {
                  freeTele.push({ x: tx, y: ty });
                }
              }
            }
            if (freeTele.length > 0) {
              var tp = freeTele[Math.floor(Math.random() * freeTele.length)];
              g.st.px = tp.x;
              g.st.py = tp.y;
              g.visited[tp.x + "," + tp.y] = true;
            }
            g.st.teleports.splice(ti, 1);
            break;
          }
        }

        if (g.st.steps % 15 === 0 && g.st.steps > 0) {
          var revealDist = 3;
          for (var ry = -revealDist; ry <= revealDist; ry++) {
            for (var rx = -revealDist; rx <= revealDist; rx++) {
              var rr = Math.sqrt(rx * rx + ry * ry);
              if (rr <= revealDist) {
                var rnx = g.st.px + rx;
                var rny = g.st.py + ry;
                if (rnx >= 0 && rnx < g.st.maze.width && rny >= 0 && rny < g.st.maze.height) {
                  g.st.revealed[rnx + "," + rny] = true;
                }
              }
            }
          }
        }

        var totalPathCells = 0;
        var visitedCount = 0;
        if (g.st.coins.length === 0 && !g.st.won) {
          var allVisited = true;
          for (var vy = 0; vy < g.st.maze.height; vy++) {
            for (var vx = 0; vx < g.st.maze.width; vx++) {
              if (g.st.maze.grid[vy][vx] === 0) {
                totalPathCells++;
                if (g.visited[vx + "," + vy]) visitedCount++;
                else allVisited = false;
              }
            }
          }
          if (allVisited && totalPathCells > 0) _achUnlock("mazeExplorer");
        }

        if (g.st.px === g.st.ex && g.st.py === g.st.ey) {
          g.st.won = true;
          var elapsed = Math.floor((Date.now() - g.st.startTime) / 1000);
          _GSTATS.mazeCompleted++;
          if (g.st.level > _GSTATS.maxMazeLevel) _GSTATS.maxMazeLevel = g.st.level;
          _gsSave();
          _achUnlock("firstMaze");
          if (_GSTATS.mazeCompleted >= 5) _achUnlock("maze5");
          if (_GSTATS.mazeCompleted >= 10) _achUnlock("maze10");
          if (_GSTATS.mazeCompleted >= 25) _achUnlock("mazeMaster");
          if (elapsed < 30) _achUnlock("speedRunner");
          if (elapsed < 15) _achUnlock("speedDemon");
          if (g.st.noDeath) _achUnlock("mazeNoDeath");
          if (g.st.level >= 5) _achUnlock("mazeLevel5");
          if (g.st.level >= 10) _achUnlock("mazeLevel10");
          renderMaze();
          showMazeOverlay(
            __("games.maze.win"),
            __("games.maze.steps") + g.st.steps + " | " + __("games.maze.time") + elapsed + "s" + (g.st.coinsCollected > 0 ? " | " + __("games.maze.coins") + g.st.coinsCollected : ""),
            g.st.level + 1,
          );
        } else {
          renderMaze();
        }
        e.preventDefault();
      }
    }

    function rebuildMazeBoard() {
      var boardEl = document.querySelector("#mazeBoard");
      if (!boardEl) return;
      boardEl.innerHTML = "";
      var grid = create3DBoard(
        g.st.maze.height,
        g.st.maze.width,
        getCellClass,
        g.cellSize,
      );
      boardEl.appendChild(grid);
    }

    function cleanup() {
      stopCamera();
      document.removeEventListener("keydown", keyHandler);
    }

    var c = document.createElement("div");
    c.className = "games-container";
    c.style.cssText =
      "height:100%;box-sizing:border-box;display:flex;flex-direction:column;";

    var topBar = document.createElement("div");
    topBar.className = "games-hud";
    topBar.innerHTML =
      '<span class="games-hud-label">' + __("games.maze.hud") + '</span><span class="games-hud-sep">|</span>' + __("games.maze.level") + '<span class="games-hud-val" id="mazeLevel">' +
      level +
      '</span><span class="games-hud-sep">|</span><span class="games-hud-val" id="mazeStatus">' + __("games.maze.steps") + '0</span><span class="games-hud-sep">|</span><span id="mazeCoins" style="color:#ffd700;font-weight:bold;">' + __("games.maze.coins") + '0/0</span><span class="games-hud-sep">|</span><span id="mazeTime" style="color:#0c0;font-weight:bold;">' + __("games.maze.time") + '0s</span>';
    c.appendChild(topBar);

    var boardWrap = document.createElement("div");
    boardWrap.id = "mazeBoard";
    boardWrap.style.cssText =
      "flex:1;display:flex;align-items:stretch;background:#000;min-height:0;";
    var grid = create3DBoard(
      g.st.maze.height,
      g.st.maze.width,
      getCellClass,
      g.cellSize,
    );
    boardWrap.appendChild(grid);
    c.appendChild(boardWrap);

    gamesBody.appendChild(c);

    document.addEventListener("keydown", keyHandler);
    startCamera("mazeBoard", g.cellSize);
    renderMaze();

    gameState.cleanup = function () {
      stopCamera();
      document.removeEventListener("keydown", keyHandler);
    };
  }

  showSelector();
})();
