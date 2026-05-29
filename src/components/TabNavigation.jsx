function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'adapt', label: 'Adapt', icon: '🔄', desc: 'Adapt existing resources' },
    { id: 'create', label: 'Create', icon: '✨', desc: 'Create from scratch' },
    { id: 'quiz', label: 'Quiz', icon: '❓', desc: 'Generate assessments' },
    { id: 'convert', label: 'Convert', icon: '📄', desc: 'Markdown to Word/PDF' },
  ]

  return (
    <nav className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          data-tab={tab.id}
          onClick={() => setActiveTab(tab.id)}
          title={tab.desc}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default TabNavigation
