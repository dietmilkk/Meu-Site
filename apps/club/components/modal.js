/**
 * Club App - Tier Modal Component
 * Handles tier selection and Hotmart checkout flow
 */

const TierModal = (function () {
    'use strict';

    let modalEl = null;
    let listEl = null;
    let closeBtn = null;
    let isOpen = false;

    function init() {
        modalEl = document.getElementById('clubTierModal');
        listEl = document.getElementById('clubTierList');
        closeBtn = document.getElementById('clubTierClose');

        if (!modalEl || !listEl) {
            console.warn('TierModal: elements not found');
            return;
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }

        modalEl.addEventListener('click', function (e) {
            if (e.target === modalEl) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen) close();
        });
    }

    function renderTierCards() {
        if (!listEl) return;
        listEl.innerHTML = '';

        State.TIER_DEFINITIONS.forEach(tier => {
            const card = document.createElement('div');
            card.className = 'club-tier-card' + (tier.featured ? ' featured' : '');
            card.innerHTML =
                '<div class="club-tier-name">' + escHtml(tier.name) + '</div>' +
                '<div class="club-tier-price">' + escHtml(tier.price) + '</div>' +
                '<div class="club-tier-features">' +
                tier.features.map(f => '• ' + escHtml(f)).join('<br>') +
                '</div>' +
                '<button class="club-tier-select" onclick="TierModal.selectTier(\'' + tier.id + '\')">' +
                'Selecionar ' + escHtml(tier.name) + '</button>';
            listEl.appendChild(card);
        });
    }

    function escHtml(s) {
        return String(s)
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, "'");
    }

    function open() {
        if (!modalEl) return;
        renderTierCards();
        modalEl.classList.remove('hidden');
        isOpen = true;
    }

    function close() {
        if (!modalEl) return;
        modalEl.classList.add('hidden');
        isOpen = false;
    }

    function selectTier(tierId) {
        const tier = State.getTierConfig(tierId);
        if (!tier) return;

        close();

        // Show loading state
        if (typeof Club !== 'undefined' && Club.showLoading) {
            Club.showLoading('Redirecionando para checkout Hotmart (' + tier.name + ')...');
        }

        // Simulate Hotmart checkout
        // In production: open Hotmart iframe
        // hotmartContainer.innerHTML = '<iframe class="club-hotmart-frame" src="https://pay.hotmart.com/' + tier.hotmartProductId + '?checkoutMode=10&bid=..."></iframe>';
        // hotmartContainer.style.display = 'block';

        setTimeout(() => {
            const accessData = Auth.generateAccessData(tierId);
            Auth.setUser(accessData);
            if (typeof Club !== 'undefined' && Club.onAuthSuccess) {
                Club.onAuthSuccess(accessData);
            }
        }, 1500);
    }

    function isVisible() {
        return isOpen;
    }

    return {
        init,
        open,
        close,
        selectTier,
        isVisible
    };
})();

// Global exposure
window.TierModal = TierModal;