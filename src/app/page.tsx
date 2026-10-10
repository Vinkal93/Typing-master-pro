'use client';

import React from 'react';
import { Keyboard } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';

export default function Home() {
  const { isLoading, isOnboardingRequired, activeProfile } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Keyboard className="w-6 h-6" />
          </div>
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Typing Master Pro
            </h2>
            <p className="text-xs text-slate-400">
              Initializing offline local storage...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isOnboardingRequired || !activeProfile) {
    return <OnboardingWizard />;
  }

  return <StudentDashboard />;
}
