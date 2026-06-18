import React from "react";
import { BarChart3, Video, ClipboardCheck, Trophy, MessageCircle, UserRound } from "lucide-react";

// Sidebar navigation component presenting profile quick-stats, tab routing buttons, and cumulative progress
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

export default Sidebar;
