import React, { useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Check, Lock, Play, BookOpen, ClipboardCheck, MessageCircle, GraduationCap } from "lucide-react";
import { formatTime } from "../constants/courseData";

// Access center buttons displayed under the active lesson video
function AccessButton({ unlocked, icon, title, detail, onClick }) {
  return (
    <button className={`access-card ${unlocked ? "unlocked" : ""}`} disabled={!unlocked} onClick={onClick}>
      {unlocked ? icon : <Lock size={20} />}
      <strong>{title}</strong>
      <span>{detail}</span>
    </button>
  );
}

// Lessons workspace component containing the sidebar module tree and active video player
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

export default Lessons;
export { AccessButton };
