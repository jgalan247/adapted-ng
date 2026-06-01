import { useState } from 'react'

const CONDITIONS = [
  { value: 'autism', label: 'Autism' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'dyslexia', label: 'Dyslexia' },
  { value: 'dyscalculia', label: 'Dyscalculia' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'visual_processing', label: 'Visual Processing' },
  { value: 'working_memory', label: 'Working Memory' },
  { value: 'slow_processing', label: 'Slow Processing' },
  { value: 'eal', label: 'EAL' },
]

const SUBJECTS = [
  { value: 'english', label: 'English' },
  { value: 'maths', label: 'Maths' },
  { value: 'science', label: 'Science' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'computing', label: 'Computing' },
  { value: 'art', label: 'Art' },
  { value: 'music', label: 'Music' },
  { value: 'pe', label: 'PE' },
  { value: 'mfl', label: 'MFL' },
  { value: 'other', label: 'Other' },
]

const KEY_STAGES = [
  { value: 'ks3', label: 'KS3 (11-14)' },
  { value: 'ks4', label: 'KS4 (14-16)' },
  { value: 'ks5', label: 'KS5 (16-18)' },
]

const ABILITY_SETS = [
  { value: 'mixed', label: 'Mixed ability' },
  { value: 'bottom', label: 'Bottom set / Foundation' },
  { value: 'middle', label: 'Middle / Core' },
  { value: 'top', label: 'Top set / Higher' },
]

function Header({ profile, updateProfile, addCondition, removeCondition, presets, showPresets, setShowPresets, applyPreset, openProfileEditor, savedProfiles = {}, saveCurrentProfile, loadSavedProfile, deleteSavedProfile }) {
  const [showAddCondition, setShowAddCondition] = useState(false)

  const availableConditions = CONDITIONS.filter(
    c => !profile.conditions.includes(c.value)
  )

  const getConditionLabel = (value) => {
    return CONDITIONS.find(c => c.value === value)?.label || value
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo-centered">
          <div className="school-title">
            <span className="logo-icon">📚</span>
            <h1>Haute Vallée School</h1>
          </div>
          <div className="app-name">AI Powered for Inclusive Education</div>
        </div>

        {/* Quick Presets Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPresets(!showPresets)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⚡ Profiles & Presets
          </button>
          {showPresets && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              padding: '8px',
              zIndex: 9999,
              minWidth: '280px',
              maxWidth: '340px',
              marginTop: '8px'
            }}>
              {/* User-saved profiles */}
              <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                My saved students
              </div>
              {Object.keys(savedProfiles).length === 0 && (
                <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
                  None yet — save the current setup below.
                </div>
              )}
              {Object.values(savedProfiles)
                .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
                .map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      color: '#2c3e50',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      gap: '8px',
                    }}
                  >
                    <span
                      onClick={() => loadSavedProfile && loadSavedProfile(entry.id)}
                      style={{ cursor: 'pointer', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={entry.name}
                    >
                      👤 {entry.name}
                    </span>
                    <button
                      onClick={() => deleteSavedProfile && deleteSavedProfile(entry.id)}
                      title="Delete this profile"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#c33',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      🗑
                    </button>
                  </div>
                ))}

              {/* Save current */}
              {saveCurrentProfile && (
                <div
                  onClick={saveCurrentProfile}
                  style={{
                    margin: '8px 0',
                    padding: '10px 12px',
                    background: '#eef4f9',
                    border: '1px dashed #6c8eaa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#2d5a7b',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  💾 Save current setup as…
                </div>
              )}

              {/* Built-in presets */}
              <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid #eee', marginTop: '4px' }}>
                Built-in starter presets
              </div>
              {presets.map((preset, i) => (
                <div
                  key={i}
                  onClick={() => applyPreset(preset)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    color: '#2c3e50',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  {preset.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-label">Student Profile</div>
        <div className="profile-controls">
          <div className="profile-group conditions-group">
            <label>Condition(s):</label>
            {profile.conditions.map(condition => (
              <span key={condition} className="condition-tag">
                {getConditionLabel(condition)}
                {profile.conditions.length > 1 && (
                  <button onClick={() => removeCondition(condition)}>×</button>
                )}
              </span>
            ))}
            {profile.conditions.length < 3 && (
              <div style={{ position: 'relative' }}>
                <button
                  className="add-condition-btn"
                  onClick={() => setShowAddCondition(!showAddCondition)}
                >
                  + Add
                </button>
                {showAddCondition && (
                  <div style={{
                    position: 'fixed',
                    top: 'auto',
                    left: 'auto',
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    padding: '8px',
                    zIndex: 9999,
                    minWidth: '180px',
                    marginTop: '4px',
                    isolation: 'isolate'
                  }}>
                    {availableConditions.map(c => (
                      <div
                        key={c.value}
                        onClick={() => {
                          addCondition(c.value)
                          setShowAddCondition(false)
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: '#2c3e50',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          background: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.background = '#ffffff'}
                      >
                        {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="profile-group">
            <label>Subject</label>
            <select
              value={profile.subject}
              onChange={(e) => updateProfile('subject', e.target.value)}
            >
              {SUBJECTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="profile-group">
            <label>Key Stage</label>
            <select
              value={profile.keyStage}
              onChange={(e) => updateProfile('keyStage', e.target.value)}
            >
              {KEY_STAGES.map(ks => (
                <option key={ks.value} value={ks.value}>{ks.label}</option>
              ))}
            </select>
          </div>

          <div className="profile-group">
            <label>Ability Set</label>
            <select
              value={profile.abilitySet || 'mixed'}
              onChange={(e) => updateProfile('abilitySet', e.target.value)}
            >
              {ABILITY_SETS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          {openProfileEditor && (
            <div className="profile-group">
              <label>Detailed Profile</label>
              <button
                type="button"
                className="profile-edit-btn"
                onClick={openProfileEditor}
                title="Tune the specific features this student needs"
              >
                ✏️ Edit features
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
