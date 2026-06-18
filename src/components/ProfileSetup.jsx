import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

// Enrollment setup screen allowing user to input initial profile info and select a course
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

export default ProfileSetup;
