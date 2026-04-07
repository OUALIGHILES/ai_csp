'use client';

import { Card } from '@/components/ui/card';
import { Session } from '@/lib/csp/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DatasetInfoProps {
  sessions: Session[];
  days: string[];
  slotsPerDay: number;
}

export function DatasetInfo({ sessions, days, slotsPerDay }: DatasetInfoProps) {
  const [expanded, setExpanded] = useState(false);

  // Group sessions by course
  const courseGroups = sessions.reduce(
    (acc, session) => {
      if (!acc[session.courseName]) {
        acc[session.courseName] = [];
      }
      acc[session.courseName].push(session);
      return acc;
    },
    {} as Record<string, Session[]>
  );

  // Count teachers and groups
  const uniqueTeachers = new Set(sessions.map((s) => s.teacherName)).size;
  const uniqueGroups = new Set(sessions.map((s) => s.groupName)).size;

  return (
    <div className="space-y-3">
      <Card className="p-4 border-border bg-secondary/5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground text-sm">Dataset Overview</p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
              <p>📚 {Object.keys(courseGroups).length} Courses</p>
              <p>👨‍🏫 {uniqueTeachers} Teachers</p>
              <p>👥 {uniqueGroups} Groups</p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="text-muted-foreground" size={20} />
          ) : (
            <ChevronDown className="text-muted-foreground" size={20} />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-border pt-3">
            {Object.entries(courseGroups).map(([courseName, courseSessions]) => (
              <div key={courseName} className="text-xs space-y-1">
                <p className="font-semibold text-foreground">{courseName}</p>
                <ul className="ml-2 text-muted-foreground space-y-0.5">
                  {courseSessions.map((session) => (
                    <li key={session.id}>
                      {session.courseName} ({session.groupName}) - {session.teacherName}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 border-border">
        <div className="space-y-2">
          <p className="font-semibold text-foreground text-sm">Schedule</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              📅 <span className="text-foreground font-medium">{days.join(', ')}</span>
            </p>
            <p>
              ⏰ <span className="text-foreground font-medium">Max {slotsPerDay} slots/day</span>
            </p>
            <p>
              📊 <span className="text-foreground font-medium">{sessions.length} total sessions</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
