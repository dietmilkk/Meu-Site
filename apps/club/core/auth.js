/**
 * Club App - Authentication & Access Control
 */

const Auth = (function () {
    'use strict';

    const STORAGE_KEY = 'clubUserAccess';
    const EXPIRY_DAYS = 30;

    let currentUser = null;
    let accessCheckTimer = null;

    function generateAccessData(tierId) {
        const tier = State.getTierConfig(tierId);
        if (!tier) return null;

        const now = Date.now();
        return {
            tier: tier.id,
            tierName: tier.name,
            tierColor: tier.color,
            expires: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
            email: 'usuario@exemplo.com',
            purchaseDate: Date.now()
        };
    }

    function loadFromStorage() {
        try {
            const stored = localStorage.getItem('clubUserAccess');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.expires && data.expires > Date.now()) {
                    return data;
                }
            }
        } catch (e) {}
        return null;
    }

    function saveToStorage(data) {
        try {
            localStorage.setItem('clubUserAccess', JSON.stringify(data));
        } catch (e) {}
    }

    function clearStorage() {
        try {
            localStorage.removeItem('clubUserAccess');
        } catch (e) {}
    }

    function setUser(data) {
        currentUser = data;
        if (data) {
            saveToStorage(data);
        } else {
            clearStorage();
        }
    }

    function getUser() {
        if (!currentUser) {
            currentUser = loadFromStorage();
        }
        return currentUser;
    }

    function clearUser() {
        currentUser = null;
        clearStorage();
    }

    function isExpired(data) {
        return !data || !data.expires || data.expires <= Date.now();
    }

    function hasAccess(requiredTier) {
        const user = getUser();
        if (!user) return requiredTier === 'Público';

        const userTier = State.normalizeTier(user.tier);
        const required = State.normalizeTier(requiredTier);

        return State.TIER_ORDER[userTier] >= State.TIER_ORDER[required];
    }

    function checkAccess() {
        const stored = loadFromStorage();
        if (stored && !isExpired(stored)) {
            setUser(stored);
            return true;
        } else if (stored && isExpired(stored)) {
            clearUser();
            return false;
        }
        return false;
    }

    function getTimeRemaining() {
        const user = getUser();
        if (!user || !user.expires) return null;
        const diff = user.expires - Date.now();
        if (diff <= 0) return null;

        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return { days, hours, totalMs: diff };
    }

    function formatExpiry() {
        const user = getUser();
        if (!user || !user.expires) return '';
        return new Date(user.expires).toLocaleDateString('pt-BR');
    }

    function startAccessCheck(intervalMs = 60000) {
        if (accessCheckTimer) clearInterval(accessCheckTimer);
        accessCheckTimer = setInterval(() => {
            const user = getUser();
            if (user && isExpired(user)) {
                clearUser();
                // Trigger UI update via event
                window.dispatchEvent(new CustomEvent('club:accessExpired'));
            }
        }, intervalMs);
    }

    function stopAccessCheck() {
        if (accessCheckTimer) {
            clearInterval(accessCheckTimer);
            accessCheckTimer = null;
        }
    }

    // Public API
    return {
        getUser,
        setUser,
        clearUser,
        checkAccess,
        hasAccess,
        generateAccessData,
        getTimeRemaining,
        formatExpiry,
        startAccessCheck,
        stopAccessCheck,
        clearStorage
    };
})();

// Expose for global access (legacy compatibility)
window.Auth = Auth;
window.clubAuth = Auth;