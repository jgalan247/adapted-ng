// Task types for context-aware rules
const TASK_TYPES = {
  ADAPT: 'adapt',
  CREATE: 'create',
  QUIZ: 'quiz'
}

// Subject-specific pedagogical guidance - HOW to teach the subject
const SUBJECT_PEDAGOGY = {
  maths: {
    structure: `LESSON STRUCTURE:
1. PRIOR KNOWLEDGE: Start by activating what students already know (prerequisite skills)
2. CONCEPT INTRODUCTION: Explain the mathematical concept with concrete examples
3. WORKED EXAMPLES: Demonstrate 2-3 problems step-by-step, increasing complexity
4. GUIDED PRACTICE: Students try with support (hint boxes, partially worked solutions)
5. INDEPENDENT PRACTICE: Students work alone with decreasing scaffolding
6. CONSOLIDATION: Summary of key method, common errors to avoid`,
    content: `MATHEMATICAL CONTENT REQUIREMENTS:
- Define key terms precisely with mathematical notation
- Show MULTIPLE worked examples progressing from simple to complex
- Include "Why does this work?" explanations, not just procedures
- Address common misconceptions explicitly
- Provide method checklist students can follow
- Include estimation/sense-checking prompts`,
    questionTypes: 'fluency (practice the method), reasoning (explain why), problem-solving (apply to new contexts)'
  },
  science: {
    structure: `LESSON STRUCTURE:
1. ENGAGE: Hook with phenomenon, question, or demonstration
2. EXPLORE: Investigation or guided discovery activity
3. EXPLAIN: Introduce scientific vocabulary and concepts
4. ELABORATE: Apply to new situations, make connections
5. EVALUATE: Check understanding, address misconceptions`,
    content: `SCIENTIFIC CONTENT REQUIREMENTS:
- Use correct scientific terminology with clear definitions
- Explain cause and effect relationships
- Include diagrams with clear labels
- Connect to real-world applications
- Address common misconceptions explicitly
- Include "What would happen if...?" questions`,
    questionTypes: 'recall (definitions, facts), application (use knowledge), analysis (explain data/results), evaluation (judge/compare)'
  },
  english: {
    structure: `LESSON STRUCTURE:
1. CONTEXT: Set the scene - author, period, genre, purpose
2. FIRST READING: Overall meaning and initial response
3. CLOSE ANALYSIS: Language, structure, form analysis
4. INTERPRETATION: What does it mean? Multiple interpretations
5. PERSONAL RESPONSE: Student's own supported opinion`,
    content: `ENGLISH CONTENT REQUIREMENTS:
- Provide relevant context (historical, biographical, genre)
- Include the actual text/extract to analyse
- Model analytical writing with PEE/PEEL paragraphs
- Provide a bank of key quotes with suggested interpretations
- Include vocabulary for analysis (e.g., connotes, implies, suggests)
- Show how to embed quotes in sentences`,
    questionTypes: 'comprehension (retrieve, summarise), analysis (language/structure effects), evaluation (personal response with evidence)'
  },
  history: {
    structure: `LESSON STRUCTURE:
1. CONTEXT: When, where, what was happening
2. KEY KNOWLEDGE: Essential facts, dates, figures
3. SOURCE WORK: Analyse primary/secondary sources
4. INTERPRETATION: Why did it happen? What were the consequences?
5. SIGNIFICANCE: Why does it matter? Links to today`,
    content: `HISTORY CONTENT REQUIREMENTS:
- Provide clear chronological context
- Include key dates, names, events
- Use primary and secondary sources with provenance
- Explain cause, consequence, change, continuity
- Show multiple perspectives/interpretations
- Model source analysis and extended writing`,
    questionTypes: 'knowledge (facts, dates), source analysis (utility, reliability), explanation (causes, consequences), judgement (significance, interpretations)'
  },
  geography: {
    structure: `LESSON STRUCTURE:
1. PLACE: Where is this? Locate on maps at different scales
2. DESCRIBE: What is it like? Physical and human features
3. EXPLAIN: Why is it like this? Processes and causes
4. EVALUATE: What are the impacts? Who benefits/loses?
5. FUTURE: What might happen? Sustainability`,
    content: `GEOGRAPHY CONTENT REQUIREMENTS:
- Include maps at appropriate scales
- Use case studies with specific place details
- Explain geographical processes clearly
- Include data (statistics, graphs) to support points
- Show connections between physical and human geography
- Address different stakeholder perspectives`,
    questionTypes: 'describe (what is there), explain (why/how), analyse (patterns, connections), evaluate (judge solutions, impacts)'
  },
  computing: {
    structure: `LESSON STRUCTURE:
1. UNPLUG: Introduce concept without computer first
2. DEMONSTRATE: Show working code/algorithm with explanation
3. MODIFY: Students adapt existing code
4. CREATE: Students write their own solution
5. DEBUG: Test, find errors, fix`,
    content: `COMPUTING CONTENT REQUIREMENTS:
- Explain concepts before showing code
- Provide working code examples with line-by-line comments
- Include trace tables or dry-run exercises
- Show common errors and how to fix them
- Build complexity gradually (start simple, add features)
- Include pseudocode before real code`,
    questionTypes: 'recall (definitions, syntax), trace (predict output), debug (find/fix errors), create (write code for a task)'
  }
}

