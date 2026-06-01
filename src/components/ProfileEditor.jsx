/**
 * ProfileEditor — modal for fine-grained accessibility-feature selection.
 *
 * Two interaction patterns:
 *   - 'single' groups → radio buttons (mutually exclusive — Option 2)
 *   - 'multi' groups  → checkboxes (additive)
 *
 * Cross-category contradictions surface as warning chips (Option 3).
 */
import { useState } from 'react'
import {
  FEATURE_GROUPS,
  FEATURE_RULES,
  DIAGNOSTIC_PRESETS,
  detectConflicts,
  mergePresets,
  EMPTY_FEATURES,
} from '../utils/features'

function ProfileEditor({ profile, onChange, onClose }) {
  const [features, setFeatures] = useState(profile.features)
  const conflicts = detectConflicts(features)

  const setSingle = (groupId, value) => {
    setFeatures((prev) => ({ ...prev, [groupId]: value }))
  }
  const toggleMulti = (groupId, value) => {
    setFeatures((prev) => {
      const cur = prev[groupId] || []
      return {
        ...prev,
        [groupId]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      }
    })
  }

  const applyPreset = (id) => {
    const preset = DIAGNOSTIC_PRESETS[id]
    if (preset) setFeatures(preset.features)
  }
  const applyConditions = () => {
    setFeatures(mergePresets(profile.conditions))
  }
  const reset = () => setFeatures({ ...EMPTY_FEATURES })

  const save = () => {
    onChange(features)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Detailed Profile</h2>
            <p className="modal-subtitle">
              Pick the specific features this student actually needs. Two students with the
              same diagnosis can need opposite things.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Diagnostic preset shortcuts */}
          <div className="profile-presets">
            <span className="profile-presets-label">Quick preset:</span>
            <button className="preset-pill" onClick={applyConditions}>
              From current conditions ({profile.conditions.join(', ') || 'none'})
            </button>
            {Object.entries(DIAGNOSTIC_PRESETS).map(([id, p]) => (
              <button key={id} className="preset-pill" onClick={() => applyPreset(id)}>
                {p.label}
              </button>
            ))}
            <button className="preset-pill preset-pill-reset" onClick={reset}>
              Reset to neutral
            </button>
          </div>

          {/* Conflict warnings */}
          {conflicts.length > 0 && (
            <div className="conflicts-panel">
              <strong>⚠ Conflicting selections:</strong>
              <ul>
                {conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Feature groups */}
          {FEATURE_GROUPS.map((group) => (
            <div key={group.id} className="feature-group">
              <h3 className="feature-group-title">{group.label}</h3>
              {group.type === 'single' ? (
                <div className="feature-options">
                  {group.options.map((optId) => {
                    const opt = FEATURE_RULES[optId]
                    if (!opt) return null
                    const checked = features[group.id] === optId
                    return (
                      <label
                        key={optId}
                        className={`feature-option ${checked ? 'feature-option-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={group.id}
                          value={optId}
                          checked={checked}
                          onChange={() => setSingle(group.id, optId)}
                        />
                        <span className="feature-option-label">{opt.label}</span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="feature-options">
                  {group.options.map((optId) => {
                    const opt = FEATURE_RULES[optId]
                    if (!opt) return null
                    const checked = (features[group.id] || []).includes(optId)
                    return (
                      <label
                        key={optId}
                        className={`feature-option ${checked ? 'feature-option-selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMulti(group.id, optId)}
                        />
                        <span className="feature-option-label">{opt.label}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditor
