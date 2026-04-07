'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConstraintSettingsProps {
  onSettingsChange: (settings: ConstraintSettings) => void;
}

export interface ConstraintSettings {
  enforceHardConstraints: boolean;
  minimizeGaps: boolean;
  evenDistribution: boolean;
  maxConsecutiveSessions: number;
}

export function ConstraintSettings({ onSettingsChange }: ConstraintSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ConstraintSettings>({
    enforceHardConstraints: true,
    minimizeGaps: true,
    evenDistribution: true,
    maxConsecutiveSessions: 3,
  });

  const handleChange = (newSettings: ConstraintSettings) => {
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Card className="border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
      >
        <h3 className="font-semibold text-foreground">Advanced Constraints</h3>
        {isOpen ? (
          <ChevronUp size={20} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={20} className="text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hard-constraints"
                checked={settings.enforceHardConstraints}
                onChange={(e) =>
                  handleChange({
                    ...settings,
                    enforceHardConstraints: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-border bg-input"
              />
              <Label htmlFor="hard-constraints" className="text-sm text-foreground">
                Enforce Hard Constraints
              </Label>
            </div>

            <p className="text-xs text-muted-foreground ml-7">
              • No group overlaps
            </p>
            <p className="text-xs text-muted-foreground ml-7">
              • No teacher overlaps
            </p>
            <p className="text-xs text-muted-foreground ml-7">
              • Max {settings.maxConsecutiveSessions} consecutive sessions per day
            </p>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="minimize-gaps"
                checked={settings.minimizeGaps}
                onChange={(e) =>
                  handleChange({
                    ...settings,
                    minimizeGaps: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-border bg-input"
              />
              <Label htmlFor="minimize-gaps" className="text-sm text-foreground">
                Minimize Schedule Gaps (Soft)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-7">
              Prefer timetables with fewer breaks between sessions
            </p>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="even-dist"
                checked={settings.evenDistribution}
                onChange={(e) =>
                  handleChange({
                    ...settings,
                    evenDistribution: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-border bg-input"
              />
              <Label htmlFor="even-dist" className="text-sm text-foreground">
                Even Day Distribution (Soft)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-7">
              Spread sessions evenly across days
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <Label className="text-sm font-medium text-foreground block mb-2">
              Max Consecutive Sessions Per Day
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={settings.maxConsecutiveSessions}
                onChange={(e) =>
                  handleChange({
                    ...settings,
                    maxConsecutiveSessions: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="text-sm font-semibold text-accent">
                {settings.maxConsecutiveSessions}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
