'use client';

import React, { useState } from 'react';
import {
  Hand,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  INSCRIPT_KEYS,
  InScriptKeyDef,
  Finger,
  Hand as HandSide,
} from '@/services/engine/inscriptMapping';

interface VirtualKeyboardProps {
  activeKeyCodes?: string[];    // Physical key currently pressed by student
  targetKeyCode?: string;       // Next physical key to type
  requiresShift?: boolean;      // Whether target key requires Shift
  errorKeyCode?: string;        // Physical key that triggered an error
  onVirtualKeyPress?: (code: string, shift: boolean) => void;
  showHandsGuide?: boolean;
  className?: string;
}

// Finger color codes for visual pedagogical clarity
const FINGER_COLOR_MAP: Record<Finger, { bg: string; border: string; text: string; label: string }> = {
  'left-pinky': { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-900', text: 'text-rose-700 dark:text-rose-300', label: 'Left Pinky (कनिष्ठिका)' },
  'left-ring': { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900', text: 'text-amber-700 dark:text-amber-300', label: 'Left Ring (अनामिका)' },
  'left-middle': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', label: 'Left Middle (मध्यमा)' },
  'left-index': { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-700 dark:text-blue-300', label: 'Left Index (तर्जनी)' },
  'right-index': { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-900', text: 'text-cyan-700 dark:text-cyan-300', label: 'Right Index (तर्जनी)' },
  'right-middle': { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-900', text: 'text-indigo-700 dark:text-indigo-300', label: 'Right Middle (मध्यमा)' },
  'right-ring': { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-900', text: 'text-violet-700 dark:text-violet-300', label: 'Right Ring (अनामिका)' },
  'right-pinky': { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200 dark:border-fuchsia-900', text: 'text-fuchsia-700 dark:text-fuchsia-300', label: 'Right Pinky (कनिष्ठिका)' },
  'thumb': { bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300', label: 'Thumb (अंगूठा)' },
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeKeyCodes = [],
  targetKeyCode,
  requiresShift = false,
  errorKeyCode,
  onVirtualKeyPress,
  showHandsGuide = true,
  className = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [shiftToggled, setShiftToggled] = useState<boolean>(false);

  const effectiveShift = requiresShift || shiftToggled;

  const numberRow = INSCRIPT_KEYS.filter((k) => k.row === 'number');
  const topRow = INSCRIPT_KEYS.filter((k) => k.row === 'top');
  const homeRow = INSCRIPT_KEYS.filter((k) => k.row === 'home');
  const bottomRow = INSCRIPT_KEYS.filter((k) => k.row === 'bottom');

  const renderKey = (key: InScriptKeyDef, customWidthClass: string = 'w-11 sm:w-13') => {
    const isTarget = targetKeyCode === key.code;
    const isActive = activeKeyCodes.includes(key.code);
    const isError = errorKeyCode === key.code;
    const fingerStyle = FINGER_COLOR_MAP[key.finger];

    // Status styling
    let stateClass = `${fingerStyle.bg} ${fingerStyle.border} border`;
    if (isTarget) {
      stateClass = 'ring-2 ring-blue-600 bg-blue-100 dark:bg-blue-900/60 border-blue-500 shadow-md animate-pulse';
    } else if (isActive) {
      stateClass = 'bg-blue-600 text-white border-blue-700 scale-95 shadow-inner';
    } else if (isError) {
      stateClass = 'bg-red-500 text-white border-red-600 animate-bounce';
    }

    return (
      <button
        key={key.code}
        type="button"
        onClick={() => onVirtualKeyPress?.(key.code, effectiveShift)}
        title={`${key.enNormal.toUpperCase()} -> ${effectiveShift ? key.hiShift : key.hiNormal} (${fingerStyle.label})`}
        className={`relative h-12 ${customWidthClass} rounded-lg flex flex-col justify-between p-1 transition-all select-none focus:outline-none ${stateClass}`}
      >
        {/* Top bar: English key and Shifted Hindi preview */}
        <div className="flex items-center justify-between w-full text-[10px] leading-none px-0.5 font-mono">
          <span className={`font-semibold ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
            {key.enNormal.toUpperCase()}
          </span>
          <span className={`font-devanagari font-medium text-[11px] ${
            effectiveShift
              ? 'text-blue-600 dark:text-blue-300 font-bold'
              : 'text-slate-400 dark:text-slate-500'
          }`}>
            {key.hiShift}
          </span>
        </div>

        {/* Center / Bottom: Main unshifted Hindi character */}
        <div className="flex items-center justify-center w-full">
          <span
            className={`text-base font-bold font-devanagari ${
              isActive
                ? 'text-white'
                : effectiveShift
                ? 'text-slate-400 dark:text-slate-500 text-xs'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {key.hiNormal}
          </span>
        </div>

        {/* Home key anchor indicator */}
        {key.isHomeKey && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-blue-500/60" />
        )}
      </button>
    );
  };

  if (!isVisible) {
    return (
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsVisible(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Show InScript Virtual Keyboard</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3 ${className}`}
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
    >
      {/* Keyboard Controls & Toolbar */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Hindi Unicode InScript Keyboard (BIS Standard)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
            Physical Layout Independent
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Shift Toggle */}
          <button
            type="button"
            onClick={() => setShiftToggled(!shiftToggled)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              effectiveShift
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            ⇧ Shift: {effectiveShift ? 'ON' : 'OFF'}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              disabled={zoomLevel <= 80}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-600 dark:text-slate-400">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(120, z + 10))}
              disabled={zoomLevel >= 120}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hide button */}
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Hide virtual keyboard"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyboard Matrix */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="min-w-[690px] space-y-1.5 flex flex-col items-center">
          {/* Row 1: Numbers */}
          <div className="flex gap-1 justify-center w-full">
            {numberRow.map((k) => renderKey(k))}
            <div className="h-12 w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500 select-none">
              Backspace
            </div>
          </div>

          {/* Row 2: Top Row */}
          <div className="flex gap-1 justify-center w-full">
            <div className="h-12 w-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500 select-none">
              Tab
            </div>
            {topRow.map((k) => renderKey(k))}
          </div>

          {/* Row 3: Home Row */}
          <div className="flex gap-1 justify-center w-full">
            <div className="h-12 w-14 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500 select-none">
              Caps
            </div>
            {homeRow.map((k) => renderKey(k))}
            <div className="h-12 w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500 select-none">
              Enter
            </div>
          </div>

          {/* Row 4: Bottom Row */}
          <div className="flex gap-1 justify-center w-full">
            <div
              className={`h-12 w-18 rounded-lg border flex items-center justify-center text-xs font-bold select-none transition-colors ${
                effectiveShift
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              Shift
            </div>
            {bottomRow.map((k) => renderKey(k))}
            <div
              className={`h-12 w-20 rounded-lg border flex items-center justify-center text-xs font-bold select-none transition-colors ${
                effectiveShift
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              Shift
            </div>
          </div>

          {/* Row 5: Space Bar */}
          <div className="flex gap-1 justify-center w-full">
            <div className="h-10 w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500">
              Ctrl
            </div>
            <div className="h-10 w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500">
              Alt
            </div>
            <button
              type="button"
              onClick={() => onVirtualKeyPress?.('Space', false)}
              className={`h-10 w-80 rounded-lg border flex items-center justify-center text-xs font-mono select-none transition-all ${
                targetKeyCode === 'Space'
                  ? 'ring-2 ring-blue-600 bg-blue-100 dark:bg-blue-900/60 border-blue-500 font-bold'
                  : activeKeyCodes.includes('Space')
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-500'
              }`}
            >
              Space Bar ( रिक्त स्थान )
            </button>
            <div className="h-10 w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500">
              AltGr
            </div>
            <div className="h-10 w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500">
              Ctrl
            </div>
          </div>
        </div>
      </div>

      {/* Hands Assignment Guide */}
      {showHandsGuide && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">बायाँ हाथ (Left Hand):</span>
              <span>मात्राएँ एवं स्वर (Vowels)</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">दायाँ हाथ (Right Hand):</span>
              <span>व्यंजन (Consonants)</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>होम रो लकीरें: F और J कुंजियों पर विश्राम करें</span>
          </div>
        </div>
      )}
    </div>
  );
};
