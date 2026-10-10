'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  BarChart3,
  Download,
  Printer,
  Layers,
  Award,
  TrendingUp,
  Target,
  RefreshCw,
} from 'lucide-react';
import { InstituteReportService, BatchComparisonRow } from '@/services/institute/instituteReportService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const InstituteReportsView: React.FC = () => {
  const [comparisons, setComparisons] = useState<BatchComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await InstituteReportService.getBatchComparisons();
      setComparisons(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportBatchComparisonCsv = () => {
    const csv = InstituteReportService.exportBatchComparisonToCsv(comparisons);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_Comparison_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Institute Academic Reports & Batch Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Comparative performance analytics, speed benchmarks, and printable dossiers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportBatchComparisonCsv} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export Comparisons (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} className="text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Batch Comparison Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Cross-Batch Performance Matrix</span>
          </div>
          <Badge variant="purple" size="sm">Institute Benchmark</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Batch Name</th>
                <th className="py-2.5 px-3">Shift</th>
                <th className="py-2.5 px-3">Active Students</th>
                <th className="py-2.5 px-3">Average Speed</th>
                <th className="py-2.5 px-3">Average Accuracy</th>
                <th className="py-2.5 px-3">Exam Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparisons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active batches available for comparison.
                  </td>
                </tr>
              ) : (
                comparisons.map((c) => (
                  <tr key={c.batchId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {c.batchName}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {c.shift}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {c.studentCount}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-600">
                      {c.averageWpm} WPM
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-600">
                      {c.averageAccuracy}%
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${c.passPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {c.passPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
