/**
 * Club App - Hotmart Integration
 * Handles iframe checkout, postMessage communication, and webhook simulation
 */

const Hotmart = (function () {
    'use strict';

    let containerEl = null;
    let iframeEl = null;
    let overlayEl = null;
    let currentTier = null;
    let messageHandler = null;

    const HOTMART_BASE_URL = 'https://pay.hotmart.com';

    function init() {
        containerEl = document.getElementById('clubHotmartContainer');
        if (containerEl) {
            iframeEl = containerEl.querySelector('.club-hotmart-frame');
            overlayEl = containerEl.querySelector('.club-hotmart-overlay');
        }
    }

    function buildCheckoutUrl(tier, options = {}) {
        if (!tier.hotmartProductId) return null;

        const params = new URLSearchParams({
            checkoutMode: options.checkoutMode || '10',
            bid: options.bid || '',
            src: options.src || 'club_app',
            // Add user info if available
            email: options.email || '',
            name: options.name || ''
        });

        return `${HOTMART_BASE_URL}/${tier.hotmartProductId}?${params.toString()}`;
    }

    function openCheckout(tier, options = {}) {
        if (!containerEl) return Promise.reject(new Error('Container not initialized'));

        const url = buildCheckoutUrl(tier, options);
        if (!url) return Promise.reject(new Error('Hotmart product ID not configured'));

        currentTier = tier;

        // Show container
        containerEl.style.display = 'block';

        // Create iframe if not exists
        if (!iframeEl) {
            iframeEl = document.createElement('iframe');
            iframeEl.className = 'club-hotmart-frame';
            iframeEl.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframeEl.referrerPolicy = 'no-referrer-when-downgrade';
            iframeEl.style.width = '100%';
            iframeEl.style.height = '100%';
            iframeEl.style.border = 'none';
            iframeEl.style.background = '#fff';
            containerEl.appendChild(iframeEl);
        }

        iframeEl.src = url;

        // Setup message listener for Hotmart postMessage
        setupMessageListener();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('Checkout timeout'));
            }, 10 * 60 * 1000); // 10 min timeout

            const originalResolve = resolve;
            const originalReject = reject;

            resolve = function (data) {
                clearTimeout(timeout);
                cleanup();
                originalResolve(data);
            };

            reject = function (err) {
                clearTimeout(timeout);
                cleanup();
                originalReject(err);
            };
        });
    }

    function setupMessageListener() {
        if (messageHandler) {
            window.removeEventListener('message', messageHandler);
        }

        messageHandler = function (e) {
            // Validate origin
            if (e.origin !== 'https://pay.hotmart.com' && e.origin !== 'https://hotmart.com') {
                return;
            }

            const data = e.data;
            if (!data || typeof data !== 'object') return;

            // Hotmart postMessage events
            // https://developers.hotmart.com/docs/checkout/iframe-postmessage
            if (data.event === 'purchase_approved' || data.event === 'purchase_completed') {
                handlePurchaseSuccess(data.data);
            } else if (data.event === 'purchase_cancelled' || data.event === 'checkout_closed') {
                handlePurchaseCancel();
            } else if (data.event === 'purchase_error') {
                handlePurchaseError(data.data);
            }
        };

        window.addEventListener('message', messageHandler);
    }

    function handlePurchaseSuccess(data) {
        // data contains purchase info: buyer, product, price, etc.
        const accessData = {
            tier: currentTier.id,
            tierName: currentTier.name,
            tierColor: currentTier.color,
            expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
            email: data?.buyer?.email || 'usuario@exemplo.com',
            purchaseDate: Date.now(),
            hotmartOrderId: data?.order?.id,
            hotmartTransactionId: data?.transaction?.id
        };

        Auth.setUser(accessData);

        if (typeof Club !== 'undefined' && Club.onAuthSuccess) {
            Club.onAuthSuccess(accessData);
        }

        closeCheckout();
    }

    function handlePurchaseCancel() {
        if (typeof Club !== 'undefined' && Club.showStatus) {
            Club.showStatus('Checkout cancelado. Você pode tentar novamente quando quiser.');
        }
        closeCheckout();
    }

    function handlePurchaseError(data) {
        const msg = data?.message || 'Erro no processamento do pagamento';
        if (typeof Club !== 'undefined' && Club.showStatus) {
            Club.showStatus('Erro: ' + msg);
        }
        closeCheckout();
    }

    function closeCheckout() {
        if (containerEl) containerEl.style.display = 'none';
        if (iframeEl) iframeEl.src = 'about:blank';
        currentTier = null;

        if (messageHandler) {
            window.removeEventListener('message', messageHandler);
            messageHandler = null;
        }
    }

    // Simulation mode (for development without real Hotmart account)
    function simulateCheckout(tier) {
        return new Promise((resolve) => {
            if (typeof Club !== 'undefined' && Club.showLoading) {
                Club.showLoading('Processando pagamento simulado (' + tier.name + ')...');
            }

            setTimeout(() => {
                const accessData = Auth.generateAccessData(tier.id);
                Auth.setUser(accessData);

                if (typeof Club !== 'undefined' && Club.onAuthSuccess) {
                    Club.onAuthSuccess(accessData);
                }

                resolve(accessData);
            }, 1500);
        });
    }

    function isConfigured() {
        return State.TIER_DEFINITIONS.some(t => t.hotmartProductId);
    }

    return {
        init,
        openCheckout,
        closeCheckout,
        simulateCheckout,
        isConfigured,
        buildCheckoutUrl
    };
})();

// Global exposure
window.Hotmart = Hotmart;