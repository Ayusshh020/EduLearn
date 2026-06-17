import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defaultDb } from "./defaults.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Load database helper with auto-initialization
const readDb = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log("Database file data.json not found. Auto-initializing with defaults.");
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Database read error:", error);
    return defaultDb;
  }
};

// Save database helper
const writeDb = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Database write error:", error);
    return false;
  }
};

// Fetch initial data based on course selection
app.get("/api/data", (req, res) => {
  const db = readDb();
  const courseId = req.query.courseId || db.studentState.profile.courseId || "react-js";
  console.log(`Loading modules for course: ${courseId}`);
  
  const courseData = db.courses[courseId] || db.courses["react-js"];
  
  res.json({
    courseTitle: courseData.title,
    modules: courseData.modules,
    quizQuestions: courseData.quizQuestions,
    forumThreads: db.forumThreads,
    studentState: db.studentState,
    gradebook: db.baseGradebook
  });
});

// Update student state
app.post("/api/state", (req, res) => {
  const db = readDb();
  db.studentState = {
    ...db.studentState,
    ...req.body
  };
  
  if (writeDb(db)) {
    res.json({ success: true, state: db.studentState });
  } else {
    res.status(500).json({ error: "Failed to sync state" });
  }
});

// Update video timeline marker
app.post("/api/state/video-progress", (req, res) => {
  const { lessonId, seconds } = req.body;
  if (!lessonId) {
    return res.status(400).json({ error: "Missing lessonId" });
  }
  
  const db = readDb();
  if (!db.studentState.videoMarkers) {
    db.studentState.videoMarkers = {};
  }
  db.studentState.videoMarkers[lessonId] = Number(seconds);
  
  if (writeDb(db)) {
    res.json({ success: true, videoMarkers: db.studentState.videoMarkers });
  } else {
    res.status(500).json({ error: "Failed to save video marker" });
  }
});

// Add a discussion thread
app.post("/api/forum/thread", (req, res) => {
  const { lessonId, title } = req.body;
  if (!lessonId || !title) {
    return res.status(400).json({ error: "Missing fields" });
  }
  
  const db = readDb();
  if (!db.forumThreads[lessonId]) {
    db.forumThreads[lessonId] = [];
  }
  
  const newThread = {
    id: `f_${lessonId}_${Date.now()}`,
    title: title,
    replies: 0,
    comments: []
  };
  db.forumThreads[lessonId].unshift(newThread);
  
  if (writeDb(db)) {
    res.json({ success: true, thread: newThread, threads: db.forumThreads[lessonId] });
  } else {
    res.status(500).json({ error: "Failed to add thread" });
  }
});

// Post a reply/comment to a thread
app.post("/api/forum/reply", (req, res) => {
  const { lessonId, threadId, author, text } = req.body;
  if (!lessonId || !threadId || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const db = readDb();
  const threads = db.forumThreads[lessonId] || [];
  const thread = threads.find(t => t.id === threadId);

  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  if (!thread.comments) {
    thread.comments = [];
  }

  const newComment = {
    id: `c_${Date.now()}`,
    author: author || "Student",
    text: text
  };

  thread.comments.push(newComment);
  thread.replies = thread.comments.length;

  if (writeDb(db)) {
    res.json({ success: true, comment: newComment, threads: db.forumThreads[lessonId] });
  } else {
    res.status(500).json({ error: "Failed to add reply" });
  }
});

// Delete a thread
app.post("/api/forum/thread/delete", (req, res) => {
  const { lessonId, threadId } = req.body;
  if (!lessonId || !threadId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const db = readDb();
  if (db.forumThreads[lessonId]) {
    db.forumThreads[lessonId] = db.forumThreads[lessonId].filter(t => t.id !== threadId);
  }

  if (writeDb(db)) {
    res.json({ success: true, threads: db.forumThreads[lessonId] || [] });
  } else {
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

// Add a grade to gradebook
app.post("/api/gradebook", (req, res) => {
  const { title, module, score, status } = req.body;
  
  const db = readDb();
  const newGrade = {
    id: `g_${Date.now()}`,
    title,
    module,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    score: Number(score),
    status
  };
  db.baseGradebook.unshift(newGrade);
  
  if (writeDb(db)) {
    res.json({ success: true, grade: newGrade, gradebook: db.baseGradebook });
  } else {
    res.status(500).json({ error: "Failed to save grade" });
  }
});

// Reset dashboard to defaults
app.post("/api/reset", (req, res) => {
  console.log("Resetting database to default templates");
  
  if (writeDb(defaultDb)) {
    res.json({ success: true, db: defaultDb });
  } else {
    res.status(500).json({ error: "Failed to write reset defaults to file" });
  }
});

app.listen(PORT, () => {
  console.log(`EduLearn Backend API Server is running on port ${PORT}`);
});
