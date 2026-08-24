/**
 * Club App - Main Entry Point
 * Patreon-style content platform with Hotmart payment integration
 */

(function () {
    'use strict';

    // DOM Elements
    let win = null;
    let gateScreen = null;
    let contentScreen = null;
    let feedContainer = null;
    let statusEl = null;
    let tierModal = null;
    let hotmartContainer = null;

    // State
    let currentTab = 'posts';
    let isInitialized = false;

    // ===== Initialization =====
    function init() {
        cacheElements();
        bindEvents();
        initComponents();

        // Initialize posts data
        FeedCore.setPosts(SAMPLE_POSTS);

        // Check access on startup
        checkAccess();

        // Start periodic access check
        Auth.startAccessCheck(60000);

        // Handle cross-tab storage events
        window.addEventListener('storage', function (e) {
            if (e.key === 'clubUserAccess') {
                const hasAccess = Auth.checkAccess();
                if (hasAccess) {
                    showContent(Auth.getUser());
                } else {
                    showGate();
                }
            }
        });

        isInitialized = true;
    }

    function cacheElements() {
        win = document.getElementById('clubWindow');
        gateScreen = document.getElementById('clubGateScreen');
        contentScreen = document.getElementById('clubContentScreen');
        feedContainer = document.getElementById('clubFeed');
        statusEl = document.getElementById('clubStatus');
        tierModal = document.getElementById('clubTierModal');
        hotmartContainer = document.getElementById('clubHotmartContainer');
    }

    function bindEvents() {
        // Navigation tabs
        const navPosts = document.getElementById('clubNavPosts');
        const navTiers = document.getElementById('clubNavTiers');
        const navCommunity = document.getElementById('clubNavCommunity');

        if (navPosts) navPosts.addEventListener('click', () => switchTab('posts'));
        if (navTiers) navTiers.addEventListener('click', () => switchTab('tiers'));
        if (navCommunity) navCommunity.addEventListener('click', () => switchTab('community'));

        // Gate button
        const gateBtn = document.getElementById('clubGateBtn');
        if (gateBtn) gateBtn.addEventListener('click', TierModal.open);

        // Window controls
        const dragHandle = document.getElementById('clubDragHandle');
        const btnClose = document.getElementById('clubBtnClose');
        const btnMinimize = document.getElementById('clubBtnMinimize');
        const btnMaximize = document.getElementById('clubBtnMaximize');

        // WindowBehavior will handle these
    }

    function initComponents() {
        // Initialize feed
        const feedContainerEl = document.getElementById('clubFeed');
        Feed.init(feedContainerEl);

        // Initialize modal
        TierModal.init();

        // Initialize user bar
        UserBar.init();

        // Initialize Hotmart
        Hotmart.init();

        // Initialize i18n if available
        if (typeof __ === 'function') {
            translateUI();
        }
    }

    function translateUI() {
        // Force re-translation of dynamic elements
        if (typeof __ === 'function') {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key) el.textContent = __(key);
            });
        }
    }

    // ===== Access Control =====
    function checkAccess() {
        const hasValidAccess = Auth.checkAccess();

        if (hasValidAccess) {
            const user = Auth.getUser();
            showContent(user);
        } else {
            showGate();
        }
    }

    function showGate() {
        if (gateScreen) gateScreen.style.display = 'flex';
        if (contentScreen) contentScreen.style.display = 'none';
        UserBar.hide();
        if (hotmartContainer) hotmartContainer.style.display = 'none';
        if (statusEl) statusEl.textContent = 'Acesso restrito — faça login ou assine para continuar';
        Feed.render(null);
    }

    function showContent(user) {
        if (gateScreen) gateScreen.style.display = 'none';
        if (contentScreen) contentScreen.style.display = 'flex';
        UserBar.update(user);
        if (hotmartContainer) hotmartContainer.style.display = 'none';
        updateStatus(user);
        Feed.render(user);
        switchTab(currentTab);
    }

    function updateStatus(user) {
        if (!statusEl) return;
        if (user) {
            const timeLeft = Auth.getTimeRemaining();
            if (timeLeft) {
                statusEl.textContent = `${user.tierName || user.tier} • ${timeLeft.days}d ${timeLeft.hours}h restantes`;
            } else {
                statusEl.textContent = 'Conectado como ' + (user.tierName || user.tier);
            }
        } else {
            statusEl.textContent = 'Visitante';
        }
    }

    // ===== Tab Navigation =====
    function switchTab(tab) {
        currentTab = tab;
        const tabs = {
            posts: document.getElementById('clubNavPosts'),
            tiers: document.getElementById('clubNavTiers'),
            community: document.getElementById('clubNavCommunity')
        };

        Object.entries(tabs).forEach(([key, el]) => {
            if (el) el.classList.toggle('active', key === tab);
        });

        // Handle tab content
        if (tab === 'posts') {
            Feed.render(Auth.getUser());
        } else if (tab === 'tiers') {
            TierModal.open();
        } else if (tab === 'community') {
            showCommunityPlaceholder();
        }
    }

    function showCommunityPlaceholder() {
        const feedEl = document.getElementById('clubFeed');
        if (!feedEl) return;
        feedEl.innerHTML =
            '<div class="club-empty">' +
            '<div class="club-empty-icon">👥</div>' +
            '<p>Comunidade</p>' +
            '<p style="font-size:11px;color:#808080">Em breve: fórum, diretório de membros, eventos ao vivo</p>' +
            '</div>';
    }

    // ===== Public API =====
    function openTierModal() {
        TierModal.open();
    }

    function closeTierModal() {
        TierModal.close();
    }

    function selectTier(tierId) {
        TierModal.selectTier(tierId);
    }

    function logout() {
        Auth.clearUser();
        showGate();
    }

    function recheckAccess() {
        checkAccess();
    }

    function showLoading(message) {
        if (statusEl) statusEl.textContent = message;
    }

    function showStatus(message) {
        if (statusEl) statusEl.textContent = message;
    }

    function onAuthSuccess(accessData) {
        const user = Auth.getUser();
        showContent(user);
        showStatus('Bem-vindo, ' + (user.tierName || user.tier) + '! Acesso liberado até ' + Auth.formatExpiry());
    }

    function onLogout() {
        // Called after logout
    }

    // ===== Window Behavior =====
    function setupWindowBehavior() {
        if (typeof WindowBehavior === 'undefined' || !win) return;

        const behavior = new WindowBehavior(win, {
            dragHandle: document.getElementById('clubDragHandle'),
            btnClose: document.getElementById('clubBtnClose'),
            btnMinimize: document.getElementById('clubBtnMinimize'),
            btnMaximize: document.getElementById('clubBtnMaximize'),
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

    // ===== App Registry =====
    function registerApp() {
        if (typeof W2K !== 'undefined' && W2K && W2K.AppRegistry) {
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
    }

    // ===== Global Event Handlers =====
    window.addEventListener('club:accessExpired', function () {
        if (Auth.getUser()) {
            Auth.clearUser();
            showGate();
        }
    });

    // ===== Expose Global API =====
    window.Club = {
        openTierModal,
        closeTierModal: TierModal.close,
        selectTier: TierModal.selectTier,
        logout,
        recheckAccess,
        showLoading,
        showStatus,
        onAuthSuccess,
        onLogout,
        init
    };

    // Legacy global functions (for inline onclick handlers)
    window.clubOpenTierModal = openTierModal;
    window.clubCloseTierModal = TierModal.close;
    window.clubSelectTier = TierModal.selectTier;
    window.clubLogout = logout;
    window.clubCheckAccess = checkAccess;

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();