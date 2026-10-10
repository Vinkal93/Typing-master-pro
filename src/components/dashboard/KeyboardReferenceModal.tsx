'use client';

import React, { useState } from 'react';
import { Keyboard, Hand, Check, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { KeyboardLayout } from '@/types';
import { KEYBOARD_LAYOUTS } from '@/services/keyboard/keyboardLayouts';

interface KeyboardReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: KeyboardLayout;
}

export const KeyboardReferenceModal: React.FC<KeyboardReferenceModalProps> = ({
  isOpen,
  onClose,
  layout,
}) => {
  const [activeLayoutKey, setActiveLayoutKey] = useState<KeyboardLayout>(layout);
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);

  const layoutDef = KEYBOARD_LAYOUTS[activeLayoutKey];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interactive Keyboard Layout Reference"
      subtitle={`${layoutDef.name} (${layoutDef.hindiName}) — Visual Finger Guide`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Layout Switcher & Shift Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['hindi_inscript', 'remington_gail', 'english_qwerty'] as KeyboardLayout[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveLayoutKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeLayoutKey === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {KEYBOARD_LAYOUTS[key].name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShiftActive(!isShiftActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isShiftActive
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              ⇧ Shift Layer: {isShiftActive ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Layout description */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {layoutDef.description}
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            📋 Standard Exam Board: {layoutDef.examUsage}
          </p>
        </div>

        {/* Visual Keyboard Representation */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-inner overflow-x-auto">
          <div className="min-w-[700px] space-y-2">
            {layoutDef.rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1.5">
                {row.map((key) => {
                  const label = isShiftActive ? key.shiftLabel || key.label : key.label;
                  const isHome = key.isHomeKey;

                  return (
                    <div
                      key={key.code}
                      className={`h-12 min-w-[42px] px-2 flex flex-col items-center justify-center rounded-lg border shadow-xs transition-all select-none ${
                        isHome
                          ? 'border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-blue-500 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {/* Secondary label (shift or unshift) */}
                      <span className="text-[9px] text-slate-400 font-mono leading-none">
                        {isShiftActive ? key.label : key.shiftLabel}
                      </span>
                      {/* Main label */}
                      <span
                        className={`text-sm font-semibold leading-tight font-devanagari ${
                          isHome ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Finger Placement Legend */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Hand className="w-4 h-4 text-blue-600" />
            <span>Home Row Finger Anchors ( विश्राम स्थिति )</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Left Hand (Pinky/Ring)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-devanagari">
                {layoutDef.fingerPlacements.leftPinky} | {layoutDef.fingerPlacements.leftRing}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Left Hand (Middle/Index)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-devanagari">
                {layoutDef.fingerPlacements.leftMiddle} | {layoutDef.fingerPlacements.leftIndex}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Right Hand (Index/Middle)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-devanagari">
                {layoutDef.fingerPlacements.rightIndex} | {layoutDef.fingerPlacements.rightMiddle}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Right Hand (Ring/Pinky)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-devanagari">
                {layoutDef.fingerPlacements.rightRing} | {layoutDef.fingerPlacements.rightPinky}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