// Get pedagogy for subject (default to maths)
function getPedagogy(subject) {
  return SUBJECT_PEDAGOGY[subject] || SUBJECT_PEDAGOGY.maths
}

// Neurologically-specific condition rules
// Each condition targets the actual cognitive/processing differences

const CONDITION_RULES = {
  autism: {
    name: 'Autism Spectrum Condition',
    // ASC: Difficulty with implicit meaning, need for predictability, literal interpretation
    getCore: (subject) => {
      const base = `- LITERAL LANGUAGE: No idioms, metaphors, or sarcasm—say exactly what you mean
- EXPLICIT SEQUENCE: Number every step; never assume they'll infer the next action
- CLEAR REFERENTS: Replace "it", "this", "they" with the specific noun
- PRECISE QUANTITIES: "Write 3 sentences" not "Write a few sentences"
- PREDICTABLE STRUCTURE: Same layout pattern throughout; signal any changes`
      // Subject-specific additions
      if (subject === 'english') {
        return base + `\n- Explain figurative language when analysing texts ("This metaphor means...")`
      }
      if (subject === 'maths' || subject === 'science') {
        return base + `\n- State exactly what format the answer should be in`
      }
      return base
    },
    quiz: `- Single, unambiguous instruction per question
- State exactly how many points/reasons required`
  },

  adhd: {
    name: 'ADHD',
    // ADHD: Executive function challenges, need for novelty, difficulty sustaining attention
    getCore: (subject) => {
      const base = `- CHUNKED CONTENT: Max 3-4 items per section; one concept per chunk
- TIME ANCHORS: Estimate for each task ("~5 mins") to aid time-blindness
- PROGRESS TRACKING: Checkboxes ☐ to show completion and maintain momentum
- VISUAL SIGNPOSTING: Bold key words; clear START/STOP markers
- VARIED ACTIVITIES: Mix question types to maintain engagement`
      if (subject === 'english' || subject === 'history') {
        return base + `\n- Break long texts into labelled sections with specific focus questions`
      }
      if (subject === 'maths') {
        return base + `\n- One problem type per section; clear transition between topics`
      }
      return base
    },
    quiz: `- Short question stems; avoid multi-part questions
- Visual breaks between questions (spacing/lines)`
  },

  dyslexia: {
    name: 'Dyslexia',
    // Dyslexia: Phonological processing, decoding difficulties, working memory load from reading
    getCore: (subject) => {
      const base = `- REDUCED READING LOAD: Short sentences (max 15-20 words); one idea per sentence
- DECODABLE VOCABULARY: Simple words for instructions; keep technical terms with definitions
- ACTIVE CONSTRUCTIONS: "Calculate the area" not "The area should be calculated"
- SCANNABLE FORMAT: Bullets, numbered lists; avoid dense paragraphs`
      if (subject === 'english') {
        return base + `\n- Provide key quotes rather than requiring students to find them
- Audio/visual alternatives where possible`
      }
      if (subject === 'maths' || subject === 'science') {
        return base + `\n- Minimise word problems; use diagrams and symbols where possible`
      }
      return base
    },
    quiz: `- Keep question stems short and direct
- Bold key instruction words (calculate, explain, describe)`
  },

  dyscalculia: {
    name: 'Dyscalculia',
    // Dyscalculia: Number sense difficulties, spatial aspects of maths, procedural memory for algorithms
    getCore: (subject) => {
      // Dyscalculia rules are primarily relevant for maths/science
      if (subject === 'maths') {
        return `- CONCRETE FIRST: Physical/visual representations before abstract (○○○, number lines, place value grids)
- PROCEDURAL SCAFFOLDING: Every calculation broken into numbered micro-steps
- FORMULA REFERENCE: Keep formulas visible; don't require memorisation
- ESTIMATION HABITS: "Will the answer be bigger/smaller than...?" before calculating
- SINGLE OPERATION: One operation type per section; explicit transition between types
- REAL CONTEXTS: Embed numbers in meaningful scenarios`
      }
      if (subject === 'science') {
        return `- CALCULATION SUPPORT: Step-by-step method boxes for any calculations
- FORMULA REFERENCE: Provide all formulas; focus on understanding not recall
- VISUAL DATA: Prefer diagrams/graphs over tables of numbers
- ESTIMATION: Encourage sense-checking ("Is this answer reasonable?")`
      }
      // For non-maths subjects, minimal rules
      return `- Provide any numerical information in multiple formats
- Don't assume comfort with dates, statistics, or data interpretation`
    },
    quiz: `- Provide formula sheet
- Include "estimate first" prompts
- Partial marks for correct method`
  },

  anxiety: {
    name: 'Anxiety',
    // Anxiety: Threat sensitivity, perfectionism, avoidance, physical symptoms under stress
    getCore: (subject) => {
      const base = `- LOW-THREAT LANGUAGE: "Try", "practice", "explore" not "must", "test", "exam"
- PERMISSION STATEMENTS: "It's okay to skip and return", "Ask for help anytime"
- REDUCE UNCERTAINTY: Clear expectations; "There are 5 questions. This should take about 15 minutes."
- NORMALISE STRUGGLE: "Many students find this challenging—take your time"
- GROWTH FRAMING: Focus on process/thinking, not just correct answers`
      if (subject === 'maths' || subject === 'science') {
        return base + `\n- Emphasise method marks; "Show your working—partial credit available"`
      }
      if (subject === 'english') {
        return base + `\n- "There's no single right answer—explain your interpretation"`
      }
      return base
    },
    quiz: `- Call it "practice activity" not "test"
- "Show your thinking" not "Get the right answer"
- Note partial credit is available`
  },

  visual_processing: {
    name: 'Visual Processing Difficulties',
    // Visual processing: Difficulty interpreting visual information, tracking, visual crowding
    getCore: (subject) => {
      const base = `- UNCLUTTERED LAYOUT: Maximum 1-2 elements per visual area; generous margins
- CONSISTENT VISUAL LANGUAGE: Same fonts, heading sizes, spacing throughout
- CLEAR HIERARCHY: Obvious distinction between headings, subheadings, body text
- DESCRIBED VISUALS: Text description of any image, graph, or diagram content`
      if (subject === 'maths' || subject === 'science') {
        return base + `\n- Large, well-spaced numbers and symbols
- Avoid crowded diagrams; label clearly`
      }
      if (subject === 'geography') {
        return base + `\n- Describe map features in text; use high-contrast colours`
      }
      return base
    },
    quiz: `- One question visible at a time where possible
- Clear spacing between answer options
- Avoid questions requiring detailed visual interpretation`
  },

  working_memory: {
    name: 'Working Memory Difficulties',
    // Working memory: Limited capacity for holding/manipulating information simultaneously
    getCore: (subject) => {
      const base = `- EXTERNAL MEMORY AIDS: Reference boxes with key facts visible throughout
- SINGLE-STEP INSTRUCTIONS: One action per instruction; sequence numbered separately
- INFORMATION AT POINT OF NEED: Repeat relevant facts where needed; don't assume recall
- REDUCED COGNITIVE LOAD: Remove non-essential information`
      if (subject === 'maths') {
        return base + `\n- Keep formulas visible; provide worked example alongside practice questions`
      }
      if (subject === 'english' || subject === 'history') {
        return base + `\n- Provide key quotes/facts alongside questions that need them`
      }
      if (subject === 'science') {
        return base + `\n- Method steps visible during experiments; key definitions in margin`
      }
      return base
    },
    quiz: `- Include all information needed within each question
- Don't require recall from a passage read earlier
- Keep instructions visible`
  },

  slow_processing: {
    name: 'Slow Processing Speed',
    // Slow processing: Needs more time to take in, process, and respond to information
    getCore: (subject) => {
      const base = `- REDUCED QUANTITY, SAME DEPTH: Fewer questions covering same learning objectives
- STREAMLINED LANGUAGE: Direct instructions; remove filler words and redundancy
- TIERED TASKS: Mark "Core" (must do) vs "Extension" (if time permits)
- TIME GUIDANCE: "Standard: 30 min | Extended: 45 min"`
      if (subject === 'english' || subject === 'history') {
        return base + `\n- Shorter source texts or provide summary alongside full text`
      }
      if (subject === 'maths') {
        return base + `\n- Fewer practice questions; focus on depth of understanding`
      }
      return base
    },
    quiz: `- Mark questions as Core/Extension
- Provide timing guidance (standard + extended time)
- Fewer questions testing same skills`
  },

  eal: {
    name: 'English as Additional Language',
    // EAL: Language barrier, cultural unfamiliarity, academic English vs conversational
    getCore: (subject) => {
      const base = `- SIMPLIFIED INSTRUCTION LANGUAGE: Short sentences; common vocabulary for non-technical words
- NO IDIOMS OR CULTURAL ASSUMPTIONS: "At a market" not "At a boot sale"; diverse names
- TECHNICAL VOCABULARY SUPPORT: **Bold** subject terms with brief definition in brackets
- GLOSSARY: Key terms box at start with simple definitions`
      if (subject === 'english') {
        return base + `\n- Explain historical/cultural context of texts
- Provide vocabulary lists for literary analysis`
      }
      if (subject === 'history') {
        return base + `\n- Explain UK-specific historical context that may be unfamiliar`
      }
      return base
    },
    quiz: `- Culturally neutral scenarios and names
- Define complex vocabulary within the question
- Avoid idiomatic question phrasing`
  }
}

