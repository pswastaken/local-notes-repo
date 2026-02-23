// 1. Import Firebase Functions (Using Web CDN links)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Your Firebase Configuration 
const firebaseConfig = {
  apiKey: "AIzaSyCFWwVVHUBppZgxrf4FYB8G_TeYgjyY6CY",
  authDomain: "student-notes-repo.firebaseapp.com",
  projectId: "student-notes-repo",
  storageBucket: "student-notes-repo.firebasestorage.app",
  messagingSenderId: "475928296488",
  appId: "1:475928296488:web:19361d1eccd8d77d01891d",
  measurementId: "G-6711BP99LP"
};

// 3. Initialize Firebase, Analytics, and Firestore
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // THIS WAS MISSING!
const defaultNotes = [
    { title: "LADE Course Policy 2025-26", link: "#", category: "Course Policies" },
    { title: "Quantum Physics Course Policy", link: "#", category: "Course Policies" },
    { title: "Product Realization Policy", link: "#", category: "Course Policies" },
    { title: "Web Development Policy", link: "#", category: "Course Policies" },
    { title: "BEEE Course Policy", link: "#", category: "Course Policies" }
];

// Global State
let notes = [];
let currentRole = 'student'; // Default view

// 4. Fetch Notes from the Live Firebase Database
async function fetchNotes() {
    try {
        const querySnapshot = await getDocs(collection(db, "studyHubNotes"));
        notes = []; // Clear current array before loading new data
        
        querySnapshot.forEach((doc) => {
            // Push the document data AND its unique Firebase ID
            notes.push({ id: doc.id, ...doc.data() }); 
        });
        
        applyFilters(); // Render the notes after fetching
    } catch (error) {
        console.error("Error fetching notes: ", error);
        document.getElementById('notes-container').innerHTML = '<p>Error loading repository. Check your connection.</p>';
    }
    async function fetchNotes() {
    try {
        const querySnapshot = await getDocs(collection(db, "studyHubNotes"));
        notes = []; 
        
        querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() }); 
        });

        // Optional: If Firebase is empty, load the default policies just for viewing
        if (notes.length === 0) {
            notes = [...defaultNotes];
        }
        
        applyFilters(); 
    } catch (error) {
        console.error("Error fetching notes: ", error);
        document.getElementById('notes-container').innerHTML = '<p>Error loading repository. Check your connection.</p>';
    }
    }
}

// 5. Core Rendering Function 
function renderNotes(dataToRender = notes) {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';
    
    if (dataToRender.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No resources found. Log in as an Admin to upload the first note!</p>';
        return;
    }

    dataToRender.forEach((note) => {
        // Only render the delete button if the user is a teacher
        const deleteBtn = currentRole === 'teacher' 
            ? `<button class="btn-danger" onclick="deleteNote('${note.id}')">Delete</button>` 
            : '';

        container.innerHTML += `
            <div class="note-card">
                <div class="note-header">
                    <span class="tag">${note.category}</span>
                    <strong>${note.title}</strong>
                </div>
                <div class="card-actions">
                    <a href="${note.link}" target="_blank" class="btn-view">View Resource</a>
                    ${deleteBtn}
                </div>
            </div>
        `;
    });
}

// 6. Add a New Note to Firebase
window.addNote = async function() {
    const title = document.getElementById('note-title').value.trim();
    const link = document.getElementById('note-link').value.trim();
    const category = document.getElementById('note-category').value;

    if (title && link) {
        // Provide visual feedback while uploading
        const btn = document.querySelector('.btn-success');
        btn.textContent = "Uploading...";
        btn.disabled = true;

        try {
            await addDoc(collection(db, "studyHubNotes"), {
                title: title,
                link: link,
                category: category
            });
            
            // Clear inputs on success
            document.getElementById('note-title').value = '';
            document.getElementById('note-link').value = '';
            
            // Re-fetch to update the screen instantly
            fetchNotes(); 
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Failed to upload note. Check console for details.");
        } finally {
            // Reset button
            btn.textContent = "Post Note";
            btn.disabled = false;
        }
    } else {
        alert("Please provide both a title and a link.");
    }
}

// 7. Delete a Note from Firebase
window.deleteNote = async function(id) {
    if (confirm("Are you sure you want to remove this resource permanently?")) {
        try {
            await deleteDoc(doc(db, "studyHubNotes", id));
            fetchNotes(); // Re-fetch to update the screen
        } catch (e) {
            console.error("Error deleting document: ", e);
            alert("Failed to delete note.");
        }
    }
}

// 8. Compound Filtering (Search + Category)
window.applyFilters = function() {
    const searchQuery = document.getElementById('search-bar').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery);
        const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderNotes(filteredNotes);
}

// 9. Role & Authentication Mock
window.handleLogin = function(role) {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const uploadPanel = document.getElementById('upload-panel');
    
    if (role === 'teacher') {
        // Require password for Admin
        if (prompt("Enter Admin Password:") === "Admin123") { 
            currentRole = 'teacher';
            uploadPanel.classList.remove('hidden');
        } else {
            alert("Incorrect Password!");
            return; // Stop here, do not let them in
        }
    } else {
        // Let students straight in
        currentRole = 'student';
        uploadPanel.classList.add('hidden');
    }
    
    // Hide the login screen, show the main app
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    
    // Reset the search bar/filters and render the fresh notes
    document.getElementById('search-bar').value = '';
    document.getElementById('category-filter').value = 'All';
    renderNotes(); 
}

window.logout = function() {
    // Hide the main app, show the login screen
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    
    // Reset role to student for security
    currentRole = 'student';
}

// 10. Dark Mode Toggle (Updated for dual buttons)
window.toggleDarkMode = function() {
    const body = document.documentElement;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    
    // Determine which icon to show
    const themeIcon = newTheme === 'dark' ? '☀️' : '🌙';
    
    // Update the App Navigation button
    const navBtn = document.getElementById('theme-toggle');
    if (navBtn) navBtn.textContent = themeIcon;
    
    // Update the Login Screen button
    const loginBtn = document.getElementById('theme-toggle-login');
    if (loginBtn) loginBtn.textContent = themeIcon;
}


// Initialize App: Fetch live data as soon as the script loads
fetchNotes();