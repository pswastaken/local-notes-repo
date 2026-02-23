# StudyHub: Cloud-Connected Student Repository
**Overview**
StudyHub is a responsive, web-based platform designed to centralize and share academic resources, course policies, and study notes. Built with a focus on usability and real-time collaboration, the application serves as a shared digital library where authorized users can upload materials, and students can easily search and access them from any device.

**Key Features**
Role-Based Access Control (Gateway Pattern): Features a dedicated login screen that routes users based on their role. "Students" receive immediate, view-only access to the repository, while "Admins" (teachers or designated uploaders) must authenticate with a password to access the hidden upload and deletion controls.

**Live Cloud Database Synchronization**: Integrated with Google Firebase (Cloud Firestore) via ES Modules. Any newly added resource or deletion is instantly updated and synced across all users' browsers in real-time.

**Cost-Effective File Management**: Designed to bypass expensive cloud storage limits by utilizing a direct-link system. Admins can host heavy files (PDFs, PPTs, code files) on free services like Google Drive and seamlessly link them into the repository.

**Compound Search & Filtering**: A highly efficient dual-filter system allows students to search by text (title) and filter by specific academic categories simultaneously.

**Customized Curriculum Categories**: The repository is pre-configured to support specific coursework, including Course Policies, Linear Algebra and Differential Equations (LADE), Quantum Physics, Product Realization, Web Development, and BEEE.

**Persistent UI/UX**: Features a clean, modern interface utilizing CSS Grid and Flexbox, complete with a globally synced Dark Mode toggle for late-night study sessions.

**Tech Stack**

**Frontend**: HTML5, CSS3 (Native Variables), JavaScript

**Backend/Database**: Google Firebase (Cloud Firestore NoSQL Database)

**Architecture**: Client-Server model using ES6 Modules and asynchronous JavaScript (async/await).
