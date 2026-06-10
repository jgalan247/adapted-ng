import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import HomeView from './components/HomeView'
import AdaptTab from './components/AdaptTab'
import CreateTab from './components/CreateTab'
import QuizTab from './components/QuizTab'
import ConvertTab from './components/ConvertTab'
import ProfileEditor from './components/ProfileEditor'
import { mergePresets, EMPTY_FEATURES } from './utils/features'

// Quick presets for common setups
// Hand-tuned demo preset — showcases the granular feature system.
// Designed for: bottom-set KS4 Maths student with overlapping needs
// (dyslexia + ADHD + EAL). NOT a generic merge — every feature here was
// chosen deliberately for THIS profile.
const CORBETTMATHS_FEATURES = {
  visual_layout: 'visual_minimal',        // dense maths PDFs are already busy
  attention: 'attn_short_bursts',         // ADHD + maths fatigue
  structure: 'struct_high_predict',       // anchors anxious learners
  language_style: 'lang_literal',         // EAL + ND both benefit
  social: 'soc_pair',                     // pair talk supports EAL; less anxious than groups
  reading: ['read_dyslexic_font', 'read_larger_text', 'read_decodable', 'read_less_per_page'],
  vocabulary: ['vocab_preteach', 'vocab_visual_cards', 'vocab_glossary'],
  processing: ['proc_step_by_step', 'proc_worked_examples', 'proc_concrete_first', 'proc_fewer_items', 'proc_chunking'],
  regulation: ['reg_low_stakes', 'reg_clear_success', 'reg_sentence_starters'],
  maths: ['math_visual_models', 'math_worked_solutions', 'math_real_world'],
}

const PRESETS = [
  { name: 'Corbettmaths PDF - Bottom set, ND + EAL', conditions: ['dyslexia', 'adhd', 'eal'], subject: 'maths', keyStage: 'ks4', abilitySet: 'bottom', features: CORBETTMATHS_FEATURES },
  { name: 'Autism - English KS3', conditions: ['autism'], subject: 'english', keyStage: 'ks3', abilitySet: 'mixed' },
  { name: 'ADHD - Maths KS4', conditions: ['adhd'], subject: 'maths', keyStage: 'ks4', abilitySet: 'mixed' },
  { name: 'Dyslexia - English KS4', conditions: ['dyslexia'], subject: 'english', keyStage: 'ks4', abilitySet: 'mixed' },
  { name: 'Autism + ADHD - Science KS3', conditions: ['autism', 'adhd'], subject: 'science', keyStage: 'ks3', abilitySet: 'mixed' },
  { name: 'EAL - History KS5', conditions: ['eal'], subject: 'history', keyStage: 'ks5', abilitySet: 'mixed' },
]

const DEFAULT_PROFILE = {
  conditions: ['autism'],
  subject: 'english',
  keyStage: 'ks3',
  abilitySet: 'mixed',
  examBoard: '',
  features: mergePresets(['autism']),
}

