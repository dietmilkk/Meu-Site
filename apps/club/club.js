(function () {
    "use strict";

    var win = document.getElementById("clubWindow");
    var dragHandle = document.getElementById("clubDragHandle");
    var btnClose = document.getElementById("clubBtnClose");
    var btnMinimize = document.getElementById("clubBtnMinimize");
    var btnMaximize = document.getElementById("clubBtnMaximize");

    var gateScreen = document.getElementById("clubGateScreen");
    var contentScreen = document.getElementById("clubContentScreen");
    var feedEl = document.getElementById("clubFeed");
    var navPosts = document.getElementById("clubNavPosts");
    var navTiers = document.getElementById("clubNavTiers");
    var navCommunity = document.getElementById("clubNavCommunity");
    var statusEl = document.getElementById("clubStatus");
    var tierModal = document.getElementById("clubTierModal");
    var tierList = document.getElementById("clubTierList");
    var tierClose = document.getElementById("clubTierClose");
    var hotmartContainer = document.getElementById("clubHotmartContainer");

    var currentUser = null;
    var currentTier = null;
    var postsData = [];
    var isLoading = false;

    var TIER_DEFINITIONS = [
        {
            id: "supporter",
            name: "Apoiador",
            price: "R$ 15/mês",
            priceValue: 15,
            features: [
                "Acesso a todos os posts exclusivos",
                "Conteúdo antecipado (48h antes do público)",
                "Badge de apoiador no perfil",
                "Acesso ao Discord exclusivo",
                "Enquetes para decidir próximos temas"
            ],
            color: "#27ae60",
            hotmartProductId: null
        },
        {
            id: "patron",
            name: "Patrono",
            price: "R$ 35/mês",
            priceValue: 35,
            features: [
                "Tudo do nível Apoiador",
                "Posts bastidores e processo criativo",
                "Downloads de wallpapers em alta resolução",
                "Acesso a lives mensais exclusivas",
                "Nome nos créditos de projetos",
                "Desconto de 20% em merchandise"
            ],
            color: "#2980b9",
            hotmartProductId: null,
            featured: true
        },
        {
            id: "founder",
            name: "Fundador",
            price: "R$ 80/mês",
            priceValue: 80,
            features: [
                "Tudo do nível Patrono",
                "Chamada de vídeo trimestral (grupo pequeno)",
                "Acesso vitalício a todo conteúdo futuro",
                "Input direto em decisões de direção criativa",
                "Arte personalizada anual",
                "Acesso ao arquivo completo (incluindo rascunhos)"
            ],
            color: "#8e44ad",
            hotmartProductId: null
        }
    ];

    var SAMPLE_POSTS = [
        {
            id: 1,
            author: "NSUMNEVSAIDF-88",
            avatar: "radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)",
            time: "2 horas atrás",
            tier: "Patrono",
            tierColor: "#2980b9",
            body: "Acabei de finalizar o novo wallpaper pack de outubro! 🎃\n\nSão 12 variações temáticas (outono, halloween, estética vaporwave, minimalista) em 4K, 1440p e 1080p. Disponível agora para Patronos e Fundadores.\n\nPreview abaixo — o pack completo tem 48 arquivos no total.",
            media: [
                { type: "image", url: "https://picsum.photos/seed/wallpaper1/600/400", alt: "Preview wallpaper pack" },
                { type: "image", url: "https://picsum.photos/seed/wallpaper2/600/400", alt: "Preview wallpaper pack 2" }
            ],
            likes: 47,
            liked: false,
            comments: [
                { author: "Membro#124", avatar: "radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)", time: "1h", text: "Mal posso esperar para baixar! A estética vaporwave ficou linda." },
                { author: "Membro#89", avatar: "radial-gradient(circle at 30% 30%, #fd79a8, #e84393)", time: "45min", text: "Os tamanhos 4K fazem toda diferença no meu monitor ultrawide. Obrigado!" }
            ]
        },
        {
            id: 2,
            author: "NSUMNEVSAIDF-88",
            avatar: "radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)",
            time: "1 dia atrás",
            tier: "Apoiador",
            tierColor: "#27ae60",
            body: "Pequena atualização sobre o projeto \"Liberdade & Chão\" que mencionei semana passada:\n\n• Capítulo 3 em revisão final (sai até sexta)\n• Gravei o áudio do capítulo 1 — link no post anterior para Patronos+\n• Próximo tema da live: \"Como não virar mercadoria sem virar eremita\"\n\nObrigado a quem mandou perguntas! Vou responder as melhores na live de domingo.",
            media: [
                { type: "audio", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", title: "Prévia: Capítulo 1 - Introdução (2:34)" }
            ],
            likes: 32,
            liked: true,
            comments: [
                { author: "Membro#203", avatar: "radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)", time: "12h", text: "Ansioso pelo capítulo 3! O capítulo 2 mexeu muito comigo." },
                { author: "Membro#56", avatar: "radial-gradient(circle at 30% 30%, #a29bfe, #6c5ce7)", time: "8h", text: "Vou tentar participar da live ao vivo dessa vez!" }
            ]
        },
        {
            id: 3,
            author: "NSUMNEVSAIDF-88",
            avatar: "radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)",
            time: "3 dias atrás",
            tier: "Fundador",
            tierColor: "#8e44ad",
            body: "Conteúdo exclusivo para Fundadores: rascunhos e anotações do processo criativo do último mês.\n\nCompartilho aqui o caderno bruto — ideias descartadas, trechos reescritos 5x, mapas mentais. É feio, bagunçado, mas é o \"chão\" por trás do resultado final.\n\nLembrete: isso fica só entre nós. Não compartilhe fora daqui.",
            media: [
                { type: "image", url: "https://picsum.photos/seed/sketchbook1/600/500", alt: "Página do caderno de rascunhos" },
                { type: "image", url: "https://picsum.photos/seed/sketchbook2/600/500", alt: "Mapa mental de temas" }
            ],
            likes: 19,
            liked: false,
            comments: [
                { author: "Membro#7", avatar: "radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)", time: "2d", text: "Ver o processo bruto é inspirador. Faz a gente se sentir menos sozinho na bagunça." }
            ]
        },
        {
            id: 4,
            author: "NSUMNEVSAIDF-88",
            avatar: "radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)",
            time: "5 dias atrás",
            tier: "Apoiador",
            tierColor: "#27ae60",
            body: "Enquete para o próximo pack de ícones! 🗳️\n\nVote nos comentários com o número:\n1. Ícones de apps retro (Win95/98 style)\n2. Ícones minimalistas monocromáticos\n3. Ícones \"glitch\" estética cyberpunk\n4. Ícones de ferramentas de dev (terminal, git, docker, etc)\n\nMais votado vira pack do mês que vem. Fundadores têm peso 2 no voto!",
            media: [],
            likes: 28,
            liked: false,
            comments: [
                { author: "Membro#145", avatar: "radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)", time: "4d", text: "Voto 1! Adoro a estética retro." },
                { author: "Membro#23", avatar: "radial-gradient(circle at 30% 30%, #fd79a8, #e84393)", time: "3d", text: "4 seria muito útil pro meu setup." },
                { author: "Membro#12", avatar: "radial-gradient(circle at 30% 30%, #a29bfe, #6c5ce7)", time: "2d", text: "1 ou 3. Difícil escolher." }
            ]
        },
        {
            id: 5,
            author: "NSUMNEVSAIDF-88",
            avatar: "radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)",
            time: "1 semana atrás",
            tier: "Público",
            tierColor: "#95a5a6",
            body: "Post público de boas-vindas! 👋\n\nEste é o espaço onde compartilho conteúdo mais profundo, bastidores, arquivos exclusivos e conversas que não cabem nas redes sociais convencionais.\n\nNíveis de acesso:\n• Público: posts ocasionais abertos a todos\n• Apoiador (R$15): posts semanais + Discord + antecipação\n• Patrono (R$35): bastidores + lives + downloads + créditos\n• Fundador (R$80): tudo acima + chamadas + vitalício + input direto\n\nObrigado por estar aqui, seja como for. 💜",
            media: [
                { type: "image", url: "https://picsum.photos/seed/welcome/600/350", alt: "Banner de boas-vindas" }
            ],
            likes: 156,
            liked: false,
            comments: [
                { author: "Visitante#1", avatar: "radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)", time: "6d", text: "Conheci pelo SoundCloud. Conteúdo incrível!" },
                { author: "Visitante#2", avatar: "radial-gradient(circle at 30% 30%, #fd79a8, #e84393)", time: "5d", text: "Pensando em virar Apoiador. Vale a pena?" },
                { author: "Membro#44", avatar: "radial-gradient(circle at 30% 30%, #a29bfe, #6c5ce7)", time: "4d", text: "Vale MUITO. O Discord sozinho já paga o valor." }
            ]
        }
    ];

    function escHtml(s) {
        return String(s)
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
    }

    function formatTimeAgo(ts) {
        if (!ts) return "agora";
        var diff = Date.now() - ts;
        var mins = Math.floor(diff / 60000);
        var hours = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);
        if (mins < 1) return "agora";
        if (mins < 60) return mins + "min atrás";
        if (hours < 24) return hours + "h atrás";
        if (days < 7) return days + "d atrás";
        var d = new Date(ts);
        return (d.getDate().toString().padStart(2, "0")) + "/" + ((d.getMonth() + 1).toString().padStart(2, "0")) + "/" + d.getFullYear();
    }

    function getUserAccess() {
        try {
            var stored = localStorage.getItem("clubUserAccess");
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return null;
    }

    function setUserAccess(data) {
        try {
            localStorage.setItem("clubUserAccess", JSON.stringify(data));
        } catch (e) {}
        currentUser = data;
    }

    function clearUserAccess() {
        try {
            localStorage.removeItem("clubUserAccess");
        } catch (e) {}
        currentUser = null;
    }

    function canViewPost(post) {
        if (!currentUser) return post.tier === "Público";
        var userTier = (currentUser.tier || "Apoiador");
        // Normaliza: aceita tanto "patron" quanto "Patrono", etc.
        var norm = function (t) {
            t = String(t).toLowerCase();
            if (t === "patron" || t === "patrono") return "Patrono";
            if (t === "supporter" || t === "apoiador") return "Apoiador";
            if (t === "founder" || t === "fundador") return "Fundador";
            if (t === "publico" || t === "público") return "Público";
            return t;
        };
        var tierOrder = { "Público": 0, "Apoiador": 1, "Patrono": 2, "Fundador": 3 };
        return tierOrder[norm(userTier)] >= tierOrder[norm(post.tier)];
    }

    function renderPost(post) {
        var div = document.createElement("div");
        div.className = "club-post";
        div.dataset.postId = post.id;

        var mediaHtml = "";
        if (post.media && post.media.length) {
            mediaHtml = '<div class="club-post-media">';
            post.media.forEach(function (m) {
                if (m.type === "image") {
                    mediaHtml += '<img src="' + escHtml(m.url) + '" alt="' + escHtml(m.alt || "") + '" loading="lazy">';
                } else if (m.type === "video") {
                    mediaHtml += '<video controls src="' + escHtml(m.url) + '"></video>';
                } else if (m.type === "audio") {
                    mediaHtml += '<audio controls src="' + escHtml(m.url) + '"><span>' + escHtml(m.title) + '</span></audio>';
                }
            });
            mediaHtml += '</div>';
        }

        var commentsHtml = "";
        if (post.comments && post.comments.length) {
            commentsHtml = '<div class="club-post-comments">';
            post.comments.forEach(function (c) {
                commentsHtml +=
                    '<div class="club-comment">' +
                    '<div class="club-comment-header">' +
                    '<div class="club-comment-avatar" style="background:' + escHtml(c.avatar) + '"></div>' +
                    '<span class="club-comment-author">' + escHtml(c.author) + '</span>' +
                    '<span class="club-comment-time">' + escHtml(c.time) + '</span>' +
                    '</div>' +
                    '<div class="club-comment-text">' + escHtml(c.text) + '</div>' +
                    '</div>';
            });
            commentsHtml += '</div>';
        }

        var commentFormHtml = currentUser ? (
            '<div class="club-comment-form">' +
            '<input type="text" class="club-comment-input" placeholder="Adicionar comentário..." data-post-id="' + post.id + '">' +
            '<button class="club-action-btn" onclick="clubSubmitComment(' + post.id + ')">Enviar</button>' +
            '</div>'
        ) : "";

        var tierTagHtml = post.tier !== "Público" ? (
            '<span class="club-post-tier-tag" style="background:' + escHtml(post.tierColor) + '">' + escHtml(post.tier) + '</span>'
        ) : "";

        div.innerHTML =
            '<div class="club-post-header">' +
            '<div class="club-post-avatar" style="background:' + escHtml(post.avatar) + '"></div>' +
            '<div class="club-post-author">' +
            '<div class="club-post-name">' + escHtml(post.author) + '</div>' +
            '<div class="club-post-meta">' + escHtml(post.time) + '</div>' +
            '</div>' +
            tierTagHtml +
            '</div>' +
            '<div class="club-post-body">' + escHtml(post.body) + '</div>' +
            mediaHtml +
            '<div class="club-post-actions">' +
            '<button class="club-action-btn' + (post.liked ? ' liked' : '') + '" onclick="clubToggleLike(' + post.id + ')" data-post-id="' + post.id + '">' +
            (post.liked ? '♥ ' : '♡ ') + post.likes +
            '</button>' +
            '<button class="club-action-btn" onclick="clubToggleComments(' + post.id + ')">💬 ' + (post.comments ? post.comments.length : 0) + '</button>' +
            '<span style="flex:1"></span>' +
            '<button class="club-action-btn" onclick="clubSharePost(' + post.id + ')">↗ Compartilhar</button>' +
            '</div>' +
            commentsHtml +
            commentFormHtml;
        return div;
    }

    function renderFeed() {
        if (!feedEl) return;
        feedEl.innerHTML = "";
        var visiblePosts = postsData.filter(canViewPost);
        if (!visiblePosts.length) {
            feedEl.innerHTML =
                '<div class="club-empty">' +
                '<div class="club-empty-icon">📭</div>' +
                '<p>Nenhum post disponível para seu nível de acesso.</p>' +
                (currentUser ? '<p style="font-size:11px;color:#808080">Posts de níveis superiores ficam visíveis ao fazer upgrade.</p>' : '<button class="club-gate-btn" onclick="clubOpenTierModal()">🔓 Desbloquear acesso completo</button>') +
                '</div>';
            return;
        }
        visiblePosts.forEach(function (post) {
            feedEl.appendChild(renderPost(post));
        });
    }

    function renderTierCards() {
        if (!tierList) return;
        tierList.innerHTML = "";
        TIER_DEFINITIONS.forEach(function (t) {
            var card = document.createElement("div");
            card.className = "club-tier-card" + (t.featured ? " featured" : "");
            card.innerHTML =
                '<div class="club-tier-name">' + escHtml(t.name) + '</div>' +
                '<div class="club-tier-price">' + escHtml(t.price) + '</div>' +
                '<div class="club-tier-features">' + t.features.map(function (f) { return "• " + escHtml(f); }).join("<br>") + '</div>' +
                '<button class="club-tier-select" onclick="clubSelectTier(\'' + t.id + '\')">Selecionar ' + escHtml(t.name) + '</button>';
            tierList.appendChild(card);
        });
    }

    function showGate() {
        if (gateScreen) gateScreen.style.display = "flex";
        if (contentScreen) contentScreen.style.display = "none";
        if (statusEl) statusEl.textContent = "Acesso restrito — faça login ou assine para continuar";
    }

    function showContent() {
        if (gateScreen) gateScreen.style.display = "none";
        if (contentScreen) contentScreen.style.display = "flex";
        if (statusEl) statusEl.textContent = "Conectado como " + (currentUser && currentUser.tier ? currentUser.tier : "Visitante");
        renderFeed();
    }

    function checkAccess() {
        var access = getUserAccess();
        if (access && access.expires && access.expires > Date.now()) {
            setUserAccess(access);
            showContent();
        } else if (access && (!access.expires || access.expires <= Date.now())) {
            // expired
            clearUserAccess();
            showGate();
        } else {
            showGate();
        }
    }

    function clubOpenTierModal() {
        if (tierModal) {
            renderTierCards();
            tierModal.classList.remove("hidden");
        }
    }

    function clubCloseTierModal() {
        if (tierModal) tierModal.classList.add("hidden");
    }

    function clubSelectTier(tierId) {
        var tier = TIER_DEFINITIONS.find(function (t) { return t.id === tierId; });
        if (!tier) return;
        clubCloseTierModal();

        // Simula abertura do checkout Hotmart em iframe
        // Em produção: hotmartContainer.innerHTML = '<iframe class="club-hotmart-frame" src="https://pay.hotmart.com/' + tier.hotmartProductId + '?checkoutMode=10&bid=..."></iframe>';
        // hotmartContainer.style.display = 'block';
        // contentScreen.style.display = 'none';

        // Por enquanto: simula pagamento bem-sucedido após 1.5s
        if (statusEl) statusEl.textContent = "Redirecionando para checkout Hotmart (" + tier.name + ")...";
        setTimeout(function () {
            // Simula sucesso do pagamento
            var accessData = {
                tier: tier.id,
                tierName: tier.name,
                expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 dias
                email: "usuario@exemplo.com",
                purchaseDate: Date.now()
            };
            setUserAccess(accessData);
            showContent();
            if (statusEl) statusEl.textContent = "Bem-vindo, " + tier.name + "! Acesso liberado até " + new Date(accessData.expires).toLocaleDateString("pt-BR");
        }, 1500);
    }

    function clubToggleLike(postId) {
        if (!currentUser) { clubOpenTierModal(); return; }
        var post = postsData.find(function (p) { return p.id === postId; });
        if (!post) return;
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        renderFeed();
    }

    function clubToggleComments(postId) {
        var postEl = feedEl.querySelector('[data-post-id="' + postId + '"]');
        if (!postEl) return;
        var comments = postEl.querySelector('.club-post-comments');
        var form = postEl.querySelector('.club-comment-form');
        if (comments) comments.style.display = comments.style.display === "none" ? "block" : "none";
        if (form) form.style.display = form.style.display === "none" ? "flex" : "none";
    }

    function clubSubmitComment(postId) {
        if (!currentUser) { clubOpenTierModal(); return; }
        var postEl = feedEl.querySelector('[data-post-id="' + postId + '"]');
        if (!postEl) return;
        var input = postEl.querySelector('.club-comment-input');
        if (!input || !input.value.trim()) return;
        var post = postsData.find(function (p) { return p.id === postId; });
        if (!post) return;
        var newComment = {
            author: currentUser.tierName || currentUser.tier || "Membro",
            avatar: "radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)",
            time: "agora",
            text: input.value.trim()
        };
        post.comments = post.comments || [];
        post.comments.push(newComment);
        input.value = "";
        renderFeed();
    }

    function clubSharePost(postId) {
        var post = postsData.find(function (p) { return p.id === postId; });
        if (!post) return;
        var url = window.location.origin + window.location.pathname + "#club/post/" + postId;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
                if (statusEl) statusEl.textContent = "Link copiado para a área de transferência!";
            });
        } else {
            prompt("Copie o link:", url);
        }
    }

    function setActiveNav(btn) {
        [navPosts, navTiers, navCommunity].forEach(function (b) {
            if (b) b.classList.remove("active");
        });
        if (btn) btn.classList.add("active");
    }

    function initNav() {
        if (navPosts) navPosts.addEventListener("click", function () {
            setActiveNav(navPosts);
            if (feedEl) feedEl.style.display = "block";
            // esconder outras views se existirem
        });
        if (navTiers) navTiers.addEventListener("click", function () {
            setActiveNav(navTiers);
            clubOpenTierModal();
        });
        if (navCommunity) navCommunity.addEventListener("click", function () {
            setActiveNav(navCommunity);
            if (statusEl) statusEl.textContent = "Comunidade — em breve: fórum, diretório de membros, eventos";
        });
    }

    function simulateHotmartCallback(success, tierId) {
        // Função para ser chamada pelo iframe do Hotmart via postMessage
        // window.addEventListener('message', function(e) { if(e.data.type==='hotmart_purchase') simulateHotmartCallback(e.data.success, e.data.tierId); });
        var tier = TIER_DEFINITIONS.find(function (t) { return t.id === tierId; });
        if (success && tier) {
            var accessData = {
                tier: tier.id,
                tierName: tier.name,
                expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
                email: "usuario@exemplo.com",
                purchaseDate: Date.now()
            };
            setUserAccess(accessData);
            if (hotmartContainer) hotmartContainer.style.display = "none";
            if (contentScreen) contentScreen.style.display = "flex";
            showContent();
        }
    }

    // Expor funções globais para onclick inline
    window.clubOpenTierModal = clubOpenTierModal;
    window.clubCloseTierModal = clubCloseTierModal;
    window.clubSelectTier = clubSelectTier;
    window.clubToggleLike = clubToggleLike;
    window.clubToggleComments = clubToggleComments;
    window.clubSubmitComment = clubSubmitComment;
    window.clubSharePost = clubSharePost;
    window.simulateHotmartCallback = simulateHotmartCallback;

    // WindowBehavior
    if (typeof WindowBehavior !== "undefined" && win) {
        var behavior = new WindowBehavior(win, {
            dragHandle: dragHandle,
            btnClose: btnClose,
            btnMinimize: btnMinimize,
            btnMaximize: btnMaximize,
            minW: 520,
            minH: 420,
            taskbarIcon:
                '<img src="system/assets/icons/tango2kde/16x16/apps/korganizer.png" alt="" width="14" height="14" style="flex-shrink:0;">',
            taskbarLabel: __("club.title"),
            taskbarAction: "club",
            appId: "club",
            onShow: function () {
                if (win) {
                    win.style.width = "640px";
                    win.style.height = "720px";
                }
                checkAccess();
            },
            onHide: function () {}
        });
        window.clubBehavior = behavior;
    }

    // Register in AppRegistry
    if (typeof W2K !== "undefined" && W2K && W2K.AppRegistry) {
        W2K.AppRegistry.register("club", {
            label: __("club.title"),
            show: function () {
                if (window.clubBehavior) window.clubBehavior.show();
            },
            minimize: function () {
                if (window.clubBehavior) window.clubBehavior.minimize();
            },
            hasEntry: function () {
                return window.clubBehavior ? window.clubBehavior.hasTaskbarEntry() : false;
            },
        });
    }

    // Init
    initNav();
    if (tierClose) tierClose.addEventListener("click", clubCloseTierModal);
    if (tierModal) tierModal.addEventListener("click", function (e) { if (e.target === tierModal) clubCloseTierModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && tierModal && !tierModal.classList.contains("hidden")) clubCloseTierModal(); });

    postsData = SAMPLE_POSTS;
    checkAccess();
})();