// Build condition rules based on task type and subject
function getConditionRules(conditionKey, subject, taskType = TASK_TYPES.CREATE) {
  const condition = CONDITION_RULES[conditionKey]
  if (!condition) return ''

  // Get subject-specific core rules
  const coreRules = condition.getCore ? condition.getCore(subject) : (condition.core || '')
  let rules = `${condition.name.toUpperCase()}:\n${coreRules}`

  // Add quiz-specific rules if applicable
  if (taskType === TASK_TYPES.QUIZ && condition.quiz) {
    rules += `\n${condition.quiz}`
  }

  return rules
}

// Legacy support - get full CONDITION_PROMPTS object
const CONDITION_PROMPTS = Object.fromEntries(
  Object.entries(CONDITION_RULES).map(([key, value]) => [
    key,
    { name: value.name, getRules: (subject) => getConditionRules(key, subject) }
  ])
)

// Subject-specific protected vocabulary
const SUBJECT_VOCABULARY = {
  english: 'metaphor, simile, personification, alliteration, protagonist, antagonist, soliloquy, monologue, dramatic irony, foreshadowing, pathetic fallacy, iambic pentameter, sonnet, stanza, rhyme scheme, narrator, first person, third person, omniscient, setting, plot, theme, motif, symbolism, imagery, tone, mood, genre, tragedy, comedy, prose, verse',
  maths: 'integer, fraction, decimal, percentage, ratio, proportion, algebra, equation, expression, variable, coefficient, quadratic, linear, gradient, intercept, coordinate, axis, graph, function, domain, range, sequence, term, formula, theorem, proof, angle, polygon, circle, radius, diameter, circumference, area, perimeter, volume, surface area, probability, statistics, mean, median, mode, range',
  science: 'hypothesis, variable, independent variable, dependent variable, control variable, method, results, conclusion, evaluation, accuracy, precision, reliability, validity, atom, molecule, element, compound, mixture, reaction, product, reactant, catalyst, enzyme, cell, nucleus, chromosome, gene, DNA, photosynthesis, respiration, ecosystem, food chain, force, energy, power, voltage, current, resistance',
  history: 'primary source, secondary source, chronology, cause, consequence, significance, interpretation, evidence, bias, propaganda, treaty, revolution, reform, empire, colony, democracy, dictatorship, monarchy, parliament, constitution, civil rights, industrialisation, urbanisation, nationalism, imperialism',
  geography: 'physical geography, human geography, climate, weather, erosion, deposition, transportation, tectonic plates, earthquake, volcano, river, coast, ecosystem, biome, population, migration, urbanisation, development, sustainability, renewable, non-renewable, globalisation, trade, GDP',
  computing: 'algorithm, variable, constant, data type, integer, string, boolean, array, loop, iteration, selection, sequence, function, procedure, parameter, argument, input, output, syntax, debugging, decomposition, abstraction, binary, hexadecimal, CPU, RAM, storage, network, protocol, encryption',
}

