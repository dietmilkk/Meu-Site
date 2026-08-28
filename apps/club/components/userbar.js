/**
 * Club App - User Bar Component
 * Shows user info and logout button when authenticated
 */

const UserBar = (function () {
    'use strict';

    let barEl = null;
    let avatarEl = null;
    let nameEl = null;
    let tierEl = null;
    let logoutBtn = null;

    function init() {
        barEl = document.getElementById('clubUserBar');
        avatarEl = document.getElementById('clubUserAvatar');
        nameEl = document.getElementById('clubUserName');
        tierEl = document.getElementById('clubUserTier');
        logoutBtn = document.getElementById('clubUserLogout');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                Auth.clearUser();
                if (typeof Club !== 'undefined' && Club.onLogout) {
                    Club.onLogout();
                }
            });
        }
    }

    function show(user) {
        if (!barEl) return;
        barEl.style.display = 'flex';

        if (avatarEl) {
            avatarEl.innerHTML = '';
            avatarEl.style.background = '';
            const photo = user.photo;
            if (photo) {
                const img = document.createElement('img');
                img.src = photo;
                img.alt = '';
                img.className = 'club-avatar-img';
                avatarEl.appendChild(img);
            } else if (typeof Profile !== 'undefined') {
                Profile.applyAvatar(avatarEl);
            } else {
                const tierConfig = State.getTierConfig(user.tier);
                avatarEl.style.background = tierConfig?.color || '#95a5a6';
            }
        }
        const displayName = user.name || user.tierName || user.tier || 'Membro';
        if (nameEl) nameEl.textContent = displayName;
        if (tierEl && user) {
            const expiry = Auth.formatExpiry();
            tierEl.textContent = (user.tier || 'Membro') + (expiry ? ' • expira em ' + expiry : '');
        }
    }

    function hide() {
        if (barEl) barEl.style.display = 'none';
    }

    function update(user) {
        if (user) {
            show(user);
        } else {
            hide();
        }
    }

    function isVisible() {
        return barEl && barEl.style.display !== 'none';
    }

    return {
        init,
        show,
        hide,
        update,
        isVisible
    };
})();

// Global exposure
window.UserBar = UserBar;