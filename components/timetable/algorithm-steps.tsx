'use client';

import { AlgorithmStep } from '@/lib/csp/types';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AlgorithmStepsProps {
  steps: AlgorithmStep[];
  totalTime: number;
}

export function AlgorithmSteps({ steps, totalTime }: AlgorithmStepsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const phaseColors = {
    'initialization': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    'ac3-propagation': 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    'variable-selection': 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    'value-ordering': 'bg-green-500/10 border-green-500/20 text-green-400',
    'constraint-check': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    'backtrack': 'bg-red-500/10 border-red-500/20 text-red-400',
    'assignment': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    'completion': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };

  const phaseLabels = {
    'initialization': 'Initialization',
    'ac3-propagation': 'AC-3 Propagation',
    'variable-selection': 'Variable Selection',
    'value-ordering': 'Value Ordering',
    'constraint-check': 'Constraint Check',
    'backtrack': 'Backtrack',
    'assignment': 'Assignment',
    'completion': 'Completion',
  };

  // Group steps by phase
  const groupedSteps = steps.reduce((acc, step) => {
    const phase = step.phase;
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(step);
    return acc;
  }, {} as Record<string, AlgorithmStep[]>);

  return (
    <Card className="p-6 border-border bg-secondary/5">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">Algorithm Execution Steps</h3>
          <div className="text-sm text-muted-foreground">Total time: {totalTime.toFixed(2)}ms</div>
        </div>

        <div className="space-y-2">
          {Object.entries(groupedSteps).map(([phase, phaseSteps]) => (
            <div key={phase} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === phase ? null : phase)}
                className={`w-full p-4 flex justify-between items-center transition-colors ${
                  phaseColors[phase as keyof typeof phaseColors]
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">
                    {phaseLabels[phase as keyof typeof phaseLabels]}
                  </div>
                  <div className="text-xs opacity-75">{phaseSteps.length} step{phaseSteps.length !== 1 ? 's' : ''}</div>
                </div>
                {expanded === phase ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {expanded === phase && (
                <div className="bg-secondary/20 border-t border-border divide-y divide-border">
                  {phaseSteps.map((step, idx) => (
                    <div key={idx} className="p-4 text-sm">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{step.description}</div>
                          {step.detail && (
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              {step.detail}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Step {step.stepNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t border-border">
          Total steps: {steps.length}
        </div>
      </div>
    </Card>
  );
}
