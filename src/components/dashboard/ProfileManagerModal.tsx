'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AvatarBadge, AVATAR_OPTIONS } from '@/components/ui/AvatarBadge';
import { useProfile } from '@/context/ProfileContext';
import { KEYBOARD_LAYOUTS } from '@/services/keyboard/keyboardLayouts';
import { KeyboardLayout, Language } from '@/types';

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewStudent: () => void;
}

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  isOpen,
  onClose,
  onAddNewStudent,
}) => {
  const { profiles, activeProfile, switchProfile, deleteProfile } = useProfile();
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;
    await deleteProfile(profileToDelete);
    setProfileToDelete(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profiles Management"
      subtitle="Manage lab student accounts and switch active practice sessions"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Delete Confirmation Alert */}
        {profileToDelete && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>Confirm Profile Deletion</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Are you sure you want to delete this student profile and all associated practice records? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
              >
                Delete Profile
              </Button>
            </div>
          </div>
        )}

        {/* Profiles List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile?.id;
            const layoutDef = KEYBOARD_LAYOUTS[p.preferences.keyboardLayout];

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AvatarBadge avatarId={p.avatar} name={p.name} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {p.name}
                      </h4>
                      {isActive && (
                        <Badge variant="blue" size="sm">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{layoutDef?.name}</span>
                      {p.instituteRollNo && (
                        <>
                          <span>•</span>
                          <span>Roll: {p.instituteRollNo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isActive && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => switchProfile(p.id)}
                    >
                      Activate
                    </Button>
                  )}
                  <button
                    onClick={() => setProfileToDelete(p.id)}
                    aria-label="Delete profile"
                    title="Delete profile"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Student CTA */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onAddNewStudent();
            }}
            icon={<UserPlus className="w-4 h-4 text-blue-600" />}
          >
            Add New Student
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
