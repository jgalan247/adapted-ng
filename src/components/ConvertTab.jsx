import { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import pptxgen from 'pptxgenjs'

// Parse markdown into structured content for DOCX/PPTX
function parseMarkdownToBlocks(markdown) {
  const lines = markdown.split('\n')
  const blocks = []
  let currentList = null
  let currentTable = null
  let tableHeaders = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines (but close lists/tables)
    if (!trimmed) {
      if (currentList) {
        blocks.push({ type: 'list', items: currentList.items, ordered: currentList.ordered })
        currentList = null
      }
      if (currentTable) {
        blocks.push({ type: 'table', headers: tableHeaders, rows: currentTable })
        currentTable = null
        tableHeaders = []
      }
      continue
    }

    // Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim())
      // Check if separator row
      if (cells.every(c => /^[-:]+$/.test(c))) {
        continue // Skip separator row
      }
      if (!currentTable) {
        tableHeaders = cells
        currentTable = []
      } else {
        currentTable.push(cells)
      }
      continue
    } else if (currentTable) {
      blocks.push({ type: 'table', headers: tableHeaders, rows: currentTable })
      currentTable = null
      tableHeaders = []
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) })
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) })
      continue
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) })
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'quote', text: trimmed.slice(2) })
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, '')
      if (!currentList || !currentList.ordered) {
        if (currentList) {
          blocks.push({ type: 'list', items: currentList.items, ordered: false })
        }
        currentList = { ordered: true, items: [] }
      }
      currentList.items.push(text)
      continue
    }

    // Unordered list
    if (/^[-*+]\s/.test(trimmed)) {
      const text = trimmed.slice(2)
      if (!currentList || currentList.ordered) {
        if (currentList) {
          blocks.push({ type: 'list', items: currentList.items, ordered: true })
        }
        currentList = { ordered: false, items: [] }
      }
      currentList.items.push(text)
      continue
    }

    // Close any open list
    if (currentList) {
      blocks.push({ type: 'list', items: currentList.items, ordered: currentList.ordered })
      currentList = null
    }

    // Regular paragraph
    blocks.push({ type: 'paragraph', text: trimmed })
  }

  // Close any remaining list or table
  if (currentList) {
    blocks.push({ type: 'list', items: currentList.items, ordered: currentList.ordered })
  }
  if (currentTable) {
    blocks.push({ type: 'table', headers: tableHeaders, rows: currentTable })
  }

  return blocks
}

// Parse inline formatting (bold, italic) into TextRuns for docx
function parseInlineFormatting(text, baseOptions = {}) {
  const runs = []
  let remaining = text

  // Replace LaTeX with plain text representation
  remaining = remaining.replace(/\$\$(.*?)\$\$/g, '[$1]')
  remaining = remaining.replace(/\$([^\$]+)\$/g, '[$1]')

  // Process bold and italic
  const regex = /(\*\*\*|___)(.+?)\1|(\*\*|__)(.+?)\3|(\*|_)(.+?)\5/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(remaining)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: remaining.slice(lastIndex, match.index), ...baseOptions }))
    }

    if (match[1]) {
      // Bold + Italic
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, ...baseOptions }))
    } else if (match[3]) {
      // Bold
      runs.push(new TextRun({ text: match[4], bold: true, ...baseOptions }))
    } else if (match[5]) {
      // Italic
      runs.push(new TextRun({ text: match[6], italics: true, ...baseOptions }))
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < remaining.length) {
    runs.push(new TextRun({ text: remaining.slice(lastIndex), ...baseOptions }))
  }

  return runs.length > 0 ? runs : [new TextRun({ text: text, ...baseOptions })]
}

// Function to render LaTeX math in the content
function renderMath(html) {
  // Handle display math: $$...$$
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })
    } catch (e) {
      return match
    }
  })
  
  // Handle inline math: $...$
  html = html.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })
    } catch (e) {
      return match
    }
  })
  
  return html
}

// Track downloaded filenames to add suffix for duplicates
const downloadedFiles = new Map()