// Key stage descriptors
const KEY_STAGE_DESCRIPTIONS = {
  ks3: 'Year 7-9 students (ages 11-14). Use age-appropriate academic language. Students are developing subject expertise.',
  ks4: 'Year 10-11 students (ages 14-16). GCSE level. Use full academic and technical vocabulary appropriate to the subject.',
  ks5: 'Year 12-13 students (ages 16-18). A-Level. Use sophisticated academic language and expect higher-order thinking.',
}

// Output format specifications
const OUTPUT_FORMAT_SPECS = {
  worksheet: {
    name: 'Worksheet',
    instructions: `OUTPUT FORMAT: WORKSHEET (1-2 pages)
- Create a structured worksheet with clear sections
- Include 5-10 questions or activities
- Add space indicators for student responses: [Write your answer here - 3 lines]
- Include a learning objective at the top
- Add success criteria or "I can..." statements`
  },
  full_lesson: {
    name: 'Full Lesson Plan',
    instructions: `OUTPUT FORMAT: FULL LESSON PLAN (3-5 pages)
- Include a STARTER activity (5-10 minutes) with hook/engagement
- Include MAIN ACTIVITIES (20-30 minutes) with differentiated tasks
- Include a PLENARY (5-10 minutes) with review/assessment
- Add timing for each section
- Include teacher notes in [TEACHER NOTE: ...]
- Add suggested resources and equipment needed
- Include differentiation notes for different ability levels`
  },
  presentation: {
    name: 'Presentation',
    instructions: `OUTPUT FORMAT: PRESENTATION (5-10 slides)
- Structure as individual slides using "## Slide 1: Title" format
- Each slide should have a clear heading and 3-5 bullet points maximum
- Include SPEAKER NOTES after each slide in [SPEAKER NOTES: ...]
- Slide 1: Title slide with learning objective
- Slides 2-3: Introduction/recap
- Slides 4-7: Main content (one concept per slide)
- Slides 8-9: Activities/practice
- Slide 10: Plenary/summary
- Keep text large and readable - minimal text per slide`
  },
  handout: {
    name: 'Handout (PDF)',
    instructions: `OUTPUT FORMAT: HANDOUT / PDF (3-4 pages)

Structure the handout with these sections:

## 1. TITLE & INTRODUCTION
- Clear title at the top
- Learning objectives (2-3 bullet points)
- Brief introduction explaining what students will learn (2-3 sentences)

## 2. KEY CONCEPTS & THEORY
- Explain the main concepts in detail with full paragraphs
- Use clear headings for each concept
- Include definitions in **bold** or in boxes
- Add image placeholders: 📷 **ADD IMAGE HERE:** [description]

## 3. WORKED EXAMPLES
- Provide 2-3 fully worked examples with step-by-step explanations
- Show the thinking process, not just the answer
- Use numbered steps: Step 1, Step 2, Step 3...
- Include image placeholders where visuals help: 📷 **ADD IMAGE HERE:** [description]

## 4. GUIDED PRACTICE
- 3-4 questions with hints or scaffolding
- Partial solutions or sentence starters provided
- Space for student answers: [Write your answer here - 3 lines]

## 5. INDEPENDENT PRACTICE
- 4-6 questions for students to try alone
- Increasing difficulty
- Include answer lines

## 6. SUMMARY BOX
- Key points to remember (bullet list)
- Common mistakes to avoid
- Extension challenge for early finishers

Make this a comprehensive learning resource with substantial text content explaining the theory.`
  },
  revision_guide: {
    name: 'Revision Guide',
    instructions: `OUTPUT FORMAT: REVISION GUIDE (2-3 pages)
- Summarise KEY CONCEPTS clearly with definitions
- Include WORKED EXAMPLES for each concept
- Add REMEMBER boxes with key facts
- Include COMMON MISTAKES to avoid
- Add PRACTICE QUESTIONS at the end with answers
- Use visual aids: diagrams, tables, flowcharts where helpful
- Make it scannable with clear headings and bullet points`
  },
  same_as_original: {
    name: 'Same as Original',
    instructions: `OUTPUT FORMAT: MATCH ORIGINAL
- Keep the same structure and format as the input resource
- Maintain similar length (or longer with added scaffolding)
- Preserve all sections in the same order`
  }
}

