/**
 * Club App - Profile Component
 * Edit display name and profile photo (upload or preset color)
 */

const Profile = (function () {
    'use strict';

    const PROFILE_KEY = 'clubUserProfile';

    const PRESETS = [
        'linear-gradient(135deg, #ff6b9d, #c44569)',
        'linear-gradient(135deg, #74b9ff, #0984e3)',
        'linear-gradient(135deg, #a29bfe, #6c5ce7)',
        'linear-gradient(135deg, #55efc4, #00b894)',
        'linear-gradient(135deg, #fdcb6e, #e17055)',
        'linear-gradient(135deg, #81ecec, #00cec9)'
    ];

    let pendingPhoto = null;    // data URL or null (use preset)
    let pendingPreset = 0;      // index of preset when no photo
    let defaultName = '';
    let previewEl = null;
    let nameEl = null;
    let presetsEl = null;

    function load() {
        try {
            const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
            if (stored && typeof stored === 'object') {
                return stored;
            }
        } catch (e) {}
        return { name: defaultName, photo: null, preset: 0 };
    }

    function saveToStorage(profile) {
        try {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        } catch (e) {}
    }

    function getProfile() {
        const p = load();
        return {
            name: p.name || defaultName,
            photo: p.photo || null,
            preset: typeof p.preset === 'number' ? p.preset : 0
        };
    }

    // Avatar CSS background / image used by user bar and comments
    function avatarStyle() {
        const p = load();
        if (p.photo) return { image: p.photo };
        return { background: PRESETS[p.preset % PRESETS.length] };
    }

    function applyAvatar(el) {
        if (!el) return;
        el.innerHTML = '';
        el.style.background = '';
        const s = avatarStyle();
        if (s.image) {
            const img = document.createElement('img');
            img.src = s.image;
            img.alt = '';
            img.className = 'club-avatar-img';
            el.appendChild(img);
        } else {
            el.style.background = s.background;
        }
    }

    function render() {
        const p = load();
        pendingPhoto = p.photo;
        pendingPreset = p.preset;
        defaultName = p.name || defaultName;

        previewEl = document.getElementById('clubAvatarPreview');
        nameEl = document.getElementById('clubProfileName');
        presetsEl = document.getElementById('clubAvatarPresets');

        if (nameEl) nameEl.value = p.name || '';
        updatePreview();
        renderPresets();
    }

    function renderPresets() {
        if (!presetsEl) return;
        presetsEl.innerHTML = '';
        PRESETS.forEach((grad, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'club-avatar-swatch' + (pendingPhoto === null && i === pendingPreset ? ' selected' : '');
            btn.title = 'Cor ' + (i + 1);
            btn.style.background = grad;
            btn.addEventListener('click', function () {
                pendingPhoto = null;
                pendingPreset = i;
                renderPresets();
                updatePreview();
            });
            presetsEl.appendChild(btn);
        });
    }

    function updatePreview() {
        if (!previewEl) return;
        previewEl.innerHTML = '';
        previewEl.style.background = '';
        if (pendingPhoto) {
            const img = document.createElement('img');
            img.src = pendingPhoto;
            img.alt = '';
            img.className = 'club-avatar-img';
            previewEl.appendChild(img);
        } else {
            previewEl.style.background = PRESETS[pendingPreset % PRESETS.length];
        }
    }

    function initPresets() {
        // Populate preset swatches on load (render is called when tab opens)
        presetsEl = document.getElementById('clubAvatarPresets');
        if (presetsEl) renderPresets();
    }

    function setPhoto(dataUrl) {
        pendingPhoto = dataUrl;
        renderPresets();
        updatePreview();
    }

    function resetPhoto() {
        pendingPhoto = null;
        pendingPreset = 0;
        renderPresets();
        updatePreview();
    }

    function save() {
        const name = nameEl ? nameEl.value.trim() : '';
        const profile = {
            name: name || defaultName,
            photo: pendingPhoto,
            preset: pendingPreset
        };
        saveToStorage(profile);

        // Update Auth user so the rest of the app uses the new name/photo
        if (typeof Auth !== 'undefined') {
            const user = Auth.getUser();
            if (user) {
                user.name = profile.name;
                user.photo = profile.photo;
                user.photoPreset = profile.preset;
                Auth.setUser(user);
            }
        }

        if (typeof UserBar !== 'undefined') UserBar.update(Auth.getUser());
        if (typeof Club !== 'undefined' && Club.showStatus) {
            Club.showStatus('Perfil atualizado!');
        }
    }

    return {
        initPresets,
        render,
        setPhoto,
        resetPhoto,
        save,
        getProfile,
        avatarStyle,
        applyAvatar,
        PRESETS
    };
})();

// Global exposure
window.Profile = Profile;
