'use client';

import React, { useState } from 'react';
import {
  Map,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LessonMetadata, LessonCategory, KeyboardLayout } from '@/types';
import { LessonCatalogService } from '@/services/lessons/lessonCatalog';

interface CourseRoadmapPreviewProps {
  layout: KeyboardLayout;
  onSelectLesson: (lesson: LessonMetadata) => void;
}

export const CourseRoadmapPreview: React.FC<CourseRoadmapPreviewProps> = ({
  layout,
  onSelectLesson,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory | 'all'>('all');

  const categories = LessonCatalogService.getCategories();
  const allLessons = LessonCatalogService.getLessonsByLayout(layout);

  const filteredLessons =
    selectedCategory === 'all'
      ? allLessons
      : allLessons.filter((l) => l.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Roadmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Course Roadmap Preview
            </h3>
            <Badge variant="blue" size="sm">Curriculum</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structured step-by-step touch typing modules designed for computer institute certification.
          </p>
        </div>

        {/* Phase notice badge */}
        <span className="text-[11px] px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 font-medium inline-flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Phase 1 Curriculum • Phase 2 Interactive Engine</span>
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          All Lessons ({allLessons.length})
        </button>
        {categories.map((cat) => {
          const count = allLessons.filter((l) => l.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredLessons.map((lesson) => {
          return (
            <Card
              key={lesson.id}
              hoverable
              onClick={() => onSelectLesson(lesson)}
              className="flex flex-col justify-between p-4 border border-slate-200 dark:border-slate-800 transition-all hover:border-blue-400 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={lesson.isComingSoon ? 'gray' : 'blue'} size="sm">
                    {lesson.isComingSoon ? 'Coming in Phase 2' : 'Lesson Preview'}
                  </Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {lesson.estimatedMinutes}m
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                    {lesson.title}
                  </h4>
                  {lesson.titleHindi && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-devanagari">
                      {lesson.titleHindi}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {lesson.description}
                </p>

                <div className="flex items-center gap-1 flex-wrap pt-1">
                  {lesson.keysIntroduced.slice(0, 5).map((k, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-devanagari"
                    >
                      {k}
                    </span>
                  ))}
                  {lesson.keysIntroduced.length > 5 && (
                    <span className="text-[10px] text-slate-400">
                      +{lesson.keysIntroduced.length - 5}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                <span>View Drill Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
