'use client';

import { Session } from '@/lib/csp/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SessionsListProps {
  sessions: Session[];
  onRemoveSession: (sessionId: string) => void;
  isDisabled: boolean;
}

export function SessionsList({
  sessions,
  onRemoveSession,
  isDisabled,
}: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <Card className="p-6 border-border/50">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No sessions added yet. Add a course session to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4 text-foreground">Sessions ({sessions.length})</h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-md hover:bg-secondary/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">
                {session.courseName}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.groupName} • {session.teacherName} • {session.duration * 30}min
              </p>
            </div>
            <Button
              onClick={() => onRemoveSession(session.id)}
              disabled={isDisabled}
              size="sm"
              variant="ghost"
              className="ml-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
