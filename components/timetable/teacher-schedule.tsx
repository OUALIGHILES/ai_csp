'use client';

import { Timetable } from '@/lib/csp/types';
import { Card } from '@/components/ui/card';
import { slotToTimeString, generateColor } from '@/lib/csp/utils';

interface TeacherScheduleProps {
  timetable: Timetable;
  days: string[];
  slotsPerDay: number;
}

export function TeacherSchedule({ timetable, days, slotsPerDay }: TeacherScheduleProps) {
  // Get unique teachers
  const teacherIds = new Set<string>();
  for (const session of timetable.sessions) {
    teacherIds.add(session.teacherId);
  }

  const teachers = Array.from(teacherIds).sort();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4 text-foreground">Teacher Schedules</h2>

      <div className="space-y-6">
        {teachers.map((teacherId) => {
          const teacherSessions = timetable.sessions.filter(
            (s) => s.teacherId === teacherId && timetable.assignments.has(s.id)
          );

          if (teacherSessions.length === 0) return null;

          const teacherName = teacherSessions[0]?.teacherName || teacherId;
          const totalHours = teacherSessions.reduce((sum, s) => sum + s.duration * 0.5, 0);

          return (
            <div key={teacherId}>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-semibold text-foreground">{teacherName}</h3>
                <p className="text-xs text-muted-foreground">{totalHours} hours</p>
              </div>

              <div className="space-y-1 text-sm">
                {teacherSessions
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
                            {days[dayIndex]} • {time} • {session.groupName}
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
