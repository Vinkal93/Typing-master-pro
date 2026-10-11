'use client';

import React, { useState } from 'react';
import { ExamConfig, ExamPassage, ExamAttemptRecord } from '@/types/exam';
import { ExamSetup } from './ExamSetup';
import { KioskExamScreen } from './KioskExamScreen';
import { ExamResultView } from './ExamResultView';

export type ExamViewStage = 'setup' | 'running' | 'result';

export const ExamContainer: React.FC = () => {
  const [stage, setStage] = useState<ExamViewStage>('setup');
  const [activeConfig, setActiveConfig] = useState<ExamConfig | null>(null);
  const [activePassage, setActivePassage] = useState<ExamPassage | null>(null);
  const [latestResult, setLatestResult] = useState<ExamAttemptRecord | null>(null);

  const handleStartExam = (config: ExamConfig, passage: ExamPassage) => {
    setActiveConfig(config);
    setActivePassage(passage);
    setStage('running');
  };

  const handleExamFinished = (record: ExamAttemptRecord) => {
    setLatestResult(record);
    setStage('result');
  };

  const handleRetry = () => {
    if (activeConfig && activePassage) {
      setStage('running');
    } else {
      setStage('setup');
    }
  };

  const handleNewTest = () => {
    setStage('setup');
  };

  const handleBackToSetup = () => {
    setStage('setup');
  };

  if (stage === 'running' && activeConfig && activePassage) {
    return (
      <KioskExamScreen
        config={activeConfig}
        passage={activePassage}
        onFinished={handleExamFinished}
        onCancel={handleBackToSetup}
      />
    );
  }

  if (stage === 'result' && latestResult) {
    return (
      <ExamResultView
        record={latestResult}
        onRetry={handleRetry}
        onNewTest={handleNewTest}
        onBackToDashboard={handleBackToSetup}
      />
    );
  }

  return <ExamSetup onStartExam={handleStartExam} />;
};
