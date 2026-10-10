'use client';

import React, { useState } from 'react';
import { Plus, BookOpen, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ExamDifficulty, ExamLanguage, ExamPassage } from '@/types/exam';
import { PassageLibraryService } from '@/services/exam/passageLibrary';
import { storageService } from '@/services/storage/storageService';

interface CustomPassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassageCreated: (passage: ExamPassage) => void;
}

export const CustomPassageModal: React.FC<CustomPassageModalProps> = ({
  isOpen,
  onClose,
  onPassageCreated,
}) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<ExamLanguage>('Hindi');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('intermediate');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.trim().length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('कृपया गद्यांश का शीर्षक दर्ज करें।');
      return;
    }
    if (text.trim().length < 30) {
      setError('गद्यांश में कम से कम ३० वर्ण होने चाहिए।');
      return;
    }

    const newPassage = PassageLibraryService.createCustomPassage(
      title.trim(),
      text.trim(),
      language,
      difficulty
    );

    const adapter = await storageService.getAdapter();
    await adapter.saveCustomPassage(newPassage);

    onPassageCreated(newPassage);
    setTitle('');
    setText('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="कस्टम परीक्षा गद्यांश जोड़ें (Add Custom Exam Passage)"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            गद्यांश का शीर्षक (Passage Title)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="उदा. संस्थान त्रैमासिक परीक्षा - आलेख १"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              भाषा (Language)
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as ExamLanguage)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              कठिनाई (Difficulty)
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ExamDifficulty)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="beginner">Beginner (सरल)</option>
              <option value="intermediate">Intermediate (मध्यम)</option>
              <option value="advanced">Advanced (उच्च)</option>
              <option value="ultra_advanced">Ultra Advanced (अति उच्च)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              गद्यांश सामग्री (Passage Text Content)
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {wordCount} शब्द | {charCount} वर्ण
            </span>
          </div>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="यहाँ अपना परीक्षा गद्यांश पेस्ट अथवा टाइप करें..."
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-devanagari leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            रद्द करें
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
          >
            <Check className="w-4 h-4" />
            गद्यांश सुरक्षित करें
          </Button>
        </div>
      </form>
    </Modal>
  );
};
