'use client';

import React, { useState } from 'react';
import { User, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AVATAR_OPTIONS } from '@/components/ui/AvatarBadge';
import { useProfile } from '@/context/ProfileContext';
import { KeyboardLayout, Language } from '@/types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { createProfile } = useProfile();

  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [avatar, setAvatar] = useState('avatar-scholar');
  const [language, setLanguage] = useState<Language>('hindi');
  const [layout, setLayout] = useState<KeyboardLayout>('hindi_inscript');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Student name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setErrorMsg('Student name must be at least 2 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createProfile({
        name: name.trim(),
        avatar,
        instituteRollNo: rollNo.trim() || undefined,
        preferences: {
          language,
          keyboardLayout: layout,
          fontPreference: 'noto_sans_devanagari',
          dailyPracticeGoal: 15,
          theme: 'light',
          soundEffects: true,
          fontSize: 'normal',
        },
      });
      setName('');
      setRollNo('');
      setErrorMsg('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create student profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Student Profile"
      subtitle="Register an additional student on this laboratory workstation"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Student Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="e.g. Ankit Verma"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            autoFocus
          />
          {errorMsg && <p className="mt-1 text-xs text-red-600 font-medium">{errorMsg}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Roll No / Student ID (Optional)
          </label>
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="e.g. LAB-104"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Choose Avatar
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((item) => {
              const isSelected = avatar === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAvatar(item.id)}
                  className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <IconComp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Language:
            </label>
            <select
              value={language}
              onChange={(e) => {
                const val = e.target.value as Language;
                setLanguage(val);
                setLayout(val === 'hindi' ? 'hindi_inscript' : 'english_qwerty');
              }}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keyboard Layout:
            </label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as KeyboardLayout)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="hindi_inscript">Hindi InScript</option>
              <option value="remington_gail">Remington GAIL</option>
              <option value="english_qwerty">English QWERTY</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Student Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
