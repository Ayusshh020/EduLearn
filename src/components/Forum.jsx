import React, { useState } from "react";
import { Trash2 } from "lucide-react";

// Lesson Q&A board containing multiple nested query comment loops
function Forum({ activeLesson, threads, onAddThread, onAddReply, onDeleteThread }) {
  const [question, setQuestion] = useState("");
  const [expandedThreadId, setExpandedThreadId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    onAddThread(activeLesson.id, question.trim());
    setQuestion("");
  };

  const handleReplySubmit = (e, threadId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(activeLesson.id, threadId, replyText.trim());
    setReplyText("");
  };

  const activeThreads = threads[activeLesson.id] || [];

  return (
    <section className="panel forum-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Q&A shortcut</p>
          <h3>{activeLesson.title} discussion</h3>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Ask a new question about this lesson..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          style={{ flex: 1, padding: "12px", border: "2px solid var(--line)", borderRadius: "7px", background: "var(--surface-strong)", color: "var(--ink)" }}
        />
        <button type="submit" className="primary-btn" style={{ minHeight: "unset", height: "42px" }}>
          Post Question
        </button>
      </form>
      <div className="thread-list">
        {activeThreads.length > 0 ? (
          activeThreads.map((thread, index) => {
            const isExpanded = expandedThreadId === thread.id;
            const comments = thread.comments || [];
            return (
              <article 
                className={`thread-card ${isExpanded ? "expanded" : ""}`} 
                key={thread.id || index}
                style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr auto" }}
                onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
              >
                <div className="avatar-small">{index + 1}</div>
                <div style={{ textAlign: "left" }}>
                  <strong>{thread.title}</strong>
                  <p style={{ fontSize: "0.82rem", margin: "3px 0 0", color: "var(--muted)" }}>
                    {comments.length > 0 
                      ? `Last reply: "${comments[comments.length - 1].text.slice(0, 45)}${comments[comments.length - 1].text.length > 45 ? "..." : ""}"` 
                      : "No replies yet. Click to view thread and reply."}
                  </p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: "bold" }}>
                    {comments.length} replies
                  </span>
                  <button 
                    className="thread-delete-btn" 
                    title="Delete thread"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this thread?")) {
                        onDeleteThread(activeLesson.id, thread.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                    {comments.map((comment) => (
                      <div className="comment-item" key={comment.id}>
                        <div className="comment-item-avatar">
                          {comment.author.split(" ").map(p => p[0]).join("").slice(0, 2)}
                        </div>
                        <div className="comment-item-body">
                          <strong>{comment.author}</strong>
                          <p>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    
                    <form onSubmit={(e) => handleReplySubmit(e, thread.id)} className="reply-form">
                      <input
                        type="text"
                        className="reply-input"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                      />
                      <button type="submit" className="primary-btn reply-btn">
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--muted)", border: "2px dashed var(--soft-line)", borderRadius: "8px" }}>
            No discussion threads yet for this lesson. Be the first to ask a question!
          </div>
        )}
      </div>
    </section>
  );
}

export default Forum;
