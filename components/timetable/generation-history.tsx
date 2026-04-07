'use client';

import { SolverResult } from '@/lib/csp/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';

interface GenerationHistoryProps {
  generations: (SolverResult & { id: string })[];
  onSelectGeneration: (id: string) => void;
  onDeleteGeneration: (id: string) => void;
  selectedId?: string;
}

export function GenerationHistory({
  generations,
  onSelectGeneration,
  onDeleteGeneration,
  selectedId,
}: GenerationHistoryProps) {
  if (generations.length === 0) {
    return (
      <Card className="p-6 border-border text-center text-muted-foreground">
        No generations yet. Click "Generate Timetable" to start.
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border space-y-3">
      <h3 className="font-semibold text-foreground text-lg">Generation History</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {generations.map((gen, idx) => (
          <div
            key={gen.id}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              selectedId === gen.id
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-accent/50 hover:bg-secondary/20'
            }`}
          >
            <div className="flex justify-between items-start gap-3">
              <button
                onClick={() => onSelectGeneration(gen.id)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Generation #{idx + 1}</span>
                  {gen.success ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Success
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      Failed
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {gen.generatedAt && new Date(gen.generatedAt).toLocaleTimeString()}
                </div>
                {gen.stats && (
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <div>Backtracks: {gen.stats.backtracks}</div>
                    <div>Solve Time: {gen.stats.solveTime}ms</div>
                  </div>
                )}
              </button>
              <button
                onClick={() => onDeleteGeneration(gen.id)}
                className="p-1.5 hover:bg-red-500/20 rounded text-muted-foreground hover:text-red-400 transition-colors"
                title="Delete generation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