function ConvertTab({ profile }) {
  const [step, setStep] = useState(1)
  const [markdownInput, setMarkdownInput] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [accessibilityOptions, setAccessibilityOptions] = useState({
    dyslexicFont: false,
    creamBackground: false,
    largeText: false,
    extraSpacing: false,
  })
  const previewRef = useRef(null)

  // Generate filename from subject + title/topic
  const generateFilename = (extension) => {
    // Get subject from profile
    const subject = profile.subject ? profile.subject.charAt(0).toUpperCase() + profile.subject.slice(1) : ''

    // Extract title from first H1 in markdown
    const h1Match = markdownInput.match(/^#\s+(.+)$/m)
    let title = h1Match ? h1Match[1] : ''

    // Clean up title - remove markdown formatting and special chars
    title = title
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 50) // Limit length

    // Build base filename
    let baseName = ''
    if (subject && title) {
      baseName = `${subject}-${title}`
    } else if (title) {
      baseName = title
    } else if (subject) {
      baseName = `${subject}-resource`
    } else {
      baseName = 'adapted-resource'
    }

    // Check for duplicates and add suffix
    const key = `${baseName}.${extension}`
    const count = downloadedFiles.get(key) || 0
    downloadedFiles.set(key, count + 1)

    if (count > 0) {
      return `${baseName}-${count}.${extension}`
    }
    return `${baseName}.${extension}`
  }

  const steps = [
    { num: 1, label: 'Paste Content' },
    { num: 2, label: 'Preview & Style' },
    { num: 3, label: 'Download' },
  ]

  // Convert markdown to HTML when input changes
  useEffect(() => {
    if (markdownInput) {
      let html = marked.parse(markdownInput)
      html = renderMath(html)
      setHtmlContent(html)
    }
  }, [markdownInput])

  // Auto-enable accessibility options based on conditions
  useEffect(() => {
    const newOptions = { ...accessibilityOptions }
    if (profile.conditions.includes('dyslexia')) {
      newOptions.dyslexicFont = true
      newOptions.creamBackground = true
      newOptions.extraSpacing = true
    }
    if (profile.conditions.includes('visual_processing')) {
      newOptions.creamBackground = true
      newOptions.extraSpacing = true
    }
    setAccessibilityOptions(newOptions)
  }, [profile.conditions])

  const toggleOption = (option) => {
    setAccessibilityOptions(prev => ({ ...prev, [option]: !prev[option] }))
  }

  const getPreviewStyles = () => {
    let styles = {}
    if (accessibilityOptions.dyslexicFont) {
      styles.fontFamily = "'OpenDyslexic', 'Comic Sans MS', sans-serif"
    }
    if (accessibilityOptions.creamBackground) {
      styles.background = '#fdf6e3'
    }
    if (accessibilityOptions.largeText) {
      styles.fontSize = '1.2rem'
    }
    if (accessibilityOptions.extraSpacing) {
      styles.lineHeight = '2'
      styles.letterSpacing = '0.05em'
    }
    return styles
  }

  const generateStyledHTML = () => {
    const styles = []
    
    if (accessibilityOptions.dyslexicFont) {
      styles.push("font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif;")
    } else {
      styles.push("font-family: Arial, sans-serif;")
    }
    
    if (accessibilityOptions.creamBackground) {
      styles.push("background-color: #fdf6e3;")
    }
    
    if (accessibilityOptions.largeText) {
      styles.push("font-size: 14pt;")
    } else {
      styles.push("font-size: 12pt;")
    }
    
    if (accessibilityOptions.extraSpacing) {
      styles.push("line-height: 2;")
      styles.push("letter-spacing: 0.05em;")
    } else {
      styles.push("line-height: 1.6;")
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Adapted Resource</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    @import url('https://fonts.cdnfonts.com/css/opendyslexic');
    
    body {
      ${styles.join('\n      ')}
      color: #2c3e50;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h1 { font-size: 1.8em; margin-bottom: 0.5em; color: #1e3d52; }
    h2 { font-size: 1.4em; margin-top: 1.5em; margin-bottom: 0.5em; color: #2d5a7b; }
    h3 { font-size: 1.2em; margin-top: 1.2em; margin-bottom: 0.4em; }
    
    p { margin-bottom: 1em; }
    
    ul, ol { margin-left: 1.5em; margin-bottom: 1em; }
    li { margin-bottom: 0.5em; }
    
    strong { font-weight: 600; }
    
    code {
      background: #f0f0f0;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: monospace;
    }
    
    pre {
      background: #f0f0f0;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    
    th { background: #f5f5f5; }
    
    .katex { font-size: 1.1em; }
    
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`
  }

  const downloadAsHTML = () => {
    const html = generateStyledHTML()
    const blob = new Blob([html], { type: 'text/html' })
    saveAs(blob, generateFilename('html'))
  }

  const downloadAsWord = async () => {
    const blocks = parseMarkdownToBlocks(markdownInput)
    const children = []

    const fontSize = accessibilityOptions.largeText ? 28 : 24 // half-points
    const fontFamily = accessibilityOptions.dyslexicFont ? 'Comic Sans MS' : 'Arial'
    const lineSpacing = accessibilityOptions.extraSpacing ? 480 : 276 // twips (1/20 of a point)

    for (const block of blocks) {
      switch (block.type) {
        case 'h1':
          children.push(new Paragraph({
            children: parseInlineFormatting(block.text, { size: 48, font: fontFamily }),
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200, line: lineSpacing }
          }))
          break
        case 'h2':
          children.push(new Paragraph({
            children: parseInlineFormatting(block.text, { size: 36, font: fontFamily }),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150, line: lineSpacing }
          }))
          break
        case 'h3':
          children.push(new Paragraph({
            children: parseInlineFormatting(block.text, { size: 28, font: fontFamily }),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100, line: lineSpacing }
          }))
          break
        case 'paragraph':
          children.push(new Paragraph({
            children: parseInlineFormatting(block.text, { size: fontSize, font: fontFamily }),
            spacing: { after: 150, line: lineSpacing }
          }))
          break
        case 'quote':
          children.push(new Paragraph({
            children: parseInlineFormatting(block.text, { size: fontSize, font: fontFamily, italics: true }),
            indent: { left: 720 },
            spacing: { after: 150, line: lineSpacing }
          }))
          break
        case 'list':
          block.items.forEach((item, idx) => {
            children.push(new Paragraph({
              children: parseInlineFormatting(item, { size: fontSize, font: fontFamily }),
              bullet: block.ordered ? undefined : { level: 0 },
              numbering: block.ordered ? { reference: 'default-numbering', level: 0 } : undefined,
              spacing: { after: 80, line: lineSpacing }
            }))
          })
          break
        case 'table':
          const tableRows = []
          // Header row
          tableRows.push(new TableRow({
            children: block.headers.map(h => new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: h, bold: true, size: fontSize, font: fontFamily })],
                spacing: { line: lineSpacing }
              })],
              shading: { fill: 'E8E8E8' }
            }))
          }))
          // Data rows
          block.rows.forEach(row => {
            tableRows.push(new TableRow({
              children: row.map(cell => new TableCell({
                children: [new Paragraph({
                  children: parseInlineFormatting(cell, { size: fontSize, font: fontFamily }),
                  spacing: { line: lineSpacing }
                })]
              }))
            }))
          })
          children.push(new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          }))
          children.push(new Paragraph({ text: '', spacing: { after: 150 } })) // Space after table
          break
        case 'hr':
          children.push(new Paragraph({
            children: [new TextRun({ text: '─'.repeat(50), color: 'CCCCCC' })],
            spacing: { before: 200, after: 200 }
          }))
          break
      }
    }

    const doc = new Document({
      numbering: {
        config: [{
          reference: 'default-numbering',
          levels: [{
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.LEFT
          }]
        }]
      },
      sections: [{
        properties: {},
        children: children
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, generateFilename('docx'))
  }

  const downloadAsPDF = () => {
    // Open print dialog - user can save as PDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(generateStyledHTML())
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const downloadAsPowerPoint = async () => {
    const blocks = parseMarkdownToBlocks(markdownInput)
    const pptx = new pptxgen()

    // Set presentation properties
    pptx.author = 'AdaptEd'
    pptx.title = 'Adapted Resource'
    pptx.subject = 'Educational Resource'

    // Define master slide with accessibility options
    const bgColor = accessibilityOptions.creamBackground ? 'FDF6E3' : 'FFFFFF'
    const fontFace = accessibilityOptions.dyslexicFont ? 'Comic Sans MS' : 'Arial'
    const baseFontSize = accessibilityOptions.largeText ? 20 : 18

    // Group blocks into slides (split on h1 or h2)
    let slides = []
    let currentSlide = { title: '', content: [] }

    for (const block of blocks) {
      if (block.type === 'h1') {
        if (currentSlide.title || currentSlide.content.length > 0) {
          slides.push(currentSlide)
        }
        currentSlide = { title: block.text, content: [], isTitle: true }
      } else if (block.type === 'h2') {
        if (currentSlide.title || currentSlide.content.length > 0) {
          slides.push(currentSlide)
        }
        currentSlide = { title: block.text, content: [] }
      } else {
        currentSlide.content.push(block)
      }
    }
    if (currentSlide.title || currentSlide.content.length > 0) {
      slides.push(currentSlide)
    }

    // Create slides
    for (const slideData of slides) {
      const slide = pptx.addSlide()
      slide.bkgd = bgColor

      // Title
      if (slideData.title) {
        slide.addText(slideData.title.replace(/\*\*/g, ''), {
          x: 0.5,
          y: slideData.isTitle ? 2 : 0.5,
          w: 9,
          h: slideData.isTitle ? 1.5 : 0.8,
          fontSize: slideData.isTitle ? 44 : 28,
          fontFace: fontFace,
          bold: true,
          color: '1E3D52',
          align: slideData.isTitle ? 'center' : 'left'
        })
      }

      // Content
      let yPos = slideData.title ? (slideData.isTitle ? 4 : 1.5) : 0.5

      for (const block of slideData.content) {
        if (yPos > 6.5) break // Don't overflow slide

        switch (block.type) {
          case 'paragraph':
            slide.addText(block.text.replace(/\*\*/g, ''), {
              x: 0.5,
              y: yPos,
              w: 9,
              h: 0.5,
              fontSize: baseFontSize,
              fontFace: fontFace,
              color: '2C3E50'
            })
            yPos += 0.6
            break
          case 'list':
            block.items.forEach((item, idx) => {
              if (yPos > 6.5) return
              const bullet = block.ordered ? `${idx + 1}. ` : '• '
              slide.addText(bullet + item.replace(/\*\*/g, ''), {
                x: 0.7,
                y: yPos,
                w: 8.5,
                h: 0.4,
                fontSize: baseFontSize - 2,
                fontFace: fontFace,
                color: '2C3E50'
              })
              yPos += 0.45
            })
            yPos += 0.2
            break
          case 'quote':
            slide.addText(`"${block.text.replace(/\*\*/g, '')}"`, {
              x: 0.7,
              y: yPos,
              w: 8.5,
              h: 0.6,
              fontSize: baseFontSize,
              fontFace: fontFace,
              italic: true,
              color: '5A6C7D'
            })
            yPos += 0.7
            break
          case 'table':
            // Simple table rendering
            const tableData = [block.headers, ...block.rows]
            slide.addTable(tableData, {
              x: 0.5,
              y: yPos,
              w: 9,
              fontFace: fontFace,
              fontSize: baseFontSize - 4,
              color: '2C3E50',
              border: { pt: 1, color: 'CCCCCC' },
              fill: { color: 'FFFFFF' },
              rowH: 0.4
            })
            yPos += (tableData.length * 0.4) + 0.3
            break
          case 'h3':
            slide.addText(block.text.replace(/\*\*/g, ''), {
              x: 0.5,
              y: yPos,
              w: 9,
              h: 0.5,
              fontSize: baseFontSize + 4,
              fontFace: fontFace,
              bold: true,
              color: '2D5A7B'
            })
            yPos += 0.6
            break
        }
      }
    }

    // If no slides were created, make a single slide with all content
    if (slides.length === 0) {
      const slide = pptx.addSlide()
      slide.bkgd = bgColor
      slide.addText('Adapted Resource', {
        x: 0.5, y: 0.5, w: 9, h: 1,
        fontSize: 32, fontFace: fontFace, bold: true, color: '1E3D52'
      })
      slide.addText('Paste content with ## headings to create multiple slides', {
        x: 0.5, y: 2, w: 9, h: 0.5,
        fontSize: 18, fontFace: fontFace, color: '5A6C7D'
      })
    }

    pptx.writeFile({ fileName: generateFilename('pptx') })
  }

  const sampleMarkdown = `# Macbeth: Act 1 Scene 1

## Learning Objective

By the end of this lesson, you will understand how Shakespeare creates a dark and supernatural atmosphere in the opening scene.

## Key Vocabulary

- **Atmosphere**: The mood or feeling created in a scene
- **Supernatural**: Things that cannot be explained by nature or science
- **Foreshadowing**: Hints about what will happen later in the play

## Task 1: Read the Extract (10 minutes)

Read the opening lines of Macbeth carefully.

> "When shall we three meet again?
> In thunder, lightning, or in rain?"

**Step 1:** Read the extract twice.

**Step 2:** Underline any words that create a dark mood.

**Step 3:** Circle any references to weather.

## Task 2: Answer These Questions (15 minutes)

1. Who are the three characters speaking? [1 mark]

2. What type of weather do they mention? [2 marks]

3. Why do you think Shakespeare chose to start the play this way? [3 marks]

---

**Remember:** A good answer will include a quote from the text.

## Maths Example

The quadratic formula is: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$

For a right triangle, the Pythagorean theorem states:

$$a^2 + b^2 = c^2$$
`

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">📄 Convert to Word / PDF</h2>
        <p className="wizard-subtitle">
          Convert the AI's Markdown output into a formatted document with accessibility options
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
              <label className="form-label">Paste the AI's Response</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '300px', fontFamily: 'monospace' }}
                placeholder="Paste the Markdown content from ChatGPT or Claude here..."
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
              />
              <p className="form-hint">
                The AI's response should be in Markdown format with headings (#), bold (**), and lists (-)
              </p>
            </div>

            <button 
              className="btn btn-secondary"
              onClick={() => setMarkdownInput(sampleMarkdown)}
              style={{ marginTop: '8px' }}
            >
              📝 Load Sample Content
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="accessibility-options">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={accessibilityOptions.dyslexicFont}
                  onChange={() => toggleOption('dyslexicFont')}
                />
                Dyslexia-friendly font
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={accessibilityOptions.creamBackground}
                  onChange={() => toggleOption('creamBackground')}
                />
                Cream background
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={accessibilityOptions.largeText}
                  onChange={() => toggleOption('largeText')}
                />
                Larger text (14pt)
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={accessibilityOptions.extraSpacing}
                  onChange={() => toggleOption('extraSpacing')}
                />
                Extra line spacing
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Preview</label>
              <div 
                ref={previewRef}
                className="convert-preview"
                style={getPreviewStyles()}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ 
              background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f7f4 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                ✅ Your document is ready!
              </h3>
              <p style={{ color: '#5a6c7d', marginBottom: '24px' }}>
                Choose a format to download. All accessibility options have been applied.
              </p>
              
              <div className="download-buttons" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <button className="btn btn-primary btn-large" onClick={downloadAsWord}>
                  📄 Word (.docx)
                </button>
                <button className="btn btn-success btn-large" onClick={downloadAsPDF}>
                  📕 PDF (Print)
                </button>
                <button className="btn btn-secondary btn-large" onClick={downloadAsPowerPoint}>
                  📊 PowerPoint (.pptx)
                </button>
                <button className="btn btn-secondary btn-large" onClick={downloadAsHTML}>
                  🌐 HTML
                </button>
              </div>
            </div>

            <div style={{
              background: '#fff9e6',
              border: '1px solid #f0e6cc',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ marginBottom: '12px', color: '#8b6914' }}>💡 Tips</h4>
              <ul style={{ marginLeft: '20px', color: '#5a6c7d' }}>
                <li><strong>Word (.docx):</strong> Native Word format with proper formatting, tables, and lists.</li>
                <li><strong>PDF:</strong> Opens the print dialog. Select "Save as PDF" as the printer.</li>
                <li><strong>PowerPoint (.pptx):</strong> Each ## heading becomes a new slide. Great for presentations.</li>
                <li><strong>HTML:</strong> Opens in any web browser. Good for online sharing.</li>
              </ul>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="form-label">Final Preview</label>
              <div 
                className="convert-preview"
                style={getPreviewStyles()}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
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
              disabled={!markdownInput.trim()}
            >
              Next: Preview →
            </button>
          )}
          {step === 2 && (
            <button className="btn btn-primary" onClick={() => setStep(3)}>
              Next: Download →
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              Convert Another
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConvertTab
