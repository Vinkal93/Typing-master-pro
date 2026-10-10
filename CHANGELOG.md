# Changelog

All notable changes to **Typing Master Pro** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - Phase 3: Smart Learning Management System (LMS) - 2026-10-10

### Added
- **Structured 6-Level Curriculum (160 Genuine Lessons)**:
  - Level 1: Absolute Beginner — 25 lessons (`l1_01_right_index_ra` to `l1_25_level1_qualifying_exam`).
  - Level 2: Basic Typing — 30 lessons (`l2_01_top_matra_aa` to `l2_30_level2_qualifying_exam`).
  - Level 3: Word Master — 30 lessons (`l3_01_halant_mechanics_intro` to `l3_30_level3_qualifying_exam`).
  - Level 4: Sentence Expert — 25 lessons (`l4_01_sentence_structure_intro` to `l4_25_level4_qualifying_exam`).
  - Level 5: Professional Typist — 25 lessons (`l5_01_office_memo_format` to `l5_25_level5_qualifying_exam`).
  - Level 6: Ultra Advanced — 25 lessons (`l6_01_complex_sanskrit_conjuncts_1` to `l6_25_level6_grand_master_certification`).
- **Master Curriculum Architecture**:
  - `src/services/curriculum/curriculumService.ts`: Central catalog indexing all 160 lessons, level metadata, and sequential navigation.
  - `src/services/curriculum/curriculumValidator.ts`: Automated integrity checker ensuring zero duplicate IDs, valid prerequisites, and complete stages.
- **4-Stage Learning Flow (`LessonPlayer.tsx`)**:
  - Stage A (Learn): Pedagogical theory, finger instructions, demo keys visual, and technique tips.
  - Stage B (Guided Practice): Target text typing with virtual keyboard expected-key highlighting and real-time audio clicks.
  - Stage C (Independent Practice): Muscle memory development without virtual key hints.
  - Stage D (Lesson Test): Timed evaluation against level passing criteria with accuracy, Net WPM, and error analysis.
- **Progression & Unlock Engine (`progressionService.ts`)**:
  - Progressive unlocking strictly requiring completion of prerequisites.
  - Configurable passing criteria thresholds: L1: 85%, L2: 90%, L3: 92%/15wpm, L4: 94%/20wpm, L5: 95%/25wpm, L6: 97%/30wpm.
  - Summary metrics computation (total completed, average accuracy, average WPM, streak).
- **Offline Adaptive Practice Engine (`adaptivePracticeService.ts`)**:
  - Mistake tracking per character and physical key.
  - Heuristic local dynamic drill generation focusing on high-error keys without AI or external network calls.
- **Adaptive Revision Center (`AdaptiveRevisionCenter.tsx`)**:
  - Remediation hub highlighting top weak keys and launching targeted drills.
- **Teacher Control Panel (`TeacherLmsModal.tsx`)**:
  - Instant toggle to unlock all 160 lessons for institute testing.
  - Configurable passing criteria thresholds per level with instant persistence.
- **LMS Curriculum Dashboard (`LmsDashboard.tsx`)**:
  - Interactive level selector tabs, progress bars, continue learning card, and lesson card grid.
- **Storage Layer Schema Upgrade (v2)**:
  - Non-destructive migration preserving all student profiles, test histories, and preferences.
  - New stores/tables for `lms_progress`, `mistake_stats`, and `teacher_settings` across IndexedDB and SQLite.
  - Backup & JSON export/import upgraded to version 2 payload.
- **Automated Testing Suite**:
  - 50 passing unit and integration tests covering curriculum integrity, unlocks, adaptive generation, persistence, and UI.

---

## [2.0.0] - Phase 2: Hindi InScript Keyboard Engine - 2026-10-10

### Added
- **Module 1: Authoritative BIS InScript Mapping Engine**:
  - Implemented `src/services/engine/inscriptMapping.ts` matching Bureau of Indian Standards (BIS) IS 16350.
  - Complete mapping of physical `event.code` to Unicode Devanagari characters for normal, Shift, and AltGr layers.
  - Layout-independent typing on any physical English keyboard without Windows Hindi layout or IME configuration.
  - Reverse mapping engine `getKeystrokeForChar` for instant lookup of physical key, finger, and shift requirements.
- **Module 2: Interactive Virtual Keyboard**:
  - Full-size visual InScript keyboard component in `src/components/keyboard/VirtualKeyboard.tsx`.
  - Dual labels: physical English keys and Hindi Devanagari characters.
  - Real-time active keypress highlighting, target key pulsing, and error key flashing.
  - Finger assignment color guides (Pinky, Ring, Middle, Index, Thumbs) with left/right hand indicators.
  - Zoom controls (80% to 120%), Shift toggle, and responsive desktop/tablet layout.
- **Module 3: Interactive Character Learning**:
  - Drill interface in `src/components/character-learning/CharacterLearning.tsx`.
  - Dedicated lessons for Vowels (स्वतंत्र स्वर), Consonants (व्यंजन), Matras (मात्राएँ), Halant (हलन्त/अनुस्वार), Compound letters, Digits (०-९), and Punctuation (।).
  - Immediate feedback with correct/incorrect attempt counters.
- **Module 4: Hindi Word Builder & Conjunct Trainer**:
  - Interactive Unicode composition engine in `src/components/word-builder/WordBuilder.tsx`.
  - Derives exact physical key sequences dynamically using `keySequencer.ts` (no hardcoded guessing).
  - Built-in bank for `प्र`, `त्र`, `क्ष`, `ज्ञ`, `श्र`, `प्रश्न`, `प्रश्नपत्र`, `विद्यालय`, `परीक्षा`, `कम्प्यूटर`, `स्वतंत्रता`, `भारत`.
  - Step-by-step guidance highlighting the next physical key and explaining linguistic rules (e.g. Halant suppression).
- **Module 5: Practice Engine**:
  - Real-time Hindi typing screen in `src/components/practice/PracticeEngine.tsx`.
  - Character-by-character color-coded feedback (green for correct, red strike-through for mistakes, blue pulse for cursor).
  - Live Net WPM, Gross WPM, Accuracy %, mistake counter, and elapsed timer.
  - Intercepts physical keydown, suppresses OS IME duplication, and handles Unicode backspace cleanly.
  - Session result summary modal with 1-click persistence to student profile stats.
- **Offline Audio Synthesis**:
  - `src/services/engine/audioService.ts` generating typewriter keystroke clicks and error buzzer using Web Audio API (zero audio files needed).
- **Navigation & Integration**:
  - Multi-tab navigation in `StudentDashboard.tsx` for Dashboard, Practice Engine, Character Learning, Word Builder, and Virtual Keyboard.
- **Automated Tests**:
  - 32 automated tests in `src/test/` passing across mapping engine, word sequencer, input handling, persistence, profile CRUD, and routing.

---

## [1.0.0] - Phase 1: Foundation, Offline Persistence & Student Dashboard - 2026-10-10

### Added
- Next.js 14 App Router, Tailwind CSS, TypeScript strict mode.
- Tauri 2 Windows desktop packaging configuration.
- Unified offline storage with IndexedDB and Tauri SQLite adapter.
- Bundled offline Noto Sans Devanagari font in `public/fonts/`.
- 7-step First-launch onboarding wizard with profile validation.
- Student Dashboard with profile switcher, daily goal progress bar, and empty states.
- Offline data backup & JSON import/export.