// Generate the ADAPT prompt - for adapting existing resources
export function generateAdaptPrompt(profile, resourceContent = '', outputFormat = 'same_as_original') {
  const conditionNames = profile.conditions.map(c => CONDITION_RULES[c]?.name).filter(Boolean)
  const ksDescription = KEY_STAGE_DESCRIPTIONS[profile.keyStage] || ''
  const formatSpec = OUTPUT_FORMAT_SPECS[outputFormat] || OUTPUT_FORMAT_SPECS.same_as_original
  const pedagogy = getPedagogy(profile.subject)
  const needsMaths = ['maths', 'science', 'computing'].includes(profile.subject)

  let prompt = `Adapt this ${profile.keyStage.toUpperCase()} ${profile.subject} resource for students with ${conditionNames.join(' and ')}.

KEY STAGE: ${ksDescription}

${formatSpec.instructions}

MAINTAIN PEDAGOGICAL QUALITY:
${pedagogy.content}

ACCESSIBILITY ADAPTATIONS:
`

  // Add condition-specific rules
  profile.conditions.forEach(c => {
    const rules = getConditionRules(c, profile.subject, TASK_TYPES.ADAPT)
    if (rules) prompt += rules + '\n\n'
  })

  prompt += `FORMAT: Markdown${needsMaths ? ', LaTeX for maths ($\\frac{1}{2}$, $x^2$)' : ''}. End with brief "## Adaptations Made" summary.

RESOURCE TO ADAPT:
${resourceContent || '[PASTE RESOURCE HERE]'}
`

  return prompt
}

