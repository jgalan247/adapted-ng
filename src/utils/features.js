/**
 * Granular accessibility-feature model.
 *
 * Replaces blunt diagnostic labels ("autism", "ADHD") with a fine-grained
 * profile of features a student actually needs. Two autistic students can
 * have opposite sensory profiles; this lets a teacher say so.
 *
 * Structure:
 *   FEATURE_GROUPS — UI groups. Each group is either:
 *     type: 'single'   — radio buttons, one choice (mutually exclusive within group)
 *     type: 'multi'    — checkboxes, any number selected
 *
 *   FEATURE_RULES   — per-feature: human label + the rule string injected into the prompt.
 *
 *   DIAGNOSTIC_PRESETS — diagnostic label → pre-selected feature set.
 *     Teacher clicks a preset, then tweaks. The presets are starting points,
 *     NOT the source of truth — the features are.
 *
 *   CONFLICTS — cross-category pairs that are unusual together. We don't block
 *     them — teachers know their students — but we surface a warning chip.
 */

export const FEATURE_GROUPS = [
  {
    id: 'visual_layout',
    label: 'Visual layout',
    type: 'single',
    options: ['visual_rich', 'visual_balanced', 'visual_minimal'],
  },
  {
    id: 'attention',
    label: 'Attention & pacing',
    type: 'single',
    options: ['attn_short_bursts', 'attn_standard', 'attn_deep_focus'],
  },
  {
    id: 'structure',
    label: 'Structure & predictability',
    type: 'single',
    options: ['struct_high_predict', 'struct_balanced', 'struct_novelty'],
  },
  {
    id: 'language_style',
    label: 'Language style',
    type: 'single',
    options: ['lang_literal', 'lang_standard', 'lang_rich'],
  },
  {
    id: 'social',
    label: 'Social & collaboration',
    type: 'single',
    options: ['soc_solo', 'soc_pair', 'soc_group'],
  },
  {
    id: 'reading',
    label: 'Reading support',
    type: 'multi',
    options: ['read_dyslexic_font', 'read_larger_text', 'read_decodable', 'read_less_per_page'],
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary support',
    type: 'multi',
    options: ['vocab_preteach', 'vocab_visual_cards', 'vocab_glossary'],
  },
  {
    id: 'processing',
    label: 'Processing & working memory',
    type: 'multi',
    options: ['proc_extra_time', 'proc_fewer_items', 'proc_step_by_step', 'proc_worked_examples', 'proc_concrete_first', 'proc_chunking'],
  },
  {
    id: 'regulation',
    label: 'Regulation, safety & writing scaffolds',
    type: 'multi',
    options: ['reg_low_stakes', 'reg_clear_success', 'reg_choice', 'reg_sentence_starters'],
  },
  {
    id: 'maths',
    label: 'Maths-specific (only used if subject is Maths/Science)',
    type: 'multi',
    options: ['math_visual_models', 'math_worked_solutions', 'math_real_world'],
  },
]

