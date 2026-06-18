import React from "react";
import { Search, LogOut } from "lucide-react";

// Top navigation header bar featuring title info, progress indicators, search bar, and reset capabilities
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

export default Topbar;
