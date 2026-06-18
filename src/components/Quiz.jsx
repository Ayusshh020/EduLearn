import React from "react";
import { Trophy, ChevronRight, Check } from "lucide-react";

// Guided step-by-step quiz screen evaluating user understanding
function Quiz({ state, quizStep, setQuizStep, answerQuiz, quizScore, quizPercent, updateState, submitQuiz, quizQuestions }) {
  if (!quizQuestions || quizQuestions.length === 0) return null;
  const current = quizQuestions[quizStep];
  const isReview = quizStep >= quizQuestions.length;
  const completeAnswers = quizQuestions.every((question) => state.quizAnswers[question.id]);

  return (
    <section className="panel quiz-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Guided Quiz Creator</p>
          <h3>Multi-step knowledge check</h3>
        </div>
        <span className="status-pill">Step {Math.min(quizStep + 1, quizQuestions.length)} of {quizQuestions.length}</span>
      </div>
      <div className="quiz-progress">
        {quizQuestions.map((question, index) => (
          <span key={question.id} className={index <= quizStep ? "active" : ""} />
        ))}
      </div>
      {!isReview ? (
        <div className="quiz-question">
          <h2>{current.question}</h2>
          <div className="option-grid">
            {current.options.map((option) => (
              <button
                key={option}
                className={state.quizAnswers[current.id] === option ? "selected" : ""}
                onClick={() => answerQuiz(current.id, option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="quiz-actions">
            <button className="outline-btn" disabled={quizStep === 0} onClick={() => setQuizStep(quizStep - 1)}>Back</button>
            <button
              className="primary-btn"
              disabled={!state.quizAnswers[current.id]}
              onClick={() => setQuizStep(quizStep + 1)}
            >
              Save and continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-result">
          <Trophy size={48} />
          <h2>{state.quizSubmitted ? `Score saved: ${quizPercent}%` : "Review your answers"}</h2>
          <p>
            {completeAnswers
              ? `You answered ${quizScore} of ${quizQuestions.length} correctly. Answers are saved persistently.`
              : "Some answers are still missing. Go back and complete each step before submitting."}
          </p>
          <div className="review-list">
            {quizQuestions.map((question) => (
              <div key={question.id}>
                <strong>{question.question}</strong>
                <span>Your answer: {state.quizAnswers[question.id] || "Not answered"}</span>
              </div>
            ))}
          </div>
          <div className="quiz-actions">
            <button className="outline-btn" onClick={() => setQuizStep(0)}>Edit answers</button>
            <button
              className="primary-btn"
              disabled={!completeAnswers}
              onClick={submitQuiz}
            >
              Submit quiz <Check size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Quiz;
