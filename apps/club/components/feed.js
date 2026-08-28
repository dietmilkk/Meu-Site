/**
 * Club App - Feed Rendering
 * Handles post rendering, filtering, and interactions
 */

const Feed = (function () {
    'use strict';

    let feedEl = null;

    function init(container) {
        feedEl = container;
        if (!feedEl) {
            console.warn('Feed: container not found');
            return;
        }
    }

    function getVisiblePosts(user) {
        if (!FeedCore) return [];
        if (!user) {
            return FeedCore.getAllPosts().filter(p => p.tier === 'Público');
        }
        const userTier = State.normalizeTier(user.tier || 'Apoiador');
        return FeedCore.getAllPosts().filter(p => {
            const postTier = State.normalizeTier(p.tier);
            return State.TIER_ORDER[userTier] >= State.TIER_ORDER[postTier];
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

    function renderPostMedia(media) {
        if (!media || !media.length) return '';

        let html = '<div class="club-post-media">';
        media.forEach(m => {
            if (m.type === 'image') {
                html += `<figure class="club-media-item"><img src="${escHtml(m.url)}" alt="${escHtml(m.alt || '')}" loading="lazy"><figcaption>${escHtml(m.alt || '')}</figcaption></figure>`;
            } else if (m.type === 'video') {
                html += `<video controls src="${escHtml(m.url)}" preload="metadata"></video>`;
            } else if (m.type === 'audio') {
                html += `<audio controls src="${escHtml(m.url)}"><span>${escHtml(m.title)}</span></audio>`;
            }
        });
        html += '</div>';
        return html;
    }

    function renderComments(comments) {
        if (!comments || !comments.length) return '';

        let html = '<div class="club-post-comments">';
        comments.forEach(c => {
            html +=
                '<div class="club-comment">' +
                '<div class="club-comment-header">' +
                '<div class="club-comment-avatar" style="background:' + escHtml(c.avatar) + '"></div>' +
                '<span class="club-comment-author">' + escHtml(c.author) + '</span>' +
                '<span class="club-comment-time">' + escHtml(c.time) + '</span>' +
                '</div>' +
                '<div class="club-comment-text">' + escHtml(c.text) + '</div>' +
                '</div>';
        });
        html += '</div>';
        return html;
    }

    function renderCommentForm(postId) {
        const user = Auth.getUser();
        if (!user) return '';

        return (
            '<div class="club-comment-form">' +
            '<input type="text" class="club-comment-input" placeholder="Adicionar comentário..." data-post-id="' + postId + '">' +
            '<button class="club-action-btn" onclick="Feed.submitComment(' + postId + ')">Enviar</button>' +
            '</div>'
        );
    }


    function renderTierTag(post) {
        if (!post.tier) return '';

        if (post.tier !== 'Público') {
            return '<span class="club-post-tier-tag" style="background:' + escHtml(post.tierColor) + '">' + escHtml(post.tier) + '</span>';
        }
        return '<span class="club-post-tier-tag" style="background:#95a5a6">Público</span>';
    }

    function renderPost(post, user) {
        const div = document.createElement('div');
        div.className = 'club-post';
        div.dataset.postId = post.id;

        const mediaHtml = renderPostMedia(post.media);
        const commentsHtml = renderComments(post.comments);
        const commentFormHtml = renderCommentForm(post.id);
        const tierTagHtml = renderTierTag(post);

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
            '<button class="club-action-btn" onclick="Feed.toggleComments(' + post.id + ')">💬 ' + (post.comments ? post.comments.length : 0) + ' comentários</button>' +
            '<span style="flex:1"></span>' +
            '<button class="club-action-btn" onclick="Feed.sharePost(' + post.id + ')">↗ Compartilhar</button>' +
            '</div>' +
            commentsHtml +
            commentFormHtml;

        return div;
    }

    function render(user) {
        if (!feedEl) return;

        feedEl.innerHTML = '';
        const visiblePosts = getVisiblePosts(user);

        if (!visiblePosts.length) {
            feedEl.innerHTML =
                '<div class="club-empty">' +
                '<div class="club-empty-icon">📭</div>' +
                '<p>Nenhum post disponível para seu nível de acesso.</p>' +
                (user ?
                    '<p style="font-size:11px;color:#808080">Posts de níveis superiores ficam visíveis ao fazer upgrade.</p>' :
                    '<button class="club-gate-btn" onclick="Club.openTierModal()">🔓 Desbloquear acesso completo</button>') +
                '</div>';
            return;
        }

        visiblePosts.forEach(post => {
            feedEl.appendChild(renderPost(post, user));
        });
    }

    function renderEmpty(message) {
        if (!feedEl) return;
        feedEl.innerHTML =
            '<div class="club-empty">' +
            '<div class="club-empty-icon">📭</div>' +
            '<p>' + escHtml(message) + '</p>' +
            '</div>';
    }

    // Interaction handlers
    function toggleComments(postId) {
        const postEl = feedEl?.querySelector('[data-post-id="' + postId + '"]');
        if (!postEl) return;

        const comments = postEl.querySelector('.club-post-comments');
        const form = postEl.querySelector('.club-comment-form');

        if (comments) comments.style.display = comments.style.display === 'none' ? 'block' : 'none';
        if (form) form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    }

    function submitComment(postId) {
        const user = Auth.getUser();
        if (!user) { Club.openTierModal(); return; }

        const postEl = feedEl?.querySelector('[data-post-id="' + postId + '"]');
        if (!postEl) return;

        const input = postEl.querySelector('.club-comment-input');
        if (!input || !input.value.trim()) return;

        const post = FeedCore.getAllPosts().find(p => p.id === postId);
        if (!post) return;

        const newComment = {
            author: user.tierName || user.tier || 'Membro',
            avatar: 'radial-gradient(circle at 30% 30%, #74b9ff, #0984e3)',
            time: 'agora',
            text: input.value.trim()
        };

        post.comments = post.comments || [];
        post.comments.push(newComment);
        input.value = '';
        refreshPost(postId);
    }

    function sharePost(postId) {
        const post = FeedCore.getAllPosts().find(p => p.id === postId);
        if (!post) return;

        const url = window.location.origin + window.location.pathname + '#club/post/' + postId;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                if (typeof __ === 'function' && window.clubStatus) {
                    window.clubStatus.textContent = 'Link copiado para a área de transferência!';
                }
            });
        } else {
            prompt('Copie o link:', url);
        }
    }

    function refreshPost(postId) {
        if (!feedEl) return;
        const postEl = feedEl.querySelector('[data-post-id="' + postId + '"]');
        if (!postEl) return;

        const post = FeedCore.getAllPosts().find(p => p.id === postId);
        if (!post) return;

        const user = Auth.getUser();
        const newEl = renderPost(post, user);
        postEl.replaceWith(newEl);
    }

    return {
        init,
        render,
        renderEmpty,
        toggleComments,
        submitComment,
        sharePost,
        refreshPost
    };
})();

// Global exposure for inline handlers
window.Feed = Feed;