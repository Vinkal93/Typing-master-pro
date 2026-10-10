# Typing Master Pro — Phase 1 (Institute Edition)

**Typing Master Pro** is a lightweight, offline-first touch typing tutor application built specifically for computer institute students and candidates preparing for government typing proficiency examinations (such as **CPCT**, **SSC CGL / CHSL**, **High Court Junior Judicial Assistant**, and **State PSC** clerk exams).

---

## 🌟 Key Features (Phase 1)

- **100% Offline-First Architecture**: Operates on classroom lab computers without cloud accounts, internet connection, or external API calls.
- **Hindi InScript, Remington GAIL & English QWERTY Support**:
  - **Hindi InScript**: Bureau of Indian Standards (BIS) layout mandatory for CPCT and High Court exams.
  - **Remington GAIL**: Traditional typewriter layout used in state secretariats and district courts.
  - **English QWERTY**: Standard international layout with finger placement guides.
- **Locally Bundled Font (Zero External Runtime Font Dependency)**:
  - Bundled **Noto Sans Devanagari** (Regular & Bold) directly in `public/fonts/`.
  - Configurable font stack: Uses **Mangal** if present on Windows, with bundled Noto Sans Devanagari as a guaranteed offline fallback.
- **7-Step First-Launch Onboarding Wizard**:
  1. Welcome overview with examination institute highlights.
  2. Student full name & custom avatar selection.
  3. Language selection (Hindi / English).
  4. Keyboard layout selection with live home row key previews.
  5. Font preference with live Devanagari rendering preview.
  6. Daily practice goal setting (10, 15, 20, 30 minutes).
  7. Setup completion & direct dashboard routing.
  - **Does not repeat onboarding** for existing student profiles.
- **Student Dashboard**:
  - **Profile Switcher**: Multi-student management for shared institute lab PCs. Add, activate, or delete student profiles without losing local data.
  - **Welcome & Lab Status Section**: Personalized greeting, roll number badge, active layout, and lab session indicators.
  - **Continue Learning Card**: Actionable lesson entry with keys introduced and estimated time.
  - **Course Roadmap Preview**: Multi-category curriculum (Home Row, Top Row, Bottom Row, Shift Keys, Speed Drills) with clear Phase 1 preview and Phase 2 status badges.
  - **Daily Practice Goal Tracker**: Visual percentage completion bar and streak day counter.
  - **Performance Analytics (Explicit Empty States)**: Net WPM, Gross WPM, Accuracy, and Practice Time with explicit no-data notifications before the first test.
  - **Recent Activity**: Clear empty states with guidance and recent test history.
  - **Teacher Mode Entry**: Architecture preview and PIN gate for Phase 2 batch management and exam mode.
  - **Interactive Keyboard Map**: Visual on-screen keyboard viewer with Shift layer toggle and finger anchor placement guides.
  - **Data Backup & Migration**: Offline JSON export/import to transfer student progress across computers.

---

## 📁 Project Folder Structure

