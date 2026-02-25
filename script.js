import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFWwVVHUBppZgxrf4FYB8G_TeYgjyY6CY",
  authDomain: "student-notes-repo.firebaseapp.com",
  projectId: "student-notes-repo",
  storageBucket: "student-notes-repo.firebasestorage.app",
  messagingSenderId: "475928296488",
  appId: "1:475928296488:web:19361d1eccd8d77d01891d",
  measurementId: "G-6711BP99LP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app); 
const googleProvider = new GoogleAuthProvider(); 

let notes = [];
let currentRole = 'student'; 
let favorites = JSON.parse(localStorage.getItem('studyHubFavorites')) || [];
let editingId = null;
let isLoginMode = true; 
const SECRET_TEACHER_CODE = "ADMIN0011";
window.switchAuthMode = function(mode) {
    isLoginMode = mode === 'login';
    document.getElementById('signup-extras').classList.toggle('hidden', isLoginMode);
    document.getElementById('auth-submit-btn').textContent = isLoginMode ? "Secure Log In" : "Create Account";
    document.getElementById('auth-subtitle').textContent = isLoginMode ? "Welcome back! Please log in." : "Create a new account.";
    
    document.getElementById('tab-login').className = isLoginMode ? 'btn-primary' : 'btn-view';
    document.getElementById('tab-signup').className = !isLoginMode ? 'btn-primary' : 'btn-view';
}
window.checkRole = function() {
    const role = document.getElementById('auth-role').value;
    const codeInput = document.getElementById('teacher-code');
    if (role === 'teacher') {
        codeInput.classList.remove('hidden');
    } else {
        codeInput.classList.add('hidden');
    }
}
window.processAuth = async function() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if (!email || !password) {
        showToast("Please enter an email and password.", "error");
        return;
    }
    const btn = document.getElementById('auth-submit-btn');
    btn.textContent = "Processing...";
    btn.disabled = true;
    try {
        if (!isLoginMode) {
            const role = document.getElementById('auth-role').value;
            const enteredCode = document.getElementById('teacher-code').value;
            if (role === 'teacher' && enteredCode !== SECRET_TEACHER_CODE) {
                showToast("Invalid Teacher Secret Code.", "error");
                btn.textContent = "Create Account";
                btn.disabled = false;
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), { email: email, role: role });
            currentRole = role;
            showToast("Account created successfully!", "success");
        } 
        else {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                currentRole = userDoc.data().role;
            } else {
                currentRole = 'student'; 
            }
            showToast(`Welcome back! Logged in as ${currentRole}.`, "success");
        }
        finalizeLogin();
    } 
    catch (error) {
        console.error("Auth Error:", error);
        if (error.code === 'auth/email-already-in-use') showToast("Email already in use.", "error");
        else if (error.code === 'auth/weak-password') showToast("Password must be at least 6 characters.", "error");
        else showToast("Authentication failed.", "error");
    }
    finally {
        btn.textContent = isLoginMode ? "Secure Log In" : "Create Account";
        btn.disabled = false;
    }
}
window.signInWithGoogle = async function() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;       
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            currentRole = userDoc.data().role;
            showToast(`Welcome back! Logged in as ${currentRole}.`, "success");
        } 
        else {
            currentRole = 'student';
            await setDoc(userDocRef, { email: user.email, role: 'student' });
            showToast("Student account created via Google!", "success");
        }
        finalizeLogin();
    } 
    catch (error) {
        console.error("Google Auth Error:", error);
        if (error.code !== 'auth/popup-closed-by-user') showToast("Failed to sign in with Google.", "error");
    }
}
function finalizeLogin() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');   
    if (currentRole === 'teacher') document.getElementById('upload-panel').classList.remove('hidden');
    else document.getElementById('upload-panel').classList.add('hidden');
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('teacher-code').value = '';
    document.getElementById('search-bar').value = '';
    document.getElementById('category-filter').value = 'All';
    fetchSubjects();
    renderNotes();
}
window.logout = async function() {
    try {
        await signOut(auth);
    }
    catch (error) {
        console.error("Error signing out:", error);
    }
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    currentRole = 'student';
    showToast("Logged out securely.", "info");
}
async function fetchNotes() {
    try {
        const q = query(collection(db, "studyHubNotes"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);       
        notes = [];
        querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() }); 
        });
        applyFilters(); 
    }
    catch (error) {
        console.error("Error fetching notes: ", error);
        document.getElementById('notes-container').innerHTML = '<p>Error loading repository. Check your connection.</p>';
    }
}
function renderNotes(dataToRender = notes) {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';   
    if (dataToRender.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No resources found.</p>';
        return;
    }
    dataToRender.forEach((note) => {
        let dateDisplay = "Date Unknown";
        if (note.timestamp) {
            const dateObj = new Date(note.timestamp);
            dateDisplay = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
        const isFav = favorites.includes(note.id);
        const starIcon = isFav ? '⭐' : '☆';
        const favBtn = `<button class="btn-icon fav-btn" onclick="toggleFavorite('${note.id}')" title="Toggle Favorite">${starIcon}</button>`;
        const editBtn = currentRole === 'teacher' 
            ? `<button class="btn-warning" onclick="editNote('${note.id}')">Edit</button>` 
            : '';
        const deleteBtn = currentRole === 'teacher' 
            ? `<button class="btn-danger" onclick="deleteNote('${note.id}')">Delete</button>` 
            : '';
        container.innerHTML += `
            <div class="note-card">
                <div class="note-header" style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <span class="tag">${note.category}</span>
                        <strong style="display: block; margin-top: 8px;">${note.title}</strong>
                        <span class="note-date">Uploaded: ${dateDisplay}</span>
                    </div>
                    ${favBtn}
                </div>
                <div class="card-actions">
                    <a href="${note.link}" target="_blank" class="btn-view">View Resource</a>
                    ${editBtn}  ${deleteBtn}
                </div>
            </div>
        `;
    });
}
window.addNote = async function() {
    const title = document.getElementById('note-title').value.trim();
    const link = document.getElementById('note-link').value.trim();
    const category = document.getElementById('note-category').value;
    if (title && link) {
        const btn = document.getElementById('submit-btn');
        btn.textContent = "Saving...";
        btn.disabled = true;
        try {
            if (editingId) {
                const noteRef = doc(db, "studyHubNotes", editingId);
                await updateDoc(noteRef, {
                    title: title,
                    link: link,
                    category: category
                });
            }
            else {
                await addDoc(collection(db, "studyHubNotes"), {
                    title: title,
                    link: link,
                    category: category,
                    timestamp: Date.now() 
                });
            }
            window.cancelEdit();
            fetchNotes();
            showToast("Note saved successfully!", "success");
        }
        catch (e) {
            console.error("Error saving document: ", e);
            showToast("Failed to save note.", "error");
        }
        finally {
            btn.disabled = false;
        }
    }
    else {
        showToast("Please provide both a title and a link.", "error");
    }
}
window.editNote = function(id) {
    const noteToEdit = notes.find(n => n.id === id);
    if (!noteToEdit) return;   
    document.getElementById('note-title').value = noteToEdit.title;
    document.getElementById('note-link').value = noteToEdit.link;
    document.getElementById('note-category').value = noteToEdit.category;
    editingId = id;
    document.getElementById('submit-btn').textContent = "Update Note";
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.cancelEdit = function() {
    editingId = null;
    document.getElementById('note-title').value = '';
    document.getElementById('note-link').value = '';   
    document.getElementById('submit-btn').textContent = "Post Note";
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}
window.deleteNote = async function(id) {
    if (confirm("Are you sure you want to remove this resource permanently?")) {
        try {
            await deleteDoc(doc(db, "studyHubNotes", id));
            fetchNotes();
            showToast("Note deleted permanently.", "info");
        } catch (e) {
            console.error("Error deleting document: ", e);
            showToast("Failed to delete note.", "error");
        }
    }
}
window.fetchSubjects = async function() {
    try {
        const q = query(collection(db, "subjects"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const filterSelect = document.getElementById('category-filter');
        const uploadSelect = document.getElementById('note-category');
        const deleteSelect = document.getElementById('delete-subject-select');
        filterSelect.innerHTML = '<option value="All">All Subjects</option>';
        uploadSelect.innerHTML = '';
        if (deleteSelect) deleteSelect.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const subjectName = doc.data().name;
            const subjectId = doc.id;
            filterSelect.innerHTML = '<option value="All">All Subjects</option><option value="Favorites">⭐ My Favorites</option>';
            filterSelect.innerHTML += `<option value="${subjectName}">${subjectName}</option>`;
            uploadSelect.innerHTML += `<option value="${subjectName}">${subjectName}</option>`;
            if (deleteSelect) {
                deleteSelect.innerHTML += `<option value="${subjectId}">${subjectName}</option>`;
            }
        });
    }
    catch (error) {
        console.error("Error fetching subjects:", error);
    }
}
window.addSubject = async function() {
    const nameInput = document.getElementById('new-subject-name');
    const subjectName = nameInput.value.trim();   
    if (!subjectName) {
        showToast("Please enter a subject name.", "error");
        return;
    }
    try {
        await addDoc(collection(db, "subjects"), { name: subjectName });
        showToast(`Subject "${subjectName}" added!`, "success");
        nameInput.value = '';
        fetchSubjects();
    }
    catch (error) {
        console.error("Error adding subject:", error);
        showToast("Failed to add subject.", "error");
    }
}
window.deleteSubject = async function() {
    const select = document.getElementById('delete-subject-select');
    const subjectId = select.value;
    const subjectName = select.options[select.selectedIndex]?.text;
    if (!subjectId) {
        showToast("No subject selected to delete.", "error");
        return;
    }
    const confirmDelete = confirm(`Are you sure you want to delete "${subjectName}"?`);
    if (!confirmDelete) 
    return;
    try {
        await deleteDoc(doc(db, "subjects", subjectId));
        showToast(`Subject "${subjectName}" removed.`, "info");
        fetchSubjects();
    }
    catch (error) {
        console.error("Error deleting subject:", error);
        showToast("Failed to remove subject.", "error");
    }
}
window.toggleFavorite = function(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    }
    else {
        favorites.push(id);
    }
    localStorage.setItem('studyHubFavorites', JSON.stringify(favorites));
    applyFilters(); 
}
window.applyFilters = function() {
    const searchQuery = document.getElementById('search-bar').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;
    const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery);    
        let matchesCategory = false;
        if (selectedCategory === "All") {
            matchesCategory = true;
        }
        else if (selectedCategory === "Favorites") {
            matchesCategory = favorites.includes(note.id);
        }
        else {
            matchesCategory = note.category === selectedCategory;
        }
        return matchesSearch && matchesCategory;
    });
    renderNotes(filteredNotes);
}
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');   
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); 
    }, 3000);
}
window.toggleDarkMode = function() {
    const body = document.documentElement;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);   
    const themeIcon = newTheme === 'dark' ? '☀️' : '🌙';
    const navBtn = document.getElementById('theme-toggle');
    if (navBtn) navBtn.textContent = themeIcon;
    const loginBtn = document.getElementById('theme-toggle-login');
    if (loginBtn) loginBtn.textContent = themeIcon;
}
fetchNotes();
