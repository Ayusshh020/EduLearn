# EduLearn - Student Course Control Panel

A fully functional, retro-brutalist course control panel designed for students to track course progress, resume playback, take quizzes, review grade reports, and ask questions.

Built as a college project MVP for the React JS Semester II course control study.

---

## Key Features

### 1. Expandable Lesson List
* **Module-Based Breakdown**: Course modules expand and collapse dynamically.
* **Granular Progress Systems**: Tracks progress percentages at both individual module levels and overall course completion level.
* **Completed States**: Clear checkmarks to indicate completed lessons.

### 2. Video Progress Marker
* **Playback Autosave**: Saves the exact timeline timestamp (seconds) on time changes and video pauses.
* **Resume Playback**: Automatically resumes playback from the last saved position upon loading a lesson.

### 3. Guided Quiz Creator
* **Multi-Step Quiz**: Clear progression checklist showing current question index.
* **Answer Autosaver**: Answers sync immediately to the database on choice selection.
* **Interruption Protection**: The current active quiz step is saved in the database, allowing students to refresh or change tabs without losing their place.

### 4. Interactive Student Access Center
* **Access Control**: Locker mechanisms check prerequisites before allowing actions (Open Notes, Start Quiz, Claim Certificate).
* **Lesson Locking Rules**: Lessons requiring previous completion display a lock icon in the list. Attempting to click locked lessons displays a dedicated warning overlay in the video container.

### 5. Discussion Q&A Forum
* **Thread Actions**: Start discussion threads, read mentor answers, and delete threads.
* **Interactive Replies**: Expand any thread card to view comments and post comments/replies dynamically.

### 6. Searchable & Sortable Gradebook
* **Frictionless Rendering**: Optimized database rendering.
* **Assessment Search**: Search box filters columns dynamically by name or module.
* **Column Sorting**: Click column headers to sort assessment results (Assessment, Module, Date, Score) in ascending or descending order (indicated by ▲/▼).

### 7. Persistent Theme Switcher
* **Light & Dark Mode**: Functional theme toggle.
* **Flash-Free Load**: Configured blocking inline header script to load saved settings early and prevent initial light-theme flashes in dark mode.

---

## Tech Stack
* **Frontend**: React JS, custom Vanilla CSS styling, Lucide Icons, Vite builder.
* **Backend**: Node JS, Express Server, CORS.
* **Database**: Local JSON Database file-system reader (`backend/data.json`).

---

## Project Structure
```
EduLearn/
├── backend/
│   ├── server.js      # Express API endpoints
│   └── data.json      # JSON data storage
├── src/
│   ├── App.jsx        # Core application client
│   ├── main.jsx       # Mount entry point
│   └── styles.css     # Retro-brutalist styles
├── index.html         # HTML entry script
├── package.json       # Dependencies config
└── .gitignore         # Excluded repositories
```

---

## Getting Started

### 1. Install Dependencies
Run the following command in the root folder to download the dependencies:
```bash
npm install
```

### 2. Start the Backend API Server
Launch the Node API server in the background (default port `5001`):
```bash
npm run server
```

### 3. Start the Frontend client
Launch the Vite React dev server in a separate terminal:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Commands

* `npm run dev`: Starts the Vite React client local server.
* `npm run server`: Launches the Express backend server.
* `npm run build`: Bundles the production client.
* `npm run preview`: Previews the production bundle.
