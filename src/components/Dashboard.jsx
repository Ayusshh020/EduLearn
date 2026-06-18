import React from "react";
import { Award, BarChart3, Check, Lock, Play, Sparkles, Trophy } from "lucide-react";
import { GradeTable } from "./Gradebook";

// Metric card block for key stats on the dashboard
function MetricCard({ label, value, icon }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

// Primary student dashboard displaying performance indicators, resume buttons, unlocked badges, and grade highlights
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

export default Dashboard;
export { MetricCard };
