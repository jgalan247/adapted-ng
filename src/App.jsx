import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import HomeView from './components/HomeView'
import AdaptTab from './components/AdaptTab'
import CreateTab from './components/CreateTab'
import QuizTab from './components/QuizTab'
import ConvertTab from './components/ConvertTab'

// Quick presets for common setups
const PRESETS = [
  { name: 'Autism - English KS3', conditions: ['autism'], subject: 'english', keyStage: 'ks3' },
  { name: 'ADHD - Maths KS4', conditions: ['adhd'], subject: 'maths', keyStage: 'ks4' },
  { name: 'Dyslexia - English KS4', conditions: ['dyslexia'], subject: 'english', keyStage: 'ks4' },
  { name: 'Autism + ADHD - Science KS3', conditions: ['autism', 'adhd'], subject: 'science', keyStage: 'ks3' },
  { name: 'EAL - History KS5', conditions: ['eal'], subject: 'history', keyStage: 'ks5' },
]

const DEFAULT_PROFILE = {
  conditions: ['autism'],
  subject: 'english',
  keyStage: 'ks3'
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const goTo = (tab) => setActiveTab(tab)
  const goHome = () => setActiveTab('home')

  const TAB_LABELS = {
    create: '✏️ Create',
    adapt: '🔄 Adapt',
    quiz: '📝 Quiz',
    convert: '📄 Format for Word / PDF',
  }
  const [profile, setProfile] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('adaptedProfile')
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE
  })
  const [showPresets, setShowPresets] = useState(false)

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem('adaptedProfile', JSON.stringify(profile))
  }, [profile])

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const addCondition = (condition) => {
    if (!profile.conditions.includes(condition) && profile.conditions.length < 3) {
      setProfile(prev => ({ ...prev, conditions: [...prev.conditions, condition] }))
    }
  }

  const removeCondition = (condition) => {
    if (profile.conditions.length > 1) {
      setProfile(prev => ({
        ...prev,
        conditions: prev.conditions.filter(c => c !== condition)
      }))
    }
  }

  const applyPreset = (preset) => {
    setProfile({
      conditions: preset.conditions,
      subject: preset.subject,
      keyStage: preset.keyStage
    })
    setShowPresets(false)
  }

  return (
    <div className="app">
      <Header
        profile={profile}
        updateProfile={updateProfile}
        addCondition={addCondition}
        removeCondition={removeCondition}
        presets={PRESETS}
        showPresets={showPresets}
        setShowPresets={setShowPresets}
        applyPreset={applyPreset}
      />
      <main className="main-content">
        {activeTab !== 'home' && (
          <div className="subnav">
            <button className="subnav-back" onClick={goHome}>
              ← Home
            </button>
            <span className="subnav-current">{TAB_LABELS[activeTab]}</span>
          </div>
        )}
        {activeTab === 'home' && <HomeView goTo={goTo} profile={profile} />}
        {activeTab === 'adapt' && <AdaptTab profile={profile} />}
        {activeTab === 'create' && <CreateTab profile={profile} />}
        {activeTab === 'quiz' && <QuizTab profile={profile} />}
        {activeTab === 'convert' && <ConvertTab profile={profile} />}
      </main>
      <footer className="footer">
        <p>AdaptEd — Making education accessible for every learner</p>
        <p className="footer-links">
          <a href="infographic.html" target="_blank" rel="noopener noreferrer">Quick Guide</a>
          {' | '}
          <a href="presentation.html" target="_blank" rel="noopener noreferrer">Presentation</a>
        </p>
        <p className="footer-credits">Designed and Created by Dr Galan. Copyright <a href="https://coderra.je" target="_blank" rel="noopener noreferrer">Coderra.je</a></p>
      </footer>
    </div>
  )
}

export default App