// Generate the CREATE prompt - for creating new resources from scratch
export function generateCreatePrompt(profile, options = {}) {
  const { topic, learningObjectives, resourceType, duration, includeStarter, includeMain, includePlenary } = options
  const conditionNames = profile.conditions.map(c => CONDITION_RULES[c]?.name).filter(Boolean)
  const ksDescription = KEY_STAGE_DESCRIPTIONS[profile.keyStage] || ''
  const pedagogy = getPedagogy(profile.subject)
  const needsMaths = ['maths', 'science', 'computing'].includes(profile.subject)

  let structure = []
  if (includeStarter) structure.push('Starter (5-10 min)')
  if (includeMain) structure.push('Main (20-30 min)')
  if (includePlenary) structure.push('Plenary (5-10 min)')

  // Build the prompt with CONTENT FIRST
  let prompt = `Create a ${profile.keyStage.toUpperCase()} ${profile.subject} ${resourceType} on "${topic || '[Topic]'}".

LEARNING OBJECTIVES:
${learningObjectives || '[Not specified]'}

KEY STAGE: ${ksDescription}
DURATION: ${duration || '40'} minutes
${structure.length > 0 ? `STRUCTURE: ${structure.join(' → ')}` : ''}

=== TEACHING CONTENT (PRIORITY) ===

${pedagogy.structure}

${pedagogy.content}

QUESTION TYPES TO INCLUDE: ${pedagogy.questionTypes}

=== ACCESSIBILITY (for students with ${conditionNames.join(' and ')}) ===
`

  // Add condition-specific rules (more concise, after content)
  profile.conditions.forEach(c => {
    const rules = getConditionRules(c, profile.subject, TASK_TYPES.CREATE)
    if (rules) prompt += rules + '\n\n'
  })

  prompt += `=== OUTPUT ===
FORMAT: Markdown${needsMaths ? ', LaTeX for maths ($\\frac{1}{2}$, $x^2$)' : ''}
Include: Learning objective, key vocabulary definitions, worked examples, practice questions with progression, extension task.
`

  return prompt
}

