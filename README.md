# PadhaiHub: Cloud-Connected Student Repository 📚

PadhaiHub is a secure, responsive, full-stack web application designed to centralize and share academic resources for subjects like LADE, Quantum Physics, Product Realization, Web Development, and BEEE. Built with HTML, CSS, Vanilla JavaScript, and Google Firebase, it serves as a real-time collaborative digital library with role-based access control.

### 🌐 **[View Live Project Here](https://pswastaken.github.io/local-notes-repo/)**

## ✨ Key Features

### 🔐 Secure Authentication & Role Management
* **Multi-Provider Login:** Users can securely log in via Email/Password or instantly authenticate using **Google Sign-In**.
* **Role-Based Access Control (RBAC):** * **Students:** Default view-only access to browse, search, and favorite materials.
  * **Teachers/Admins:** Secure access to a hidden portal for uploading, editing, and deleting resources.
* **Protected Registration:** Upgrading to a Teacher account requires a secret authorization code during sign-up to prevent unauthorized access.

### 🗄️ Real-Time Database (CRUD)
* **Firestore Integration:** Powered by Firebase Cloud Firestore, the database syncs instantly across all devices without requiring page reloads.
* **Full CRUD Functionality:** Admins can **C**reate new resource links, **R**ead the database, **U**pdate existing entries to fix typos, and **D**elete outdated files.
* **Smart Sorting:** Notes are automatically stamped with the exact millisecond of upload and sorted to display the newest resources first.

### 🎯 Personalized User Experience
* **"⭐ My Favorites" System:** Students can star specific derivations, formulas, or study guides. These preferences are saved locally to their browser via `localStorage` for quick access across sessions.
* **Dynamic Search & Filter:** A dual-filter system allows students to instantly search by title or filter by specific subject categories.
* **Custom Toast Notifications:** Clunky native browser alerts have been replaced with a sleek, custom sliding toast notification system for immediate feedback (Success, Error, Info).

### 🎨 Modern UI/UX
* **Adaptive Dark Mode:** A globally synced Dark Mode toggle for comfortable reading, ensuring all dynamic elements adapt automatically.
* **Focused Landing Page:** A clean, distraction-free login screen featuring a custom library background that hides itself once the user enters the main workspace.

---

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Grid/Flexbox, CSS Variables), Vanilla JavaScript (ES6 Modules)
* **Backend as a Service (BaaS):** Google Firebase
  * **Firebase Authentication:** Managing user sessions and secure logins.
  * **Cloud Firestore:** NoSQL real-time document database.
  * **Firestore Security Rules:** Custom server-side rules preventing unauthorized writes or tampering.
1. Clone the repository: 
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
