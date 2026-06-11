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
      'desktop.dopamina': 'Dopamina',

      /* Start menu */
      'start.label': 'Start',
      'start.header': 'win2000',
      'start.frequent': 'Usados frequentemente',
      'start.games': 'Jogos',
      'start.gallery': 'Coleção de imgs',
      'start.links': 'Links',
      'start.settings': 'Configurações',
      'start.dopamina': 'Dopamina',
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
      'welcome.modeLabel': 'Modo',
      'welcome.desktopMode': 'Desktop',
      'welcome.mobileMode': 'Mobile',
      'welcome.dontShow': 'Não mostrar na inicialização',
      'welcome.startBtn': 'Começar',
      'welcome.volumeTip': 'Para uma melhor experiência, aumente o volume do seu computador.',
      'welcome.translationNote': 'As versões em inglês e chinês são traduções automáticas.',

      /* Links */
      'links.title': 'Links',
      'links.desc': 'Plataformas onde estou ativo — me segue aí :)',
      'links.scDesc': 'Minha página no SoundCloud com playlists e músicas.',
      'links.discordDesc': 'Me adiciona no Discord! (clique para copiar)',
      'links.biliDesc': 'Meu perfil no Bilibili chinês — é estranho e divertido, não entendo nada, mas é bem intrigante, e honestamente mais divertido que o YouTube, parece um conteúdo mais genuíno.',
      'links.wakatimeDesc': 'Minhas estatísticas de código — veja o que ando codando.',

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
      'dopamina.title': 'Dopamina',
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
      'desktop.dopamina': 'Dopamina',
      'desktop.settings': 'Settings',

      /* Start menu */
      'start.label': 'Start',
      'start.header': 'win2000',
      'start.frequent': 'Frequently Used',
      'start.games': 'Games',
      'start.gallery': 'Image Collection',
      'start.links': 'Links',
      'start.settings': 'Settings',
      'start.dopamina': 'Dopamina',
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
      'welcome.modeLabel': 'Mode',
      'welcome.desktopMode': 'Desktop',
      'welcome.mobileMode': 'Mobile',
      'welcome.dontShow': 'Don\'t show on startup',
      'welcome.startBtn': 'Get Started',
      'welcome.volumeTip': 'For a better experience, increase your computer\'s volume.',
      'welcome.translationNote': 'The English and Chinese versions are machine translations.',

      /* Links */
      'links.title': 'Links',
      'links.desc': 'Platforms where I\'m active — follow me :)',
      'links.scDesc': 'My SoundCloud page with playlists and music.',
      'links.discordDesc': 'Add me on Discord! (click to copy)',
      'links.biliDesc': 'My profile on Chinese Bilibili — it\'s weird and fun, I don\'t understand anything, but it\'s intriguing, and honestly more fun than YouTube, the content feels more genuine.',
      'links.wakatimeDesc': 'My coding statistics — see what I\'ve been coding.',

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
      'dopamina.title': 'Dopamina',
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

    zh: {
      /* Boot */
      'boot.msg': '启动中...',
      'boot.stage1': '启动中...',
      'boot.stage2': '加载设置...',
      'boot.stage3': '启动服务...',
      'boot.stage4': '准备界面...',
      'boot.stage5': '完成启动...',
      'boot.stage6': '就绪...',
      'boot.done': '就绪！^^',
      'page.title': "Ky 的个人网站",

      /* Desktop icons */
      'desktop.terminal': '终端',
      'desktop.wakatime': 'WakaTime',
      'desktop.games': '游戏',
      'desktop.soundcloud': 'SoundCloud',
      'desktop.gallery': '图片收藏',
      'desktop.links': '链接',
      'desktop.dopamina': '多巴胺',
      'desktop.settings': '设置',

      /* Start menu */
      'start.label': '开始',
      'start.header': 'win2000',
      'start.frequent': '常用',
      'start.games': '游戏',
      'start.gallery': '图片收藏',
      'start.links': '链接',
      'start.settings': '设置',
      'start.dopamina': '多巴胺',
      'start.soundcloud': 'SoundCloud',
      'start.system': '系统',
      'start.terminal': '终端',
      'start.fullscreen': '全屏',
      'start.shutdown': '关机',

      /* Context menu */
      'ctx.arrange': '排列图标',
      'ctx.refresh': '刷新',
      'ctx.showdesktop': '显示桌面',
      'ctx.properties': '属性',
      'ctx.addDesktop': '添加到桌面',
      'ctx.removeDesktop': '从桌面移除',
      'ctx.pin': '固定到任务栏',
      'ctx.unpin': '从任务栏取消固定',

      /* Welcome window */
      'welcome.greeting': '欢迎！',
      'welcome.desc': '这是我以 Win2000 为主题的个人网站，希望你喜欢，因为它是用心制作的，请随意探索和享受 ^^',
      'welcome.langLabel': '语言',
      'welcome.modeLabel': '模式',
      'welcome.desktopMode': '桌面',
      'welcome.mobileMode': '移动端',
      'welcome.dontShow': '启动时不再显示',
      'welcome.startBtn': '开始',
      'welcome.volumeTip': '为获得更好的体验，请调高电脑音量。',
      'welcome.translationNote': '英文和中文版本为机器翻译。',

      /* Links */
      'links.title': '链接',
      'links.desc': '我的活跃平台 — 关注我吧 :)',
      'links.scDesc': '我的 SoundCloud 页面，包含播放列表和音乐。',
      'links.discordDesc': '在 Discord 上加我！（点击复制）',
      'links.biliDesc': '我在中国 Bilibili 上的主页 — 又怪又有趣，虽然看不懂但很有意思，说实话比 YouTube 好玩，内容感觉更真实。',
      'links.wakatimeDesc': '我的编程统计数据 — 看看我在写什么代码。',

      /* Games */
      'games.title': '游戏',
      'games.snake': '贪吃蛇',
      'games.snake.desc': '吃到食物，别撞墙',
      'games.snake.controls': '方向键 / WASD 移动 | 空格键暂停',
      'games.maze': '迷宫',
      'games.maze.desc': '逃离迷宫到出口',
      'games.maze.controls': 'W/A/S/D 移动 | R 重新开始',
      'games.typing': '打字大乱斗',
      'games.typing.desc': '在单词落地前输入它们',
      'games.typing.controls': '输入单词击破气球',
      'games.footer': 'Esc 返回 | 双击开始游戏',
      'games.gameover': '游戏结束',
      'games.newrecord': '新纪录！',
      'games.score': '分数：',
      'games.highscore': '最高分：',
      'games.replay': 'Enter = 再玩一次',
      'games.pause': '暂停',
      'games.snake.hud': '贪吃蛇',
      'games.maze.hud': '迷宫',
      'games.maze.steps': '步数：',
      'games.maze.time': '时间：',
      'games.maze.nextLevel': '下一关：',
      'games.maze.nextEnter': 'Enter = 下一关',
      'games.maze.win': '逃脱成功！',
      'games.maze.wall': '撞墙了！',
      'games.maze.wallContinue': '按 Enter 继续。',
      'games.maze.reenter': 'Enter = 继续',
      'games.maze.level': '关卡：',
      'games.maze.coins': '金币：',
      'games.typing.hud': '打字',
      'games.typing.patience': '耐心：',
      'games.typing.destroyed': '单词数：',
      'games.ach.firstFood': '* 第一次吃到食物！（贪吃蛇）',
      'games.ach.food50': '* 50 个食物！（贪吃蛇）',
      'games.ach.food100': '* 100 个食物！（贪吃蛇）',
      'games.ach.food200': '* 200 个食物！（贪吃蛇）',
      'games.ach.firstMaze': '* 第一个迷宫通关！',
      'games.ach.maze5': '* 5 个迷宫通关！',
      'games.ach.maze10': '* 10 个迷宫通关！',
      'games.ach.mazeMaster': '* 迷宫大师！（25 个通关）',
      'games.ach.snake20': '* 贪吃蛇老手！（20+ 分）',
      'games.ach.bigEater': '* 大胃王！（50+ 分）',
      'games.ach.snakeMaster': '* 蛇王！（100+ 分）',
      'games.ach.speedRunner': '* 速度之星！（迷宫 <30 秒）',
      'games.ach.speedDemon': '* 速度恶魔！（迷宫 <15 秒 / 贪吃蛇加速）',
      'games.ach.goldenGobbler': '* 金色食物！（贪吃蛇）',
      'games.ach.poisonEater': '* 毒食物！（贪吃蛇）',
      'games.ach.mazeExplorer': '* 探索者！（访问所有单元格）',
      'games.ach.mazeNoDeath': '* 无死亡迷宫！',
      'games.ach.mazeLevel5': '* 迷宫第 5 关！',
      'games.ach.mazeLevel10': '* 迷宫第 10 关！',
      'games.ach.snakePlayed': '局数',
      'games.ach.totalFood': '食物数',
      'games.ach.mazesDone': '迷宫数',
      'games.ach.maxLvl': '最高关卡：',
      'games.ach.totalCoins': '金币数',

      /* Settings */
      'settings.title': '设置',
      'settings.appearance': '外观',
      'settings.about': '关于',
      'settings.aboutHeader': '关于',
      'settings.system': '系统',
      'settings.shortcuts': '快捷键',
      'settings.shortcutClose': '关闭活动窗口',
      'settings.shortcutStart': '打开开始菜单',
      'settings.shortcutFullscreen': '切换全屏',
      'settings.wallpaper': '壁纸',
      'settings.wallpaperDesc': '从电脑中选择一张图片作为壁纸。',
      'settings.noWallpaper': '无自定义壁纸',
      'settings.selectImage': '选择图片',
      'settings.noFile': '未选择文件',
      'settings.apply': '应用',
      'settings.applySuccess': '壁纸应用成功！',
      'settings.selectFirst': '请先选择一张图片。',
      'settings.dialogTitle': '设置',
      'settings.aboutContent': '<b>Win2K 桌面</b><br>一个用 HTML/CSS/JS 制作的功能性桌面<br><br>这个空间的目的就是让我有一个可以表达自己的个人空间，就像 Instagram，但更好，因为它不受大科技公司控制，完全由我根据自己的喜好和偏好定制<br>在这个人人都争相竞争的快节奏世界中，这是我的一片宁静之地<br><br><br><b>关于作者</b><br><br>你可以叫我 sillky 或简称 ky，我是非二元性别者，任何代词都可以。我是一个科技爱好者，喜欢复古事物和黑客、垃圾摇滚等另类文化<br><br>就这些。祝你探索愉快 :)',

      /* Terminal */
      'terminal.title': 'C:\\WINDOWS\\system32\\cmd.exe',
      'terminal.prompt': 'C:\\>',
      'terminal.fileWarn': '[警告] 你从电脑直接打开了 HTML（file://）。',
      'terminal.fileWarn2': 'API 请求可能被浏览器阻止。',
      'terminal.fileWarn3': '建议使用本地服务器（如 Live Server）。',
      'terminal.osUnknown': '未知',
      'terminal.help': '可用命令：\n  help       显示此帮助\n  clear      清屏\n  data       系统信息\n  uptime     运行时间\n  whereami   位置信息',
      'terminal.uptime': '运行时间：',
      'terminal.unknown': '未知',
      'terminal.unknownAgent': '未知',
      'terminal.dataHeader': '系统信息',
      'terminal.ipLocation': '  位置：',
      'terminal.ipISP': '  网络服务商：',
      'terminal.ipTZ': '  时区：',
      'terminal.ipUnknown': '未知',
      'terminal.unknownCmd': '不是内部或外部命令，也不是可运行的程序或批处理文件。',
      'terminal.boot1': 'Microsoft Windows 2000 [版本 5.00.2195]',
      'terminal.boot2': '(C) 版权所有 1985-2000 Microsoft Corp.',
      'terminal.whereami.header': '位置信息',
      'terminal.whereami.tz': '时区：',
      'terminal.whereami.localTime': '本地时间：',
      'terminal.whereami.agent': '代理：',
      'terminal.whereami.platform': '平台：',
      'terminal.whereami.fetchGeo': '正在获取地理位置数据...',
      'terminal.whereami.geoFail': '获取位置失败。',

      /* SoundCloud */
      'soundcloud.title': 'SoundCloud 播放器',
      'soundcloud.playlistTitle': '播放列表',
      'soundcloud.addPlaylist': '添加播放列表',
      'soundcloud.addTitle': '添加播放列表',
      'soundcloud.addMsg': '粘贴 SoundCloud 播放列表链接：',
      'soundcloud.loading': '正在加载播放列表...',
      'soundcloud.failed': '加载播放列表失败',
      'soundcloud.loadingTrack': '加载中...',
      'soundcloud.failedTrack': '加载失败',
      'soundcloud.defaultTrack': '无曲目',
      'soundcloud.defaultArtist': 'SoundCloud',
      'soundcloud.trackPrefix': '曲目 ',
      'soundcloud.playlistPrefix': '播放列表 ',

      /* Feed */
      'feed.title': '日记',
      'feed.entries': '条目',
      'feed.noPosts': '暂无条目。',
      'feed.error': '加载失败。',
      'feed.unknown': '未知',
      'start.feed': '日记',
      'desktop.chat': '聊天',
      'desktop.randomgif': '随机 GIF',
      'desktop.feed': '日记',
      'dopamina.title': '多巴胺',
      'gallery.title': '图片收藏',
      'gallery.info': '空格退出 | ← → 导航（',
      'gallery.infoEnd': '）',

      /* System info */
      'sys.time': '时间：',
      'sys.os': '操作系统：',
      'sys.arch': '架构：',
      'sys.browser': '浏览器：',
      'sys.lang': '语言：',
      'sys.tz': '时区：',
      'sys.resolution': '分辨率：',
      'sys.colorDepth': '色彩深度：',
      'sys.sessionDuration': '会话时长：',
      'sys.cpu': 'CPU：',
      'sys.ram': '内存：',
      'sys.ip': 'IP：',
      'sys.location': '位置：',
      'sys.zip': '邮编：',
      'sys.isp': '网络服务商：',
      'sys.coords': '坐标：',
      'sys.fetching': '获取中...',
      'sys.fetchFail': '获取位置失败',
      'sys.unknown': '未知',
      'sys.cores': ' 核心',

      /* Dialogs */
      'dialog.ok': '确定',
      'dialog.cancel': '取消',
      'dialog.errorTitle': '错误',
      'dialog.errorOpen': '打开失败 ',

      /* Tray */
      'tray.volume': '音量',
      'tray.maxTitle': '最大（100%）',
      'tray.resetTitle': '重置音量',
      'tray.resetLabel': '重置',
      'tray.muteTitle': '静音（0%）',
      'tray.muteLabel': '静音',
      'tray.months': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      'tray.days': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],

      /* Fullscreen */
      'fullscreen.enter': '全屏',
      'fullscreen.exit': '退出全屏',

      /* Shutdown */
      'shutdown.title': '关机',
      'shutdown.msg': '你确定要关闭电脑吗？',
      'shutdown.done': '现在可以安全关闭电脑了。',

      /* System */
      'system.title': '系统',
      'system.aboutTitle': '系统',
      'system.aboutMsg': 'Windows 2000 桌面\n\n一个用纯 HTML、CSS 和 JavaScript 制作的业余项目。',

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
    if (lang !== 'pt' && lang !== 'en' && lang !== 'zh') return;
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
  else if (saved === 'zh') { _lang = 'zh'; }
})(window);
