/* Generates the demo script .docx. Run: node demo/build-demo-doc.cjs */
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, PageOrientation, ExternalHyperlink, BorderStyle,
} = require('docx')

const FONT = 'Arial'
const ACCENT = '2D5A7B' // primary brand colour

// Helpers -------------------------------------------------------------------

const p = (children, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: Array.isArray(children) ? children : [children],
  })

const text = (s, opts = {}) => new TextRun({ text: s, font: FONT, ...opts })

const h1 = (s) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text: s, font: FONT, bold: true, size: 32, color: ACCENT })],
  })

const h2 = (s) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text: s, font: FONT, bold: true, size: 26, color: ACCENT })],
  })

const h3 = (s) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: s, font: FONT, bold: true, size: 22 })],
  })

const bullet = (children) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80 },
    children: Array.isArray(children) ? children : [children],
  })

const numbered = (children) =>
  new Paragraph({
    numbering: { reference: 'steps', level: 0 },
    spacing: { after: 100 },
    children: Array.isArray(children) ? children : [children],
  })

// A "what to say" italic block
const sayBlock = (s) =>
  new Paragraph({
    spacing: { before: 60, after: 120 },
    indent: { left: 480 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 12 } },
    children: [
      new TextRun({ text: 'Say: ', font: FONT, bold: true, italics: true, color: ACCENT }),
      new TextRun({ text: `"${s}"`, font: FONT, italics: true }),
    ],
  })

// A "click X" run helper
const click = (s) => new TextRun({ text: s, font: FONT, bold: true })

// Sentence-with-mixed-formatting helper
const mix = (...parts) => parts.map((part) => (typeof part === 'string' ? text(part) : part))

// Hyperlink
const link = (url, label = url) =>
  new ExternalHyperlink({
    children: [new TextRun({ text: label, font: FONT, color: '0563C1', underline: { type: 'single' } })],
    link: url,
  })

// Divider line
const hr = () =>
  new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
    children: [text('')],
  })

// Content -------------------------------------------------------------------

const children = []

// Title
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({ text: 'adapted-ng', font: FONT, bold: true, size: 48, color: ACCENT }),
    ],
  }),
)
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [
      new TextRun({ text: 'Demo Script for Haute Vallée', font: FONT, bold: true, size: 28 }),
    ],
  }),
)
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 480 },
    children: [
      text('A 10-minute walk-through. Two examples, end-to-end. ', { italics: true, color: '555555' }),
      link('https://jgalan247.github.io/adapted-ng/'),
    ],
  }),
)

// ----- 60 second pitch ----------------------------------------------------
children.push(h1('What this tool does (60-second pitch)'))
children.push(
  p([
    text(
      'adapted-ng helps teachers build accessible classroom resources for neurodivergent and EAL students at KS3, KS4, and KS5. ',
    ),
    text(
      'It generates a precise, personalised prompt that the teacher pastes into Microsoft Copilot — the only AI tool sanctioned by the school. ',
    ),
    text(
      'Critically, the app never calls an AI service itself, so it is fully compliant with the acceptable-use policy. ',
    ),
    text(
      'What makes it different: teachers describe a student by ',
      { },
    ),
    text('features', { bold: true }),
    text(' (e.g. "minimal visual clutter, literal language, pre-taught vocabulary"), not just diagnostic labels. '),
    text('Two autistic students can need opposite things — the tool lets a teacher say so.', { italics: true }),
  ]),
)

// ----- Before you start ---------------------------------------------------
children.push(h1('Before you start'))
children.push(bullet([text('Open '), text('Microsoft Copilot', { bold: true }), text(' in one browser tab')]))
children.push(bullet([text('Open '), link('https://jgalan247.github.io/adapted-ng/'), text(' in another tab')]))
children.push(
  bullet([
    text('Have a '),
    text('Corbettmaths PDF on Pythagoras\' Theorem', { bold: true }),
    text(' ready for Example 1 (download from corbettmaths.com)'),
  ]),
)
children.push(
  bullet([
    text('Have the text of '),
    text('Macbeth Act 1 Scene 1 (the witches)', { bold: true }),
    text(' copied to your clipboard for Example 2'),
  ]),
)
children.push(bullet([text('Optional: a projector mirror so colleagues can see both tabs')]))

children.push(hr())

