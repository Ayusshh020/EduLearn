import React from "react";
import { Moon, Sun } from "lucide-react";

// Outer Shell wrapper component that handles global layouts and theme selection toggling
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

export default Shell;
