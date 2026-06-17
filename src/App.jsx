import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Lock,
  LogOut,
  MessageCircle,
  Moon,
  Play,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Trophy,
  UserRound,
  Video,
} from "lucide-react";

const STORAGE_KEY = "edulearn:v1";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const modules = [
  {
    id: "m1",
    title: "Module 1: React Foundations",
    description: "Components, props, and state essentials.",
    lessons: [
      {
        id: "l1",
        title: "Welcome to EduLearn",
        duration: 12,
        videoLength: 720,
        permission: "open",
        notes: "Understand the course flow, badges, and progress tracking.",
      },
      {
        id: "l2",
        title: "Components and JSX",
        duration: 22,
        videoLength: 1320,
        permission: "profile",
        notes: "Learn how reusable UI blocks are composed in React.",
      },
      {
        id: "l3",
        title: "State and Events",
        duration: 28,
        videoLength: 1680,
        permission: "lesson-complete",
        notes: "Handle user actions and update interface state safely.",
      },
    ],
  },
  {
    id: "m2",
    title: "Module 2: Learning Dashboard",
    description: "Progress, access rules, and guided practice.",
    lessons: [
      {
        id: "l4",
        title: "Progress Systems",
        duration: 18,
        videoLength: 1080,
        permission: "lesson-complete",
        notes: "Connect progress bars, checked lessons, and resume markers.",
      },
      {
        id: "l5",
        title: "Quiz Workflows",
        duration: 24,
        videoLength: 1440,
        permission: "lesson-complete",
        notes: "Design step-by-step checks for student understanding.",
      },
    ],
  },
  {
    id: "m3",
    title: "Module 3: MVP Readiness",
    description: "Badges, gradebook, and forum support.",
    lessons: [
      {
        id: "l6",
        title: "Gradebook UX",
        duration: 20,
        videoLength: 1200,
        permission: "lesson-complete",
        notes: "Keep long score lists scannable with dense tables.",
      },
      {
        id: "l7",
        title: "Final Project Prep",
        duration: 30,
        videoLength: 1800,
        permission: "lesson-complete",
        notes: "Prepare the full course control panel for demo day.",
      },
    ],
  },
];

const quizQuestions = [
  {
    id: "q1",
    question: "Which React concept lets a component remember user interaction?",
    options: ["Props", "State", "CSS", "HTML"],
    answer: "State",
  },
  {
    id: "q2",
    question: "What should a progress marker save for a lesson video?",
    options: ["Only the title", "The exact timestamp", "The browser size", "The font family"],
    answer: "The exact timestamp",
  },
  {
    id: "q3",
    question: "Why is a guided quiz split into steps?",
    options: ["To hide answers", "To reduce focus", "To make each question manageable", "To remove scoring"],
    answer: "To make each question manageable",
  },
  {
    id: "q4",
    question: "Which UI is best for long lists of marks and attempts?",
    options: ["Dense table", "Single hero headline", "Image gallery", "Footer menu"],
    answer: "Dense table",
  },
];

const baseGradebook = [
  ["React Warmup", "Module 1", "Jan 18", 84, "Passed"],
  ["JSX Check", "Module 1", "Jan 21", 91, "Passed"],
  ["State Drill", "Module 1", "Jan 25", 78, "Passed"],
  ["Progress Review", "Module 2", "Feb 02", 88, "Passed"],
  ["Access Rules Lab", "Module 2", "Feb 05", 73, "Needs Review"],
  ["Dashboard Sprint", "Module 2", "Feb 12", 95, "Passed"],
  ["Gradebook UX", "Module 3", "Feb 18", 89, "Passed"],
  ["Forum Flow", "Module 3", "Feb 23", 82, "Passed"],
  ["MVP Readiness", "Module 3", "Mar 01", 92, "Passed"],
  ["Final Practice", "Module 3", "Mar 09", 87, "Passed"],
].map(([title, module, date, score, status], index) => ({
  id: `g${index + 1}`,
  title,
  module,
  date,
  score,
  status,
}));

const forumThreads = {
  l1: ["How will lesson progress be calculated?", "Can badges be reset for demo?"],
  l2: ["When should I split a component?", "Do props update automatically?"],
  l3: ["Why does state update feel delayed?", "Best way to handle checkbox progress?"],
  l4: ["Should progress count video or checklist first?", "How do resume markers work?"],
  l5: ["Can quiz answers autosave?", "What happens if I refresh during a quiz?"],
  l6: ["How can dense tables stay smooth?", "Should the gradebook have sticky headers?"],
  l7: ["Which features matter most in the final demo?", "How do I explain access permissions?"],
};

const defaultState = {
  isLoggedIn: false,
  profileReady: false,
  profile: {
    name: "Aarav Mehta",
    email: "aarav.mehta@itm.edu",
    branch: "B.Tech CSE",
    semester: "Semester II",
    goal: "Finish React JS case study with a strong MVP demo",
    course: "React JS Control Panel",
  },
  theme: "light",
  completedLessons: { l1: true },
  videoMarkers: { l1: 285 },
  quizAnswers: {},
  quizSubmitted: false,
  expandedModules: { m1: true, m2: true },
  activeLessonId: "l2",
};

