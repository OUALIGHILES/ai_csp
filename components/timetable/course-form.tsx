'use client';

import { useState } from 'react';
import { Session } from '@/lib/csp/types';
import { validateSessionInput } from '@/lib/csp/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface CourseFormProps {
  onAddSession: (session: Session) => void;
  slotsPerDay: number;
  isDisabled: boolean;
}

export function CourseForm({
  onAddSession,
  slotsPerDay,
  isDisabled,
}: CourseFormProps) {
  const [courseName, setCourseName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [duration, setDuration] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateSessionInput(
      courseName,
      groupName,
      teacherName,
      duration,
      slotsPerDay
    );

    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    const session: Session = {
      id: `${Date.now()}-${Math.random()}`,
      courseId: courseName.toLowerCase().replace(/\s+/g, '-'),
      courseName,
      groupId: groupName.toLowerCase().replace(/\s+/g, '-'),
      groupName,
      teacherId: teacherName.toLowerCase().replace(/\s+/g, '-'),
      teacherName,
      duration,
    };

    onAddSession(session);

    // Reset form
    setCourseName('');
    setGroupName('');
    setTeacherName('');
    setDuration(1);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-6 text-foreground">Add Course Session</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Label htmlFor="course" className="text-sm font-medium text-foreground block mb-2">
            Course Name
          </Label>
          <Input
            id="course"
            placeholder="e.g., Mathematics 101"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            disabled={isDisabled}
            className="bg-input border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="group" className="text-sm font-medium text-foreground block mb-2">
            Group / Class
          </Label>
          <Input
            id="group"
            placeholder="e.g., Group A"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={isDisabled}
            className="bg-input border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="teacher" className="text-sm font-medium text-foreground block mb-2">
            Teacher Name
          </Label>
          <Input
            id="teacher"
            placeholder="e.g., Dr. Smith"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            disabled={isDisabled}
            className="bg-input border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="duration" className="text-sm font-medium text-foreground block mb-2">
            Duration (slots)
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="duration"
              type="number"
              min={1}
              max={slotsPerDay}
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isDisabled}
              className="w-20 bg-input border-border text-foreground"
            />
            <span className="text-sm text-muted-foreground">
              ({(duration * 30).toLocaleString()} min = {(duration * 0.5).toFixed(1)} hours)
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isDisabled || !courseName.trim() || !groupName.trim() || !teacherName.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add Session
        </Button>
      </form>
    </Card>
  );
}
