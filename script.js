let currentCategory = 'all';

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
    document.getElementById('modal-title').innerText = toolName;
    document.getElementById('tool-modal').classList.remove('hidden');
    document.getElementById('modal-config').classList.add('hidden');
    document.getElementById('modal-success').classList.add('hidden');
    document.getElementById('modal-progress-wrap').classList.add('hidden');
    document.getElementById('modal-upload-prompt').classList.remove('hidden');
    document.getElementById('modal-file-info').classList.add('hidden');
}

function closeToolModal() {
    document.getElementById('tool-modal').classList.add('hidden');
}

// Firebase Auth Handlers
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

    signInWithPopup(auth, provider)
        .then(() => {
            closeLoginModal();
        })
        .catch((error) => {
            console.error("Login Error:", error);
            alert("Login failed. Please try again.");
        });
}

function handleLogout() {
    if (!window.firebaseAuth) return;
    const { auth, signOut } = window.firebaseAuth;
    signOut(auth).catch((error) => {
        console.error("Logout Error:", error);
    });
}

// Track User Auth State
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (window.firebaseAuth) {
            const { auth, onAuthStateChanged } = window.firebaseAuth;
            onAuthStateChanged(auth, (user) => {
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

    // Drop zone setup
    const dropZone = document.getElementById('modal-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('click', () => {
            document.getElementById('modalFileUpload').click();
        });
    }
});

function handleModalFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
        loadFile(e.target.files[0]);
    }
}

function loadFile(file) {
    document.getElementById('modal-upload-prompt').classList.add('hidden');
    document.getElementById('modal-file-info').classList.remove('hidden');
    document.getElementById('modal-file-name').innerText = file.name;
    document.getElementById('modal-file-size').innerText = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('modal-config').classList.remove('hidden');
}

function processFileAction() {
    let btn = document.getElementById('modal-process-btn');
    btn.disabled = true;
    document.getElementById('modal-progress-wrap').classList.remove('hidden');
    const bar = document.getElementById('modal-progress-bar');
    let pct = 0;

    const interval = setInterval(() => {
        pct += 10;
        bar.style.width = Math.min(pct, 100) + '%';
        if (pct >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                btn.disabled = false;
                document.getElementById('modal-config').classList.add('hidden');
                document.getElementById('modal-success').classList.remove('hidden');
            }, 300);
        }
    }, 50);
}
