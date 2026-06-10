# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AdaptEd is a React web app that helps teachers and SENCOs adapt educational resources for neurodivergent students. Its primary output is a generated **prompt** the teacher pastes into an AI tool (Microsoft Copilot, ChatGPT, Claude) to produce inclusive materials. An optional in-app "Generate with AI" path can call Claude directly via a Cloudflare Worker proxy.

## Commands

```bash
npm run dev      # Vite dev server with HMR (http://localhost:5173)
npm run build    # Production build to /dist
npm run lint     # ESLint on .js/.jsx
npm run preview  # Preview the production build

# Worker (optional AI path) — run from worker/
wrangler secret put ANTHROPIC_API_KEY
wrangler deploy
```

There is no test suite.

## Two deployment shapes (this drives much of the architecture)

The app runs in one of two modes, switched by the `VITE_ENABLE_AI` env var (default `false`). See `DEPLOY.md` for full instructions.

1. **School deploy (default)** — frontend only, static host (Cloudflare Pages). No AI calls from the browser; the app only generates prompts to copy-paste. Needs no API key, no Worker, no env vars.
2. **Home deploy (optional)** — frontend + Cloudflare Worker (`worker/worker.js`), which holds the Anthropic API key as an encrypted secret and streams Claude completions back. Enabled only when **both** `VITE_ENABLE_AI=true` and `VITE_API_BASE=<worker-url>` are set. If either is missing, the app silently behaves like the school deploy.

`src/lib/generate.js` is the browser-side streaming client (`generateStream`) that POSTs to the Worker's `/api/generate` and parses the Anthropic SSE stream into text deltas. Currently only `CreateTab` consumes it.

## Architecture

### Core data flow
- `App.jsx` owns a central `profile` object and passes it to all tabs:
  `{ conditions: [], subject: '', keyStage: '', abilitySet: '', features: {} }`
- Persisted to `localStorage` under `adaptedProfile`; reloaded on refresh via `migrateProfile()`, which backfills `features`/`abilitySet` for older saved profiles.
- 1–3 conditions enforced (min 1, max 3).
- Navigation is `home` + four tabs (`create`, `adapt`, `quiz`, `convert`); `home` is the default view (`HomeView`).

### The granular feature system (src/utils/features.js) — central concept
This is the most important architectural idea and is **not** obvious from the older "9 conditions" framing.

- Diagnostic labels (autism, ADHD, …) are **starting points, not the source of truth.** The source of truth is a fine-grained `features` object grouped into categories (`FEATURE_GROUPS`): `visual_layout`, `attention`, `structure`, `language_style`, `social` (single-choice radio groups) and `reading`, `vocabulary`, `processing`, `regulation`, `maths` (multi-select).
- `FEATURE_RULES` maps each feature id → `{ label, rule }`, where `rule` is the exact sentence injected into the prompt.
- `DIAGNOSTIC_PRESETS` maps each condition → a pre-selected feature set. `mergePresets(conditionIds)` merges several: single groups take the **last** preset's value, multi groups take the **union**.
- `detectConflicts(features)` surfaces (does not block) unusual feature combinations from `CONFLICTS`.
- `selectedFeatureIds(features)` flattens the object into an ordered id list for prompt building.
- `ProfileEditor.jsx` is the modal UI for editing this object directly.

### Prompt generation (src/utils/promptGenerator.js)
Core business logic. Exports `generateAdaptPrompt()`, `generateCreatePrompt()`, `generateQuizPrompt()`.
- `CONDITION_RULES`: per-condition ✗ Bad / ✓ Good examples (9 conditions).
- `SUBJECT_VOCABULARY`: protected technical terms per subject.
- `KEY_STAGE_DESCRIPTIONS`: UK age guidance (KS1–KS5).
- `ABILITY_SET_RULES`: prompt rules per ability set (`mixed`, `bottom`, `middle`, `top`).
- `OUTPUT_FORMAT_SPECS`: templates for worksheet, full_lesson, presentation, handout, revision_guide, same_as_original.
- `buildFeatureBlock(profile, subject)`: turns `profile.features` into the `STUDENT-SPECIFIC ACCESSIBILITY FEATURES` prompt block via `FEATURE_RULES` + `selectedFeatureIds`. Maths-group features are dropped unless the subject is maths/science. Every generate* function injects this block plus the ability-set rules.

### Presets & saved profiles (App.jsx)
- `PRESETS`: quick-start configs. A preset may carry a hand-tuned `features` object (e.g. `CORBETTMATHS_FEATURES`); `applyPreset` uses it directly and only falls back to `mergePresets(conditions)` when absent. **A preset's explicit `features` beats the auto-merge** — don't replace it with a derived merge.
- **Named saved profiles** (one per student/group) live separately in `localStorage` under `adaptedSavedProfiles`, with save/load/delete plus JSON **export/import** (schema `adapted-ng-profiles`, version 1). Import always assigns fresh ids to avoid collisions.

### Components (src/components/)
- **Header**: profile bar — conditions/subject/key-stage/ability controls, presets dropdown, saved-profile menu, opens `ProfileEditor`.
- **HomeView**: landing page with tab launchers and the featured preset.
- **AdaptTab**: adapt existing resources; supports paste or Copilot-PDF source modes + output format.
- **CreateTab**: wizard to create from scratch; hosts the optional AI generate panel.
- **QuizTab**: wizard for assessments with question-type selection.
- **ConvertTab**: Markdown → accessible DOCX/PDF/PPTX/HTML, with accessibility styling (dyslexic font, cream background, large text, spacing) auto-enabled from conditions. Uses a custom `renderMath()` for LaTeX (`$$…$$` display, `$…$` inline).

## Key technologies
- React 19 + Vite 7, pure CSS with custom properties (no UI framework).
- marked + KaTeX (math); docx, pptxgenjs, html2pdf.js, file-saver (exports).
- Cloudflare Worker + Anthropic Messages API (optional AI path). Worker allow-lists models and uses an ephemeral cache block on the system prompt; default model `claude-haiku-4-5`.

## Extending the system
- **New condition**: add to `CONDITION_RULES` (✗/✓ examples) **and** to `DIAGNOSTIC_PRESETS` in features.js so it maps to features.
- **New accessibility feature**: add to the relevant `FEATURE_GROUPS` group, define its `FEATURE_RULES` entry, and reference it from any `DIAGNOSTIC_PRESETS` that need it.
- **New subject**: add to `SUBJECT_VOCABULARY`. **New key stage**: `KEY_STAGE_DESCRIPTIONS`. **New ability set**: `ABILITY_SET_RULES`. **New output format**: `OUTPUT_FORMAT_SPECS`.
- **New AI-callable model**: add to `ALLOWED_MODELS` in `worker/worker.js`.