```text
Typing master pro/
├── public/
│   └── fonts/
│       ├── NotoSansDevanagari-Regular.ttf   # Bundled offline regular font
│       └── NotoSansDevanagari-Bold.ttf      # Bundled offline bold font
├── src/
│   ├── app/
│   │   ├── globals.css                      # @font-face rules, CSS variables, dark mode
│   │   ├── layout.tsx                       # Root layout with Theme and Profile providers
│   │   └── page.tsx                         # First-run routing (Wizard vs Dashboard)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AddStudentModal.tsx          # Quick student registration dialog
│   │   │   ├── ContinueLearningCard.tsx     # Primary next lesson CTA
│   │   │   ├── CourseRoadmapPreview.tsx     # Curriculum roadmap by category
│   │   │   ├── DailyGoalCard.tsx            # Daily target progress & streaks
│   │   │   ├── DashboardHeader.tsx          # App bar, profile dropdown, settings
│   │   │   ├── KeyboardReferenceModal.tsx   # Visual on-screen keyboard & fingers
│   │   │   ├── LessonPreviewModal.tsx       # Drill details & practice simulation
│   │   │   ├── ProfileManagerModal.tsx      # Multi-profile CRUD & deletion guards
│   │   │   ├── RecentActivity.tsx           # Recent drill history & empty state
│   │   │   ├── SettingsModal.tsx            # Font, layout, goals, and JSON backup
│   │   │   ├── StatsOverview.tsx            # WPM & accuracy cards with no-data state
│   │   │   ├── StudentDashboard.tsx         # Consolidated student dashboard view
│   │   │   ├── TeacherModeModal.tsx         # Phase 2 teacher & exam mode preview
│   │   │   └── WelcomeSection.tsx           # Student greeting & badge indicators
│   │   ├── onboarding/
│   │   │   └── OnboardingWizard.tsx         # 7-step onboarding flow
│   │   └── ui/
│   │       ├── AvatarBadge.tsx              # Student avatar badges
│   │       ├── Badge.tsx                    # Accessible status badges
│   │       ├── Button.tsx                   # Accessible button primitive
│   │       ├── Card.tsx                     # Card container
│   │       └── Modal.tsx                    # Accessible modal dialog
│   ├── context/
│   │   ├── ProfileContext.tsx               # Active profile, multi-profile state
│   │   └── ThemeContext.tsx                 # Light / Dark / System theme management
│   ├── services/
│   │   ├── keyboard/
│   │   │   └── keyboardLayouts.ts           # InScript, Remington GAIL, QWERTY maps
│   │   ├── lessons/
│   │   │   └── lessonCatalog.ts             # Lesson metadata, categories, curriculum
│   │   ├── profile/
│   │   │   └── profileService.ts            # Profile validation, CRUD, active profile
│   │   ├── statistics/
│   │   │   └── statisticsService.ts         # Aggregated stats, streaks, daily goals
│   │   └── storage/
│   │       ├── indexedDbAdapter.ts          # IndexedDB offline storage engine
│   │       ├── storageAdapter.ts            # StorageAdapter interface
│   │       ├── storageService.ts            # Unified storage factory singleton
│   │       └── tauriSqliteAdapter.ts        # Tauri SQLite adapter with IDB fallback
│   ├── test/
│   │   ├── persistence.test.ts              # Storage and backup unit tests
│   │   ├── profileService.test.ts           # Profile CRUD and validation tests
│   │   ├── routing.test.tsx                 # First-run onboarding vs dashboard tests
│   │   └── setup.ts                         # Vitest setup with fake-indexeddb
│   └── types/
│       └── index.ts                         # TypeScript domain models & interfaces
├── src-tauri/
│   ├── capabilities/
│   │   └── default.json                     # Tauri 2 app capabilities & permissions
│   ├── src/
│   │   ├── lib.rs                           # Tauri plugin initialization
│   │   └── main.rs                          # Windows entry point
│   ├── build.rs                             # Tauri build script
│   ├── Cargo.toml                           # Rust dependencies (Tauri 2, SQLite)
│   └── tauri.conf.json                      # Tauri 2 packaging configuration
├── next.config.mjs                          # Next.js static export configuration
├── tailwind.config.ts                       # Tailwind styling with font stacks
├── tsconfig.json                            # TypeScript strict mode configuration
├── vitest.config.ts                         # Automated testing configuration
├── CHANGELOG.md                             # Phase 1 change history
├── PHASES.md                                # Detailed roadmap of completed & pending work
└── README.md                                # Setup & usage documentation
```

---

## 🚀 Local Development Commands

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24 LTS tested)
- **npm**: v9.0.0 or later

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Static Frontend (for Tauri Desktop Packaging)
```bash
npm run build
```
This generates the standalone static distribution in the `out/` directory.

### 5. Run Automated Tests
```bash
npm test
```
Runs Vitest with 11 automated unit tests across offline persistence, profile CRUD, and first-run routing.

---

## 🖥️ Tauri 2 Windows Packaging Configuration

Typing Master Pro is configured for **Tauri v2** desktop packaging with **SQLite** storage and static export frontend:

### 1. Prerequisites for Windows Desktop Packaging
- **Rust Toolchain**: Install via [https://rustup.rs](https://rustup.rs) (`x86_64-pc-windows-msvc`)
- **Microsoft C++ Build Tools**: Visual Studio Build Tools with C++ workload
- **WebView2**: Built into Windows 10 (version 1803+) and Windows 11

### 2. Run Tauri Desktop in Development Mode
```bash
npm run tauri dev
```

### 3. Build Production Windows Installer (.exe / .msi)
```bash
npm run tauri build
```
The compiled standalone Windows installer will be placed in `src-tauri/target/release/bundle/nsis/`.

---

## 🧪 Automated Test Instructions

The test suite runs headlessly in Vitest with fake IndexedDB and React Testing Library:

```bash
# Run all test suites once
npm run test

# Run tests in watch mode during development
npm run test:watch
```

**Tested areas:**
1. **Persistence (`src/test/persistence.test.ts`)**: Profile storage, active student pointer, practice result logging, daily goals, data export and import.
2. **Profile Service (`src/test/profileService.test.ts`)**: Student name validation, default preferences, multi-student switching, deletion.
3. **Routing Flow (`src/test/routing.test.tsx`)**: First-launch onboarding routing when empty, and automatic dashboard loading for returning students.

---

## 🔒 Offline & Data Integrity Guarantee

- **Never deletes existing profiles on update**: Uses non-destructive migrations and storage schemas.
- **Export/Import JSON**: Allows backing up student records to a flash drive or transferring profiles between lab computers.
- **Zero Runtime CDNs**: Noto Sans Devanagari is bundled in `public/fonts/` and served locally without external network calls.
