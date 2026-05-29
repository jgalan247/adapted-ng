import { useState } from 'react'
import { generateQuizPrompt } from '../utils/promptGenerator'

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'true_false', label: 'True / False' },
  { value: 'matching', label: 'Matching' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'extended', label: 'Extended Response' },
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'mixed', label: 'Mixed' },
]

const EXAM_BOARDS = [
  { value: '', label: 'No specific board' },
  { value: 'aqa', label: 'AQA' },
  { value: 'ccea', label: 'CCEA' },
  { value: 'edexcel', label: 'Edexcel' },
  { value: 'eduqas', label: 'Eduqas' },
  { value: 'ocr', label: 'OCR' },
  { value: 'wjec', label: 'WJEC' },
]

function QuizTab({ profile }) {
  const [step, setStep] = useState(1)
  const [options, setOptions] = useState({
    sourceType: 'topic',
    sourceTopic: '',
    sourceText: '',
    questionTypes: ['multiple_choice', 'short_answer'],
    questionCount: 10,
    difficulty: 'medium',
    includeAnswers: true,
    examBoard: '',
  })
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const steps = [
    { num: 1, label: 'Source' },
    { num: 2, label: 'Question Types' },
    { num: 3, label: 'Settings' },
    { num: 4, label: 'Generate' },
  ]

  const updateOption = (field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }))
  }

  const toggleQuestionType = (type) => {
    setOptions(prev => {
      if (prev.questionTypes.includes(type)) {
        if (prev.questionTypes.length > 1) {
          return { ...prev, questionTypes: prev.questionTypes.filter(t => t !== type) }
        }
        return prev
      }
      return { ...prev, questionTypes: [...prev.questionTypes, type] }
    })
  }

  const handleGenerate = () => {
    const prompt = generateQuizPrompt(profile, options)
    setGeneratedPrompt(prompt)
    setStep(4)
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
    const topicSlug = (options.sourceTopic || 'quiz').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
    a.download = `quiz-${topicSlug}-${profile.subject}-${profile.keyStage}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canProceedStep1 = options.sourceType === 'topic' 
    ? options.sourceTopic.trim().length > 0 
    : options.sourceText.trim().length > 0

  const showExamBoard = ['ks4', 'ks5'].includes(profile.keyStage)

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">❓ Generate Quiz / Assessment</h2>
        <p className="wizard-subtitle">
          Create accessible assessment questions for students with {profile.conditions.join(', ')}
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
              <label className="form-label">Question Source</label>
              <div className="radio-group">
                <label className={`radio-item ${options.sourceType === 'topic' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sourceType"
                    value="topic"
                    checked={options.sourceType === 'topic'}
                    onChange={(e) => updateOption('sourceType', e.target.value)}
                  />
                  Enter a topic
                </label>
                <label className={`radio-item ${options.sourceType === 'text' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sourceType"
                    value="text"
                    checked={options.sourceType === 'text'}
                    onChange={(e) => updateOption('sourceType', e.target.value)}
                  />
                  Paste source text
                </label>
              </div>
            </div>

            {options.sourceType === 'topic' && (
              <div className="form-group">
                <label className="form-label">Topic *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Macbeth Act 1, World War 1 causes, Photosynthesis"
                  value={options.sourceTopic}
                  onChange={(e) => updateOption('sourceTopic', e.target.value)}
                />
                <p className="form-hint">What should the questions be about?</p>
              </div>
            )}

            {options.sourceType === 'text' && (
              <div className="form-group">
                <label className="form-label">Source Text *</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '200px' }}
                  placeholder="Paste the text that questions should be based on..."
                  value={options.sourceText}
                  onChange={(e) => updateOption('sourceText', e.target.value)}
                />
                <p className="form-hint">The AI will generate questions based on this content</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Question Types (select at least one)</label>
              <div className="checkbox-group">
                {QUESTION_TYPES.map(qt => (
                  <label key={qt.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={options.questionTypes.includes(qt.value)}
                      onChange={() => toggleQuestionType(qt.value)}
                    />
                    {qt.label}
                  </label>
                ))}
              </div>
              <p className="form-hint">
                The AI will create a mix of the selected question types
              </p>
            </div>

            <div style={{ 
              background: '#e8f4f8',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '24px'
            }}>
              <h4 style={{ marginBottom: '12px' }}>💡 Accessibility Note</h4>
              <p style={{ fontSize: '0.9rem', color: '#5a6c7d' }}>
                Based on the selected conditions, the AI will automatically:
              </p>
              <ul style={{ fontSize: '0.9rem', color: '#5a6c7d', marginLeft: '20px', marginTop: '8px' }}>
                {profile.conditions.includes('autism') && <li>Use literal, unambiguous language</li>}
                {profile.conditions.includes('adhd') && <li>Add clear numbering and visual structure</li>}
                {profile.conditions.includes('dyslexia') && <li>Simplify sentence structures</li>}
                {profile.conditions.includes('anxiety') && <li>Use encouraging, low-pressure wording</li>}
              </ul>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="form-group">
              <label className="form-label">Number of Questions</label>
              <div className="radio-group">
                {[5, 10, 15, 20].map(n => (
                  <label 
                    key={n} 
                    className={`radio-item ${options.questionCount === n ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="questionCount"
                      value={n}
                      checked={options.questionCount === n}
                      onChange={() => updateOption('questionCount', n)}
                    />
                    {n} questions
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <div className="radio-group">
                {DIFFICULTIES.map(d => (
                  <label 
                    key={d.value} 
                    className={`radio-item ${options.difficulty === d.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={d.value}
                      checked={options.difficulty === d.value}
                      onChange={(e) => updateOption('difficulty', e.target.value)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            {showExamBoard && (
              <div className="form-group">
                <label className="form-label">Exam Board Style</label>
                <select
                  className="form-select"
                  value={options.examBoard}
                  onChange={(e) => updateOption('examBoard', e.target.value)}
                >
                  {EXAM_BOARDS.map(eb => (
                    <option key={eb.value} value={eb.value}>{eb.label}</option>
                  ))}
                </select>
                <p className="form-hint">Questions will use command words and mark schemes matching this board's style</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Include Answers?</label>
              <div className="radio-group">
                <label className={`radio-item ${options.includeAnswers ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="includeAnswers"
                    checked={options.includeAnswers}
                    onChange={() => updateOption('includeAnswers', true)}
                  />
                  Yes, include answer key
                </label>
                <label className={`radio-item ${!options.includeAnswers ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="includeAnswers"
                    checked={!options.includeAnswers}
                    onChange={() => updateOption('includeAnswers', false)}
                  />
                  No, student version only
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
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
                <li>Review the generated questions</li>
                <li>Ask the AI to adjust difficulty or add more questions if needed</li>
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
              Next: Question Types →
            </button>
          )}
          {step === 2 && (
            <button className="btn btn-primary" onClick={() => setStep(3)}>
              Next: Settings →
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-primary" onClick={handleGenerate}>
              Generate Prompt →
            </button>
          )}
          {step === 4 && (
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizTab
