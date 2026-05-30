# adapted-ng

A web tool that helps UK secondary teachers (KS3, KS4, KS5) create resources tailored to neurodivergent students — worksheets, slides, explainers, and quizzes adapted for Autism, ADHD, Dyslexia, Dyscalculia, Anxiety, Visual Processing, Working Memory, Slow Processing, and EAL.

## Status

Forked from [AdaptEd](https://github.com/jgalan247/inclusion) — currently the prompt-generation MVP. Roadmap below.

## How it's intended to be used

- **At school**: the app generates a prompt. Teachers **copy the prompt and paste it into Microsoft Copilot** — the school-approved AI tool. The app itself never calls an AI from the school network. This keeps the tool fully compliant with school acceptable-use policies that restrict third-party AI services.
- **At home (optional)**: teachers can enable a "Generate with AI" panel that calls Claude directly via a Cloudflare Worker. This is **off by default** and only appears when the build env var `VITE_ENABLE_AI=true` is set. The hosted school version should never enable it.

This split is deliberate: it lets the same codebase serve both use cases without ever bypassing a school's filter or policy.

## Roadmap

- [x] Fork base from AdaptEd
- [x] Restrict to KS3 / KS4 / KS5
- [ ] Live AI generation (Haiku 4.5 default, Sonnet 4.6 for hard cases)
- [ ] File upload for Adapt flow (PDF/DOCX)
- [ ] Prompt caching for cheap regeneration
- [ ] Quiz adaptation from uploaded tests

## Stack

React 19 + Vite 7 frontend, Anthropic SDK backend (to be added). Pure CSS with custom properties. Markdown → DOCX/PDF/PPTX export via `docx`, `html2pdf.js`, `pptxgenjs`.

## Scripts

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build
npm run lint
```

## Key stages

- KS3 (Years 7–9, ages 11–14)
- KS4 (Years 10–11, GCSE)
- KS5 (Years 12–13, A-Level)
