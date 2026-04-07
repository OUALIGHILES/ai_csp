'use client';

import { Timetable } from '@/lib/csp/types';
import { Card } from '@/components/ui/card';
import { slotToTimeString, generateColor } from '@/lib/csp/utils';

interface GroupScheduleProps {
  timetable: Timetable;
  days: string[];
  slotsPerDay: number;
}

export function GroupSchedule({ timetable, days, slotsPerDay }: GroupScheduleProps) {
  // Get unique groups
  const groupIds = new Set<string>();
  for (const session of timetable.sessions) {
    groupIds.add(session.groupId);
  }

  const groups = Array.from(groupIds).sort();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4 text-foreground">Group Schedules</h2>

      <div className="space-y-6">
        {groups.map((groupId) => {
          const groupSessions = timetable.sessions.filter(
            (s) => s.groupId === groupId && timetable.assignments.has(s.id)
          );

          if (groupSessions.length === 0) return null;

          const groupName = groupSessions[0]?.groupName || groupId;

          return (
            <div key={groupId}>
              <h3 className="font-semibold text-foreground mb-2">{groupName}</h3>

              <div className="space-y-1 text-sm">
                {groupSessions
                  .sort((a, b) => {
                    const slotA = timetable.assignments.get(a.id)!;
                    const slotB = timetable.assignments.get(b.id)!;
                    const dayCompare = days.indexOf(slotA.day) - days.indexOf(slotB.day);
                    if (dayCompare !== 0) return dayCompare;
                    return slotA.slot - slotB.slot;
                  })
                  .map((session) => {
                    const slot = timetable.assignments.get(session.id)!;
                    const bgColor = generateColor(session.courseId);
                    const dayIndex = days.indexOf(slot.day);
                    const time = slotToTimeString(slot.slot);

                    return (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 p-2 rounded border border-border/50"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: bgColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium truncate">
                            {session.courseName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {days[dayIndex]} • {time} • {session.teacherName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