export const FEATURE_RULES = {
  // visual_layout
  visual_rich: {
    label: 'Rich visual scaffolding',
    rule: 'Use rich visual structure: colour-coded sections, icons next to key points, diagrams, callout boxes, visual cues throughout.',
  },
  visual_balanced: {
    label: 'Balanced visual support',
    rule: 'Use moderate visual elements: clear headings, occasional icons, well-spaced sections — but avoid heavy decoration.',
  },
  visual_minimal: {
    label: 'Minimal visual clutter',
    rule: 'Use a clean, plain layout. No colour, no icons, no decorative elements. Plenty of white space. One thing per area.',
  },

  // attention
  attn_short_bursts: {
    label: 'Short bursts (3–5 min activities)',
    rule: 'Break work into short 3–5 minute activities. Each task should be completable before attention drifts. Frequent natural break points.',
  },
  attn_standard: {
    label: 'Standard pacing',
    rule: 'Use standard activity lengths (10–15 min) appropriate to the key stage.',
  },
  attn_deep_focus: {
    label: 'Extended deep focus',
    rule: 'Allow extended single-task focus (20+ min). Avoid unnecessary task-switching.',
  },

  // structure
  struct_high_predict: {
    label: 'High predictability (consistent format)',
    rule: 'Maintain a consistent, predictable structure. Use the same format and order every time. Signpost every transition explicitly. No surprises.',
  },
  struct_balanced: {
    label: 'Balanced structure',
    rule: 'Use a clear structure but vary task types within it.',
  },
  struct_novelty: {
    label: 'Novelty welcomed',
    rule: 'Include novel formats, surprises, and unusual contexts to engage curiosity.',
  },

  // language_style
  lang_literal: {
    label: 'Literal, direct language',
    rule: 'Use literal, direct language. No idioms, metaphors, sarcasm or figurative speech. Say exactly what you mean. Avoid ambiguity.',
  },
  lang_standard: {
    label: 'Standard academic language',
    rule: 'Use standard academic language appropriate to the key stage.',
  },
  lang_rich: {
    label: 'Rich / figurative language welcomed',
    rule: 'Use rich vocabulary including metaphor, idiom and figurative language as appropriate.',
  },

  // social
  soc_solo: {
    label: 'Solo work preferred',
    rule: 'Design tasks for independent work. Avoid required group or pair interactions.',
  },
  soc_pair: {
    label: 'Structured pair work',
    rule: 'Include structured pair tasks with clear roles and explicit scripts. Avoid open-ended group dynamics.',
  },
  soc_group: {
    label: 'Open group work',
    rule: 'Include open collaborative group tasks where students discuss and negotiate.',
  },

  // reading
  read_dyslexic_font: {
    label: 'Dyslexia-friendly font',
    rule: 'Specify a dyslexia-friendly font (e.g. OpenDyslexic, Lexend, Comic Sans) at the top of the document.',
  },
  read_larger_text: {
    label: 'Larger text + extra line spacing',
    rule: 'Use larger font (14pt+) and at least 1.5 line spacing. Generous paragraph spacing.',
  },
  read_decodable: {
    label: 'Decodable / common words',
    rule: 'Prefer high-frequency, decodable words. Avoid unnecessary low-frequency vocabulary in instructions and stems.',
  },
  read_less_per_page: {
    label: 'Less text per page',
    rule: 'Limit the amount of text on each page or section. Break long passages into smaller chunks with headings.',
  },

  // vocabulary
  vocab_preteach: {
    label: 'Pre-teach key vocabulary',
    rule: 'Open with a "Key Vocabulary" section that defines every subject-specific term that will appear, in plain language.',
  },
  vocab_visual_cards: {
    label: 'Visual vocabulary cards',
    rule: 'For each key vocabulary term, include a small visual cue or icon and a one-line example sentence.',
  },
  vocab_glossary: {
    label: 'End-of-resource glossary',
    rule: 'Include a glossary at the end of the resource listing every technical term used.',
  },

  // processing
  proc_extra_time: {
    label: 'Extra time / fewer items',
    rule: 'Reduce the total number of items to allow more time per task. Quality over quantity.',
  },
  proc_fewer_items: {
    label: 'Fewer items per page',
    rule: 'Show no more than 3–5 items per page or section. Avoid dense layouts.',
  },
  proc_step_by_step: {
    label: 'Step-by-step scaffolds',
    rule: 'For every multi-step task, break the steps out explicitly. Number each step. Do not assume the student can hold the procedure in mind.',
  },
  proc_worked_examples: {
    label: 'Worked examples before practice',
    rule: 'Show 2 fully worked examples before any practice question. Annotate the reasoning at each step.',
  },
  proc_concrete_first: {
    label: 'Concrete before abstract',
    rule: 'Introduce concepts through concrete, real-world examples before any abstract notation or generalisation.',
  },
  proc_chunking: {
    label: 'Chunking long tasks',
    rule: 'Break long tasks into named sub-tasks with checkpoints between each. The student should always know "where they are".',
  },

  // regulation
  reg_low_stakes: {
    label: 'Low-stakes practice (no public failure)',
    rule: 'Frame all practice as low-stakes. Avoid any element that could expose the student to public failure in front of peers.',
  },
  reg_clear_success: {
    label: 'Clear success criteria',
    rule: 'State explicit success criteria at the top of each task ("You\'ve done this if…"). Include self-check questions.',
  },
  reg_choice: {
    label: 'Choice of task (autonomy)',
    rule: 'Offer 2–3 alternative tasks at the same difficulty so the student can choose. Autonomy supports engagement.',
  },
  reg_sentence_starters: {
    label: 'Sentence starters for writing',
    rule: 'For any extended-writing task, provide 2–3 sentence starters and a paragraph frame.',
  },

  // maths
  math_visual_models: {
    label: 'Visual mathematical models',
    rule: 'Use bar models, number lines, arrays and other visual representations alongside symbolic notation.',
  },
  math_worked_solutions: {
    label: 'Step-by-step worked solutions',
    rule: 'For every example, show every line of working. Annotate which operation is being applied and why.',
  },
  math_real_world: {
    label: 'Real-world maths contexts',
    rule: 'Ground every abstract concept in a real-world context the student can visualise.',
  },
}

