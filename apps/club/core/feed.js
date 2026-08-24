/**
 * Club App - Feed Data & Filtering Core
 * Pure data logic for post filtering and management
 */

const FeedCore = (function () {
    'use strict';

    let posts = [];

    function setPosts(newPosts) {
        posts = newPosts || [];
    }

    function getAllPosts() {
        return [...posts];
    }

    function getPostById(id) {
        return posts.find(p => p.id === id);
    }

    function getVisiblePosts(user) {
        if (!user) {
            return posts.filter(p => p.tier === 'Público');
        }
        const userTier = State.normalizeTier(user.tier || 'Apoiador');
        return posts.filter(p => {
            const postTier = State.normalizeTier(p.tier);
            return State.TIER_ORDER[userTier] >= State.TIER_ORDER[postTier];
        });
    }

    function addPost(post) {
        const newPost = {
            id: Date.now(),
            author: 'NSUMNEVSAIDF-88',
            avatar: 'radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)',
            time: 'agora',
            tier: 'Apoiador',
            tierColor: '#27ae60',
            likes: 0,
            liked: false,
            comments: [],
            ...post
        };
        posts.unshift(newPost);
        return newPost;
    }

    function updatePost(id, updates) {
        const idx = posts.findIndex(p => p.id === id);
        if (idx > -1) {
            posts[idx] = { ...posts[idx], ...updates };
            return posts[idx];
        }
        return null;
    }

    function deletePost(id) {
        const idx = posts.findIndex(p => p.id === id);
        if (idx > -1) {
            return posts.splice(idx, 1)[0];
        }
        return null;
    }

    function toggleLike(id) {
        const post = getPostById(id);
        if (!post) return null;
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        return post;
    }

    function addComment(postId, comment) {
        const post = getPostById(postId);
        if (!post) return null;
        post.comments = post.comments || [];
        post.comments.push(comment);
        return post;
    }

    function getPostsByTier(tier) {
        const normTier = State.normalizeTier(tier);
        return posts.filter(p => State.normalizeTier(p.tier) === normTier);
    }

    function getPostCountByTier() {
        const counts = {};
        posts.forEach(p => {
            const t = State.normalizeTier(p.tier);
            counts[t] = (counts[t] || 0) + 1;
        });
        return counts;
    }

    return {
        setPosts,
        getAllPosts,
        getPostById,
        getVisiblePosts,
        addPost,
        updatePost,
        deletePost,
        toggleLike,
        addComment,
        getPostsByTier,
        getPostCountByTier
    };
})();

// Global exposure
window.FeedCore = FeedCore;