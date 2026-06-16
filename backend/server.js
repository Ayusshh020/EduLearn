import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Load database helper
const readDb = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Database read error:", error);
    return {};
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
  
  const defaultDb = {
    courses: {
      "react-js": {
        "title": "React JS Control Panel",
        "modules": [
          {
            "id": "m1",
            "title": "Module 1: React Foundations",
            "description": "Components, props, and state essentials.",
            "lessons": [
              {
                "id": "l1",
                "title": "Welcome to EduLearn",
                "duration": 1,
                "videoLength": 10,
                "permission": "open",
                "notes": "Understand the course flow, badges, and progress tracking.",
                "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
              },
              {
                "id": "l2",
                "title": "Components and JSX",
                "duration": 1,
                "videoLength": 32,
                "permission": "profile",
                "notes": "Learn how reusable UI blocks are composed in React.",
                "videoUrl": "https://www.w3schools.com/html/movie.mp4"
              },
              {
                "id": "l3",
                "title": "State and Events",
                "duration": 1,
                "videoLength": 30,
                "permission": "lesson-complete",
                "notes": "Handle user actions and update interface state safely.",
                "videoUrl": "https://media.w3.org/2010/05/video/movie_300.mp4"
              }
            ]
          },
          {
            "id": "m2",
            "title": "Module 2: Learning Dashboard",
            "description": "Progress, access rules, and guided practice.",
            "lessons": [
              {
                "id": "l4",
                "title": "Progress Systems",
                "duration": 1,
                "videoLength": 46,
                "permission": "lesson-complete",
                "notes": "Connect progress bars, checked lessons, and resume markers.",
                "videoUrl": "https://vjs.zencdn.net/v/oceans.mp4"
              },
              {
                "id": "l5",
                "title": "Quiz Workflows",
                "duration": 1,
                "videoLength": 32,
                "permission": "lesson-complete",
                "notes": "Design step-by-step checks for student understanding.",
                "videoUrl": "https://media.w3.org/2010/05/bunny/trailer.mp4"
              }
            ]
          },
          {
            "id": "m3",
            "title": "Module 3: MVP Readiness",
            "description": "Badges, gradebook, and forum support.",
            "lessons": [
              {
                "id": "l6",
                "title": "Gradebook UX",
                "duration": 1,
                "videoLength": 10,
                "permission": "lesson-complete",
                "notes": "Keep long score lists scannable with dense tables.",
                "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
              },
              {
                "id": "l7",
                "title": "Final Project Prep",
                "duration": 1,
                "videoLength": 32,
                "permission": "lesson-complete",
                "notes": "Prepare the full course control panel for demo day.",
                "videoUrl": "https://www.w3schools.com/html/movie.mp4"
              }
            ]
          }
        ],
        "quizQuestions": [
          {
            "id": "q1",
            "question": "Which React concept lets a component remember user interaction?",
            "options": ["Props", "State", "CSS", "HTML"],
            "answer": "State"
          },
          {
            "id": "q2",
            "question": "What should a progress marker save for a lesson video?",
            "options": ["Only the title", "The exact timestamp", "The browser size", "The font family"],
            "answer": "The exact timestamp"
          },
          {
            "id": "q3",
            "question": "Why is a guided quiz split into steps?",
            "options": ["To hide answers", "To reduce focus", "To make each question manageable", "To remove scoring"],
            "answer": "To make each question manageable"
          },
          {
            "id": "q4",
            "question": "Which UI is best for long lists of marks and attempts?",
            "options": ["Dense table", "Single hero headline", "Image gallery", "Footer menu"],
            "answer": "Dense table"
          }
        ]
      },
      "dsa-java": {
        "title": "Data Structures & Algorithms",
        "modules": [
          {
            "id": "m1",
            "title": "Module 1: Arrays & Lists",
            "description": "Sequential layouts, searching, and traversal.",
            "lessons": [
              {
                "id": "l1",
                "title": "Intro to Array Algorithms",
                "duration": 1,
                "videoLength": 10,
                "permission": "open",
                "notes": "Analyze memory allocation and sequential scans.",
                "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
              },
              {
                "id": "l2",
                "title": "Linked List Insertion",
                "duration": 1,
                "videoLength": 32,
                "permission": "profile",
                "notes": "Learn pointer swaps for insertion at head, tail, and body.",
                "videoUrl": "https://www.w3schools.com/html/movie.mp4"
              },
              {
                "id": "l3",
                "title": "Double Linked Lists",
                "duration": 1,
                "videoLength": 30,
                "permission": "lesson-complete",
                "notes": "Bidirectional structures and previous pointer management.",
                "videoUrl": "https://media.w3.org/2010/05/video/movie_300.mp4"
              }
            ]
          },
          {
            "id": "m2",
            "title": "Module 2: Stacks & Queues",
            "description": "LIFO/FIFO models and array implementations.",
            "lessons": [
              {
                "id": "l4",
                "title": "Stack Push/Pop Operations",
                "duration": 1,
                "videoLength": 46,
                "permission": "lesson-complete",
                "notes": "Implement a simple call stack tracer using standard arrays.",
                "videoUrl": "https://vjs.zencdn.net/v/oceans.mp4"
              },
              {
                "id": "l5",
                "title": "Circular Queues",
                "duration": 1,
                "videoLength": 32,
                "permission": "lesson-complete",
                "notes": "Handle circular wrapping using mod arithmetic.",
                "videoUrl": "https://media.w3.org/2010/05/bunny/trailer.mp4"
              }
            ]
          },
          {
            "id": "m3",
            "title": "Module 3: Trees & Graphs",
            "description": "Hierarchical data, traversals, and search trees.",
            "lessons": [
              {
                "id": "l6",
                "title": "Binary Tree Traversals",
                "duration": 1,
                "videoLength": 10,
                "permission": "lesson-complete",
                "notes": "Practice Preorder, Postorder, and Inorder recursion.",
                "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
              },
              {
                "id": "l7",
                "title": "Graph DFS and BFS",
                "duration": 1,
                "videoLength": 32,
                "permission": "lesson-complete",
                "notes": "Explore graph searching using stacks, queues, and visitor sets.",
                "videoUrl": "https://www.w3schools.com/html/movie.mp4"
              }
            ]
          }
        ],
        "quizQuestions": [
          {
            "id": "q1",
            "question": "What is the time complexity of searching in a sorted array with binary search?",
            "options": ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
            "answer": "O(log N)"
          },
          {
            "id": "q2",
            "question": "Which data structure follows the Last In First Out (LIFO) principle?",
            "options": ["Queue", "Stack", "Array", "Tree"],
            "answer": "Stack"
          },
          {
            "id": "q3",
            "question": "What is the main benefit of a doubly linked list over a singly linked list?",
            "options": ["Less memory overhead", "O(1) access to middle", "Bidirectional traversal", "Auto resizing"],
            "answer": "Bidirectional traversal"
          },
          {
            "id": "q4",
            "question": "In a Binary Search Tree, what traversal yields elements in sorted order?",
            "options": ["Pre-order", "Post-order", "In-order", "Level-order"],
            "answer": "In-order"
          }
        ]
      },
      "full-stack": {
        "title": "Full-Stack Web Development",
        "modules": [
          {
            "id": "m1",
            "title": "Module 1: Web UI Development",
            "description": "Modern frontend structure, selectors, and sizing.",
            "lessons": [
              {
                "id": "l1",
                "title": "HTML5 & Semantic Tags",
                "duration": 1,
                "videoLength": 10,
                "permission": "open",
                "notes": "Learn to structure accessible pages with headers, footers, and articles.",
                "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
              },
              {
                "id": "l2",
                "title": "CSS Grid and Flexbox",
                "duration": 1,
                "videoLength": 32,
                "permission": "profile",
                "notes": "Compare CSS flex directional flow with grid system templates.",
                "videoUrl": "https://www.w3schools.com/html/movie.mp4"
              },
              {
                "id": "l3",
                "title": "Responsive Web Layouts",
                "duration": 1,
                "videoLength": 30,
                "permission": "lesson-complete",
                "notes": "Write viewport media queries to shift column structures cleanly.",
                "videoUrl": "https://media.w3.org/2010/05/video/movie_300.mp4"
              }
            ]
          },
          {
            "id": "m2",
            "title": "Module 2: Backend APIs",
            "description": "Node API design, routing, and HTTP validation.",
            "lessons": [
              {
                "id": "l4",
                "title": "Express Router Setup",
                "duration": 1,
                "videoLength": 46,
                "permission": "lesson-complete",
                "notes": "Split server logic into modular routers and handler modules.",
                "videoUrl": "https://vjs.zencdn.net/v/oceans.mp4"
              },
              {
                "id": "l5",
                "title": "RESTful API Principles",
                "duration": 1,
                "videoLength": 32,
                "permission": "lesson-complete",
                "notes": "Understand HTTP verbs, response status codes, and URI structures.",
                "videoUrl": "https://media.w3.org/2010/05/bunny/trailer.mp4"
              }
            ]
          },
          {
            "id": "m3",
            "title": "Module 3: Databases & SQL",
            "description": "Schema definitions, relational links, and database queries.",
            "lessons": [
              {
                "id": "l6",
                "title": "Relational Tables Schema",
                "duration": 1,
                "videoLength": 10,
                "permission": "lesson-complete",
                "notes": "Design primary keys, foreign keys, and index constraints.",
                "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
              },
              {
                "id": "l7",
                "title": "Connecting Databases",
                "duration": 1,
                "videoLength": 32,
                "permission": "lesson-complete",
                "notes": "Write connection loops and run SQL select queries dynamically.",
                "videoUrl": "https://www.w3schools.com/html/movie.mp4"
              }
            ]
          }
        ],
        "quizQuestions": [
          {
            "id": "q1",
            "question": "Which HTTP method is typically used to create a new resource on the server?",
            "options": ["GET", "POST", "PUT", "DELETE"],
            "answer": "POST"
          },
          {
            "id": "q2",
            "question": "What does CORS stand for in web API development?",
            "options": ["Cross-Origin Resource Sharing", "Common Outline Retrieval System", "Client Object Response System", "Custom Origin Request State"],
            "answer": "Cross-Origin Resource Sharing"
          },
          {
            "id": "q3",
            "question": "Which CSS layout model is best for a strict two-dimensional grid layout?",
            "options": ["Flexbox", "CSS Grid", "Floats", "Absolute positioning"],
            "answer": "CSS Grid"
          },
          {
            "id": "q4",
            "question": "What is the default port for Express servers in common local development tutorials?",
            "options": ["80", "443", "3000", "8080"],
            "answer": "3000"
          }
        ]
      }
    },
    "baseGradebook": [
      {"id": "g1", "title": "React Warmup", "module": "Module 1", "date": "Jan 18", "score": 84, "status": "Passed"},
      {"id": "g2", "title": "JSX Check", "module": "Module 1", "date": "Jan 21", "score": 91, "status": "Passed"},
      {"id": "g3", "title": "State Drill", "module": "Module 1", "date": "Jan 25", "score": 78, "status": "Passed"},
      {"id": "g4", "title": "Progress Review", "module": "Module 2", "date": "Feb 02", "score": 88, "status": "Passed"},
      {"id": "g5", "title": "Access Rules Lab", "module": "Module 2", "date": "Feb 05", "score": 73, "status": "Needs Review"},
      {"id": "g6", "title": "Dashboard Sprint", "module": "Module 2", "date": "Feb 12", "score": 95, "status": "Passed"},
      {"id": "g7", "title": "Gradebook UX", "module": "Module 3", "date": "Feb 18", "score": 89, "status": "Passed"},
      {"id": "g8", "title": "Forum Flow", "module": "Module 3", "date": "Feb 23", "score": 82, "status": "Passed"},
      {"id": "g9", "title": "MVP Readiness", "module": "Module 3", "date": "Mar 01", "score": 92, "status": "Passed"},
      {"id": "g10", "title": "Final Practice", "module": "Module 3", "date": "Mar 09", "score": 87, "status": "Passed"}
    ],
    "forumThreads": {
      "l1": [
        {"id": "f1_1", "title": "How will lesson progress be calculated?", "replies": 2, "comments": [
          {"id": "c1_1_1", "author": "Mentor", "text": "It tracks both checkbox states and video watching completion."},
          {"id": "c1_1_2", "author": "Aarav Mehta", "text": "Perfect, thanks for clarifying!"}
        ]},
        {"id": "f1_2", "title": "Can badges be reset for demo?", "replies": 1, "comments": [
          {"id": "c1_2_1", "author": "Mentor", "text": "Yes, clicking the yellow 'Reset Course Progress' button clears all badges."}
        ]}
      ],
      "l2": [
        {"id": "f2_1", "title": "When should I split a component?", "replies": 2, "comments": [
          {"id": "c2_1_1", "author": "Mentor", "text": "When a component exceeds 150 lines or does more than one job."},
          {"id": "c2_1_2", "author": "Aarav Mehta", "text": "Got it, keeping components focused is key."}
        ]},
        {"id": "f2_2", "title": "Do props update automatically?", "replies": 1, "comments": [
          {"id": "c2_2_1", "author": "Mentor", "text": "Yes, if the parent state changes, props automatically re-render."}
        ]}
      ],
      "l3": [
        {"id": "f3_1", "title": "Why does state update feel delayed?", "replies": 1, "comments": [
          {"id": "c3_1_1", "author": "Mentor", "text": "React state updates are batched and async. Use useEffect for post-state logs."}
        ]},
        {"id": "f3_2", "title": "Best way to handle checkbox progress?", "replies": 1, "comments": [
          {"id": "c3_2_1", "author": "Mentor", "text": "Direct state updates synced back via a debounced API is standard."}
        ]}
      ],
      "l4": [
        {"id": "f4_1", "title": "Should progress count video or checklist first?", "replies": 1, "comments": [
          {"id": "c4_1_1", "author": "Mentor", "text": "In our schema, progress tracks checked lesson checkboxes."}
        ]},
        {"id": "f4_2", "title": "How do resume markers work?", "replies": 1, "comments": [
          {"id": "c4_2_1", "author": "Mentor", "text": "The HTML5 video saves currentTime via onTimeUpdate and pauses."}
        ]}
      ],
      "l5": [
        {"id": "f5_1", "title": "Can quiz answers autosave?", "replies": 1, "comments": [
          {"id": "c5_1_1", "author": "Mentor", "text": "Yes, they sync back to studentState automatically on each answer."}
        ]},
        {"id": "f5_2", "title": "What happens if I refresh during a quiz?", "replies": 1, "comments": [
          {"id": "c5_2_1", "author": "Mentor", "text": "The quiz state matches your cached progress in the database."}
        ]}
      ],
      "l6": [
        {"id": "f6_1", "title": "How can dense tables stay smooth?", "replies": 1, "comments": [
          {"id": "c6_1_1", "author": "Mentor", "text": "Use pagination or keep row count limited under 50 items."}
        ]},
        {"id": "f6_2", "title": "Should the gradebook have sticky headers?", "replies": 1, "comments": [
          {"id": "c6_2_1", "author": "Mentor", "text": "Yes, position: sticky in CSS ensures headers stay visible during scrolling."}
        ]}
      ],
      "l7": [
        {"id": "f7_1", "title": "Which features matter most in the final demo?", "replies": 1, "comments": [
          {"id": "c7_1_1", "author": "Mentor", "text": "The core control panel, expandable lesson list, and quiz tracker."}
        ]},
        {"id": "f7_2", "title": "How do I explain access permissions?", "replies": 1, "comments": [
          {"id": "c7_2_1", "author": "Mentor", "text": "Show that some lessons require completing the previous module first."}
        ]}
      ]
    },
    "studentState": {
      "isLoggedIn": false,
      "profileReady": false,
      "profile": {
        "name": "Aarav Mehta",
        "email": "aarav.mehta@itm.edu",
        "branch": "B.Tech CSE",
        "semester": "Semester II",
        "goal": "Finish my course case study with a strong MVP demo",
        "courseId": "react-js",
        "course": "React JS Control Panel"
      },
      "theme": "light",
      "completedLessons": { "l1": true },
      "videoMarkers": { "l1": 5 },
      "quizAnswers": {},
      "quizSubmitted": false,
      "expandedModules": { "m1": true, "m2": true },
      "activeLessonId": "l2"
    }
  };
  
  if (writeDb(defaultDb)) {
    res.json({ success: true, db: defaultDb });
  } else {
    res.status(500).json({ error: "Failed to write reset defaults to file" });
  }
});

app.listen(PORT, () => {
  console.log(`EduLearn Backend API Server is running on port ${PORT}`);
});
