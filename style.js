let currentCategory = 'all';
let selectedModalFile = null;
let currentToolName = '';

function filterByCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    const cards = document.querySelectorAll('#tools-container .tool-card');
    cards.forEach(card => {
        const matchesCategory = currentCategory === 'all' || card.dataset.cat === currentCategory;
        card.style.display = matchesCategory ? '' : 'none';
    });
}

function openToolModal(toolName, type) {
    currentToolName = toolName;
    selectedModalFile = null;
    document.getElementById('modal-title').innerText = toolName;
    document.getElementById('tool-modal').classList.remove('hidden');
    document.getElementById('modal-config').classList.add('hidden');
    document.getElementById('modal-success').classList.add('hidden');
    document.getElementById('modal-progress-wrap').classList.add('hidden');
    document.getElementById('modal-upload-prompt').classList.remove('hidden');
    document.getElementById('modal-file-info').classList.add('hidden');
    document.getElementById('modal-progress-bar').style.width = '0%';
    document.getElementById('modal-process-btn').disabled = false;
    document.getElementById('modalFileUpload').value = '';
}

function closeToolModal() {
    document.getElementById('tool-modal').classList.add('hidden');
    selectedModalFile = null;
}

function openLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function loginWithGoogle() {
    if (!window.firebaseAuth) return;
    const { auth, signInWithPopup, GoogleAuthProvider } = window.firebaseAuth;
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(closeLoginModal).catch(error => {
        console.error('Login Error:', error);
        alert('Login failed. Please try again.');
    });
}

function handleLogout() {
    if (!window.firebaseAuth) return;
    const { auth, signOut } = window.firebaseAuth;
    signOut(auth).catch(error => console.error('Logout Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.firebaseAuth) {
            const { auth, onAuthStateChanged } = window.firebaseAuth;
            onAuthStateChanged(auth, user => {
                const loggedOutDiv = document.getElementById('auth-logged-out');
                const loggedInDiv = document.getElementById('auth-logged-in');
                const nameSpan = document.getElementById('user-display-name');
                if (user) {
                    loggedOutDiv.classList.add('hidden');
                    loggedInDiv.classList.remove('hidden');
                    nameSpan.innerText = user.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : 'Hi, User';
                } else {
                    loggedOutDiv.classList.remove('hidden');
                    loggedInDiv.classList.add('hidden');
                }
            });
        }
    }, 500);

    const dropZone = document.getElementById('modal-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('click', () => document.getElementById('modalFileUpload').click());
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('ring-2', 'ring-red-400');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('ring-2', 'ring-red-400'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('ring-2', 'ring-red-400');
            if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
        });
    }
});

function handleModalFileSelect(e) {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
}

function loadFile(file) {
    if (currentToolName === 'Image Compressor' && !file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, WEBP, etc.).');
        return;
    }

    selectedModalFile = file;
    document.getElementById('modal-upload-prompt').classList.add('hidden');
    document.getElementById('modal-file-info').classList.remove('hidden');
    document.getElementById('modal-file-name').innerText = file.name;
    document.getElementById('modal-file-size').innerText = formatBytes(file.size);
    document.getElementById('modal-config').classList.remove('hidden');
}

function processFileAction() {
    if (!selectedModalFile) {
        alert('Please select a file first.');
        return;
    }

    if (currentToolName === 'Image Compressor') {
        processImageCompression(selectedModalFile);
        return;
    }

    // Other tools are still placeholders until their conversion engines are implemented.
    const btn = document.getElementById('modal-process-btn');
    const progressWrap = document.getElementById('modal-progress-wrap');
    const bar = document.getElementById('modal-progress-bar');
    btn.disabled = true;
    progressWrap.classList.remove('hidden');
    let pct = 0;
    const interval = setInterval(() => {
        pct += 10;
        bar.style.width = Math.min(pct, 100) + '%';
        if (pct >= 100) {
            clearInterval(interval);
            btn.disabled = false;
            progressWrap.classList.add('hidden');
            document.getElementById('modal-success').classList.remove('hidden');
        }
    }, 50);
}
