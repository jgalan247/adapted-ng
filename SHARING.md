# Sharing student profiles — best practice for SENCOs and teachers

adapted-ng lets you export and import student profiles as small JSON files. This is genuinely useful — but it touches data about real children, so please read this before you start sharing files.

## TL;DR

- **Use pseudonyms or initials, not full names** ("Y9 Student A" not "Sam Williamson"). The file is a document about a child's needs; treat it like any other SEND record.
- **Share via your school's approved channels** (Teams, OneDrive, school email). Not personal email or WhatsApp.
- **Profiles do not contain student work, grades, or personal data** beyond the name you choose to give them. They're a *recipe* of adaptations, not a record about a person.
- **The JSON file is plain text** — open it in Notepad before sending if you want to check what's in there.

## What a profile actually contains

A saved profile is a snapshot of:

- The **conditions** ticked (autism, ADHD, dyslexia, etc.)
- **Subject**, **Key Stage**, **Ability Set**
- The full **feature selections** across all 10 groups (visual layout, attention, vocabulary, regulation, etc.)
- The **name you chose** for the profile

It does **not** contain:

- Student work, marks, or assessment data
- Photographs, dates of birth, addresses, contact details
- EHCP documents, medical information, or safeguarding notes
- Browsing history or anything the teacher has typed elsewhere in the app

It's pedagogical configuration, not a record. But the *name* you give it can make it personal — so name carefully.

## Naming conventions that work

Pick one that suits your context:

| Style | Example | When to use |
|---|---|---|
| Pseudonym | `Y9 Student A — Maths bottom set` | Sharing within department or with cover |
| Code | `9MA3 — Profile 1` | Sharing across the school via SENCO |
| Role | `Year 10 GCSE Maths — typical foundation profile` | Department starter packs (not student-specific) |
| Personal shorthand | `Sam Y9` | **Only** for your own use, never exported |

The rule of thumb: **if the file leaves your device, the name should not identify the child to anyone who doesn't already know them.**

## Three real-world workflows

### Workflow 1 — Personal handover (Sam moves classes)

You teach Sam in Year 9 Maths. Next year he goes to a colleague.

1. Open the **⚡ Profiles & Presets** dropdown
2. Click **⤓ Export** — a JSON file downloads
3. **Rename the file** to remove identifying info: `Y9-to-Y10-maths-handover.json`
4. Share via Teams / OneDrive to the receiving teacher
5. The receiving teacher clicks **⤒ Import** in their adapted-ng
6. They rename the loaded profile in their list (right-click the saved profile in the dropdown is not supported yet — they'd export, edit the JSON, re-import. Or simply use a new name when they next save.)

### Workflow 2 — SENCO starter pack for a department

You're the SENCO. You want every Maths teacher to start the term with a sensible set of 8–10 SEND profiles for known students.

1. In your own browser, build the 8–10 profiles using initials or codes (`9MA3-A`, `9MA3-B`, etc.)
2. **⤓ Export** — one JSON with all of them
3. Share via Teams or the staff drive at the start of term
4. Each maths teacher imports once. They can then rename each profile to whatever they personally remember the child as — that rename stays on their device only.

### Workflow 3 — Cover teacher

You'll be off Friday. The cover teacher needs to know what's adapted for who.

1. **⤓ Export** your profiles
2. Rename the file `Friday-cover-9MA-profiles.json`
3. Email or Teams it with your cover work
4. Cover teacher imports, runs adapted-ng for the lesson, generates resources

After Friday, **the cover teacher should delete the imported profiles** from their browser if they're not their regular class. Click the 🗑 next to each profile.

## Data protection (UK GDPR / Jersey Data Protection Law)

Profile files are very low-risk — they're configuration, not records — but they still touch children. Sensible practice:

- **Lawful basis**: under UK GDPR Art. 6(1)(e) (public task) processing students' SEND adaptations within school is fine. Sharing within school = fine. Sharing outside school = needs more thought.
- **Minimisation**: don't store more than you need. Don't name a profile after a child unless you'd be comfortable with that name appearing in a list of SEND students.
- **Retention**: clear out profiles for students who've left your class. The 🗑 button takes 2 seconds.
- **Local storage**: profiles live in your browser, on your device. They are not synced to any cloud and not visible to the adapted-ng developers. Clearing browser data deletes them.
- **External services**: when you paste a prompt into Microsoft Copilot, the content of the prompt goes to Microsoft. The school's existing data-processing agreement with Microsoft 365 covers this. Don't paste a prompt that contains identifying student information into Copilot — the prompt should describe the *student's needs*, not the *student themselves*.

If in doubt, talk to your school's Data Protection Officer.

## What if I make a mistake?

- **Imported a wrong file**: 🗑 the unwanted profiles
- **Exported a file with a child's name in it**: ask the recipient to delete it, re-export with a renamed profile. Treat any send-in-error like any other accidental disclosure (your DPO will have a process for this).
- **Profile got corrupted**: delete it, rebuild it. Profiles take 30 seconds to build via the **✏️ Edit features** modal.

## Limits to know about

- Profiles are stored in **browser local storage**. Clearing browsing data on that browser will delete them. Export periodically as a backup.
- Profiles do **not** sync between devices automatically. If you use the app on a school laptop and at home, you need to export from one and import to the other.
- The same applies if a teacher changes their browser (Chrome → Edge): they'd need to export from the old one first.

## Future improvements being considered

- Optional **cloud sync** keyed by school email (would need a tiny backend — opt-in only)
- **Per-profile export** (currently you export all at once)
- **Profile rename** in the dropdown without re-saving
- **Tags** so a SENCO can mark profiles as "departmental starter" vs "personal"

Tell us at the demo which of these would actually help — we build what teachers ask for.
