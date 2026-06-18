// EduLearn Dashboard Application - Main Entry Component
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  STORAGE_KEY,
  API_BASE_URL,
  modules,
  quizQuestions,
  baseGradebook,
  forumThreads,
  getInitialState,
} from "./constants/courseData";
import {
  Shell,
  LoginHero,
  ProfileSetup,
  Sidebar,
  Topbar,
  Dashboard,
  Lessons,
  Quiz,
  Gradebook,
  Forum,
  Profile,
} from "./components";

// Main App container: coordinates state syncing, backend requests, and tab routing
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

export default App;