/**
 * Diagnostic presets — clicking applies these features, teacher refines from there.
 * Chosen pragmatically from common SEND practice; not prescriptive.
 */
export const DIAGNOSTIC_PRESETS = {
  autism: {
    label: 'Autism (typical profile)',
    features: {
      visual_layout: 'visual_rich',
      attention: 'attn_standard',
      structure: 'struct_high_predict',
      language_style: 'lang_literal',
      social: 'soc_solo',
      reading: [],
      vocabulary: ['vocab_preteach'],
      processing: ['proc_step_by_step', 'proc_worked_examples'],
      regulation: ['reg_clear_success', 'reg_low_stakes'],
      maths: [],
    },
  },
  adhd: {
    label: 'ADHD (typical profile)',
    features: {
      visual_layout: 'visual_balanced',
      attention: 'attn_short_bursts',
      structure: 'struct_balanced',
      language_style: 'lang_standard',
      social: 'soc_pair',
      reading: ['read_less_per_page'],
      vocabulary: [],
      processing: ['proc_chunking', 'proc_fewer_items'],
      regulation: ['reg_clear_success', 'reg_choice'],
      maths: [],
    },
  },
  dyslexia: {
    label: 'Dyslexia (typical profile)',
    features: {
      visual_layout: 'visual_minimal',
      attention: 'attn_standard',
      structure: 'struct_balanced',
      language_style: 'lang_standard',
      social: 'soc_pair',
      reading: ['read_dyslexic_font', 'read_larger_text', 'read_decodable', 'read_less_per_page'],
      vocabulary: ['vocab_preteach', 'vocab_glossary'],
      processing: ['proc_extra_time'],
      regulation: ['reg_sentence_starters'],
      maths: [],
    },
  },
  dyscalculia: {
    label: 'Dyscalculia (typical profile)',
    features: {
      visual_layout: 'visual_balanced',
      attention: 'attn_standard',
      structure: 'struct_balanced',
      language_style: 'lang_standard',
      social: 'soc_pair',
      reading: [],
      vocabulary: ['vocab_preteach'],
      processing: ['proc_step_by_step', 'proc_concrete_first', 'proc_worked_examples'],
      regulation: ['reg_clear_success'],
      maths: ['math_visual_models', 'math_worked_solutions', 'math_real_world'],
    },
  },
  anxiety: {
    label: 'Anxiety (typical profile)',
    features: {
      visual_layout: 'visual_minimal',
      attention: 'attn_standard',
      structure: 'struct_high_predict',
      language_style: 'lang_standard',
      social: 'soc_solo',
      reading: [],
      vocabulary: ['vocab_preteach'],
      processing: ['proc_step_by_step'],
      regulation: ['reg_low_stakes', 'reg_clear_success', 'reg_sentence_starters'],
      maths: [],
    },
  },
  visual_processing: {
    label: 'Visual processing (typical profile)',
    features: {
      visual_layout: 'visual_minimal',
      attention: 'attn_standard',
      structure: 'struct_balanced',
      language_style: 'lang_standard',
      social: 'soc_pair',
      reading: ['read_larger_text', 'read_less_per_page'],
      vocabulary: [],
      processing: ['proc_fewer_items'],
      regulation: ['reg_clear_success'],
      maths: [],
    },
  },
  working_memory: {
    label: 'Working memory (typical profile)',
    features: {
      visual_layout: 'visual_balanced',
      attention: 'attn_standard',
      structure: 'struct_balanced',
      language_style: 'lang_standard',
      social: 'soc_pair',
      reading: [],
      vocabulary: ['vocab_glossary'],
      processing: ['proc_fewer_items', 'proc_chunking', 'proc_step_by_step', 'proc_worked_examples'],
      regulation: ['reg_clear_success'],
      maths: [],
    },
  },
  slow_processing: {
    label: 'Slow processing (typical profile)',
    features: {
      visual_layout: 'visual_balanced',
      attention: 'attn_standard',
      structure: 'struct_balanced',
      language_style: 'lang_standard',
      social: 'soc_solo',
      reading: ['read_less_per_page'],
      vocabulary: ['vocab_preteach'],
      processing: ['proc_extra_time', 'proc_fewer_items'],
      regulation: ['reg_clear_success'],
      maths: [],
    },
  },
  eal: {
    label: 'EAL — English as Additional Language',
    features: {
      visual_layout: 'visual_balanced',
      attention: 'attn_standard',
      structure: 'struct_balanced',
      language_style: 'lang_literal',
      social: 'soc_pair',
      reading: ['read_decodable'],
      vocabulary: ['vocab_preteach', 'vocab_visual_cards', 'vocab_glossary'],
      processing: ['proc_concrete_first'],
      regulation: ['reg_sentence_starters'],
      maths: [],
    },
  },
}