function getInitialState() {
  try {
    const savedTheme = localStorage.getItem("edulearn:theme") || "light";
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      return { ...defaultState, ...saved, theme: savedTheme };
    }
    return { ...defaultState, theme: savedTheme };
  } catch {
    return defaultState;
  }
}

function formatTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function getAllLessons() {
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title, moduleId: module.id })),
  );
}

function App() {
  const [state, setState] = useState(getInitialState);
  const [backendModules, setBackendModules] = useState([]);
  const [backendQuizQuestions, setBackendQuizQuestions] = useState([]);
  const [backendGradebook, setBackendGradebook] = useState([]);
  const [backendForumThreads, setBackendForumThreads] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [quizStep, setQuizStep] = useState(() => getInitialState().quizStep || 0);

  const [currentLoadedCourseId, setCurrentLoadedCourseId] = useState("");

  const pendingPatchRef = useRef({});
  const debounceTimeoutRef = useRef(null);

  // Sync local quizStep state to state.quizStep
  useEffect(() => {
    if (state.quizStep !== undefined && state.quizStep !== quizStep) {
      setQuizStep(state.quizStep);
    }
  }, [state.quizStep]);

  useEffect(() => {
    const targetCourseId = state.profile.courseId || "react-js";
    
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/data?courseId=${targetCourseId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server communication error");
        return res.json();
      })
      .then((data) => {
        setBackendModules(data.modules || modules);
        setBackendQuizQuestions(data.quizQuestions || quizQuestions);
        setBackendGradebook(data.gradebook || baseGradebook);
        setBackendForumThreads(data.forumThreads || forumThreads);
        setCurrentLoadedCourseId(targetCourseId);
        if (data.studentState) {
          setState((prev) => {
            const merged = { ...prev, ...data.studentState };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to load initial data from server. Falling back to local data.", err);
        setBackendModules(modules);
        setBackendQuizQuestions(quizQuestions);
        setBackendGradebook(baseGradebook);
        setBackendForumThreads(forumThreads);
        setIsLoading(false);
      });
  }, [state.profile.courseId]);

  const allLessons = useMemo(() => {
    return backendModules.flatMap((module) =>
      module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title, moduleId: module.id })),
    );
  }, [backendModules]);

  const activeLesson = allLessons.find((lesson) => lesson.id === state.activeLessonId) || allLessons[0] || { id: "l1", title: "Welcome to EduLearn", notes: "", videoUrl: "" };
  const completedCount = Object.values(state.completedLessons).filter(Boolean).length;
  const progress = Math.round((completedCount / (allLessons.length || 1)) * 100);
  
  const quizScore = backendQuizQuestions.reduce((score, item) => {
    return score + (state.quizAnswers[item.id] === item.answer ? 1 : 0);
  }, 0);
  const quizPercent = Math.round((quizScore / (backendQuizQuestions.length || 1)) * 100);
  
  const gradebook = backendGradebook;
  const badges = [
    { title: "First Lesson", detail: "Completed your first lesson", unlocked: completedCount >= 1, criteria: "Complete at least 1 lesson in the module list." },
    { title: "Module Starter", detail: "Finished three lessons", unlocked: completedCount >= 3, criteria: "Complete at least 3 lessons across any modules." },
    { title: "Quiz Pilot", detail: "Submitted guided quiz", unlocked: state.quizSubmitted, criteria: "Finish and submit the multi-step knowledge quiz." },
    { title: "High Scorer", detail: "Scored 80% or above", unlocked: state.quizSubmitted && quizPercent >= 80, criteria: "Submit quiz with an 80% score or higher." },
    { title: "Course Finisher", detail: "Completed every lesson", unlocked: completedCount === allLessons.length && allLessons.length > 0, criteria: "Mark all available course lessons as completed." },
  ];

  const syncState = (patch) => {
    if (patch.theme) {
      try {
        localStorage.setItem("edulearn:theme", patch.theme);
      } catch (e) {}
    }

    pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };

    setState((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const finalPatch = pendingPatchRef.current;
        pendingPatchRef.current = {};
        fetch(`${API_BASE_URL}/api/state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPatch),
        }).catch((err) => console.error("Error syncing state:", err));
      }, 400);

      return next;
    });
  };

  const updateState = (patch) => syncState(patch);

  const toggleLesson = (lessonId) => {
    const updated = {
      ...state.completedLessons,
      [lessonId]: !state.completedLessons[lessonId],
    };
    syncState({ completedLessons: updated });
  };

  const saveVideoProgress = (lessonId, seconds) => {
    setState((current) => {
      const updatedMarkers = { ...current.videoMarkers, [lessonId]: Number(seconds) };
      const next = { ...current, videoMarkers: updatedMarkers };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    fetch(`${API_BASE_URL}/api/state/video-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, seconds: Number(seconds) })
    }).catch((err) => console.error("Failed to sync video progress:", err));
  };

  const answerQuiz = (questionId, value) => {
    const updated = { ...state.quizAnswers, [questionId]: value };
    syncState({ quizAnswers: updated });
  };

  const submitQuiz = () => {
    syncState({ quizSubmitted: true });
    fetch(`${API_BASE_URL}/api/gradebook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Guided ${state.profile.course.split(" ")[0]} Quiz`,
        module: "Current Attempt",
        score: quizPercent,
        status: quizPercent >= 70 ? "Passed" : "Needs Review"
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to post grade");
      return res.json();
    })
    .then(data => {
      setBackendGradebook(data.gradebook);
    })
    .catch(err => console.error("Error submitting grade:", err));
  };

  const addForumQuestion = (lessonId, questionTitle) => {
    fetch(`${API_BASE_URL}/api/forum/thread`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, title: questionTitle })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to add forum thread");
      return res.json();
    })
    .then(data => {
      setBackendForumThreads(prev => ({
        ...prev,
        [lessonId]: data.threads
      }));
    })
    .catch(err => console.error("Error adding forum thread:", err));
  };

  const addForumReply = (lessonId, threadId, text) => {
    fetch(`${API_BASE_URL}/api/forum/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, threadId, author: state.profile.name, text })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to add reply");
      return res.json();
    })
    .then(data => {
      setBackendForumThreads(prev => ({
        ...prev,
        [lessonId]: data.threads
      }));
    })
    .catch(err => console.error("Error adding reply:", err));
  };

  const deleteForumThread = (lessonId, threadId) => {
    fetch(`${API_BASE_URL}/api/forum/thread/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, threadId })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete thread");
      return res.json();
    })
    .then(data => {
      setBackendForumThreads(prev => ({
        ...prev,
        [lessonId]: data.threads
      }));
    })
    .catch(err => console.error("Error deleting thread:", err));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all course progress?")) {
      // Clear any pending debounced sync operations and patch queues
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      pendingPatchRef.current = {};

      fetch(`${API_BASE_URL}/api/reset`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          setBackendGradebook(data.db.baseGradebook);
          setBackendForumThreads(data.db.forumThreads);
          setState(data.db.studentState);
          setQuizStep(0);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.db.studentState));
          } catch (e) {}
          alert("Course progress reset successfully!");
        })
         .catch((err) => console.error("Reset error:", err));
    }
  };

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  if (isLoading) {
    return (
      <div className="loading-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "15px" }}>
        <div style={{ width: "50px", height: "50px", border: "4px solid var(--line)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <h2 style={{ fontFamily: "Georgia, serif" }}>Loading EduLearn Dashboard...</h2>
      </div>
    );
  }

  if (!state.isLoggedIn) {
    return (
      <Shell state={state} updateState={updateState}>
        <LoginHero onStart={() => updateState({ isLoggedIn: true })} progress={progress} />
      </Shell>
    );
  }

  if (!state.profileReady) {
    return (
      <Shell state={state} updateState={updateState}>
        <ProfileSetup state={state} updateState={updateState} />
      </Shell>
    );
  }

  return (
    <Shell state={state} updateState={updateState}>
      <div className="app-shell">
        <Sidebar
          state={state}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          progress={progress}
          badges={badges}
        />
        <main className="workspace">
          <Topbar state={state} updateState={updateState} progress={progress} onReset={handleReset} />
          {activeTab === "dashboard" && (
            <Dashboard
              state={state}
              progress={progress}
              completedCount={completedCount}
              allLessons={allLessons}
              activeLesson={activeLesson}
              badges={badges}
              gradebook={gradebook}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "lessons" && (
            <Lessons
              state={state}
              updateState={updateState}
              activeLesson={activeLesson}
              progress={progress}
              toggleLesson={toggleLesson}
              saveVideoProgress={saveVideoProgress}
              setActiveTab={setActiveTab}
              completedCount={completedCount}
              allLessons={allLessons}
              modules={backendModules}
            />
          )}
          {activeTab === "quiz" && (
            <Quiz
              state={state}
              quizStep={quizStep}
              setQuizStep={(step) => {
                setQuizStep(step);
                syncState({ quizStep: step });
              }}
              answerQuiz={answerQuiz}
              quizScore={quizScore}
              quizPercent={quizPercent}
              updateState={updateState}
              submitQuiz={submitQuiz}
              quizQuestions={backendQuizQuestions}
            />
          )}
          {activeTab === "gradebook" && <Gradebook gradebook={gradebook} />}
          {activeTab === "forum" && (
            <Forum
              activeLesson={activeLesson}
              threads={backendForumThreads}
              onAddThread={addForumQuestion}
              onAddReply={addForumReply}
              onDeleteThread={deleteForumThread}
            />
          )}
          {activeTab === "profile" && (
            <Profile
              state={state}
              updateState={updateState}
            />
          )}
        </main>
      </div>
    </Shell>
  );
}

function Shell({ children, state, updateState }) {
  return (
    <div className="page">
      <button
        className="theme-float icon-btn"
        aria-label="Toggle theme"
        onClick={() => updateState({ theme: state.theme === "light" ? "dark" : "light" })}
      >
        {state.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
      {children}
    </div>
  );
}

function LoginHero({ onStart, progress }) {
  return (
    <section className="hero-card">
      <nav className="hero-nav">
        <div className="brand">EduLearn</div>
        <div className="nav-links">
          <span>For Students</span>
          <span>Courses</span>
          <span>Gradebook</span>
          <button className="outline-btn">Login</button>
        </div>
      </nav>
      <div className="hero-stage">
        <FloatingWidget className="widget-progress" title="Course Progress" icon={<BarChart3 size={15} />}>
          <strong>{progress}%</strong>
          <div className="mini-bar"><span style={{ width: `${progress}%` }} /></div>
          <small>React JS Semester II</small>
        </FloatingWidget>
        <FloatingWidget className="widget-score" title="Quiz Score" icon={<ClipboardCheck size={15} />}>
          <strong>91%</strong>
          <small>Last guided check</small>
        </FloatingWidget>
        <FloatingWidget className="widget-list" title="Lesson Checklist" icon={<Check size={15} />}>
          <ul>
            <li>Video marker saved</li>
            <li>Badge unlocked</li>
            <li>Forum linked</li>
          </ul>
        </FloatingWidget>
        <FloatingWidget className="widget-flow" title="Workflow" icon={<ShieldCheck size={15} />}>
          <ol>
            <li>Login</li>
            <li>Profile</li>
            <li>Learn</li>
            <li>Quiz</li>
          </ol>
        </FloatingWidget>
        <div className="doodle doodle-left">178%</div>
        <div className="doodle doodle-top">JS</div>
        <div className="doodle doodle-right">A+</div>
        <div className="hero-copy">
          <p className="eyebrow">ITM Skills University</p>
          <h1>Supercharge your course journey</h1>
          <p>
            A student control panel for tracking lessons, resuming videos, taking guided quizzes,
            earning badges, and checking grades without losing focus.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={onStart}>
              Start learning <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="hero-footer">
        <span />
        <strong>Built for React JS Semester II course control panels</strong>
        <span />
      </div>
    </section>
  );
}

function FloatingWidget({ className, title, icon, children }) {
  return (
    <div className={`floating-widget ${className}`}>
      <div className="widget-title">{icon}{title}</div>
      {children}
    </div>
  );
}

function ProfileSetup({ state, updateState }) {
  const [profile, setProfile] = useState(state.profile);
  const coursesOptions = [
    { id: "react-js", title: "React JS Control Panel" },
    { id: "dsa-java", title: "Data Structures & Algorithms" },
    { id: "full-stack", title: "Full-Stack Web Development" }
  ];
  const fields = [
    ["name", "Student name"],
    ["email", "Email"],
    ["branch", "Branch"],
    ["semester", "Semester"],
    ["goal", "Learning goal"],
  ];

  return (
    <section className="profile-page">
      <div className="profile-intro">
        <p className="eyebrow">Step 2</p>
        <h1>Create your learning profile</h1>
        <p>
          Fill out your details and select the course you want to enroll in to customize your control panel.
        </p>
      </div>
      <form
        className="profile-card"
        onSubmit={(event) => {
          event.preventDefault();
          updateState({ profile, profileReady: true });
        }}
      >
        <div className="avatar-preview">{profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
        {fields.map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            {key === "goal" ? (
              <textarea value={profile[key] || ""} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} required />
            ) : (
              <input value={profile[key] || ""} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} required />
            )}
          </label>
        ))}
        <label>
          <span>Select Enrolled Course</span>
          <select 
            value={profile.courseId || "react-js"} 
            onChange={(e) => {
              const cid = e.target.value;
              const title = coursesOptions.find(c => c.id === cid).title;
              setProfile({ ...profile, courseId: cid, course: title });
            }}
            style={{ width: "100%", padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)" }}
          >
            {coursesOptions.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
        <button className="primary-btn" type="submit" style={{ marginTop: "10px" }}>
          Build my dashboard <ChevronRight size={18} />
        </button>
      </form>
    </section>
  );
}

function Sidebar({ state, activeTab, setActiveTab, progress, badges }) {
  const navItems = [
    ["dashboard", "Dashboard", BarChart3],
    ["lessons", "Lessons", Video],
    ["quiz", "Guided Quiz", ClipboardCheck],
    ["gradebook", "Gradebook", Trophy],
    ["forum", "Q&A Forum", MessageCircle],
    ["profile", "Profile & Courses", UserRound],
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand sidebar-brand">EduLearn</div>
        <div className="student-chip">
          <div className="avatar-small">{state.profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
          <div>
            <strong>{state.profile.name}</strong>
            <span>{state.profile.branch}</span>
          </div>
        </div>
      </div>
      <nav className="side-nav">
        {navItems.map(([id, label, Icon]) => (
          <button
            key={id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-card">
        <span>Course Progress</span>
        <strong>{progress}%</strong>
        <div className="mini-bar"><span style={{ width: `${progress}%` }} /></div>
        <small>{badges.filter((badge) => badge.unlocked).length} badges unlocked</small>
      </div>
    </aside>
  );
}

function Topbar({ state, updateState, progress, onReset }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">React JS Semester II</p>
        <h2>{state.profile.course}</h2>
      </div>
      <div className="topbar-actions">
        <div className="search-box"><Search size={17} />Search lessons</div>
        <div className="status-pill">{progress}% complete</div>
        <button 
          className="outline-btn" 
          style={{ background: "var(--yellow)", color: "#24211e", fontSize: "0.82rem", padding: "0 12px", minHeight: "34px" }} 
          onClick={onReset}
        >
          Reset Course Progress
        </button>
        <button className="icon-btn" aria-label="Log out" onClick={() => updateState({ isLoggedIn: false })}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function Dashboard({ progress, completedCount, allLessons, activeLesson, badges, gradebook, setActiveTab }) {
  const average = gradebook.length > 0 
    ? Math.round(gradebook.reduce((sum, row) => sum + row.score, 0) / gradebook.length) 
    : 0;

  return (
    <section className="content-stack">
      <div className="dashboard-grid">
        <MetricCard label="Overall Progress" value={`${progress}%`} icon={<BarChart3 />} />
        <MetricCard label="Lessons Finished" value={`${completedCount}/${allLessons.length}`} icon={<Check />} />
        <MetricCard label="Grade Average" value={`${average}%`} icon={<Trophy />} />
        <MetricCard label="Unlocked Badges" value={badges.filter((badge) => badge.unlocked).length} icon={<Award />} />
      </div>
      <div className="two-column">
        <section className="panel hero-panel">
          <div>
            <p className="eyebrow">Continue learning</p>
            <h3>{activeLesson.title}</h3>
            <p>{activeLesson.notes}</p>
          </div>
          <button className="primary-btn" onClick={() => setActiveTab("lessons")}>
            Continue course <Play size={18} />
          </button>
        </section>
        <section className="panel">
          <p className="eyebrow">Instant Badge Generator</p>
          <div className="badge-grid">
            {badges.map((badge) => (
              <div 
                className={`badge-item ${badge.unlocked ? "unlocked" : ""}`} 
                key={badge.title}
                data-tooltip={`Unlock: ${badge.criteria}`}
              >
                {badge.unlocked ? <Sparkles size={18} /> : <Lock size={18} />}
                <strong>{badge.title}</strong>
                <span>{badge.detail}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Gradebook snapshot</p>
            <h3>Recent results</h3>
          </div>
          <button className="outline-btn" onClick={() => setActiveTab("gradebook")}>Open gradebook</button>
        </div>
        <GradeTable rows={gradebook.slice(0, 5)} compact />
      </section>
    </section>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Lessons({
  state,
  updateState,
  activeLesson,
  progress,
  toggleLesson,
  saveVideoProgress,
  setActiveTab,
  completedCount,
  allLessons,
  modules,
}) {
  const marker = state.videoMarkers[activeLesson.id] || 0;
  const canTakeQuiz = Boolean(state.completedLessons[activeLesson.id]);
  const allComplete = completedCount === allLessons.length;
  
  const videoRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  // Check if current active lesson is locked
  const activeIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const isLocked = activeLesson.permission === "lesson-complete" && prevLesson && !state.completedLessons[prevLesson.id];

  useEffect(() => {
    const video = videoRef.current;
    if (video && !isLocked) {
      const handleLoadedMetadata = () => {
        const savedTime = state.videoMarkers[activeLesson.id] || 0;
        video.currentTime = savedTime;
        lastSavedTimeRef.current = savedTime;
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.load();

      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [activeLesson.id, isLocked]);

  const handleTimeUpdate = (e) => {
    const currentTime = Math.round(e.target.currentTime);
    if (currentTime !== lastSavedTimeRef.current && currentTime % 3 === 0) {
      lastSavedTimeRef.current = currentTime;
      saveVideoProgress(activeLesson.id, currentTime);
    }
  };

  const handleVideoPause = (e) => {
    const currentTime = Math.round(e.target.currentTime);
    lastSavedTimeRef.current = currentTime;
    saveVideoProgress(activeLesson.id, currentTime);
  };

  return (
    <section className="lesson-layout">
      <div className="panel lesson-list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Expandable lesson list</p>
            <h3>Course modules</h3>
          </div>
          <span className="status-pill">{progress}%</span>
        </div>
        {modules.map((module) => {
          const moduleDone = module.lessons.filter((lesson) => state.completedLessons[lesson.id]).length;
          const moduleProgress = Math.round((moduleDone / module.lessons.length) * 100);
          const expanded = state.expandedModules[module.id];
          return (
            <article className="module-block" key={module.id}>
              <button
                className="module-toggle"
                onClick={() =>
                  updateState({
                    expandedModules: { ...state.expandedModules, [module.id]: !expanded },
                  })
                }
              >
                {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <div>
                  <strong>{module.title}</strong>
                  <span>{module.description}</span>
                </div>
                <em>{moduleProgress}%</em>
              </button>
              <div className="mini-bar"><span style={{ width: `${moduleProgress}%` }} /></div>
              {expanded && (
                <div className="lesson-items">
                  {module.lessons.map((lesson) => {
                    const idx = allLessons.findIndex((l) => l.id === lesson.id);
                    const prevL = idx > 0 ? allLessons[idx - 1] : null;
                    const lessonLocked = lesson.permission === "lesson-complete" && prevL && !state.completedLessons[prevL.id];
                    return (
                      <button
                        key={lesson.id}
                        className={`lesson-row ${activeLesson.id === lesson.id ? "selected" : ""}`}
                        onClick={() => updateState({ activeLessonId: lesson.id })}
                      >
                        <span
                          className={`check-dot ${state.completedLessons[lesson.id] ? "done" : ""}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!lessonLocked) {
                              toggleLesson(lesson.id);
                            }
                          }}
                          style={{ cursor: lessonLocked ? "not-allowed" : "pointer" }}
                        >
                          {state.completedLessons[lesson.id] && <Check size={14} />}
                        </span>
                        <div className="lesson-row-wrapper">
                          <div>
                            <strong>{lesson.title}</strong>
                            <span>{lesson.duration} min video</span>
                          </div>
                          {lessonLocked && (
                            <span className="lesson-row-lock-icon" title="Locked: Complete previous lesson first">
                              <Lock size={13} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="content-stack">
        <section className="panel video-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Video progress marker</p>
              <h3>{activeLesson.title}</h3>
            </div>
            <span className="status-pill">{isLocked ? "locked" : `${formatTime(marker)} saved`}</span>
          </div>
          <div className="video-player-container" style={{ position: "relative", border: "2px solid var(--line)", borderRadius: "8px", overflow: "hidden", background: "#000", minHeight: "260px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--small-shadow)" }}>
            {isLocked ? (
              <div className="locked-video-overlay">
                <Lock size={42} />
                <h3>Lesson Locked</h3>
                <p>Please complete the previous lesson to unlock this video:</p>
                <strong style={{ display: "block", marginTop: "8px", color: "var(--accent)" }}>
                  {prevLesson ? prevLesson.title : "Previous Lesson"}
                </strong>
              </div>
            ) : activeLesson.videoUrl ? (
              <video
                ref={videoRef}
                src={activeLesson.videoUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
                onPause={handleVideoPause}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            ) : (
              <div style={{ color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <Play size={42} />
                <span>No video available for this lesson</span>
              </div>
            )}
          </div>
          {!isLocked && (
            <div className="video-controls" style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
              <button className="outline-btn" onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}>
                -10s
              </button>
              <button className="outline-btn" onClick={() => {
                if (videoRef.current) videoRef.current.currentTime += 30;
              }}>
                +30s
              </button>
              <button className="outline-btn" onClick={() => {
                const saved = state.videoMarkers[activeLesson.id] || 0;
                if (videoRef.current) videoRef.current.currentTime = saved;
              }}>
                Resume from Saved ({formatTime(state.videoMarkers[activeLesson.id] || 0)})
              </button>
            </div>
          )}
          <p className="lesson-note">{activeLesson.notes}</p>
        </section>
        <section className="panel">
          <p className="eyebrow">Student Access Center</p>
          <div className="access-grid">
            <AccessButton unlocked icon={<BookOpen />} title="Open notes" detail="Available to enrolled students" />
            <AccessButton
              unlocked={canTakeQuiz && !isLocked}
              icon={<ClipboardCheck />}
              title="Start quiz"
              detail={isLocked ? "Lesson locked" : canTakeQuiz ? "Lesson complete" : "Finish lesson to unlock"}
              onClick={() => canTakeQuiz && !isLocked && setActiveTab("quiz")}
            />
            <AccessButton
              unlocked={!isLocked}
              icon={<MessageCircle />}
              title="Q&A shortcut"
              detail={isLocked ? "Lesson locked" : "Jump to current lesson forum"}
              onClick={() => !isLocked && setActiveTab("forum")}
            />
            <AccessButton
              unlocked={allComplete}
              icon={<GraduationCap />}
              title="Certificate"
              detail={allComplete ? "Ready to claim" : "Complete all lessons"}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

function AccessButton({ unlocked, icon, title, detail, onClick }) {
  return (
    <button className={`access-card ${unlocked ? "unlocked" : ""}`} disabled={!unlocked} onClick={onClick}>
      {unlocked ? icon : <Lock size={20} />}
      <strong>{title}</strong>
      <span>{detail}</span>
    </button>
  );
}

function Quiz({ state, quizStep, setQuizStep, answerQuiz, quizScore, quizPercent, updateState, submitQuiz, quizQuestions }) {
  if (!quizQuestions || quizQuestions.length === 0) return null;
  const current = quizQuestions[quizStep];
  const isReview = quizStep >= quizQuestions.length;
  const completeAnswers = quizQuestions.every((question) => state.quizAnswers[question.id]);

  return (
    <section className="panel quiz-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Guided Quiz Creator</p>
          <h3>Multi-step knowledge check</h3>
        </div>
        <span className="status-pill">Step {Math.min(quizStep + 1, quizQuestions.length)} of {quizQuestions.length}</span>
      </div>
      <div className="quiz-progress">
        {quizQuestions.map((question, index) => (
          <span key={question.id} className={index <= quizStep ? "active" : ""} />
        ))}
      </div>
      {!isReview ? (
        <div className="quiz-question">
          <h2>{current.question}</h2>
          <div className="option-grid">
            {current.options.map((option) => (
              <button
                key={option}
                className={state.quizAnswers[current.id] === option ? "selected" : ""}
                onClick={() => answerQuiz(current.id, option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="quiz-actions">
            <button className="outline-btn" disabled={quizStep === 0} onClick={() => setQuizStep(quizStep - 1)}>Back</button>
            <button
              className="primary-btn"
              disabled={!state.quizAnswers[current.id]}
              onClick={() => setQuizStep(quizStep + 1)}
            >
              Save and continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-result">
          <Trophy size={48} />
          <h2>{state.quizSubmitted ? `Score saved: ${quizPercent}%` : "Review your answers"}</h2>
          <p>
            {completeAnswers
              ? `You answered ${quizScore} of ${quizQuestions.length} correctly. Answers are saved persistently.`
              : "Some answers are still missing. Go back and complete each step before submitting."}
          </p>
          <div className="review-list">
            {quizQuestions.map((question) => (
              <div key={question.id}>
                <strong>{question.question}</strong>
                <span>Your answer: {state.quizAnswers[question.id] || "Not answered"}</span>
              </div>
            ))}
          </div>
          <div className="quiz-actions">
            <button className="outline-btn" onClick={() => setQuizStep(0)}>Edit answers</button>
            <button
              className="primary-btn"
              disabled={!completeAnswers}
              onClick={submitQuiz}
            >
              Submit quiz <Check size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Gradebook({ gradebook }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter rows
  const filteredRows = useMemo(() => {
    return gradebook.filter(row => 
      row.title.toLowerCase().includes(search.toLowerCase()) ||
      row.module.toLowerCase().includes(search.toLowerCase())
    );
  }, [gradebook, search]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "score") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRows, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lag-free gradebook</p>
          <h3>Assessment history</h3>
        </div>
        <span className="status-pill">{sortedRows.length} rows</span>
      </div>

      <div className="gradebook-search-container">
        <input
          type="text"
          className="gradebook-search-input"
          placeholder="Search assessments or modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <GradeTable 
        rows={sortedRows} 
        sortBy={sortBy} 
        sortOrder={sortOrder} 
        onSort={handleSort} 
      />
    </section>
  );
}

function GradeTable({ rows, compact = false, sortBy = "", sortOrder = "", onSort = null }) {
  const renderHeader = (label, field) => {
    if (compact || !onSort) {
      return <th>{label}</th>;
    }
    const isCurrent = sortBy === field;
    return (
      <th className="sortable" onClick={() => onSort(field)}>
        {label}
        {isCurrent && (
          <span className="sort-indicator">
            {sortOrder === "asc" ? " ▲" : " ▼"}
          </span>
        )}
      </th>
    );
  };

  return (
    <div className={`table-wrap ${compact ? "compact" : ""}`}>
      <table>
        <thead>
          <tr>
            {renderHeader("Assessment", "title")}
            {renderHeader("Module", "module")}
            {renderHeader("Date", "date")}
            {renderHeader("Score", "score")}
            {renderHeader("Status", "status")}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>{row.module}</td>
                <td>{row.date}</td>
                <td><strong>{row.score}%</strong></td>
                <td><span className={`result ${row.status === "Passed" ? "pass" : "review"}`}>{row.status}</span></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "30px 10px" }}>
                No matching assessment records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Forum({ activeLesson, threads, onAddThread, onAddReply, onDeleteThread }) {
  const [question, setQuestion] = useState("");
  const [expandedThreadId, setExpandedThreadId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    onAddThread(activeLesson.id, question.trim());
    setQuestion("");
  };

  const handleReplySubmit = (e, threadId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(activeLesson.id, threadId, replyText.trim());
    setReplyText("");
  };

  const activeThreads = threads[activeLesson.id] || [];

  return (
    <section className="panel forum-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Q&A shortcut</p>
          <h3>{activeLesson.title} discussion</h3>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Ask a new question about this lesson..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          style={{ flex: 1, padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", color: "var(--ink)" }}
        />
        <button type="submit" className="primary-btn" style={{ minHeight: "unset", height: "42px" }}>
          Post Question
        </button>
      </form>
      <div className="thread-list">
        {activeThreads.length > 0 ? (
          activeThreads.map((thread, index) => {
            const isExpanded = expandedThreadId === thread.id;
            const comments = thread.comments || [];
            return (
              <article 
                className={`thread-card ${isExpanded ? "expanded" : ""}`} 
                key={thread.id || index}
                style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr auto" }}
                onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
              >
                <div className="avatar-small">{index + 1}</div>
                <div style={{ textAlign: "left" }}>
                  <strong>{thread.title}</strong>
                  <p style={{ fontSize: "0.82rem", margin: "3px 0 0", color: "var(--muted)" }}>
                    {comments.length > 0 
                      ? `Last reply: "${comments[comments.length - 1].text.slice(0, 45)}${comments[comments.length - 1].text.length > 45 ? "..." : ""}"` 
                      : "No replies yet. Click to view thread and reply."}
                  </p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: "bold" }}>
                    {comments.length} replies
                  </span>
                  <button 
                    className="thread-delete-btn" 
                    title="Delete thread"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this thread?")) {
                        onDeleteThread(activeLesson.id, thread.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                    {comments.map((comment) => (
                      <div className="comment-item" key={comment.id}>
                        <div className="comment-item-avatar">
                          {comment.author.split(" ").map(p => p[0]).join("").slice(0, 2)}
                        </div>
                        <div className="comment-item-body">
                          <strong>{comment.author}</strong>
                          <p>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    
                    <form onSubmit={(e) => handleReplySubmit(e, thread.id)} className="reply-form">
                      <input
                        type="text"
                        className="reply-input"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                      />
                      <button type="submit" className="primary-btn reply-btn">
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--muted)", border: "2px dashed var(--soft-line)", borderRadius: "8px" }}>
            No discussion threads yet for this lesson. Be the first to ask a question!
          </div>
        )}
      </div>
    </section>
  );
}

function Profile({ state, updateState }) {
  const [profile, setProfile] = useState(state.profile);
  const coursesOptions = [
    { id: "react-js", title: "React JS Control Panel" },
    { id: "dsa-java", title: "Data Structures & Algorithms" },
    { id: "full-stack", title: "Full-Stack Web Development" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const isCourseChanged = profile.courseId !== state.profile.courseId;
    const patch = {
      profile,
      ...(isCourseChanged ? {
        completedLessons: {},
        videoMarkers: {},
        quizAnswers: {},
        quizSubmitted: false,
        quizStep: 0,
        activeLessonId: profile.courseId === "react-js" ? "l2" : "l1"
      } : {})
    };
    updateState(patch);
    alert("Profile and Course Selection saved!");
  };

  return (
    <section className="panel" style={{ width: "100%" }}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">User profile settings</p>
          <h3>Manage Enrolled Courses</h3>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <label style={{ display: "grid", gap: "7px" }}>
            <span>Student Name</span>
            <input value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required style={{ padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", width: "100%" }} />
          </label>
          <label style={{ display: "grid", gap: "7px" }}>
            <span>Email Address</span>
            <input value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required style={{ padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", width: "100%" }} />
          </label>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <label style={{ display: "grid", gap: "7px" }}>
            <span>Branch / Division</span>
            <input value={profile.branch || ""} onChange={(e) => setProfile({ ...profile, branch: e.target.value })} required style={{ padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", width: "100%" }} />
          </label>
          <label style={{ display: "grid", gap: "7px" }}>
            <span>Semester</span>
            <input value={profile.semester || ""} onChange={(e) => setProfile({ ...profile, semester: e.target.value })} required style={{ padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", width: "100%" }} />
          </label>
        </div>

        <label style={{ display: "grid", gap: "7px" }}>
          <span>Active Enrolled Course</span>
          <select 
            value={profile.courseId || "react-js"} 
            onChange={(e) => {
              const cid = e.target.value;
              const title = coursesOptions.find(c => c.id === cid).title;
              setProfile({ ...profile, courseId: cid, course: title });
            }}
            style={{ width: "100%", padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", color: "var(--ink)" }}
          >
            {coursesOptions.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "7px" }}>
          <span>What you want to learn (Learning Goal)</span>
          <textarea value={profile.goal || ""} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} required style={{ padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", minHeight: "100px", width: "100%" }} />
        </label>
        
        <button type="submit" className="primary-btn" style={{ justifySelf: "start", padding: "0 24px", minHeight: "42px" }}>
          Save Profile & Course Setup
        </button>
      </form>
    </section>
  );
}

export default App;
