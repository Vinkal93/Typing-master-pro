'use client';

import React from 'react';
import { Play, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LessonMetadata } from '@/types';

interface ContinueLearningCardProps {
  currentLesson: LessonMetadata;
  onStartLesson: (lesson: LessonMetadata) => void;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  currentLesson,
  onStartLesson,
}) => {
  return (
    <div className="rounded-2xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/30 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-sm relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="md">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Next Lesson</span>
            </Badge>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {currentLesson.estimatedMinutes} Minutes
            </span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {currentLesson.title}
            </h3>
            {currentLesson.titleHindi && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-devanagari mt-0.5">
                {currentLesson.titleHindi}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {currentLesson.description}
            </p>
          </div>

          {/* Keys introduced */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Keys Introduced:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentLesson.keysIntroduced.map((key, idx) => (
                <kbd
                  key={idx}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs text-slate-800 dark:text-slate-200 font-devanagari"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="shrink-0 flex items-center">
          <Button
            size="lg"
            onClick={() => onStartLesson(currentLesson)}
            icon={<Play className="w-5 h-5 fill-current" />}
            className="w-full sm:w-auto shadow-md"
          >
            Start Practice Drill
          </Button>
        </div>
      </div>
    </div>
  );
};
