/**
 * Club App - Authentication & Access Control
 */

const Auth = (function () {
    'use strict';

    const STORAGE_KEY = 'clubUserAccess';
    const EXPIRY_DAYS = 30;

    let currentUser = null;
    let accessCheckTimer = null;

    function loadProfile() {
        try {
            const stored = JSON.parse(localStorage.getItem('clubUserProfile') || 'null');
            if (stored && typeof stored === 'object') return stored;
        } catch (e) {}
        return null;
    }

    function mergeProfile(user) {
        if (!user) return user;
        const p = loadProfile();
        if (p) {
            if (p.name) user.name = p.name;
            if (p.photo) user.photo = p.photo;
            user.photoPreset = typeof p.preset === 'number' ? p.preset : 0;
        }
        return user;
    }

    function generateAccessData(tierId) {
        const tier = State.getTierConfig(tierId);
        if (!tier) return null;

        const now = Date.now();
        const data = {
            tier: tier.id,
            tierName: tier.name,
            tierColor: tier.color,
            expires: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
            email: 'usuario@exemplo.com',
            purchaseDate: Date.now()
        };
        return mergeProfile(data);
    }

    function loadFromStorage() {
        try {
            const stored = localStorage.getItem('clubUserAccess');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.expires && data.expires > Date.now()) {
                    return mergeProfile(data);
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
        currentUser = mergeProfile(data);
        if (currentUser) {
            saveToStorage(currentUser);
        } else {
            clearStorage();
        }
    }

    function getUser() {
        if (!currentUser) {
            currentUser = loadFromStorage();
        }
        if (currentUser) {
            currentUser = mergeProfile(currentUser);
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