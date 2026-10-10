# Changelog

All notable changes to **Typing Master Pro** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.0.0] - Phase 6: Advanced Analytics, Achievements & Certificates - 2026-10-10

### Added
- **Module 1: Advanced Student Analytics (`StudentAnalyticsView.tsx`, `AnalyticsService.ts`)**:
  - Detailed performance metrics: Best and average Gross WPM, Best and average Net WPM, Best and average Accuracy %, total practice duration, completed lessons count (out of 160), and completed official exams count.
  - Multi-dimensional filters: Date range (All, 7 days, 30 days, 90 days), Language (Hindi, English), Keyboard Layout (Hindi InScript, English QWERTY), and Duration (1m, 2m, 5m, 10m, 15m).
  - Chronological trend chart with SVG bar visualizations and hover tooltips showing Net WPM progression over time.
  - Personal Records Showcase: Peak Net Speed, Highest Accuracy, and Peak Gross Speed with timestamps and test titles.
  - Weekly and monthly performance percentage change indicators (`weeklyWpmChangePct`, `monthlyWpmChangePct`).
  - Graceful empty states with constructive onboarding guidance for new students without test history.
- **Module 2: Keyboard Accuracy Heatmap (`KeyboardHeatmapView.tsx`, `HeatmapService.ts`)**:
  - Interactive physical keyboard canvas for both Hindi InScript and English QWERTY.
  - Per-key keystroke tracking distinguishing physical key codes (`event.code`, e.g. `KeyK`) from Unicode characters (e.g. `क`, `k`).
  - Dynamic color coding: Mastered (>= 95%, emerald), Good (85-94%, light emerald), Fair (75-84%, amber), Weak (60-74%, orange), Critical (< 60%, rose), and Untrained (slate).
  - Detailed Key Diagnostic Modal displaying total attempts, correct count, accuracy %, average response latency in milliseconds, and top repeated confusion characters.
- **Module 3: Intelligent Practice Recommendations (`SmartRecommendationsView.tsx`, `RecommendationService.ts`)**:
  - Local heuristic remediation engine analyzing weak keys, recent accuracy, response latency, and revision intervals.
  - Generates focused practice exercises targeting high-error keys with authentic Devanagari syllable/word banks or English vocabulary.
  - 100% offline local generation without external AI APIs or cloud dependencies.
  - Multi-pattern variety preventing repetitive drill fatigue.
  - Direct 1-click drill launcher loading customized exercises into the Practice Engine.
- **Module 4: Milestone Achievements System (`AchievementsView.tsx`, `AchievementService.ts`)**:
  - 16+ structured achievements across Speed (20, 30, 40, 50 WPM), Accuracy (90, 95, 98, 100%), Consistency (3, 7, 30-day streaks), Curriculum (1st lesson, Level 1 completed, All 160 lessons), and Exams (Debut, Veteran).
  - Tiered badge styling: Bronze, Silver, Gold, Platinum.
  - Duplicate award prevention engine ensuring milestone integrity across multiple evaluations.
  - Administrator configurable thresholds via `AchievementMilestoneSettings`.
  - Progress tracker showing completion percentage and unlocked medal counts.
- **Module 5: Professional Certificate Management (`CertificateService.ts`, `CertificateGalleryView.tsx`, `CertificateIssueModal.tsx`)**:
  - Qualification engine enforcing institutional certification standards (verifies completed passed exam with >= 25 Net WPM and >= 85% Accuracy). Rejects unverified or failing scores.
  - Automatic Grade calculation: A+ (>= 50 WPM, >= 98% Acc), A (>= 40 WPM, >= 95% Acc), B (>= 30 WPM, >= 90% Acc), C (>= 25 WPM, >= 85% Acc), Pass.
  - Unique tamper-evident Certificate ID generator (`TMP-CERT-YYYY-XXXXX`).
  - Cryptographic digital signatures computed via SHA-256 over candidate metadata, net WPM, accuracy, and issue timestamp.
  - Printable Certificate Modal (`CertificatePreviewModal.tsx`) with classic gold double-border styling, official seal watermark, Devanagari typography, and direct `window.print()` trigger.
  - Certificate revocation engine tracking authorized instructor ID, timestamp, and audit trail reason.
