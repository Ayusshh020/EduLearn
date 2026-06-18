import React, { useState } from "react";

// Profile details setup pane permitting dynamic user-profile customization and enrollment updates
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

export default Profile;
