'use client';

import { Card } from '@/components/ui/card';
import { SolverResult } from '@/lib/csp/types';

interface SolverStatsProps {
  result: SolverResult;
}

export function SolverStats({ result }: SolverStatsProps) {
  if (!result.stats) return null;

  const { backtracks, constraintChecks, solveTime } = result.stats;

  return (
    <Card className="p-4 bg-secondary/20 border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Solver Statistics</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Backtracks</p>
          <p className="text-lg font-bold text-accent">{backtracks.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Constraint Checks</p>
          <p className="text-lg font-bold text-accent">{constraintChecks.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Solve Time</p>
          <p className="text-lg font-bold text-accent">{solveTime}ms</p>
        </div>
      </div>
    </Card>
  );
}