- **Module 6: Offline Certificate Verification (`CertificateVerificationModal.tsx`, `CertificateVerificationService.ts`)**:
  - Offline verification tool verifying certificate ID against local registry without internet.
  - Validates SHA-256 digital signature to guarantee zero tampering or unauthorized grade modifications.
  - Checks revocation registry and clearly marks revoked credentials.
- **Module 7: Institute Leaderboards & Privacy Controls (`LeaderboardView.tsx`, `LeaderboardService.ts`)**:
  - Student and Batch leaderboards with fair parameter isolation (only compares identical language, layout, duration, and scoring policy).
  - Metric sorting: Peak Net WPM, Highest Accuracy, or Most Improved.
  - Timeframe filters: All-time, Monthly, Weekly.
  - Privacy protections: Student opt-out preference (`showOnLeaderboard: false`) anonymizing names as "Anonymous Typist" for peer viewers.
- **Module 8: Teacher Analytics & Batch Radar (`TeacherAnalyticsView.tsx`, `TeacherAnalyticsService.ts`)**:
  - Scoped faculty analytics dashboard restricted strictly to teacher-authorized batches and students.
  - Early-warning At-Risk Student radar detecting low accuracy (<85%), low speed (<20 WPM), or long absence (>7 days).
  - Collective Weak-Key Radar identifying the most failed Devanagari characters across the entire batch to advise lecture topics.
  - Batch performance matrix and achievement distribution summaries.
- **Module 9: Offline Storage Schema Upgrade (IndexedDB v5)**:
  - Upgraded database version to `DB_VERSION = 5` in `indexedDbAdapter.ts`.
  - Added 6 new object stores: `key_heatmap_stats`, `student_achievements`, `achievement_settings`, `certificates`, `certificate_revocations`, `practice_recommendations`.
  - Delegating methods added in `TauriSQLiteStorageAdapter`.
  - Non-destructive migration preserving all Phase 1-5 student profiles, LMS progress, exam records, and institute batches.
  - Backup export and restore extended to include all Phase 6 datasets under schema version 5.
- **Module 10: Automated Test Coverage**:
  - 21 new automated unit tests added across 5 test suites (`analyticsService.test.ts`, `heatmapService.test.ts`, `achievementService.test.ts`, `certificateService.test.ts`, `leaderboardService.test.ts`, `phase6Persistence.test.ts`).
  - Total test suite now stands at **108 passed tests across 26 test files (100% pass rate)**.

## [5.0.0] - Phase 5: Teacher Admin & Institute Management - 2026-10-10

### Added
- **Module 1: Role-Based Access Control & Cryptographic Security**:
  - Three distinct roles: Institute Admin, Teacher, and Student with explicit permission guards.
  - Offline cryptographic security service (`CryptoService`): Salted password and PIN hashing using PBKDF2/SHA-256 with key stretching.
  - Zero plaintext credential storage. Constant-time comparison (`constantTimeCompare`) preventing timing attacks.
  - Session lifecycle management (`RbacService`): session locking, auto-timeout expiration, secure PIN unlock, and administrator credential reset workflow.
  - Immutable local audit logging (`AuditService`) recording all administrative and academic actions.
- **Module 2: Institute Administration Dashboard (`InstituteDashboardView.tsx`)**:
  - Live local analytics: Total students, active batches, assigned faculty, completed LMS lessons, examinations conducted, average speed (WPM), and average accuracy.
  - "Students Needing Remediation" dynamic detection identifying students with low test accuracy or sub-threshold speed.
  - Real-time audit log activity timeline.
