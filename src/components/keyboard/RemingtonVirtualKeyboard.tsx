'use client';

import React, { useState } from 'react';
import {
  Keyboard as KeyboardIcon,
  HelpCircle,
  Hash,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  REMINGTON_KEYS,
  REMINGTON_ALT_CODES,
} from '@/services/engine/remingtonMapping';
import { RemingtonKeyDef } from '@/types/remington';
import { Finger } from '@/services/engine/inscriptMapping';

interface RemingtonVirtualKeyboardProps {
  activeCode?: string;
  activeKeyCodes?: string[];
  targetCode?: string;
  showHandsGuide?: boolean;
  showAltCodes?: boolean;
}

const FINGER_COLORS: Record<Finger, string> = {
  'left-pinky': 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-950/60 dark:text-pink-200 dark:border-pink-800',
  'left-ring': 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800',
  'left-middle': 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-800',
  'left-index': 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
  'right-index': 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
  'right-middle': 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
  'right-ring': 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-800',
  'right-pinky': 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
  'thumb': 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
};

export const RemingtonVirtualKeyboard: React.FC<RemingtonVirtualKeyboardProps> = ({
  activeCode,
  activeKeyCodes = [],
  targetCode,
  showHandsGuide = true,
  showAltCodes: initialShowAltCodes = false,
}) => {
  const [showAltCodes, setShowAltCodes] = useState(initialShowAltCodes);

  const isCodeActive = (code: string) => activeCode === code || activeKeyCodes.includes(code);

  const numberRow = REMINGTON_KEYS.filter((k) => k.row === 'number');
  const topRow = REMINGTON_KEYS.filter((k) => k.row === 'top');
  const homeRow = REMINGTON_KEYS.filter((k) => k.row === 'home');
  const bottomRow = REMINGTON_KEYS.filter((k) => k.row === 'bottom');

  const renderKey = (key: RemingtonKeyDef) => {
    const isActive = isCodeActive(key.code);
    const isTarget = targetCode === key.code;
    const fingerColor = FINGER_COLORS[key.finger];

    return (
      <div
        key={key.code}
        className={`h-14 w-14 rounded-lg border flex flex-col justify-between p-1.5 transition-all select-none ${
          isActive
            ? 'scale-95 bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400 z-10'
            : isTarget
            ? 'animate-pulse ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
            : fingerColor
        }`}
      >
        <div className="flex justify-between text-[10px] opacity-75 font-mono">
          <span className="font-bold">{key.enShift}</span>
          <span className="font-devanagari font-bold">{key.hiShift}</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[10px] uppercase font-mono opacity-60">{key.enNormal}</span>
          <span className="text-base font-black font-devanagari">{key.hiNormal}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Keyboard Canvas Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs overflow-x-auto">
        <div className="min-w-[800px] flex flex-col gap-1.5 mx-auto">
          {/* Number Row */}
          <div className="flex gap-1.5 justify-center">
            {numberRow.map((k) => renderKey(k))}
          </div>

          {/* Top Row */}
          <div className="flex gap-1.5 justify-center">
            {topRow.map((k) => renderKey(k))}
          </div>

          {/* Home Row */}
          <div className="flex gap-1.5 justify-center">
            {homeRow.map((k) => renderKey(k))}
          </div>

          {/* Bottom Row */}
          <div className="flex gap-1.5 justify-center">
            {bottomRow.map((k) => renderKey(k))}
          </div>

          {/* Space Bar */}
          <div className="flex justify-center mt-1">
            <div
              className={`h-10 w-96 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${
                isCodeActive('Space')
                  ? 'bg-blue-600 text-white border-blue-700 scale-98'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              स्पेस बार (Space Bar)
            </div>
          </div>
        </div>

        {/* Finger Zones Guide */}
        {showHandsGuide && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-400">उंगली निर्देशिका:</span>
            <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-900 dark:bg-pink-950/60 dark:text-pink-300 text-[10px] font-bold">
              बायां कनिष्ठिका (Left Pinky)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold">
              बायां अनामिका (Left Ring)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-bold">
              बायां मध्यमा (Left Middle)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-bold">
              बायां तर्जनी (Left Index)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
              दायां तर्जनी (Right Index)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold">
              दायां मध्यमा (Right Middle)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 text-[10px] font-bold">
              दायां अनामिका (Right Ring)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold">
              दायां कनिष्ठिका (Right Pinky)
            </span>
          </div>
        )}
      </div>

      {/* Remington Alt Codes Quick Reference Drawer */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowAltCodes(!showAltCodes)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-600" />
            <span>रेमिंगटन गेल स्पेशल आल्ट कोड सूची (Remington GAIL Alt Codes Table)</span>
          </div>
          {showAltCodes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAltCodes && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
            {REMINGTON_ALT_CODES.map((item) => (
              <div
                key={item.code}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
              >
                <div>
                  <div className="font-black text-base font-devanagari text-purple-600 dark:text-purple-400">
                    {item.character}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                    {item.usageExample}
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  {item.keyCombo}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
