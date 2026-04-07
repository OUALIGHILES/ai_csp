import { Constraint, Session, TimeSlot } from './types';

// Hard Constraint 1: No overlapping sessions for the same group
export const noGroupOverlapConstraint: Constraint = {
  type: 'hard',
  name: 'No Group Overlap',
  check: (assignment, sessions, allSlots) => {
    for (const session1 of sessions) {
      const slot1 = assignment.get(session1.id);
      if (!slot1) continue;

      for (const session2 of sessions) {
        if (session1.id === session2.id) continue;
        if (session1.groupId !== session2.groupId) continue;

        const slot2 = assignment.get(session2.id);
        if (!slot2) continue;

        // Check if sessions overlap
        if (
          slot1.day === slot2.day &&
          slotsOverlap(slot1.slot, session1.duration, slot2.slot, session2.duration)
        ) {
          return false;
        }
      }
    }
    return true;
  },
};

// Hard Constraint 2: No teacher at two places simultaneously
export const noTeacherOverlapConstraint: Constraint = {
  type: 'hard',
  name: 'No Teacher Overlap',
  check: (assignment, sessions, allSlots) => {
    for (const session1 of sessions) {
      const slot1 = assignment.get(session1.id);
      if (!slot1) continue;

      for (const session2 of sessions) {
        if (session1.id === session2.id) continue;
        if (session1.teacherId !== session2.teacherId) continue;

        const slot2 = assignment.get(session2.id);
        if (!slot2) continue;

        // Check if sessions overlap
        if (
          slot1.day === slot2.day &&
          slotsOverlap(slot1.slot, session1.duration, slot2.slot, session2.duration)
        ) {
          return false;
        }
      }
    }
    return true;
  },
};

// Hard Constraint 3: Max 3 consecutive sessions per day per group
export const maxConsecutiveSessionsConstraint: Constraint = {
  type: 'hard',
  name: 'Max 3 Consecutive Sessions',
  check: (assignment, sessions, allSlots) => {
    const groupDays = new Map<string, TimeSlot[]>();

    for (const session of sessions) {
      const slot = assignment.get(session.id);
      if (!slot) continue;

      const key = `${session.groupId}-${slot.day}`;
      if (!groupDays.has(key)) {
        groupDays.set(key, []);
      }
      groupDays.get(key)!.push(slot);
    }

    // Check consecutive sessions for each group-day
    for (const [, slots] of groupDays) {
      slots.sort((a, b) => a.slot - b.slot);
      let consecutive = 1;
      for (let i = 1; i < slots.length; i++) {
        if (slots[i].slot === slots[i - 1].slot + 1) {
          consecutive++;
          if (consecutive > 3) return false;
        } else {
          consecutive = 1;
        }
      }
    }
    return true;
  },
};

// Hard Constraint 4: Same course cannot appear more than once per day for the same group
export const noSameCoursePerDayConstraint: Constraint = {
  type: 'hard',
  name: 'No Same Course Per Day',
  check: (assignment, sessions, allSlots) => {
    // Track which sessions are assigned to which group-course-day
    const groupCourseDaySessions = new Map<string, string[]>();

    for (const session of sessions) {
      const slot = assignment.get(session.id);
      if (!slot) continue;

      const key = `${session.groupId}-${session.courseId}-${slot.day}`;
      if (!groupCourseDaySessions.has(key)) {
        groupCourseDaySessions.set(key, []);
      }
      groupCourseDaySessions.get(key)!.push(session.id);
    }

    // Check if any course has more than one session on the same day for a group
    for (const [key, sessionIds] of groupCourseDaySessions) {
      const uniqueSessions = new Set(sessionIds);
      if (uniqueSessions.size > 1) {
        return false;
      }
    }
    return true;
  },
};

// Hard Constraint 5: Each course appears exactly ONCE per group per week
export const oneSessionPerCoursePerWeekConstraint: Constraint = {
  type: 'hard',
  name: 'One Session Per Course Per Week',
  check: (assignment, sessions, allSlots) => {
    // Count how many times each course appears for each group in the entire week
    const groupCourseCount = new Map<string, string[]>();

    for (const session of sessions) {
      const slot = assignment.get(session.id);
      if (!slot) continue;

      const key = `${session.groupId}-${session.courseId}`;
      if (!groupCourseCount.has(key)) {
        groupCourseCount.set(key, []);
      }
      groupCourseCount.get(key)!.push(session.id);
    }

    // Check that each course appears exactly once per group
    for (const [key, sessionIds] of groupCourseCount) {
      const uniqueSessions = new Set(sessionIds);
      if (uniqueSessions.size > 1) {
        return false;
      }
    }
    return true;
  },
};

// Soft Constraint: Minimize gaps between sessions in a day
export const minimizeGapsConstraint: Constraint = {
  type: 'soft',
  name: 'Minimize Gaps',
  penalty: (assignment, sessions, allSlots) => {
    const groupDays = new Map<string, number[]>();
    let penalty = 0;

    for (const session of sessions) {
      const slot = assignment.get(session.id);
      if (!slot) continue;

      const key = `${session.groupId}-${slot.day}`;
      if (!groupDays.has(key)) {
        groupDays.set(key, []);
      }
      groupDays.get(key)!.push(slot.slot);
    }

    for (const [, slots] of groupDays) {
      slots.sort((a, b) => a - b);
      for (let i = 1; i < slots.length; i++) {
        const gap = slots[i] - slots[i - 1] - 1;
        if (gap > 0) {
          penalty += gap * 2; // Penalize gaps
        }
      }
    }
    return penalty;
  },
};

// Soft Constraint: Distribute sessions evenly across days
export const evenDistributionConstraint: Constraint = {
  type: 'soft',
  name: 'Even Distribution',
  penalty: (assignment, sessions, allSlots) => {
    const groupDayCount = new Map<string, number>();
    const days = new Set<string>();

    for (const session of sessions) {
      const slot = assignment.get(session.id);
      if (!slot) continue;

      days.add(slot.day);
      const key = `${session.groupId}-${slot.day}`;
      groupDayCount.set(key, (groupDayCount.get(key) || 0) + 1);
    }

    let penalty = 0;
    const groupSessions = new Map<string, number>();

    for (const session of sessions) {
      const slot = assignment.get(session.id);
      if (!slot) continue;
      groupSessions.set(session.groupId, (groupSessions.get(session.groupId) || 0) + 1);
    }

    for (const [groupId, totalSessions] of groupSessions) {
      const targetPerDay = Math.ceil(totalSessions / days.size);
      for (const day of days) {
        const key = `${groupId}-${day}`;
        const count = groupDayCount.get(key) || 0;
        if (count > targetPerDay) {
          penalty += (count - targetPerDay) * 3;
        }
      }
    }

    return penalty;
  },
};

// Helper function to check if time slots overlap considering duration
function slotsOverlap(
  slot1Start: number,
  duration1: number,
  slot2Start: number,
  duration2: number
): boolean {
  const slot1End = slot1Start + duration1 - 1;
  const slot2End = slot2Start + duration2 - 1;

  return !(slot1End < slot2Start || slot2End < slot1Start);
}

export const hardConstraints = [
  noGroupOverlapConstraint,
  noTeacherOverlapConstraint,
  maxConsecutiveSessionsConstraint,
  noSameCoursePerDayConstraint,
  oneSessionPerCoursePerWeekConstraint,
];

export const softConstraints = [minimizeGapsConstraint, evenDistributionConstraint];