- **Module 3: Student Management & Roster (`StudentManagementView.tsx`)**:
  - Student registration and profile editing with duplicate roll number detection.
  - Soft-delete archiving and 1-click restoration protecting historical data from accidental loss.
  - Permanent delete safeguard requiring explicit instructor confirmation.
  - Search & filtering by batch, status (active/archived), name, and roll number.
  - Student Academic Dossier & Performance Modal with one-click official report card printing.
  - Bulk RFC 4180 CSV roster import and Excel-compatible CSV export with UTF-8 BOM (`\uFEFF`).
- **Module 4: Batch Management & Shift Schedules (`BatchManagementView.tsx`)**:
  - Full batch lifecycle: creation, editing, teacher assignment, course track allocation, and seat capacity limits.
  - Shift scheduling: Morning, Afternoon, Evening, and Custom time slot configurations.
  - Batch capacity progress bars and active student rosters.
- **Module 5: Isolated Faculty Portal (`TeacherDashboardView.tsx`)**:
  - Scoped dashboard for instructors isolating unauthorized batches and institute-level settings.
  - Direct access to assigned students, quick attendance registers, and test assignments.
- **Module 6: Test Assignment System (`TestAssignmentsView.tsx`)**:
  - Test assignment creator reusing Phase 4 examination engines, authentic Devanagari passages, and official scoring policies (CPCT, SSC, High Court, Standard).
  - Target batch allocation, completion due dates, and minimum pass thresholds.
  - Assignment submissions viewer with student scores, Net WPM, accuracy, and pass/fail rankings.
- **Module 7: Daily Attendance Register (`AttendanceRegisterView.tsx`)**:
  - Daily batch attendance register with date selector and quick status toggles (Present, Absent, Late).
  - One-click "Mark All Present" batch action.
  - Monthly attendance percentage summaries and daily CSV export with UTF-8 BOM.
- **Module 8: Reports & Analytics Hub (`InstituteReportsView.tsx`)**:
  - Cross-batch performance benchmark matrix comparing average speed, accuracy, and pass rates.
  - Printable official student report card dossier (`window.print()`).
  - Batch comparison CSV export for spreadsheet analysis.
- **Module 9: Disaster Recovery & Verified Backup (`BackupRestoreView.tsx`)**:
  - Full institute archive export bundled with SHA-256 cryptographic tamper-detection checksum.
  - Backup file validation & inspection preview displaying exact record counts before restoration.
  - Safe restoration preventing silent overwriting of active databases.
- **Module 10: Multi-Terminal Lab LAN Architecture Specification (`lanArchitectureSpec.ts`, `LanSpecView.tsx`)**:
  - Formal technical whitepaper and protocol specification for computer lab local area networks.
  - Central Lab Server architecture, UDP broadcast discovery (port 8766), client outbox queuing, and vector clock conflict resolution.
- **Module 11: Master Portal UI & Student Dashboard Integration (`InstitutePortal.tsx`)**:
  - Responsive tabbed desktop administration portal with session lock/unlock modal.
  - Seamless toggle between Student Mode and Institute Portal with role verification.
- **Module 12: Storage Schema Upgrade (v4) & Automated Tests**:
  - Upgraded IndexedDB to `DB_VERSION = 4` with stores for `institute_users`, `batches`, `institute_students`, `test_assignments`, `attendance`, `audit_logs`, `institute_settings`.
  - SQLite adapter updated with corresponding tables and delegating methods.
  - 18 new automated tests across `cryptoService.test.ts`, `rbacService.test.ts`, `instituteService.test.ts`, `attendanceAssignment.test.ts`, and `institutePersistence.test.ts`.
  - Total test suite now contains 87 passing tests across 20 test files (100% passing).

---

## [4.0.0] - Phase 4: Professional Typing Examination System - 2026-10-10

