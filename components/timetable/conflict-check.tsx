'use client';

import { Session } from '@/lib/csp/types';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ConflictCheckProps {
  sessions: Session[];
}

export function ConflictCheck({ sessions }: ConflictCheckProps) {
  const warnings: string[] = [];

  // Check for duplicate sessions (same course, group, teacher)
  const sessionMap = new Map<string, number>();
  for (const session of sessions) {
    const key = `${session.courseId}:${session.groupId}:${session.teacherId}`;
    sessionMap.set(key, (sessionMap.get(key) || 0) + 1);
  }

  for (const [key, count] of sessionMap) {
    if (count > 1) {
      const [courseId, groupId, teacherId] = key.split(':');
      const session = sessions.find(
        (s) => s.courseId === courseId && s.groupId === groupId
      );
      if (session) {
        warnings.push(
          `Duplicate: ${session.courseName} for ${session.groupName}`
        );
      }
    }
  }

  // Check if any teacher has too many sessions
  const teacherSessions = new Map<string, number>();
  for (const session of sessions) {
    teacherSessions.set(
      session.teacherId,
      (teacherSessions.get(session.teacherId) || 0) + 1
    );
  }

  for (const [teacherId, count] of teacherSessions) {
    if (count > 8) {
      const teacher = sessions.find((s) => s.teacherId === teacherId);
      if (teacher) {
        warnings.push(
          `Teacher "${teacher.teacherName}" has ${count} sessions (overloaded)`
        );
      }
    }
  }

  if (warnings.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 border-amber-500/50 bg-amber-500/10">
      <div className="flex gap-3">
        <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-600 mb-2">Warnings</h3>
          <ul className="text-sm text-amber-600 space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
