# Hindi Unicode InScript Keyboard Engine Architecture

This document describes the engineering design and implementation of the **Hindi Unicode InScript Typing Engine** in **Typing Master Pro (Phase 2)**.

---

## 1. Overview & Standard Compliance

The engine implements the authoritative **Bureau of Indian Standards (BIS) IS 16350** InScript standard for Devanagari touch typing. It allows students on any computer institute PC or laptop to type authentic Hindi Unicode text using a physical English (QWERTY) keyboard **without requiring a Hindi keyboard layout or language pack to be installed in Windows**.

### Key Architectural Pillars:
1. **Layout-Independent Mapping**: The engine captures physical keys via `event.code` (e.g. `KeyD`, `KeyK`, `Digit1`) rather than `event.key`, rendering it immune to OS language settings or keyboard layout mismatches.
2. **IME Interception & Suppression**: Prevents duplicate character insertions or IME candidate windows by intercepting keydown events directly and maintaining internal Unicode buffer state.
3. **Phonetic Decomposition**: Generates true Unicode conjunct sequences (e.g., `प्र`, `त्र`, `क्ष`, `ज्ञ`, `श्र`, `विद्यालय`, `कम्प्यूटर`) dynamically rather than hardcoding guessed characters.
4. **100% Offline Synthesis**: Uses the Web Audio API to synthesize mechanical typewriter click sounds and error cues without requiring any external audio files or CDN assets.

---

## 2. InScript Layout Symmetry

InScript is engineered with physiological and linguistic symmetry:
- **Left Hand**: Vowels (स्वतंत्र स्वर) and Vowel Signs (मात्राएँ).
  - Unshifted: Dependent Matras (`ो`, `े`, `्`, `ि`, `ु`, `ौ`, `ै`, `ा`, `ी`, `ू`, `ं`).
  - Shifted: Independent Vowels (`ओ`, `ए`, `अ`, `इ`, `उ`, `औ`, `ऐ`, `आ`, `ई`, `ऊ`, `ँ`).
- **Right Hand**: Consonants (व्यंजन).
  - Unshifted: Unaspirated primary consonants (`प`, `र`, `क`, `त`, `च`, `ट`, `ब`, `ह`, `ग`, `द`, `ज`, `ड`, `म`, `न`, `व`, `ल`, `स`, `य`).
  - Shifted: Aspirated & nasal consonants (`फ`, `ऱ`, `ख`, `थ`, `छ`, `ठ`, `भ`, `ङ`, `घ`, `ध`, `झ`, `ढ`, `ञ`, `ण`, `ऩ`, `श`, `ष`, `।`).

---

## 3. Physical Key Mapping Table

