# Changelog

All notable changes to **Typing Master Pro** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
