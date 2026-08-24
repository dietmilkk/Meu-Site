/**
 * Club App - State Management
 * Centralized state with reactive updates
 */

// Tier definitions (shared) - must be defined BEFORE State IIFE
const TIER_DEFINITIONS = [
    {
        id: 'supporter',
        name: 'Apoiador',
        price: 'R$ 15/mês',
        priceValue: 15,
        features: [
            'Acesso a todos os posts exclusivos',
            'Conteúdo antecipado (48h antes do público)',
            'Badge de apoiador no perfil',
            'Acesso ao Discord exclusivo',
            'Enquetes para decidir próximos temas'
        ],
        color: '#27ae60',
        hotmartProductId: null
    },
    {
        id: 'patron',
        name: 'Patrono',
        price: 'R$ 35/mês',
        priceValue: 35,
        features: [
            'Tudo do nível Apoiador',
            'Posts bastidores e processo criativo',
            'Downloads de wallpapers em alta resolução',
            'Acesso a lives mensais exclusivas',
            'Nome nos créditos de projetos',
            'Desconto de 20% em merchandise'
        ],
        color: '#2980b9',
        hotmartProductId: null,
        featured: true
    },
    {
        id: 'founder',
        name: 'Fundador',
        price: 'R$ 80/mês',
        priceValue: 80,
        features: [
            'Tudo do nível Patrono',
            'Chamada de vídeo trimestral (grupo pequeno)',
            'Acesso vitalício a todo conteúdo futuro',
            'Input direto em decisões de direção criativa',
            'Arte personalizada anual',
            'Acesso ao arquivo completo (incluindo rascunhos)'
        ],
        color: '#8e44ad',
        hotmartProductId: null
    }
];

const State = (function () {
    'use strict';

    const STORAGE_KEY = 'clubUserAccess';
    const TIER_ORDER = { 'Público': 0, 'Apoiador': 1, 'Patrono': 2, 'Fundador': 3 };

    let state = {
        user: null,           // { tier, tierName, expires, email, purchaseDate }
        posts: [],            // Array of post objects
        ui: {
            gateVisible: true,
            contentVisible: false,
            userBarVisible: false,
            modalVisible: false,
            hotmartVisible: false
        },
        config: {
            tokenExpiryDays: 30,
            minBarHeight: 96
        }
    };

    const listeners = new Map();

    function notify(key, value) {
        const keyListeners = listeners.get(key) || [];
        keyListeners.forEach(fn => fn(value));
    }

    function set(key, value) {
        const keys = key.split('.');
        let obj = state;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        notify(key, value);
    }

    function get(key) {
        const keys = key.split('.');
        let obj = state;
        for (const k of keys) {
            if (obj === undefined || obj === null) return undefined;
            obj = obj[k];
        }
        return obj;
    }

    function subscribe(key, fn) {
        if (!listeners.has(key)) listeners.set(key, []);
        listeners.get(key).push(fn);
        return () => {
            const arr = listeners.get(key) || [];
            const idx = arr.indexOf(fn);
            if (idx > -1) arr.splice(idx, 1);
        };
    }

    function getState() {
        return JSON.parse(JSON.stringify(state));
    }

    // User access helpers
    function loadUserFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.expires && data.expires > Date.now()) {
                    return data;
                }
            }
        } catch (e) {}
        return null;
    }

    function saveUserToStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function clearUserStorage() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
    }

    function normalizeTier(t) {
        t = String(t || '').toLowerCase();
        if (t === 'patron' || t === 'patrono') return 'Patrono';
        if (t === 'supporter' || t === 'apoiador') return 'Apoiador';
        if (t === 'founder' || t === 'fundador') return 'Fundador';
        if (t === 'publico' || t === 'público') return 'Público';
        return t;
    }

    function canViewPost(userTier, postTier) {
        const u = normalizeTier(userTier || 'Apoiador');
        const p = normalizeTier(postTier || 'Público');
        return TIER_ORDER[u] >= TIER_ORDER[p];
    }

    function getTierConfig(tierId) {
        return TIER_DEFINITIONS.find(t => t.id === tierId);
    }

    return {
        state,
        set,
        get,
        subscribe,
        getState,
        loadUserFromStorage,
        saveUserToStorage,
        clearUserStorage,
        normalizeTier,
        canViewPost,
        getTierConfig,
        TIER_ORDER,
        TIER_DEFINITIONS
    };
})();

