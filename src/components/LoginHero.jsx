import React from "react";
import { ChevronRight, BarChart3, ClipboardCheck, Check, ShieldCheck } from "lucide-react";

// Floating widgets displayed inside the LoginHero stage
function FloatingWidget({ className, title, icon, children }) {
  return (
    <div className={`floating-widget ${className}`}>
      <div className="widget-title">{icon}{title}</div>
      {children}
    </div>
  );
}

// First screen shown to anonymous users, promoting features with mocked visual cards
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

export default LoginHero;
export { FloatingWidget };
