import { useState } from 'react'
import { generateCreatePrompt } from '../utils/promptGenerator'

const RESOURCE_TYPES = [
  { value: 'worksheet', label: 'Worksheet' },
  { value: 'lesson_plan', label: 'Lesson Plan' },
  { value: 'information_sheet', label: 'Information Sheet' },
  { value: 'revision_guide', label: 'Revision Guide' },
  { value: 'presentation_notes', label: 'Presentation Notes' },
]

const DURATIONS = [
  { value: '20', label: '20 minutes' },
  { value: '40', label: '40 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
]

function CreateTab({ profile }) {
  const [step, setStep] = useState(1)
  const [options, setOptions] = useState({
    topic: '',
    learningObjectives: '',
    resourceType: 'worksheet',
    duration: '40',
    includeStarter: true,
    includeMain: true,
    includePlenary: true,
  })
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const steps = [
    { num: 1, label: 'Topic & Objectives' },
    { num: 2, label: 'Format Options' },
    { num: 3, label: 'Generate Prompt' },
  ]

  const updateOption = (field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = () => {
    const prompt = generateCreatePrompt(profile, options)
    setGeneratedPrompt(prompt)
    setStep(3)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const topicSlug = (options.topic || 'resource').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
    a.download = `create-${topicSlug}-${options.resourceType}-${profile.subject}-${profile.keyStage}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canProceedStep1 = options.topic.trim().length > 0
  const canProceedStep2 = true

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">✨ Create New Resource</h2>
        <p className="wizard-subtitle">
          Generate a prompt to create a new resource from scratch for students with {profile.conditions.join(', ')}
        </p>
      </div>

      <div className="progress-steps">
        {steps.map((s, i) => (
          <div key={s.num} style={{ display: 'contents' }}>
            <div className={`progress-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="step-number">{step > s.num ? '✓' : s.num}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`step-connector ${step > s.num ? 'completed' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Topic *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Macbeth Act 1 Scene 1, Pythagoras Theorem, The Water Cycle"
                value={options.topic}
                onChange={(e) => updateOption('topic', e.target.value)}
              />
              <p className="form-hint">What is the lesson or resource about?</p>
            </div>

            <div className="form-group">
              <label className="form-label">Learning Objectives</label>
              <textarea
                className="form-textarea"
                placeholder="e.g., 
• Understand how Shakespeare creates atmosphere
• Identify key quotes about the supernatural
• Explain the significance of the witches' prophecies"
                value={options.learningObjectives}
                onChange={(e) => updateOption('learningObjectives', e.target.value)}
              />
              <p className="form-hint">What should students learn or be able to do? (Optional but recommended)</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Resource Type</label>
              <div className="radio-group">
                {RESOURCE_TYPES.map(rt => (
                  <label 
                    key={rt.value} 
                    className={`radio-item ${options.resourceType === rt.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="resourceType"
                      value={rt.value}
                      checked={options.resourceType === rt.value}
                      onChange={(e) => updateOption('resourceType', e.target.value)}
                    />
                    {rt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Lesson Duration</label>
              <div className="radio-group">
                {DURATIONS.map(d => (
                  <label 
                    key={d.value} 
                    className={`radio-item ${options.duration === d.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={d.value}
                      checked={options.duration === d.value}
                      onChange={(e) => updateOption('duration', e.target.value)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Include Sections</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={options.includeStarter}
                    onChange={(e) => updateOption('includeStarter', e.target.checked)}
                  />
                  Starter Activity
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={options.includeMain}
                    onChange={(e) => updateOption('includeMain', e.target.checked)}
                  />
                  Main Activity
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={options.includePlenary}
                    onChange={(e) => updateOption('includePlenary', e.target.checked)}
                  />
                  Plenary / Review
                </label>
              </div>
            </div>

            <div style={{ 
              background: '#fff9e6',
              border: '1px solid #f0e6cc',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '24px'
            }}>
              <h4 style={{ marginBottom: '12px', color: '#8b6914' }}>📋 Summary</h4>
              <p><strong>Topic:</strong> {options.topic}</p>
              <p><strong>Type:</strong> {RESOURCE_TYPES.find(r => r.value === options.resourceType)?.label}</p>
              <p><strong>Duration:</strong> {options.duration} minutes</p>
              <p><strong>Condition(s):</strong> {profile.conditions.join(', ')}</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="prompt-output">
              <div className="prompt-header">
                <h3>Your Generated Prompt</h3>
                <div className="prompt-actions">
                  <button 
                    className={`btn btn-secondary ${copied ? 'copy-success' : ''}`}
                    onClick={copyToClipboard}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button className="btn btn-secondary" onClick={downloadPrompt}>
                    📥 Download
                  </button>
                </div>
              </div>
              <pre className="prompt-content">{generatedPrompt}</pre>
            </div>

            <div className="next-steps">
              <h4>📝 What To Do Next</h4>
              <ol>
                <li><strong>Copy</strong> the prompt above</li>
                <li>Open <a href="https://copilot.microsoft.com" target="_blank" rel="noopener noreferrer">Copilot</a>, <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer">ChatGPT</a>, or <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">Claude</a></li>
                <li><strong>Paste</strong> the prompt and press Enter</li>
                <li>Review the generated resource</li>
                <li>Ask the AI to modify anything that needs changing</li>
                <li>Copy the final version and use the <strong>Convert</strong> tab to create Word/PDF</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <div className="wizard-actions">
        <div>
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
        </div>
        <div>
          {step === 1 && (
            <button 
              className="btn btn-primary" 
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
            >
              Next: Format Options →
            </button>
          )}
          {step === 2 && (
            <button 
              className="btn btn-primary" 
              onClick={handleGenerate}
              disabled={!canProceedStep2}
            >
              Generate Prompt →
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTab
