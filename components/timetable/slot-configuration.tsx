'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface SlotConfigurationProps {
  onConfigured: (days: string[], slotsPerDay: number) => void;
  isDisabled: boolean;
}

export function SlotConfiguration({
  onConfigured,
  isDisabled,
}: SlotConfigurationProps) {
  const [days, setDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday']);
  const [newDay, setNewDay] = useState('');
  const [slotsPerDay, setSlotsPerDay] = useState(8);

  const handleAddDay = () => {
    if (newDay.trim() && !days.includes(newDay.trim())) {
      setDays([...days, newDay.trim()]);
      setNewDay('');
    }
  };

  const handleRemoveDay = (day: string) => {
    setDays(days.filter((d) => d !== day));
  };

  const handleConfigure = () => {
    if (days.length > 0 && slotsPerDay > 0) {
      onConfigured(days, slotsPerDay);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-6 text-foreground">Time Configuration</h2>

      <div className="space-y-4">
        {/* Days Configuration */}
        <div>
          <Label className="text-sm font-medium text-foreground block mb-2">
            Days of the Week
          </Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a day (e.g., Thursday)"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDay()}
              disabled={isDisabled}
              className="bg-input border-border text-foreground"
            />
            <Button
              onClick={handleAddDay}
              disabled={isDisabled || !newDay.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <div
                key={day}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
              >
                {day}
                <button
                  onClick={() => handleRemoveDay(day)}
                  disabled={isDisabled}
                  className="ml-1 hover:opacity-70 disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Slots Per Day Configuration */}
        <div>
          <Label className="text-sm font-medium text-foreground block mb-2">
            Time Slots Per Day (30-min increments)
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={1}
              max={20}
              value={slotsPerDay}
              onChange={(e) => setSlotsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isDisabled}
              className="w-20 bg-input border-border text-foreground"
            />
            <span className="text-sm text-muted-foreground">
              ({slotsPerDay * 0.5} hours)
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-secondary/30 border border-border rounded-md p-3 text-sm text-muted-foreground">
          <p>
            Configured days: <strong>{days.length}</strong> • Slots per day:{' '}
            <strong>{slotsPerDay}</strong>
          </p>
        </div>

        {/* Configure Button */}
        <Button
          onClick={handleConfigure}
          disabled={isDisabled || days.length === 0}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Save Configuration
        </Button>
      </div>
    </Card>
  );
}