// Migrate older saved profiles (no `features` object) by deriving from conditions.
function migrateProfile(raw) {
  const merged = { ...DEFAULT_PROFILE, ...raw }
  if (!merged.features || typeof merged.features !== 'object') {
    merged.features = merged.conditions?.length
      ? mergePresets(merged.conditions)
      : { ...EMPTY_FEATURES }
  }
  return merged
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
    if (!saved) return DEFAULT_PROFILE
    return migrateProfile(JSON.parse(saved))
  })
  const [showPresets, setShowPresets] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  // Named saved profiles (one per student/group). Persisted separately.
  const [savedProfiles, setSavedProfiles] = useState(() => {
    try {
      const raw = localStorage.getItem('adaptedSavedProfiles')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem('adaptedSavedProfiles', JSON.stringify(savedProfiles))
  }, [savedProfiles])

  const updateFeatures = (nextFeatures) => {
    setProfile((prev) => ({ ...prev, features: nextFeatures }))
  }

  // Snapshot the active profile under a chosen name.
  const saveCurrentProfile = () => {
    const suggested = (profile.conditions?.[0] || 'Student')
      .charAt(0).toUpperCase() + (profile.conditions?.[0] || 'Student').slice(1)
    const name = window.prompt(
      'Name this profile (e.g. "Sam Y9 Maths", "Period 3 bottom set"):',
      `${suggested} - ${profile.subject} ${profile.keyStage.toUpperCase()}`,
    )
    if (!name || !name.trim()) return
    const id = `p_${Date.now().toString(36)}`
    setSavedProfiles((prev) => ({
      ...prev,
      [id]: {
        id,
        name: name.trim(),
        profile: { ...profile },
        savedAt: Date.now(),
      },
    }))
    setShowPresets(false)
  }

  const loadSavedProfile = (id) => {
    const entry = savedProfiles[id]
    if (!entry) return
    setProfile({ ...DEFAULT_PROFILE, ...entry.profile })
    setShowPresets(false)
  }

  const deleteSavedProfile = (id) => {
    if (!window.confirm(`Delete "${savedProfiles[id]?.name}"?`)) return
    setSavedProfiles((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const exportProfiles = () => {
    const entries = Object.values(savedProfiles)
    if (entries.length === 0) {
      window.alert('No saved profiles to export yet.')
      return
    }
    const payload = {
      schema: 'adapted-ng-profiles',
      version: 1,
      exportedAt: new Date().toISOString(),
      profiles: entries,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `adapted-ng-profiles-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importProfiles = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result || ''))
        if (parsed?.schema !== 'adapted-ng-profiles' || !Array.isArray(parsed.profiles)) {
          throw new Error('Not an adapted-ng profile export file.')
        }
        // Always assign fresh IDs to avoid colliding with existing entries.
        const additions = {}
        let added = 0
        for (const entry of parsed.profiles) {
          if (!entry || !entry.profile || !entry.name) continue
          const id = `p_${Date.now().toString(36)}_${added}`
          additions[id] = {
            id,
            name: entry.name,
            profile: entry.profile,
            savedAt: Date.now(),
          }
          added++
        }
        if (added === 0) {
          window.alert('File parsed but contained no valid profiles.')
          return
        }
        setSavedProfiles((prev) => ({ ...prev, ...additions }))
        window.alert(`Imported ${added} profile${added === 1 ? '' : 's'}.`)
      } catch (err) {
        window.alert(`Couldn't import: ${err.message || err}`)
      }
    }
    reader.readAsText(file)
  }

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
      keyStage: preset.keyStage,
      abilitySet: preset.abilitySet || 'mixed',
      // Use the preset's hand-tuned features if present; otherwise derive from conditions.
      features: preset.features || mergePresets(preset.conditions),
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
        openProfileEditor={() => setEditingProfile(true)}
        savedProfiles={savedProfiles}
        saveCurrentProfile={saveCurrentProfile}
        loadSavedProfile={loadSavedProfile}
        deleteSavedProfile={deleteSavedProfile}
        exportProfiles={exportProfiles}
        importProfiles={importProfiles}
      />
      {editingProfile && (
        <ProfileEditor
          profile={profile}
          onChange={updateFeatures}
          onClose={() => setEditingProfile(false)}
          saveCurrentProfile={saveCurrentProfile}
        />
      )}
      <main className="main-content">
        {activeTab !== 'home' && (
          <div className="subnav">
            <button className="subnav-back" onClick={goHome}>
              ← Home
            </button>
            <span className="subnav-current">{TAB_LABELS[activeTab]}</span>
          </div>
        )}
        {activeTab === 'home' && (
          <HomeView
            goTo={goTo}
            profile={profile}
            featuredPreset={PRESETS[0]}
            applyPreset={applyPreset}
          />
        )}
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