/**
 * Cross-category combinations that are unusual together. Not blocked — just warned.
 * Each conflict says: "if both A and B are selected, show this message."
 */
export const CONFLICTS = [
  {
    when: ['struct_high_predict', 'struct_novelty'],
    message: 'High predictability and novelty pull in opposite directions. Choose the one that matters most for this student.',
  },
  {
    when: ['soc_group', 'reg_low_stakes'],
    message: 'Open group work can feel high-stakes for an anxious student. Consider structured pair work instead.',
  },
  {
    when: ['attn_deep_focus', 'attn_short_bursts'],
    message: 'These pacing options conflict. Pick one — typically short bursts for ADHD profiles, deep focus for hyperfocus.',
  },
  {
    when: ['visual_rich', 'visual_minimal'],
    message: 'Rich visuals and minimal layout conflict. Pick the one this student actually needs.',
  },
  {
    when: ['lang_literal', 'lang_rich'],
    message: 'Literal and figurative language requirements conflict. Pick the one this student actually needs.',
  },
]

/**
 * Empty starting profile — everything unset / neutral.
 */
export const EMPTY_FEATURES = {
  visual_layout: 'visual_balanced',
  attention: 'attn_standard',
  structure: 'struct_balanced',
  language_style: 'lang_standard',
  social: 'soc_pair',
  reading: [],
  vocabulary: [],
  processing: [],
  regulation: [],
  maths: [],
}

/**
 * Merge a list of diagnostic presets into a single feature profile.
 * For 'single' groups, the LAST preset in the list wins (teacher ordering matters).
 * For 'multi' groups, the union of all selected features is taken.
 */
export function mergePresets(conditionIds = []) {
  const merged = { ...EMPTY_FEATURES, reading: [], vocabulary: [], processing: [], regulation: [], maths: [] }
  for (const id of conditionIds) {
    const preset = DIAGNOSTIC_PRESETS[id]
    if (!preset) continue
    for (const group of FEATURE_GROUPS) {
      const val = preset.features[group.id]
      if (group.type === 'single') {
        if (val) merged[group.id] = val
      } else {
        merged[group.id] = Array.from(new Set([...(merged[group.id] || []), ...(val || [])]))
      }
    }
  }
  return merged
}

/**
 * Detect which conflict messages should be shown given a feature profile.
 */
export function detectConflicts(features) {
  const flat = new Set()
  for (const group of FEATURE_GROUPS) {
    const val = features[group.id]
    if (group.type === 'single' && val) flat.add(val)
    if (group.type === 'multi' && Array.isArray(val)) val.forEach((v) => flat.add(v))
  }
  return CONFLICTS.filter((c) => c.when.every((f) => flat.has(f))).map((c) => c.message)
}

/**
 * Flatten a feature profile into the list of selected feature IDs (in group order).
 */
export function selectedFeatureIds(features) {
  const out = []
  for (const group of FEATURE_GROUPS) {
    const val = features[group.id]
    if (group.type === 'single' && val) out.push(val)
    if (group.type === 'multi' && Array.isArray(val)) out.push(...val)
  }
  return out
}