| Physical Key (`event.code`) | English Key | Normal (Unshifted) | Shifted Layer | AltGr Layer |
| :--- | :--- | :--- | :--- | :--- |
| `KeyQ` | Q | ौ (U+094C) | औ (U+0914) | — |
| `KeyW` | W | ै (U+0948) | ऐ (U+0910) | — |
| `KeyE` | E | ा (U+093E) | आ (U+0906) | — |
| `KeyR` | R | ी (U+0940) | ई (U+0908) | — |
| `KeyT` | T | ू (U+0942) | ऊ (U+090A) | — |
| `KeyY` | Y | ब (U+092C) | भ (U+092D) | — |
| `KeyU` | U | ह (U+0939) | ङ (U+0919) | — |
| `KeyI` | I | ग (U+0917) | घ (U+0918) | — |
| `KeyO` | O | द (U+0926) | ध (U+0927) | — |
| `KeyP` | P | ज (U+091C) | झ (U+091D) | — |
| `BracketLeft` | [ | ड (U+0921) | ढ (U+0922) | — |
| `BracketRight` | ] | ़ (U+093C Nukta) | ञ (U+091E) | — |
| `KeyA` | A | ो (U+094B) | ओ (U+0913) | — |
| `KeyS` | S | े (U+0947) | ए (U+090F) | — |
| `KeyD` | D | ् (U+094D Halant) | अ (U+0905) | — |
| `KeyF` | F | ि (U+093F) | इ (U+0907) | — |
| `KeyG` | G | ु (U+0941) | उ (U+0909) | — |
| `KeyH` | H | प (U+092A) | फ (U+092B) | — |
| `KeyJ` | J | र (U+0930) | ऱ (U+0931) | — |
| `KeyK` | K | क (U+0915) | ख (U+0916) | — |
| `KeyL` | L | त (U+0924) | थ (U+0925) | — |
| `Semicolon` | ; | च (U+091A) | छ (U+091B) | — |
| `Quote` | ' | ट (U+091F) | ठ (U+0920) | — |
| `KeyZ` | Z | ॆ (U+0946) | ऎ (U+090E) | — |
| `KeyX` | X | ं (U+0902) | ँ (U+0901) | — |
| `KeyC` | C | म (U+092E) | ण (U+0923) | — |
| `KeyV` | V | न (U+0928) | ऩ (U+0929) | — |
| `KeyB` | B | व (U+0935) | ऴ (U+0934) | — |
| `KeyN` | N | ल (U+0932) | ळ (U+0933) | — |
| `KeyM` | M | स (U+0938) | श (U+0936) | — |
| `Comma` | , | , (U+002C) | ष (U+0937) | — |
| `Period` | . | . (U+002E) | । (U+0964 Purna Viram) | — |
| `Slash` | / | य (U+092F) | ? (U+003F) | — |
| `Equal` | = | ृ (U+0943) | ऋ (U+090B) | — |
| `Minus` | - | - (U+002D) | ः (U+0903 Visarga) | — |
| `Digit0`-`Digit9` | 0-9 | ० - ९ (U+0966-U+096F) | ! - ) | AltGr Ligatures |

---

## 4. Unicode Conjunct Deconstruction

In Devanagari, conjuncts (संयुक्त वर्ण) are produced phonetically using **Halant / Virama (`्`, `KeyD`)**:

- **प्र**: `प` (`KeyH`) + `्` (`KeyD`) + `र` (`KeyJ`)
- **त्र**: `त` (`KeyL`) + `्` (`KeyD`) + `र` (`KeyJ`)
- **क्ष**: `क` (`KeyK`) + `्` (`KeyD`) + `ष` (`Comma` + Shift)
- **ज्ञ**: `ज` (`KeyP`) + `्` (`KeyD`) + `ञ` (`BracketRight` + Shift)
- **श्र**: `श` (`KeyM` + Shift) + `्` (`KeyD`) + `र` (`KeyJ`)
- **विद्यालय**: `व` (`KeyB`) + `ि` (`KeyF`) + `द` (`KeyO`) + `्` (`KeyD`) + `य` (`Slash`) + `ा` (`KeyE`) + `ल` (`KeyN`) + `य` (`Slash`)
- **परीक्षा**: `प` (`KeyH`) + `र` (`KeyJ`) + `ी` (`KeyR`) + `क` (`KeyK`) + `्` (`KeyD`) + `ष` (`Comma` + Shift) + `ा` (`KeyE`)
- **कम्प्यूटर**: `क` (`KeyK`) + `म` (`KeyC`) + `्` (`KeyD`) + `प` (`KeyH`) + `्` (`KeyD`) + `य` (`Slash`) + `ू` (`KeyT`) + `ट` (`Quote`) + `र` (`KeyJ`)

---

## 5. Modules Included in Phase 2

1. **Module 1: Keyboard Mapping Engine** (`src/services/engine/inscriptMapping.ts`)
2. **Module 2: Interactive Virtual Keyboard** (`src/components/keyboard/VirtualKeyboard.tsx`)
3. **Module 3: Character Learning** (`src/components/character-learning/CharacterLearning.tsx`)
4. **Module 4: Hindi Word Builder** (`src/components/word-builder/WordBuilder.tsx`)
5. **Module 5: Practice Engine** (`src/components/practice/PracticeEngine.tsx`)
6. **Module 6: Zero-Network Offline Operation**
7. **Module 7: Automated Test Suites** (32 unit tests verifying mappings, decompositions, and input handling)
