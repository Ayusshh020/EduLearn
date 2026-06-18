// Local storage key and API endpoint configuration for state persistence
export const STORAGE_KEY = "edulearn:v1";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// Hardcoded default syllabus data fallback when API is unreachable
export const modules = [
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

// Default quiz questions for student self-assessments
export const quizQuestions = [
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

// Base mockup gradebook data populated upon dashboard initialization
export const baseGradebook = [
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

// Thread subjects mapping to lessons for the community Q&A section
export const forumThreads = {
  l1: ["How will lesson progress be calculated?", "Can badges be reset for demo?"],
  l2: ["When should I split a component?", "Do props update automatically?"],
  l3: ["Why does state update feel delayed?", "Best way to handle checkbox progress?"],
  l4: ["Should progress count video or checklist first?", "How do resume markers work?"],
  l5: ["Can quiz answers autosave?", "What happens if I refresh during a quiz?"],
  l6: ["How can dense tables stay smooth?", "Should the gradebook have sticky headers?"],
  l7: ["Which features matter most in the final demo?", "How do I explain access permissions?"],
};

// Default baseline student state structure
export const defaultState = {
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

// Retrieves initial student state by merging defaults with localStorage cache
export function getInitialState() {
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

// Utility to format raw seconds into a readable MM:SS layout
export function formatTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

// Flat-maps all syllabus lessons from the module structures
export function getAllLessons() {
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title, moduleId: module.id })),
  );
}
