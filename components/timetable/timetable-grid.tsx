'use client';

import { Timetable, TimeSlot, Session } from '@/lib/csp/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { slotToTimeString, generateColor, slotToHourRange } from '@/lib/csp/utils';

interface TimetableGridProps {
  timetable: Timetable;
  days: string[];
  slotsPerDay: number;
}

export function TimetableGrid({
  timetable,
  days,
  slotsPerDay,
}: TimetableGridProps) {
  const sessionColorMap = new Map<string, string>();
  for (const session of timetable.sessions) {
    sessionColorMap.set(session.id, generateColor(session.courseId));
  }

  // Build a 2D grid: day -> slot -> Session[] (multiple sessions can occupy the same slot)
  const daySlotGrid = new Map<string, Map<number, Session[]>>();

  for (const session of timetable.sessions) {
    const slot = timetable.assignments.get(session.id);
    if (!slot) continue;

    const dayKey = slot.day;
    if (!daySlotGrid.has(dayKey)) {
      daySlotGrid.set(dayKey, new Map());
    }
    const slotMap = daySlotGrid.get(dayKey)!;
    if (!slotMap.has(slot.slot)) {
      slotMap.set(slot.slot, []);
    }
    slotMap.get(slot.slot)!.push(session);
  }

  // Build a set of occupied cells (for multi-slot sessions)
  const occupiedCells = new Set<string>();
  for (const session of timetable.sessions) {
    const slot = timetable.assignments.get(session.id);
    if (!slot) continue;
    for (let i = 0; i < session.duration; i++) {
      occupiedCells.add(`${slot.day}-${slot.slot + i}`);
    }
  }

  // Get max slot index across all days
  const maxSlotIndex = Math.max(...Array.from({ length: slotsPerDay }, (_, i) => i));

  return (
    <Card className="p-6 overflow-hidden shadow-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Generated Timetable
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Complete schedule for all groups and teachers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/40 rounded-full text-xs font-medium text-blue-300 border border-blue-700/50">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            {timetable.sessions.length} Sessions Scheduled
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-collapse text-sm shadow-xl rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-gradient-to-r from-slate-800 to-slate-900 p-4 font-bold text-white border-r-2 border-slate-600 min-w-[100px] shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  🕐
                  <span>Time</span>
                </div>
              </th>
              {days.map((day, index) => (
                <th
                  key={day}
                  className="p-4 font-bold text-white border-r border-slate-600 min-w-[180px] text-center shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${[
                      '#667eea',
                      '#48bb78',
                      '#ed8936',
                      '#4299e1',
                      '#ed64a6'
                    ][index % 5]}, ${[
                      '#764ba2',
                      '#38a169',
                      '#dd6b20',
                      '#3182ce',
                      '#d53f8c'
                    ][index % 5]})`,
                  }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: slotsPerDay }).map((_, slotIndex) => (
              <tr
                key={slotIndex}
                className={`hover:bg-blue-900/20 transition-all duration-200 ${
                  slotIndex % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'
                }`}
              >
                <td className="sticky left-0 z-10 p-4 text-center font-bold text-white border-r-2 border-slate-600 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg font-extrabold drop-shadow-lg">
                      {slotToTimeString(slotIndex)}
                    </span>
                  </div>
                </td>
                {days.map((day) => {
                  const daySlots = daySlotGrid.get(day);
                  const sessionsAtSlot = daySlots?.get(slotIndex) || [];

                  // Check if this cell is covered by a previous session's rowspan
                  const cellKey = `${day}-${slotIndex}`;
                  const isOccupiedByRowspan = occupiedCells.has(cellKey) && sessionsAtSlot.length === 0;

                  // No session at all and not occupied by rowspan - render empty cell
                  if (sessionsAtSlot.length === 0 && !isOccupiedByRowspan) {
                    return (
                      <td
                        key={day}
                        className="p-2 border border-slate-700 min-h-[80px] bg-gradient-to-br from-slate-800 to-slate-900"
                      />
                    );
                  }

                  // This cell is covered by a previous session's rowspan
                  if (isOccupiedByRowspan) {
                    return null;
                  }

                  // Check if any session starts at this slot
                  const startingSessions = sessionsAtSlot.filter(
                    (s) => timetable.assignments.get(s.id)?.slot === slotIndex
                  );

                  // If no new sessions start here, skip (covered by rowspan above)
                  if (startingSessions.length === 0) {
                    return null;
                  }

                  // Calculate max rowspan needed
                  const maxRowSpan = Math.max(...startingSessions.map((s) => s.duration));

                  return (
                    <td
                      key={day}
                      rowSpan={maxRowSpan}
                      className="p-2 border border-slate-700 align-top"
                    >
                      <div className="flex flex-col gap-2">
                        {startingSessions.map((session) => {
                          const slot = timetable.assignments.get(session.id)!;
                          const rowSpan = session.duration;
                          const bgColor = sessionColorMap.get(session.id);

                          return (
                            <div
                              key={session.id}
                              className="group rounded-xl p-3 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/20 cursor-pointer"
                              style={{
                                background: `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`,
                                boxShadow: `0 4px 16px ${bgColor}60`,
                              }}
                            >
                              <div className="font-bold text-white text-sm mb-2 drop-shadow-lg tracking-wide">
                                {session.courseName}
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="secondary"
                                    className="bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-2.5 py-1 font-semibold shadow-md rounded-full border border-slate-600"
                                  >
                                    {session.groupName}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-white/95 text-xs font-medium">
                                  <span className="text-base">👨‍🏫</span>
                                  <span className="drop-shadow-sm">{session.teacherName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/85 text-xs font-medium">
                                  <span className="text-base">🕐</span>
                                  <span className="bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm drop-shadow-sm">
                                    {slotToHourRange(slot.slot, rowSpan)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