// Generate the QUIZ prompt - for creating assessments
export function generateQuizPrompt(profile, options = {}) {
  const { sourceType, sourceTopic, sourceText, questionTypes, questionCount, difficulty, includeAnswers, examBoard } = options
  const conditionNames = profile.conditions.map(c => CONDITION_RULES[c]?.name).filter(Boolean)
  const ksDescription = KEY_STAGE_DESCRIPTIONS[profile.keyStage] || ''
  const pedagogy = getPedagogy(profile.subject)
  const needsMaths = ['maths', 'science', 'computing'].includes(profile.subject)

  const typeMap = {
    multiple_choice: 'MCQ',
    short_answer: 'Short answer',
    true_false: 'True/False',
    matching: 'Matching',
    fill_blank: 'Fill blank',
    extended: 'Extended'
  }

  const selectedTypes = (questionTypes || ['multiple_choice', 'short_answer'])
    .map(t => typeMap[t])
    .join(', ')

  const topicLine = sourceType === 'topic' ? sourceTopic : ''
  const textBlock = sourceType === 'text' ? `\nSOURCE TEXT:\n${sourceText}\n` : ''

  let prompt = `Create a ${profile.subject} assessment on "${topicLine || '[Topic]'}".
${textBlock}
KEY STAGE: ${ksDescription}
${examBoard && ['ks4', 'ks5'].includes(profile.keyStage) ? `EXAM BOARD STYLE: ${examBoard}` : ''}

=== ASSESSMENT CONTENT (PRIORITY) ===

QUESTIONS: ${questionCount || 10} questions
TYPES: ${selectedTypes}
DIFFICULTY: ${difficulty || 'medium'} (start with 2-3 easier questions to build confidence)

QUESTION DESIGN:
- Test: ${pedagogy.questionTypes}
- Each question should assess ONE clear skill or concept
- Include a mix of question types for varied assessment
- Progress from recall → understanding → application
- Ensure questions directly test the learning objectives

=== ACCESSIBILITY (for students with ${conditionNames.join(' and ')}) ===
`

  // Add condition-specific rules (including quiz-specific additions)
  profile.conditions.forEach(c => {
    const rules = getConditionRules(c, profile.subject, TASK_TYPES.QUIZ)
    if (rules) prompt += rules + '\n\n'
  })

  prompt += `=== OUTPUT FORMAT ===
- **Q1** [X marks] as header
- Separate questions with ---
- MCQ: ☐ options with plausible distractors
- Answer lines: _____________${needsMaths ? `
- LaTeX for maths ($\\frac{1}{2}$, $x^2$)` : ''}

${includeAnswers ? `Include "## Answers" section with mark scheme and common misconceptions.` : `Do NOT include answers (student version).`}

End with: Total marks, suggested timing (standard + extended time).
`

  return prompt
}

export { CONDITION_PROMPTS, SUBJECT_VOCABULARY, KEY_STAGE_DESCRIPTIONS }
