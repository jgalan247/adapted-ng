import { useState } from 'react'
import { generateAdaptPrompt } from '../utils/promptGenerator'

const OUTPUT_FORMATS = [
  { value: 'same_as_original', label: 'Same as Original', description: 'Match the original format' },
  { value: 'worksheet', label: 'Worksheet', description: '1-2 pages with questions' },
  { value: 'handout', label: 'Handout (PDF)', description: '3-4 pages with theory & exercises' },
  { value: 'presentation', label: 'Presentation', description: '5-10 slides' },
  { value: 'full_lesson', label: 'Full Lesson', description: 'Starter, main, plenary' },
  { value: 'revision_guide', label: 'Revision Guide', description: 'Key concepts summary' },
]

function AdaptTab({ profile }) {
  const [resourceContent, setResourceContent] = useState('')
  const [outputFormat, setOutputFormat] = useState('same_as_original')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  const handleGenerate = () => {
    const prompt = generateAdaptPrompt(profile, resourceContent, outputFormat)
    setGeneratedPrompt(prompt)
    setShowPrompt(true)
  }

  const copyAndOpenCopilot = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
    window.open('https://copilot.microsoft.com/', '_blank')
  }

  const copyAndOpenChatGPT = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
    window.open('https://chat.openai.com/', '_blank')
  }

  const copyAndOpenClaude = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
    window.open('https://claude.ai/', '_blank')
  }

  const copyOnly = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canGenerate = resourceContent.trim().length > 0

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">🔄 Adapt Existing Resource</h2>
        <p className="wizard-subtitle">
          Adapting for: <strong>{profile.conditions.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')).join(', ')}</strong> • {profile.subject} • {profile.keyStage.toUpperCase()}
        </p>
      </div>

      <div className="wizard-content">
        {!showPrompt ? (
          <div>
            {/* Output Format - Horizontal Pills */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Output Format</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {OUTPUT_FORMATS.map(format => (
                  <button
                    key={format.value}
                    onClick={() => setOutputFormat(format.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: outputFormat === format.value ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                      background: outputFormat === format.value ? 'var(--color-primary)' : 'white',
                      color: outputFormat === format.value ? 'white' : 'var(--color-text)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    title={format.description}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Input */}
            <div className="form-group">
              <label className="form-label">Paste Your Resource</label>
              <textarea
                className="form-textarea"
                placeholder="Paste your worksheet, lesson plan, or educational content here...

Tip: Select All (Ctrl+A) → Copy (Ctrl+C) from your Word/PDF/PowerPoint document"
                value={resourceContent}
                onChange={(e) => setResourceContent(e.target.value)}
                style={{ minHeight: '280px' }}
              />
              {resourceContent.length > 0 && (
                <p className="form-hint" style={{ color: 'var(--color-success)' }}>
                  ✓ {resourceContent.length} characters pasted
                </p>
              )}
            </div>

            {/* Generate Button */}
            <button
              className="btn btn-primary btn-large"
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
            >
              Generate Adapted Prompt →
            </button>
          </div>
        ) : (
          <div>
            {/* Success Message */}
            <div style={{
              background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✓ Prompt Ready!</h3>
              <p style={{ margin: 0, color: '#155724' }}>Click a button below to copy and open your AI assistant</p>
            </div>

            {/* One-Click Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={copyAndOpenCopilot}
                className="btn btn-primary btn-large"
                style={{ flex: '1', minWidth: '150px', justifyContent: 'center', padding: '16px' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy & Open Copilot'}
              </button>
              <button
                onClick={copyAndOpenChatGPT}
                className="btn btn-secondary btn-large"
                style={{ flex: '1', minWidth: '150px', justifyContent: 'center', padding: '16px' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy & Open ChatGPT'}
              </button>
              <button
                onClick={copyAndOpenClaude}
                className="btn btn-secondary btn-large"
                style={{ flex: '1', minWidth: '150px', justifyContent: 'center', padding: '16px' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy & Open Claude'}
              </button>
            </div>

            {/* Quick Instructions */}
            <div style={{
              background: 'var(--color-bg-warm)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                <strong>Next:</strong> Paste (Ctrl+V) into the AI → Wait for response → Copy the result → Use <strong>Convert</strong> tab for Word/PDF
              </p>
            </div>

            {/* Collapsible Prompt Preview */}
            <details style={{ marginBottom: '20px' }}>
              <summary style={{
                cursor: 'pointer',
                padding: '12px',
                background: 'var(--color-bg-warm)',
                borderRadius: '8px',
                fontWeight: '500'
              }}>
                View/Copy Prompt Manually
              </summary>
              <div style={{ marginTop: '12px' }}>
                <div className="prompt-output">
                  <div className="prompt-header">
                    <h3>Generated Prompt</h3>
                    <button className="btn btn-secondary" onClick={copyOnly}>
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <pre className="prompt-content" style={{ maxHeight: '300px' }}>{generatedPrompt}</pre>
                </div>
              </div>
            </details>

            {/* Start Over */}
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowPrompt(false)
                setResourceContent('')
                setOutputFormat('same_as_original')
                setGeneratedPrompt('')
              }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              ← Start New Adaptation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdaptTab
