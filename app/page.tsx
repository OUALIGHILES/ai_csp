'use client';

import { useState, useCallback, useEffect } from 'react';
import { Timetable, SolverResult, Session } from '@/lib/csp/types';
import { solveCSPHybrid } from '@/lib/csp/solver';
import { createTimeSlots, validateDataset, validateTimetable } from '@/lib/csp/utils';
import { hardConstraints, softConstraints } from '@/lib/csp/constraints';
import { DAYS, SLOTS_PER_DAY, PREDEFINED_SESSIONS } from '@/lib/data/predefined-timetable';
import { TimetableGrid } from '@/components/timetable/timetable-grid';
import { SolverStats } from '@/components/timetable/solver-stats';
import { GroupSchedule } from '@/components/timetable/group-schedule';
import { TeacherSchedule } from '@/components/timetable/teacher-schedule';
import { DatasetInfo } from '@/components/timetable/dataset-info';
import { AlgorithmSteps } from '@/components/timetable/algorithm-steps';
import { GenerationHistory } from '@/components/timetable/generation-history';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, RotateCcw, Download, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [days, setDays] = useState<string[]>([]);
  const [slotsPerDay, setSlotsPerDay] = useState(0);
  const [configured, setConfigured] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'groups' | 'teachers'>('grid');
  const [initialized, setInitialized] = useState(false);
  const [generations, setGenerations] = useState<(SolverResult & { id: string })[]>([]);
  const [selectedGenId, setSelectedGenId] = useState<string | null>(null);
  const [datasetWarnings, setDatasetWarnings] = useState<string[]>([]);
  const [datasetErrors, setDatasetErrors] = useState<string[]>([]);
  const [timetableErrors, setTimetableErrors] = useState<string[]>([]);

  const handleGenerateTimetable = useCallback(async (sessionsToUse?: Session[], daysToUse?: string[], slotsToUse?: number) => {
    const activeSessions = sessionsToUse || sessions;
    const activeDays = daysToUse || days;
    const activeSlots = slotsToUse !== undefined ? slotsToUse : slotsPerDay;

    if (activeSessions.length === 0) {
      setError('Please add at least one session');
      return;
    }

    setLoading(true);
    setError(null);
    setTimetableErrors([]);

    try {
      const timeSlots = createTimeSlots(activeDays, activeSlots);
      const problem = {
        sessions: activeSessions,
        timeSlots,
        constraints: [...hardConstraints, ...softConstraints],
      };

      const solveResult = await solveCSPHybrid(problem);
      const resultWithId = {
        ...solveResult,
        id: `gen-${Date.now()}-${Math.random()}`,
        generatedAt: new Date().toISOString(),
      };

      setResult(solveResult);
      setGenerations((prev) => [resultWithId, ...prev]);
      setSelectedGenId(resultWithId.id);

      // Validate the generated timetable
      if (solveResult.success && solveResult.timetable) {
        const validation = validateTimetable(solveResult.timetable);
        setTimetableErrors(validation.errors);
      }

      if (!solveResult.success) {
        setError(solveResult.error || 'Failed to generate timetable');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessions, days, slotsPerDay]);

  // Initialize with predefined dataset
  useEffect(() => {
    if (!initialized) {
      const daysArray = DAYS;
      const slotCount = Math.max(...Object.values(SLOTS_PER_DAY));

      setDays(daysArray);
      setSlotsPerDay(slotCount);
      setSessions(PREDEFINED_SESSIONS);
      setConfigured(true);
      setInitialized(true);

      // Validate dataset
      const validation = validateDataset(PREDEFINED_SESSIONS);
      setDatasetErrors(validation.errors);
      setDatasetWarnings(validation.warnings);

      // Auto-solve after initialization with predefined data
      setTimeout(() => {
        handleGenerateTimetable(PREDEFINED_SESSIONS, daysArray, slotCount);
      }, 100);
    }
  }, [initialized, handleGenerateTimetable]);

  const handleReset = useCallback(() => {
    setDays(DAYS);
    setSlotsPerDay(Math.max(...Object.values(SLOTS_PER_DAY)));
    setSessions(PREDEFINED_SESSIONS);
    setResult(null);
    setError(null);
    setViewMode('grid');
  }, []);

  const handleSelectGeneration = useCallback((id: string) => {
    const selected = generations.find((g) => g.id === id);
    if (selected) {
      setResult(selected);
      setSelectedGenId(id);
      setViewMode('grid');
    }
  }, [generations]);

  const handleDeleteGeneration = useCallback((id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    if (selectedGenId === id) {
      setResult(null);
      setSelectedGenId(null);
    }
  }, [selectedGenId]);

  const handleExportCSV = useCallback(() => {
    if (!result?.timetable) return;

    const { exportTimetableToCSV } = require('@/lib/csp/utils');
    const csv = exportTimetableToCSV(result.timetable, days, slotsPerDay);

    const blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, days, slotsPerDay]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Timetable Solver</h1>
            <p className="text-muted-foreground mt-2">
              Automatically schedule courses using constraint satisfaction
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Info and Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Dataset Info Component */}
              <DatasetInfo sessions={sessions} days={days} slotsPerDay={slotsPerDay} />

              {/* Generate/Reset Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleGenerateTimetable()}
                  disabled={loading || sessions.length === 0}
                  className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Timetable'
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-border hover:bg-secondary/20"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Reset Dataset
                </Button>
              </div>

              {/* Generation History */}
              <GenerationHistory
                generations={generations}
                onSelectGeneration={handleSelectGeneration}
                onDeleteGeneration={handleDeleteGeneration}
                selectedId={selectedGenId || undefined}
              />
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dataset Validation Warnings */}
              {datasetWarnings.length > 0 && (
                <Card className="p-4 border-yellow-500/50 bg-yellow-500/10">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-500 mb-1">Dataset Warnings</h3>
                      <ul className="text-sm text-yellow-500/90 space-y-1">
                        {datasetWarnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Dataset Validation Errors */}
              {datasetErrors.length > 0 && (
                <Card className="p-4 border-orange-500/50 bg-orange-500/10">
                  <div className="flex gap-3">
                    <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-500 mb-1">Dataset Errors</h3>
                      <ul className="text-sm text-orange-500/90 space-y-1">
                        {datasetErrors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Timetable Validation Errors */}
              {timetableErrors.length > 0 && (
                <Card className="p-4 border-red-500/50 bg-red-500/10">
                  <div className="flex gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-500 mb-1">Timetable Constraint Violations</h3>
                      <p className="text-xs text-red-500/70 mb-2">
                        The generated timetable has constraint violations. Try generating again.
                      </p>
                      <ul className="text-sm text-red-500/90 space-y-1">
                        {timetableErrors.map((err, idx) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/10">
                  <div className="flex gap-3">
                    <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive mb-1">Error</h3>
                      <p className="text-sm text-destructive/90">{error}</p>
                    </div>
                  </div>
                </Card>
              )}

              {result && (
                <>
                  {result.success && (
                    <Card className="p-4 border-green-500/50 bg-green-500/10">
                      <div className="flex gap-3">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-500 mb-1">Success!</h3>
                          <p className="text-sm text-green-500/90 mb-3">
                            Timetable generated successfully.
                          </p>
                          {result.stats && (
                            <div className="text-xs text-green-500/70 space-y-1">
                              <p>Backtracks: {result.stats.backtracks}</p>
                              <p>
                                Constraint Checks: {result.stats.constraintChecks.toLocaleString()}
                              </p>
                              <p>Solve Time: {result.stats.solveTime}ms</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}

                  {result.success && result.timetable && (
                    <>
                      <SolverStats result={result} />

                      {/* View Mode Tabs */}
                      <div className="flex gap-2 border-b border-border">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            viewMode === 'grid'
                              ? 'border-accent text-accent'
                              : 'border-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Timetable Grid
                        </button>
                        <button
                          onClick={() => setViewMode('groups')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            viewMode === 'groups'
                              ? 'border-accent text-accent'
                              : 'border-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Group Schedules
                        </button>
                        <button
                          onClick={() => setViewMode('teachers')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            viewMode === 'teachers'
                              ? 'border-accent text-accent'
                              : 'border-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Teacher Schedules
                        </button>
                      </div>

                      {/* Grid View */}
                      {viewMode === 'grid' && (
                        <TimetableGrid
                          timetable={result.timetable}
                          days={days}
                          slotsPerDay={slotsPerDay}
                        />
                      )}

                      {/* Group View */}
                      {viewMode === 'groups' && (
                        <GroupSchedule
                          timetable={result.timetable}
                          days={days}
                          slotsPerDay={slotsPerDay}
                        />
                      )}

                      {/* Teacher View */}
                      {viewMode === 'teachers' && (
                        <TeacherSchedule
                          timetable={result.timetable}
                          days={days}
                          slotsPerDay={slotsPerDay}
                        />
                      )}

                      <Button
                        onClick={handleExportCSV}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Download size={16} className="mr-2" />
                        Export as CSV
                      </Button>

                      {/* Algorithm Steps */}
                      {result.steps && result.steps.length > 0 && (
                        <AlgorithmSteps
                          steps={result.steps}
                          totalTime={result.stats?.solveTime || 0}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
      </div>
    </main>
  );
}
