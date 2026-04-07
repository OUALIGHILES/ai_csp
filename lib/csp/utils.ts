import { TimeSlot, Session, Timetable } from './types';

export function createTimeSlots(
  days: string[],
  slotsPerDay: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (const day of days) {
    for (let slot = 0; slot < slotsPerDay; slot++) {
      slots.push({ day, slot });
    }
  }
  return slots;
}

export function getSessionsByGroup(group: string, sessions: Session[]): Session[] {
  return sessions.filter((s) => s.groupId === group);
}

export function getSessionsByTeacher(
  teacherId: string,
  sessions: Session[]
): Session[] {
  return sessions.filter((s) => s.teacherId === teacherId);
}

export function slotToTimeString(slot: number, startHour: number = 8): string {
  const hour = startHour + Math.floor(slot / 2);
  const minute = slot % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
}

export function slotToHourRange(
  slot: number,
  duration: number,
  startHour: number = 8
): string {
  const startSlot = slot;
  const endSlot = slot + duration - 1;

  const startHourVal = startHour + Math.floor(startSlot / 2);
  const startMinute = startSlot % 2 === 0 ? '00' : '30';

  const endHourVal = startHour + Math.floor(endSlot / 2);
  const endMinute = endSlot % 2 === 0 ? '00' : '30';

  // Handle case where end minute is :00 and we need :30
  let endMinuteVal = endMinute;
  let endHourVal_final = endHourVal;
  if (endSlot % 2 === 1) {
    endMinuteVal = '30';
  } else if (endSlot > startSlot) {
    // Round up to next hour
    endHourVal_final = endHourVal + 1;
    endMinuteVal = '00';
  }

  return `${startHourVal}:${startMinute} - ${endHourVal_final}:${endMinuteVal}`;
}

export function validateSessionInput(
  courseName: string,
  groupName: string,
  teacherName: string,
  duration: number,
  coursesPerDay: number
): { valid: boolean; error?: string } {
  if (!courseName.trim()) {
    return { valid: false, error: 'Course name is required' };
  }
  if (!groupName.trim()) {
    return { valid: false, error: 'Group name is required' };
  }
  if (!teacherName.trim()) {
    return { valid: false, error: 'Teacher name is required' };
  }
  if (duration < 1 || duration > coursesPerDay) {
    return {
      valid: false,
      error: `Duration must be between 1 and ${coursesPerDay}`,
    };
  }
  return { valid: true };
}

export function generateColor(id: string): string {
  // Generate a consistent color based on the ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 70;
  const lightness = 60;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function exportTimetableToCSV(
  timetable: Timetable,
  days: string[],
  slotsPerDay: number
): string {
  const rows: string[][] = [];

  // Header row
  const header = ['Time', ...days];
  rows.push(header);

  // Create grid
  for (let slot = 0; slot < slotsPerDay; slot++) {
    const row = [slotToTimeString(slot)];

    for (const day of days) {
      const cellSessions: string[] = [];

      for (const session of timetable.sessions) {
        const assignedSlot = timetable.assignments.get(session.id);
        if (
          assignedSlot &&
          assignedSlot.day === day &&
          assignedSlot.slot <= slot &&
          slot < assignedSlot.slot + session.duration
        ) {
          cellSessions.push(
            `${session.courseName} (${session.groupName}/${session.teacherName})`
          );
        }
      }

      row.push(cellSessions.join('; '));
    }

    rows.push(row);
  }

  // Convert to CSV
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

/**
 * Validate dataset consistency
 * Checks if all groups have the same courses
 */
export function validateDataset(sessions: Session[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Build a map of group -> courses
  const groupCourses = new Map<string, Set<string>>();
  const groupSessionCount = new Map<string, Map<string, number>>();

  for (const session of sessions) {
    if (!groupCourses.has(session.groupId)) {
      groupCourses.set(session.groupId, new Set());
      groupSessionCount.set(session.groupId, new Map());
    }

    groupCourses.get(session.groupId)!.add(session.courseId);

    const sessionMap = groupSessionCount.get(session.groupId)!;
    sessionMap.set(session.courseId, (sessionMap.get(session.courseId) || 0) + 1);
  }

  // Get all unique groups
  const groups = Array.from(groupCourses.keys()).sort();

  // Check if all groups have the same courses
  if (groups.length > 0) {
    const firstGroupCourses = groupCourses.get(groups[0])!;
    const expectedCourses = Array.from(firstGroupCourses).sort();

    for (const group of groups) {
      const groupCourseSet = groupCourses.get(group)!;
      const currentGroupCourses = Array.from(groupCourseSet).sort();

      // Find missing courses
      const missing = expectedCourses.filter((c) => !groupCourseSet.has(c));
      if (missing.length > 0) {
        errors.push(
          `${group} is missing courses: ${missing.join(', ')}`
        );
      }

      // Find extra courses
      const extra = currentGroupCourses.filter((c) => !firstGroupCourses.has(c));
      if (extra.length > 0) {
        errors.push(
          `${group} has extra courses not in ${groups[0]}: ${extra.join(', ')}`
        );
      }

      // Check session counts per course
      for (const courseId of expectedCourses) {
        const count = groupSessionCount.get(group)!.get(courseId) || 0;
        const firstGroupCount = groupSessionCount.get(groups[0])!.get(courseId) || 0;
        if (count !== firstGroupCount) {
          warnings.push(
            `${group} has ${count} sessions for ${courseId}, but ${groups[0]} has ${firstGroupCount}`
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate timetable for constraint violations
 */
export function validateTimetable(
  timetable: { assignments: Map<string, TimeSlot>; sessions: Session[] }
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for same course multiple times per day for same group
  const groupCourseDaySessions = new Map<string, string[]>();

  for (const session of timetable.sessions) {
    const slot = timetable.assignments.get(session.id);
    if (!slot) continue;

    const key = `${session.groupId}-${session.courseId}-${slot.day}`;
    if (!groupCourseDaySessions.has(key)) {
      groupCourseDaySessions.set(key, []);
    }
    groupCourseDaySessions.get(key)!.push(session.id);
  }

  for (const [key, sessionIds] of groupCourseDaySessions) {
    const uniqueSessions = new Set(sessionIds);
    if (uniqueSessions.size > 1) {
      const [groupId, courseId, day] = key.split('-');
      errors.push(
        `${groupId} has ${uniqueSessions.size} sessions of ${courseId} on ${day}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