// ============== EXAMPLE 1 =================================================
children.push(h1('Example 1 — Adapt a Corbettmaths PDF for a bottom-set student'))
children.push(
  p([text('Estimated time: ', { bold: true }), text('5 minutes.'), text(' This is the hero demo.', { italics: true, color: '555555' })]),
)

children.push(h3('Scenario'))
children.push(
  sayBlock(
    'I teach KS4 Maths. I\'ve got a Corbettmaths PDF on Pythagoras. My bottom set includes students with dyslexia, ADHD and EAL needs. I want it adapted in under two minutes.',
  ),
)

children.push(h3('Step-by-step'))

children.push(
  numbered(
    mix(
      'Land on the home page. Point out the gold ',
      click('⭐ Demo preset'),
      ' card at the top.',
    ),
  ),
)
children.push(sayBlock('One click loads a hand-tuned profile — not generic, but 18 specific decisions for this student archetype.'))

children.push(
  numbered(
    mix(
      'Click the ',
      click('⭐ Demo preset'),
      ' card. The app routes straight to the Adapt page. Pause.',
    ),
  ),
)
children.push(sayBlock('Notice the header — Maths, KS4, Bottom set. The conditions are already there.'))

children.push(
  numbered(
    mix(
      'Click ',
      click('✏️ Edit features'),
      ' in the header. The modal opens. Scroll briefly through the groups (Visual: Minimal, Language: Literal, Vocabulary: Pre-teach + Visual cards + Glossary, etc).',
    ),
  ),
)
children.push(sayBlock('Each of these was chosen for THIS student archetype. If your Sam is different, change them. The diagnosis is the starting point, not the answer.'))

children.push(
  numbered(
    mix(
      'Close the modal. Pick source mode: ',
      click('📎 I have uploaded a PDF to Copilot'),
      '. Pick Output Format: ',
      click('Worksheet'),
      '.',
    ),
  ),
)

children.push(numbered(mix('Switch to the Copilot tab. Drag the Corbettmaths PDF into the chat. Wait for Copilot to confirm it has read the file.')))

children.push(
  numbered(
    mix(
      'Switch back to adapted-ng. Click ',
      click('Generate Adapted Prompt'),
      '. The prompt appears with the student-specific feature block.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Click ',
      click('📋 Copy & Open Copilot'),
      '. Paste (Ctrl+V) into the ',
      text('same Copilot conversation', { italics: true }),
      ' where the PDF is already attached.',
    ),
  ),
)

children.push(numbered(mix('Wait ~30 seconds. Copilot returns an adapted worksheet in Markdown.')))

children.push(
  numbered(
    mix(
      'Copy Copilot\'s entire response. Back in adapted-ng, click ',
      click('← Home'),
      ', then click ',
      click('📄 Format it as Word / PDF'),
      '.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Paste the Markdown into the textarea. Click ',
      click('Download Word'),
      '. Open the .docx in Word.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Highlight the visible accessibility: ',
      text('dyslexia-friendly font, cream background, larger text, more spacing.', { bold: true }),
    ),
  ),
)

children.push(h3('Closing line'))
children.push(
  sayBlock(
    'Total time: about 90 seconds of teacher work. The student gets a resource that\'s been adapted along 18 specific axes — not a generic "made it easier".',
  ),
)

children.push(hr())

// ============== EXAMPLE 2 =================================================
children.push(h1('Example 2 — Create a Shakespeare worksheet for an autistic KS3 student with a custom profile'))
children.push(
  p([text('Estimated time: ', { bold: true }), text('3 minutes.'), text(' Shows the granular customisation in action.', { italics: true, color: '555555' })]),
)

children.push(h3('Scenario'))
children.push(
  sayBlock(
    'I teach Year 8 English. I have an autistic student who, unusually, prefers minimal visuals and loves figurative language — the opposite of the typical autism profile. I want to create a Macbeth Act 1 Scene 1 worksheet for him.',
  ),
)

children.push(h3('Step-by-step'))

children.push(numbered(mix('Go back to the home page. Click the ', click('✏️ Create something new'), ' card.')))

