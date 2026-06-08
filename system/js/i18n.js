(function(global) {
  'use strict';

  var _lang = 'pt';
  var _callbacks = [];

  var strings = {
    pt: {
      /* Boot */
      'boot.msg': 'Iniciando...',
      'boot.stage1': 'Iniciando...',
      'boot.stage2': 'Carregando configurações...',
      'boot.stage3': 'Iniciando serviços...',
      'boot.stage4': 'Preparando interface...',
      'boot.stage5': 'Finalizando inicialização...',
      'boot.stage6': 'Pronto...',
      'boot.done': 'Pronto! ^^',
      'page.title': 'Site de ky',

      /* Desktop icons */
      'desktop.terminal': 'Terminal',
      'desktop.wakatime': 'WakaTime',
      'desktop.games': 'Jogos',
      'desktop.soundcloud': 'SoundCloud',
      'desktop.gallery': 'Coleção de imgs',
      'desktop.links': 'Links',
      'desktop.settings': 'Config',

      /* Start menu */
      'start.label': 'Start',
      'start.header': 'win2000',
      'start.frequent': 'Usados frequentemente',
      'start.games': 'Jogos',
      'start.gallery': 'Coleção de imgs',
      'start.links': 'Links',
      'start.settings': 'Configurações',
      'start.soundcloud': 'SoundCloud',
      'start.system': 'Sistema',
      'start.terminal': 'Terminal',
      'start.fullscreen': 'Tela Cheia',
      'start.shutdown': 'Desligar',

      /* Context menu */
      'ctx.arrange': 'Organizar Ícones',
      'ctx.refresh': 'Atualizar',
      'ctx.showdesktop': 'Mostrar Área de Trabalho',
      'ctx.properties': 'Propriedades',
      'ctx.addDesktop': 'Adicionar à Área de Trabalho',
      'ctx.removeDesktop': 'Remover da Área de Trabalho',
      'ctx.pin': 'Fixar na Barra de Tarefas',
      'ctx.unpin': 'Desafixar da Barra de Tarefas',

      /* Welcome window */
      'welcome.greeting': 'Bem vinda!',
      'welcome.desc': 'Esse é o meu site pessoal com temática de win2000, espero que goste pois é feito com carinho, sinta-se à vontade, explore e aproveite ^^',
      'welcome.langLabel': 'Idioma',
      'welcome.dontShow': 'Não mostrar na inicialização',
      'welcome.startBtn': 'Começar',
      'welcome.volumeTip': 'Para uma melhor experiência, aumente o volume do seu computador.',

      /* Links */
      'links.title': 'Links',
      'links.desc': 'Plataformas onde estou ativo — me segue aí :)',
      'links.scDesc': 'Minha página no SoundCloud com playlists e músicas.',
      'links.discordDesc': 'Me adiciona no Discord! (clique para copiar)',
      'links.biliDesc': 'Meu perfil no Bilibili chinês — é estranho e divertido, não entendo nada, mas é bem intrigante, e honestamente mais divertido que o YouTube, parece um conteúdo mais genuíno.',

      /* Games */
      'games.title': 'Jogos',
      'games.snake': 'Cobrinha',
      'games.snake.desc': 'Pegue a comida sem bater na parede',
      'games.snake.controls': 'Setas / WASD para mover | Espaço para pausar',
      'games.maze': 'Labirinto',
      'games.maze.desc': 'Fuja do labirinto até a saída',
      'games.maze.controls': 'W/A/S/D para mover | R para reiniciar',
      'games.typing': 'Digitação Caótica',
      'games.typing.desc': 'Digite as palavras antes que caiam no chão',
      'games.typing.controls': 'Digite a palavra para destruir o balão',
      'games.footer': 'Esc para voltar | Clique duas vezes para jogar',
      'games.gameover': 'GAME OVER',
      'games.newrecord': 'NOVO RECORDE!',
      'games.score': 'Pontos: ',
      'games.highscore': 'Recorde: ',
      'games.replay': 'ENTER = Jogar de novo',
      'games.pause': 'PAUSA',
      'games.snake.hud': 'COBRINHA',
      'games.maze.hud': 'LABIRINTO',
      'games.maze.steps': 'Passos: ',
      'games.maze.time': 'Tempo: ',
      'games.maze.nextLevel': 'Próximo nível: ',
      'games.maze.nextEnter': 'ENTER = Próximo nível',
      'games.maze.win': 'ESCAPOU!',
      'games.maze.wall': 'BATEU NA PAREDE!',
      'games.maze.wallContinue': 'Pressione ENTER para continuar.',
      'games.maze.reenter': 'ENTER = Continuar',
      'games.maze.level': 'Nível: ',
      'games.maze.coins': 'Moedas: ',
      'games.typing.hud': 'DIGITAÇÃO',
      'games.typing.patience': 'Paciência: ',
      'games.typing.destroyed': 'Palavras: ',
      'games.ach.firstFood': '* Primeira comida! (Cobrinha)',
      'games.ach.food50': '* 50 comidas! (Cobrinha)',
      'games.ach.food100': '* 100 comidas! (Cobrinha)',
      'games.ach.food200': '* 200 comidas! (Cobrinha)',
      'games.ach.firstMaze': '* Primeiro labirinto completo!',
      'games.ach.maze5': '* 5 labirintos completos!',
      'games.ach.maze10': '* 10 labirintos completos!',
      'games.ach.mazeMaster': '* Mestre dos labirintos! (25 completos)',
      'games.ach.snake20': '* Cobrinha veterana! (20+ pontos)',
      'games.ach.bigEater': '* Comilão! (50+ pontos)',
      'games.ach.snakeMaster': '* Mestre cobra! (100+ pontos)',
      'games.ach.speedRunner': '* Velocista! (Labirinto <30s)',
      'games.ach.speedDemon': '* Demônio da velocidade! (Labirinto <15s / Cobrinha turbo)',
      'games.ach.goldenGobbler': '* Comida dourada! (Cobrinha)',
      'games.ach.poisonEater': '* Comida envenenada! (Cobrinha)',
      'games.ach.mazeExplorer': '* Explorador! (Visitou todas as células)',
      'games.ach.mazeNoDeath': '* Labirinto sem morte!',
      'games.ach.mazeLevel5': '* Nível 5 no labirinto!',
      'games.ach.mazeLevel10': '* Nível 10 no labirinto!',
      'games.ach.snakePlayed': 'partidas',
      'games.ach.totalFood': 'comidas',
      'games.ach.mazesDone': 'labirintos',
      'games.ach.maxLvl': 'Nv max:',
      'games.ach.totalCoins': 'moedas',

      /* Settings */
      'settings.title': 'Configurações',
      'settings.appearance': 'Aparência',
      'settings.about': 'Sobre',
      'settings.aboutHeader': 'Sobre',
      'settings.system': 'Sistema',
      'settings.shortcuts': 'Atalhos',
      'settings.shortcutClose': 'Fechar janela ativa',
      'settings.shortcutStart': 'Abrir menu iniciar',
      'settings.shortcutFullscreen': 'Alternar tela cheia',
      'settings.wallpaper': 'Wallpaper',
      'settings.wallpaperDesc': 'Escolha uma imagem do seu computador para usar como papel de parede.',
      'settings.noWallpaper': 'Nenhum wallpaper personalizado',
      'settings.selectImage': 'Selecionar Imagem',
      'settings.noFile': 'Nenhum arquivo selecionado',
      'settings.apply': 'Aplicar',
      'settings.applySuccess': 'Wallpaper aplicado com sucesso!',
      'settings.selectFirst': 'Selecione uma imagem primeiro.',
      'settings.dialogTitle': 'Configurações',
      'settings.aboutContent': '<b>Win2K Desktop</b><br>Um desktop funcional feito por um maluco com HTML/CSS/JS<br><br>O intuito deste espaço é ser um espaço pessoal onde eu possa me expor, tipo um instagram, mas melhor porque não é controlado por uma bigtech, e é totalmente feito e customizado por mim, com base completamente em meus gostos e preferências<br>Sendo meu espaço de paz em meio a um mundo frenético onde todos estão competindo por algo<br><br><br><b>Sobre o Autor</b><br><br>Podem me chamar de sillky ou ky pros mais intimos, sou uma pessoa não binária, pode me chamar com qualquer pronome, tambem sou uma entusiasta de tecnologia e amante de coisas antigas e de culturas alternativas como hacker e grunge<br><br>só isso. se divirta explorando :)',

      /* Terminal */
      'terminal.title': 'C:\\WINDOWS\\system32\\cmd.exe',
      'terminal.prompt': 'C:\\>',
      'terminal.fileWarn': '[AVISO] Você abriu o HTML direto do PC (file://).',
      'terminal.fileWarn2': 'Requisições de API podem ser bloqueadas pelo navegador.',
      'terminal.fileWarn3': 'Recomenda-se usar um servidor local (ex: Live Server).',
      'terminal.osUnknown': 'Desconhecido',
      'terminal.help': 'Comandos disponíveis:\n  help       Mostra esta ajuda\n  clear      Limpar a tela\n  data       Informações do sistema\n  uptime     Tempo de atividade\n  whereami   Informações de localização',
      'terminal.uptime': 'Tempo de atividade: ',
      'terminal.unknown': 'desconhecida',
      'terminal.unknownAgent': 'desconhecido',
      'terminal.dataHeader': 'Informações do Sistema',
      'terminal.ipLocation': '  Localização: ',
      'terminal.ipISP': '  ISP: ',
      'terminal.ipTZ': '  Fuso: ',
      'terminal.ipUnknown': 'Desconhecido',
      'terminal.unknownCmd': 'não é reconhecido como um comando interno\nexterno, programa ou arquivo batch.',
      'terminal.boot1': 'No Microsoft Windows 2000 [Version 5.00.2195]',
      'terminal.boot2': '(C) Copyright 1985-2000 No Microsoft Corp.',
      'terminal.whereami.header': 'Informações de Localização',
      'terminal.whereami.tz': 'Fuso Horário: ',
      'terminal.whereami.localTime': 'Hora Local: ',
      'terminal.whereami.agent': 'Agente: ',
      'terminal.whereami.platform': 'Plataforma: ',
      'terminal.whereami.fetchGeo': 'Obtendo dados de geolocalização...',
      'terminal.whereami.geoFail': 'Falha ao obter localização.',

      /* SoundCloud */
      'soundcloud.title': 'SoundCloud Player',
      'soundcloud.playlistTitle': 'Playlists',
      'soundcloud.addPlaylist': 'Adicionar playlist',
      'soundcloud.addTitle': 'Adicionar playlist',
      'soundcloud.addMsg': 'Cole o link da playlist do SoundCloud:',
      'soundcloud.loading': 'Carregando playlist...',
      'soundcloud.failed': 'Falha ao carregar playlist',
      'soundcloud.loadingTrack': 'Carregando...',
      'soundcloud.failedTrack': 'Falha ao carregar',
      'soundcloud.defaultTrack': 'Nenhuma faixa',
      'soundcloud.defaultArtist': 'SoundCloud',
      'soundcloud.trackPrefix': 'Faixa ',
      'soundcloud.playlistPrefix': 'Playlist ',

      /* Feed */
      'feed.title': 'Diário',
      'feed.entries': 'entradas',
      'feed.noPosts': 'Nenhuma entrada.',
      'feed.error': 'Erro ao carregar.',
      'feed.unknown': 'desconhecido',
      'start.feed': 'Diário',
      'desktop.chat': 'Bate-papo',
      'desktop.randomgif': 'GIF Aleatório',
      'desktop.feed': 'Diário',
      'gallery.title': 'Coleção de imgs',
      'gallery.info': 'SPACE para sair | ← → para navegar (',
      'gallery.infoEnd': ')',

      /* System info */
      'sys.time': 'Hora: ',
      'sys.os': 'SO: ',
      'sys.arch': 'Arquitetura: ',
      'sys.browser': 'Navegador: ',
      'sys.lang': 'Idioma: ',
      'sys.tz': 'Fuso: ',
      'sys.resolution': 'Resolução: ',
      'sys.colorDepth': 'Profundidade de Cor: ',
      'sys.sessionDuration': 'Duração da sessão: ',
      'sys.cpu': 'CPU: ',
      'sys.ram': 'RAM: ',
      'sys.ip': 'IP: ',
      'sys.location': 'Localização: ',
      'sys.zip': 'CEP: ',
      'sys.isp': 'ISP: ',
      'sys.coords': 'Coordenadas: ',
      'sys.fetching': 'Buscando...',
      'sys.fetchFail': 'Falha ao buscar localização',
      'sys.unknown': 'Desconhecido',
      'sys.cores': ' núcleos',

      /* Dialogs */
      'dialog.ok': 'OK',
      'dialog.cancel': 'Cancelar',
      'dialog.errorTitle': 'Erro',
      'dialog.errorOpen': 'Erro ao abrir ',

      /* Tray */
      'tray.volume': 'Volume',
      'tray.maxTitle': 'Máximo (100%)',
      'tray.resetTitle': 'Resetar volume',
      'tray.resetLabel': 'Resetar',
      'tray.muteTitle': 'Silenciar (0%)',
      'tray.muteLabel': 'Mudo',
      'tray.months': ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      'tray.days': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],

      /* Fullscreen */
      'fullscreen.enter': 'Tela Cheia',
      'fullscreen.exit': 'Sair da Tela Cheia',

      /* Shutdown */
      'shutdown.title': 'Desligar',
      'shutdown.msg': 'Tem certeza que deseja desligar o computador?',
      'shutdown.done': 'Agora é seguro desligar o computador.',

      /* System */
      'system.title': 'Sistema',
      'system.aboutTitle': 'Sistema',
      'system.aboutMsg': 'Windows 2000 Desktop\n\nUm projeto hobby feito com HTML, CSS e JavaScript puros.',

    },

    en: {
      /* Boot */
      'boot.msg': 'Starting...',
      'boot.stage1': 'Starting...',
      'boot.stage2': 'Loading settings...',
      'boot.stage3': 'Starting services...',
      'boot.stage4': 'Preparing interface...',
      'boot.stage5': 'Finishing startup...',
      'boot.stage6': 'Ready...',
      'boot.done': 'Ready! ^^',
      'page.title': "Ky's Site",

      /* Desktop icons */
      'desktop.terminal': 'Terminal',
      'desktop.wakatime': 'WakaTime',
      'desktop.games': 'Games',
      'desktop.soundcloud': 'SoundCloud',
      'desktop.gallery': 'Image Collection',
      'desktop.links': 'Links',
      'desktop.settings': 'Settings',

      /* Start menu */
      'start.label': 'Start',
      'start.header': 'win2000',
      'start.frequent': 'Frequently Used',
      'start.games': 'Games',
      'start.gallery': 'Image Collection',
      'start.links': 'Links',
      'start.settings': 'Settings',
      'start.soundcloud': 'SoundCloud',
      'start.system': 'System',
      'start.terminal': 'Terminal',
      'start.fullscreen': 'Full Screen',
      'start.shutdown': 'Shut Down',

      /* Context menu */
      'ctx.arrange': 'Arrange Icons',
      'ctx.refresh': 'Refresh',
      'ctx.showdesktop': 'Show Desktop',
      'ctx.properties': 'Properties',
      'ctx.addDesktop': 'Add to Desktop',
      'ctx.removeDesktop': 'Remove from Desktop',
      'ctx.pin': 'Pin to Taskbar',
      'ctx.unpin': 'Unpin from Taskbar',

      /* Welcome window */
      'welcome.greeting': 'Welcome!',
      'welcome.desc': 'This is my personal website with a win2000 theme, I hope you enjoy it because it\'s made with love, feel free to explore and have fun ^^',
      'welcome.langLabel': 'Language',
      'welcome.dontShow': 'Don\'t show on startup',
      'welcome.startBtn': 'Get Started',
      'welcome.volumeTip': 'For a better experience, increase your computer\'s volume.',

      /* Links */
      'links.title': 'Links',
      'links.desc': 'Platforms where I\'m active — follow me :)',
      'links.scDesc': 'My SoundCloud page with playlists and music.',
      'links.discordDesc': 'Add me on Discord! (click to copy)',
      'links.biliDesc': 'My profile on Chinese Bilibili — it\'s weird and fun, I don\'t understand anything, but it\'s intriguing, and honestly more fun than YouTube, the content feels more genuine.',

      /* Games */
      'games.title': 'Games',
      'games.snake': 'Snake',
      'games.snake.desc': 'Eat the food without hitting the wall',
      'games.snake.controls': 'Arrows / WASD to move | Space to pause',
      'games.maze': 'Maze',
      'games.maze.desc': 'Escape the maze to the exit',
      'games.maze.controls': 'W/A/S/D to move | R to restart',
      'games.typing': 'Typing Chaos',
      'games.typing.desc': 'Type the words before they hit the ground',
      'games.typing.controls': 'Type the word to pop the balloon',
      'games.footer': 'Esc to go back | Double-click to play',
      'games.gameover': 'GAME OVER',
      'games.newrecord': 'NEW RECORD!',
      'games.score': 'Score: ',
      'games.highscore': 'Best: ',
      'games.replay': 'ENTER = Play again',
      'games.pause': 'PAUSED',
      'games.snake.hud': 'SNAKE',
      'games.maze.hud': 'MAZE',
      'games.maze.steps': 'Steps: ',
      'games.maze.time': 'Time: ',
      'games.maze.nextLevel': 'Next level: ',
      'games.maze.nextEnter': 'ENTER = Next level',
      'games.maze.win': 'ESCAPED!',
      'games.maze.wall': 'HIT THE WALL!',
      'games.maze.wallContinue': 'Press ENTER to continue.',
      'games.maze.reenter': 'ENTER = Continue',
      'games.maze.level': 'Level: ',
      'games.maze.coins': 'Coins: ',
      'games.typing.hud': 'TYPING',
      'games.typing.patience': 'Patience: ',
      'games.typing.destroyed': 'Words: ',
      'games.ach.firstFood': '* First food! (Snake)',
      'games.ach.food50': '* 50 food! (Snake)',
      'games.ach.food100': '* 100 food! (Snake)',
      'games.ach.food200': '* 200 food! (Snake)',
      'games.ach.firstMaze': '* First maze completed!',
      'games.ach.maze5': '* 5 mazes completed!',
      'games.ach.maze10': '* 10 mazes completed!',
      'games.ach.mazeMaster': '* Maze master! (25 completed)',
      'games.ach.snake20': '* Snake veteran! (20+ score)',
      'games.ach.bigEater': '* Big eater! (50+ score)',
      'games.ach.snakeMaster': '* Snake master! (100+ score)',
      'games.ach.speedRunner': '* Speed runner! (Maze <30s)',
      'games.ach.speedDemon': '* Speed demon! (Maze <15s / Snake turbo)',
      'games.ach.goldenGobbler': '* Golden food! (Snake)',
      'games.ach.poisonEater': '* Poison food! (Snake)',
      'games.ach.mazeExplorer': '* Explorer! (Visited all cells)',
      'games.ach.mazeNoDeath': '* No-death maze!',
      'games.ach.mazeLevel5': '* Maze level 5!',
      'games.ach.mazeLevel10': '* Maze level 10!',
      'games.ach.snakePlayed': 'played',
      'games.ach.totalFood': 'food',
      'games.ach.mazesDone': 'mazes',
      'games.ach.maxLvl': 'Max lvl:',
      'games.ach.totalCoins': 'coins',

      /* Settings */
      'settings.title': 'Settings',
      'settings.appearance': 'Appearance',
      'settings.about': 'About',
      'settings.aboutHeader': 'About',
      'settings.system': 'System',
      'settings.shortcuts': 'Shortcuts',
      'settings.shortcutClose': 'Close active window',
      'settings.shortcutStart': 'Open start menu',
      'settings.shortcutFullscreen': 'Toggle fullscreen',
      'settings.wallpaper': 'Wallpaper',
      'settings.wallpaperDesc': 'Choose an image from your computer to use as wallpaper.',
      'settings.noWallpaper': 'No custom wallpaper',
      'settings.selectImage': 'Select Image',
      'settings.noFile': 'No file selected',
      'settings.apply': 'Apply',
      'settings.applySuccess': 'Wallpaper applied successfully!',
      'settings.selectFirst': 'Select an image first.',
      'settings.dialogTitle': 'Settings',
      'settings.aboutContent': '<b>Win2K Desktop</b><br>A functional desktop made by a madman with HTML/CSS/JS<br><br>The purpose of this space is to be a personal space where I can express myself, like an Instagram, but better because it\'s not controlled by a big tech company, and it\'s entirely made and customized by me, based completely on my tastes and preferences<br>Being my peace space in the midst of a frenetic world where everyone is competing for something<br><br><br><b>About the Author</b><br><br>You can call me sillky or ky for short, I\'m a non-binary person, you can use any pronouns, I\'m also a tech enthusiast and lover of old things and alternative cultures like hacker and grunge<br><br>that\'s it. have fun exploring :)',

      /* Terminal */
      'terminal.title': 'C:\\WINDOWS\\system32\\cmd.exe',
      'terminal.prompt': 'C:\\>',
      'terminal.fileWarn': '[WARN] You opened the HTML directly from your PC (file://).',
      'terminal.fileWarn2': 'API requests may be blocked by the browser.',
      'terminal.fileWarn3': 'It is recommended to use a local server (e.g. Live Server).',
      'terminal.osUnknown': 'Unknown',
      'terminal.help': 'Available commands:\n  help       Show this help\n  clear      Clear screen\n  data       System information\n  uptime     Uptime\n  whereami   Location information',
      'terminal.uptime': 'Uptime: ',
      'terminal.unknown': 'unknown',
      'terminal.unknownAgent': 'unknown',
      'terminal.dataHeader': 'System Information',
      'terminal.ipLocation': '  Location: ',
      'terminal.ipISP': '  ISP: ',
      'terminal.ipTZ': '  Timezone: ',
      'terminal.ipUnknown': 'Unknown',
      'terminal.unknownCmd': 'is not recognized as an internal or external\ncommand, program, or batch file.',
      'terminal.boot1': 'No Microsoft Windows 2000 [Version 5.00.2195]',
      'terminal.boot2': '(C) Copyright 1985-2000 No Microsoft Corp.',
      'terminal.whereami.header': 'Location Information',
      'terminal.whereami.tz': 'Timezone: ',
      'terminal.whereami.localTime': 'Local Time: ',
      'terminal.whereami.agent': 'Agent: ',
      'terminal.whereami.platform': 'Platform: ',
      'terminal.whereami.fetchGeo': 'Fetching geolocation data...',
      'terminal.whereami.geoFail': 'Failed to get location.',

      /* SoundCloud */
      'soundcloud.title': 'SoundCloud Player',
      'soundcloud.playlistTitle': 'Playlists',
      'soundcloud.addPlaylist': 'Add playlist',
      'soundcloud.addTitle': 'Add playlist',
      'soundcloud.addMsg': 'Paste the SoundCloud playlist link:',
      'soundcloud.loading': 'Loading playlist...',
      'soundcloud.failed': 'Failed to load playlist',
      'soundcloud.loadingTrack': 'Loading...',
      'soundcloud.failedTrack': 'Failed to load',
      'soundcloud.defaultTrack': 'No track',
      'soundcloud.defaultArtist': 'SoundCloud',
      'soundcloud.trackPrefix': 'Track ',
      'soundcloud.playlistPrefix': 'Playlist ',

      /* Feed */
      'feed.title': 'Diary',
      'feed.entries': 'entries',
      'feed.noPosts': 'No entries.',
      'feed.error': 'Error loading.',
      'feed.unknown': 'unknown',
      'start.feed': 'Diary',
      'desktop.chat': 'Chat',
      'desktop.randomgif': 'Random GIF',
      'desktop.feed': 'Diary',
      'gallery.title': 'Image Collection',
      'gallery.info': 'SPACE to exit | ← → to navigate (',
      'gallery.infoEnd': ')',

      /* System info */
      'sys.time': 'Time: ',
      'sys.os': 'OS: ',
      'sys.arch': 'Architecture: ',
      'sys.browser': 'Browser: ',
      'sys.lang': 'Language: ',
      'sys.tz': 'Timezone: ',
      'sys.resolution': 'Resolution: ',
      'sys.colorDepth': 'Color Depth: ',
      'sys.sessionDuration': 'Session Duration: ',
      'sys.cpu': 'CPU: ',
      'sys.ram': 'RAM: ',
      'sys.ip': 'IP: ',
      'sys.location': 'Location: ',
      'sys.zip': 'ZIP: ',
      'sys.isp': 'ISP: ',
      'sys.coords': 'Coordinates: ',
      'sys.fetching': 'Fetching...',
      'sys.fetchFail': 'Failed to fetch location.',
      'sys.unknown': 'Unknown',
      'sys.cores': ' cores',

      /* Dialogs */
      'dialog.ok': 'OK',
      'dialog.cancel': 'Cancel',
      'dialog.errorTitle': 'Error',
      'dialog.errorOpen': 'Error opening ',

      /* Tray */
      'tray.volume': 'Volume',
      'tray.maxTitle': 'Max (100%)',
      'tray.resetTitle': 'Reset volume',
      'tray.resetLabel': 'Reset',
      'tray.muteTitle': 'Mute (0%)',
      'tray.muteLabel': 'Mute',
      'tray.months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'tray.days': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

      /* Fullscreen */
      'fullscreen.enter': 'Full Screen',
      'fullscreen.exit': 'Exit Full Screen',

      /* Shutdown */
      'shutdown.title': 'Shut Down',
      'shutdown.msg': 'Are you sure you want to shut down the computer?',
      'shutdown.done': 'It is now safe to turn off your computer.',

      /* System */
      'system.title': 'System',
      'system.aboutTitle': 'System',
      'system.aboutMsg': 'Windows 2000 Desktop\n\nA hobby project built with plain HTML, CSS, and JavaScript.',

    },
  };

  function t(key, ...args) {
    var lang = strings[_lang] || strings.pt;
    var val = lang[key];
    if (val === undefined || val === null) {
      var pt = strings.pt[key];
      val = pt !== undefined ? pt : key;
    }
    if (typeof val === 'function') return val.apply(null, args);
    if (args.length) {
      return val.replace(/\{(\d+)\}/g, function(_, n) { return args[parseInt(n)] !== undefined ? args[parseInt(n)] : '{' + n + '}'; });
    }
    return val;
  }

  function setLanguage(lang) {
    if (lang !== 'pt' && lang !== 'en') return;
    _lang = lang;
    try { localStorage.setItem('w2kLang', lang); } catch (e) {}

    applyTranslations();

    for (var i = 0; i < _callbacks.length; i++) {
      try { _callbacks[i](lang); } catch (e) { console.error('i18n callback error:', e); }
    }
  }

  function onLanguageChange(fn) {
    if (typeof fn === 'function') _callbacks.push(fn);
  }

  function applyTranslations() {
    document.title = t('page.title');
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-title');
      el.title = t(key);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-alt');
      el.alt = t(key);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-html');
      el.innerHTML = t(key);
    });
  }

  global.__ = t;
  global.getCurrentLang = function () { return _lang; };
  global.setLanguage = setLanguage;
  global.onLanguageChange = onLanguageChange;

  // Init: load saved language
  var saved = null;
  try { saved = localStorage.getItem('w2kLang'); } catch (e) {}
  if (saved === 'en') { _lang = 'en'; }
})(window);
