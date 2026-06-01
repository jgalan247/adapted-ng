/**
 * HomeView — landing page that frames the flow correctly:
 *   Create OR Adapt (Quiz is a sub-choice of either) → then optionally Convert.
 */
function HomeView({ goTo, profile, featuredPreset, applyPreset }) {
  const conditionsLabel = profile.conditions
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' '))
    .join(', ')

  const tryFeatured = () => {
    if (featuredPreset && applyPreset) {
      applyPreset(featuredPreset)
      goTo('adapt')
    }
  }

  return (
    <div className="home-view">
      <div className="home-intro">
        <h2 className="home-title">What would you like to do?</h2>
        <p className="home-subtitle">
          Adapting for <strong>{conditionsLabel}</strong> · {profile.subject} ·{' '}
          {profile.keyStage.toUpperCase()} · <em>{profile.abilitySet || 'mixed'} ability</em>
        </p>
      </div>

      {featuredPreset && (
        <div className="home-featured" onClick={tryFeatured} role="button" tabIndex={0}
             onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && tryFeatured()}>
          <div className="home-featured-badge">⭐ Demo preset</div>
          <h3 className="home-featured-title">Adapt a Corbettmaths PDF for a bottom-set student</h3>
          <p className="home-featured-desc">
            <strong>Maths · KS4 · Bottom set.</strong> Loads a hand-tuned profile with
            18 features specifically chosen for a student who is dyslexic + ADHD + EAL:
            minimal visual clutter, literal language, pre-taught vocabulary with visual cards,
            worked examples, real-world contexts, low-stakes practice. Open the
            <em> Edit features </em> button after loading to see (and tweak) every choice.
          </p>
          <span className="home-featured-link">One-click setup →</span>
        </div>
      )}

      <div className="home-cards">
        {/* CREATE */}
        <button className="home-card" onClick={() => goTo('create')}>
          <div className="home-card-icon">✏️</div>
          <h3 className="home-card-title">Create something new</h3>
          <p className="home-card-desc">
            Generate a worksheet, lesson plan, slide deck, handout or revision guide
            from scratch.
          </p>
          <div className="home-card-chips">
            <span className="chip">Worksheet</span>
            <span className="chip">Lesson Plan</span>
            <span className="chip">Presentation</span>
            <span className="chip">Revision Guide</span>
          </div>
          <div className="home-card-link">Start creating →</div>
        </button>

        {/* ADAPT */}
        <button className="home-card" onClick={() => goTo('adapt')}>
          <div className="home-card-icon">🔄</div>
          <h3 className="home-card-title">Adapt something you have</h3>
          <p className="home-card-desc">
            Paste a resource you already use and make it accessible for your students.
          </p>
          <div className="home-card-chips">
            <span className="chip">Worksheet</span>
            <span className="chip">Handout</span>
            <span className="chip">Presentation</span>
            <span className="chip">Revision Guide</span>
          </div>
          <div className="home-card-link">Start adapting →</div>
        </button>
      </div>

      {/* Quiz sub-choice — presented under Create/Adapt, not as a primary card */}
      <div className="home-quiz">
        <span className="home-quiz-label">📝 Just need a quiz or test?</span>
        <button className="home-quiz-btn" onClick={() => goTo('quiz')}>
          Make a quiz →
        </button>
      </div>

      {/* Convert — secondary, downstream action */}
      <div className="home-secondary">
        <span className="home-secondary-label">Already have Copilot's output?</span>
        <button className="home-secondary-btn" onClick={() => goTo('convert')}>
          📄 Format it as Word / PDF →
        </button>
      </div>

      <div className="home-flow-hint">
        <strong>How it works:</strong> Create or Adapt builds a prompt → paste into{' '}
        <strong>Microsoft Copilot</strong> → bring the result back to <em>Format it</em>{' '}
        for a Word/PDF download with dyslexia-friendly styling baked in.
      </div>
    </div>
  )
}

export default HomeView