children.push(
  numbered(
    mix(
      'In the header, set: Conditions = ',
      text('Autism', { bold: true }),
      ', Subject = ',
      text('English', { bold: true }),
      ', Key Stage = ',
      text('KS3', { bold: true }),
      ', Ability Set = ',
      text('Top set / Higher', { bold: true }),
      '.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Click ',
      click('✏️ Edit features'),
      '. Click the ',
      click('Autism (typical profile)'),
      ' preset pill to load the standard autism defaults.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Now ',
      text('customise', { bold: true }),
      ': change ',
      text('Visual layout', { bold: true }),
      ' from "Rich" to ',
      click('Minimal visual clutter'),
      '. Change ',
      text('Language style', { bold: true }),
      ' from "Literal" to ',
      click('Rich / figurative language welcomed'),
      '. Click ',
      click('Save profile'),
      '.',
    ),
  ),
)
children.push(
  sayBlock(
    'Notice — I just made two changes that contradict the typical autism preset. The tool doesn\'t fight me. It trusts I know my student.',
  ),
)

children.push(
  numbered(
    mix(
      'Back in the Create wizard, enter Topic: ',
      text('Macbeth Act 1 Scene 1 — the witches', { bold: true }),
      '.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Enter Learning Objectives: ',
      text('Understand how Shakespeare creates atmosphere; identify language techniques in the witches\' speeches.', { italics: true }),
    ),
  ),
)

children.push(numbered(mix('Pick Resource Type: ', click('Worksheet'), '. Duration: 40 minutes. Click ', click('Next'), ' twice.')))

children.push(
  numbered(
    mix(
      'Click ',
      click('Generate Prompt'),
      '. The prompt appears. Scroll briefly — point out the "STUDENT-SPECIFIC ACCESSIBILITY FEATURES" block listing the custom choices.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Click ',
      click('📋 Copy & Open Copilot'),
      ' (or copy and switch to Copilot in a new conversation). Paste, wait for the response.',
    ),
  ),
)

children.push(
  numbered(
    mix(
      'Copy Copilot\'s reply. Go to ',
      click('📄 Format it as Word / PDF'),
      '. Paste. Download.',
    ),
  ),
)

children.push(h3('Closing line'))
children.push(
  sayBlock(
    'Same tool, completely different output — because the profile was different. That is the point.',
  ),
)

children.push(hr())

// ----- SLT talking points -------------------------------------------------
children.push(h1('Key talking points (leave-behind for SLT / SENCO)'))
children.push(bullet([text('Respects the acceptable-use policy: ', { bold: true }), text('the app never calls AI directly; the teacher uses school-approved Microsoft Copilot.')]))
children.push(bullet([text('Person-centred: ', { bold: true }), text('features, not labels. No two students with the same diagnosis are the same.')]))
children.push(bullet([text('Pedagogy-led: ', { bold: true }), text('each accessibility feature has an evidence-informed rule injected into the prompt.')]))
children.push(bullet([text('Time-saving: ', { bold: true }), text('~90 seconds of teacher work vs ~30 minutes of manual adaptation per resource.')]))
children.push(bullet([text('Open and free: ', { bold: true }), text('open source, hosted on GitHub Pages, zero per-seat cost.')]))
children.push(bullet([text('Made here: ', { bold: true }), text('built at Haute Vallée by Dr Galan.')]))
children.push(bullet([text('URL: '), link('https://jgalan247.github.io/adapted-ng/')]))

children.push(hr())

// ----- Troubleshooting ----------------------------------------------------
children.push(h1('Troubleshooting'))
children.push(bullet([text('If Copilot doesn\'t seem to see the PDF: ', { bold: true }), text('re-attach the file in the same chat, then paste the prompt again.')]))
children.push(bullet([text('If the output is too long: ', { bold: true }), text('after Copilot responds, ask "make it half the length" — it adapts the same content.')]))
children.push(
  bullet([
    text('If a feature is missing from the worksheet: ', { bold: true }),
    text('click '),
    click('✏️ Edit features'),
    text(', confirm the feature is ticked, and regenerate the prompt.'),
  ]),
)
children.push(bullet([text('If the cream background doesn\'t appear in the Word doc: ', { bold: true }), text('open the file in Word (not Pages); Pages strips some background formatting.')]))

// Build the document --------------------------------------------------------
const doc = new Document({
  creator: 'Dr Galan',
  title: 'adapted-ng — Demo Script for Haute Vallée',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } }, // 11pt
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: FONT, size: 32, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: FONT, size: 26, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: FONT, size: 22, bold: true },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: 'steps',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    },
  ],
})

const outPath = path.join(__dirname, 'adapted-ng-demo-script.docx')
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf)
  console.log(`Wrote ${outPath} (${buf.length} bytes)`)
})
