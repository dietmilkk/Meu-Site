/**
 * Club App - Private Messages Component
 * Member messages to the creator being supported
 */

const Messages = (function () {
    'use strict';

    const MSG_KEY = 'clubMessages';

    let threadEl = null;
    let inputEl = null;

    function load() {
        try {
            const stored = JSON.parse(localStorage.getItem(MSG_KEY) || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch (e) {}
        return [];
    }

    function save(list) {
        try {
            localStorage.setItem(MSG_KEY, JSON.stringify(list.slice(-100)));
        } catch (e) {}
    }

    function render() {
        threadEl = document.getElementById('clubMessagesThread');
        inputEl = document.getElementById('clubMessagesInput');
        if (!threadEl) return;

        const list = load();
        threadEl.innerHTML = '';

        if (!list.length) {
            const profile = typeof Profile !== 'undefined' ? Profile.getProfile() : { name: 'Membro' };
            threadEl.innerHTML =
                '<div class="club-message club-message-incoming">' +
                '<div class="club-message-bubble club-message-bubble-creator">' +
                '<strong>NSUMNEVSAIDF-88</strong><br>' +
                'Olá! 👋 Esta é a caixa de mensagens direta para o criador. ' +
                'Mande suas dúvidas, ideias ou comentários sobre os posts exclusivos.' +
                '</div>' +
                '</div>';
        }

        list.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'club-message ' + (msg.direction === 'out' ? 'club-message-out' : 'club-message-incoming');
            div.innerHTML =
                '<div class="club-message-bubble ' + (msg.direction === 'out' ? 'club-message-bubble-user' : 'club-message-bubble-creator') + '">' +
                '<div class="club-message-meta"><strong>' + escHtml(msg.name || 'Membro') + '</strong><span>' + escHtml(msg.time) + '</span></div>' +
                '<div class="club-message-text">' + escHtml(msg.text) + '</div>' +
                '</div>';
            threadEl.appendChild(div);
        });

        threadEl.scrollTop = threadEl.scrollHeight;
    }

    function send() {
        if (!inputEl) {
            inputEl = document.getElementById('clubMessagesInput');
            if (!inputEl) return;
        }
        const text = inputEl.value.trim();
        if (!text) return;

        const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
        const profile = typeof Profile !== 'undefined' ? Profile.getProfile() : null;
        const name = (profile && profile.name) || (user && (user.name || user.tierName)) || 'Membro';

        const list = load();
        list.push({
            id: Date.now(),
            name: name,
            text: text,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            direction: 'out'
        });
        save(list);
        inputEl.value = '';
        render();

        if (typeof Club !== 'undefined' && Club.showStatus) {
            Club.showStatus('Mensagem enviada para o criador!');
        }
    }

    function escHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    return {
        render,
        send
    };
})();

// Global exposure
window.Messages = Messages;