// Sample posts (in production: fetch from API)
const SAMPLE_POSTS = [
    {
        id: 1,
        author: 'NSUMNEVSAIDF-88',
        avatar: 'radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)',
        time: '2 horas atrás',
        tier: 'Patrono',
        tierColor: '#2980b9',
        body: 'Acabei de finalizar o novo wallpaper pack de outubro! 🎃\n\nSão 12 variações temáticas (outono, halloween, estética vaporwave, minimalista) em 4K, 1440p e 1080p. Disponível agora para Patronos e Fundadores.\n\nPreview abaixo — o pack completo tem 48 arquivos no total.',
        media: [
            { type: 'image', url: 'https://picsum.photos/seed/wallpaper1/600/400', alt: 'Preview wallpaper pack' },
            { type: 'image', url: 'https://picsum.photos/seed/wallpaper2/600/400', alt: 'Preview wallpaper pack 2' }
        ],
        likes: 47,
        liked: false,
        comments: [
            { author: 'Membro#124', avatar: 'radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)', time: '1h', text: 'Mal posso esperar para baixar! A estética vaporwave ficou linda.' },
            { author: 'Membro#89', avatar: 'radial-gradient(circle at 30% 30%, #fd79a8, #e84393)', time: '45min', text: 'Os tamanhos 4K fazem toda diferença no meu monitor ultrawide. Obrigado!' }
        ]
    },
    {
        id: 2,
        author: 'NSUMNEVSAIDF-88',
        avatar: 'radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)',
        time: '1 dia atrás',
        tier: 'Apoiador',
        tierColor: '#27ae60',
        body: 'Pequena atualização sobre o projeto "Liberdade & Chão" que mencionei semana passada:\n\n• Capítulo 3 em revisão final (sai até sexta)\n• Gravei o áudio do capítulo 1 — link no post anterior para Patronos+\n• Próximo tema da live: "Como não virar mercadoria sem virar eremita"\n\nObrigado a quem mandou perguntas! Vou responder as melhores na live de domingo.',
        media: [
            { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Prévia: Capítulo 1 - Introdução (2:34)' }
        ],
        likes: 32,
        liked: true,
        comments: [
            { author: 'Membro#203', avatar: 'radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)', time: '12h', text: 'Ansioso pelo capítulo 3! O capítulo 2 mexeu muito comigo.' },
            { author: 'Membro#56', avatar: 'radial-gradient(circle at 30% 30%, #a29bfe, #6c5ce7)', time: '8h', text: 'Vou tentar participar da live ao vivo dessa vez!' }
        ]
    },
    {
        id: 3,
        author: 'NSUMNEVSAIDF-88',
        avatar: 'radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)',
        time: '3 dias atrás',
        tier: 'Fundador',
        tierColor: '#8e44ad',
        body: 'Conteúdo exclusivo para Fundadores: rascunhos e anotações do processo criativo do último mês.\n\nCompartilho aqui o caderno bruto — ideias descartadas, trechos reescritos 5x, mapas mentais. É feio, bagunçado, mas é o "chão" por trás do resultado final.\n\nLembrete: isso fica só entre nós. Não compartilhe fora daqui.',
        media: [
            { type: 'image', url: 'https://picsum.photos/seed/sketchbook1/600/500', alt: 'Página do caderno de rascunhos' },
            { type: 'image', url: 'https://picsum.photos/seed/sketchbook2/600/500', alt: 'Mapa mental de temas' }
        ],
        likes: 19,
        liked: false,
        comments: [
            { author: 'Membro#7', avatar: 'radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)', time: '2d', text: 'Ver o processo bruto é inspirador. Faz a gente se sentir menos sozinho na bagunça.' }
        ]
    },
    {
        id: 4,
        author: 'NSUMNEVSAIDF-88',
        avatar: 'radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)',
        time: '5 dias atrás',
        tier: 'Apoiador',
        tierColor: '#27ae60',
        body: 'Enquete para o próximo pack de ícones! 🗳️\n\nVote nos comentários com o número:\n1. Ícones de apps retro (Win95/98 style)\n2. Ícones minimalistas monocromáticos\n3. Ícones "glitch" estética cyberpunk\n4. Ícones de ferramentas de dev (terminal, git, docker, etc)\n\nMais votado vira pack do mês que vem. Fundadores têm peso 2 no voto!',
        media: [],
        likes: 28,
        liked: false,
        comments: [
            { author: 'Membro#145', avatar: 'radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)', time: '4d', text: 'Voto 1! Adoro a estética retro.' },
            { author: 'Membro#23', avatar: 'radial-gradient(circle at 30% 30%, #fd79a8, #e84393)', time: '3d', text: '4 seria muito útil pro meu setup.' },
            { author: 'Membro#12', avatar: 'radial-gradient(circle at 30% 30%, #a29bfe, #6c5ce7)', time: '2d', text: '1 ou 3. Difícil escolher.' }
        ]
    },
    {
        id: 5,
        author: 'NSUMNEVSAIDF-88',
        avatar: 'radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)',
        time: '1 semana atrás',
        tier: 'Público',
        tierColor: '#95a5a6',
        body: 'Post público de boas-vindas! 👋\n\nEste é o espaço onde compartilho conteúdo mais profundo, bastidores, arquivos exclusivos e conversas que não cabem nas redes sociais convencionais.\n\nNíveis de acesso:\n• Público: posts ocasionais abertos a todos\n• Apoiador (R$15): posts semanais + Discord + antecipação\n• Patrono (R$35): bastidores + lives + downloads + créditos\n• Fundador (R$80): tudo acima + chamadas + vitalício + input direto\n\nObrigado por estar aqui, seja como for. 💜',
        media: [
            { type: 'image', url: 'https://picsum.photos/seed/welcome/600/350', alt: 'Banner de boas-vindas' }
        ],
        likes: 156,
        liked: false,
        comments: [
            { author: 'Visitante#1', avatar: 'radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)', time: '6d', text: 'Conheci pelo SoundCloud. Conteúdo incrível!' },
            { author: 'Visitante#2', avatar: 'radial-gradient(circle at 30% 30%, #fd79a8, #e84393)', time: '5d', text: 'Pensando em virar Apoiador. Vale a pena?' },
            { author: 'Membro#44', avatar: 'radial-gradient(circle at 30% 30%, #a29bfe, #6c5ce7)', time: '4d', text: 'Vale MUITO. O Discord sozinho já paga o valor.' }
        ]
    }
];