### Added
- **Configurable Examination Setup (`ExamSetup.tsx`)**:
  - Languages: Hindi (InScript) and English (QWERTY).
  - Explicit layout policy: Remington GAIL is clearly marked as disabled (`Coming Soon - Engine In Development`) and never falsely enabled.
  - Test durations: 1, 2, 5, 10, 15, 30, and 60 minutes.
  - Difficulty ratings: Beginner, Intermediate, Advanced, and Ultra-Advanced.
  - Backspace policies: Allowed (full editing), Restricted to current word, or Completely Disabled.
  - Official Examination Presets: MP CPCT (15 min), SSC CGL/CHSL Tier-II (15 min), High Court Strict (10 min), Railway NTPC (10 min), Institute Assessment (5 min), and Speed Sandbox.
- **Distraction-Free Examination Interface (`ExamScreen.tsx`)**:
  - Live target text display with line tracking and input synchronization.
  - Strict Examination Mode: completely suppresses live accuracy, mistake highlighting, and keyboard hints to emulate official exam conditions.
  - Immediate backspace policy enforcement preventing unauthorized revisions.
- **Monotonic Elapsed-Time Timer (`MonotonicExamTimer`)**:
  - Wall-clock timestamp delta calculation (`Date.now() - startTimestamp`) preventing timer drift.
  - Immunity to background tab throttling via `visibilitychange` synchronization.
  - Crash recovery and pause/resume preservation using atomic `sessionStorage` checkpoints.
  - Atomic double-submission guard (`markSubmitted`) preventing duplicate submissions.
- **Sequence Alignment Scoring Engine (`ScoringEngine`)**:
  - Needleman-Wunsch / Levenshtein word sequence alignment classifying words as correct, substitution, insertion, or omission.
  - Error cascade prevention: single missed or inserted words do not invalidate subsequent passage alignment.
  - Official scoring formulas:
    - MP CPCT Hindi: 5 keystrokes per word standard with 1-word deduction per mistake.
    - SSC CGL/CHSL: Error percentage penalty with configurable disqualification threshold.
    - High Court Strict: 1.5x penalty per spelling mistake.
    - Standard Typing Tutor: Net WPM = Gross WPM - (Errors / Minutes).
- **Results Analytics & Diff Viewer (`ExamResultView.tsx`)**:
  - Visual color-coded diff comparison: green (correct), red strike-through (substitution), amber (omission), purple (insertion).
  - Complete KPI summary: Gross WPM, Net WPM, Accuracy, CPM, mistake breakdown, and backspaces used.
- **Printable Scorecard & Certificate Generator (`ExamReportService.generatePrintableHtml`)**:
  - Clean A4 printable HTML report with candidate details, verification ID, institutional stamp, and breakdown table (`window.print()`).
- **Excel-Compatible CSV Export (`ExamReportService.exportResultsToCsv`)**:
  - RFC 4180 compliant CSV export prepended with UTF-8 BOM (`\uFEFF`) ensuring Devanagari Hindi text opens correctly without character corruption in Microsoft Excel.
- **Teacher Custom Passage Creator (`CustomPassageModal.tsx`)**:
  - Custom passage authoring with live word and character counters, language tagging, and difficulty selection.
- **Exam History & Attempt Tracker (`ExamHistoryModal.tsx`)**:
  - Historical exam attempt logs with one-click full CSV export and printable scorecards.
- **Storage Layer Schema Upgrade (v3)**:
  - IndexedDB upgraded to `DB_VERSION = 3` with new object stores `exam_results` and `custom_passages`.
  - Tauri SQLite database updated with corresponding tables.
  - 100% backward compatibility preserving all Phase 1-3 profiles, LMS progress, and practice data.
- **Automated Test Coverage**:
  - 19 new tests in `scoringEngine.test.ts`, `monotonicTimer.test.ts`, `examPersistence.test.ts`, and `examReport.test.ts`.
  - Total test suite now contains 69 passing tests across 15 test files.

---

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
