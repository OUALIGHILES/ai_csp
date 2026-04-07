import { Session, TimeSlot, CSPProblem } from './types';
import { hardConstraints } from './constraints';

export interface Domain {
  sessionId: string;
  availableSlots: TimeSlot[];
}

/**
 * AC-3 Arc Consistency algorithm
 * Reduces domains by removing values that cannot be part of any solution
 */
export function ac3(problem: CSPProblem): Domain[] {
  // Initialize domains - all sessions can use all time slots initially
  const domains = new Map<string, Set<string>>();

  for (const session of problem.sessions) {
    const slotSet = new Set<string>();
    for (const slot of problem.timeSlots) {
      slotSet.add(slotToString(slot));
    }
    domains.set(session.id, slotSet);
  }

  // Build queue of arcs (Xi, Xj) for all pairs
  const queue: Array<[string, string]> = [];
  for (let i = 0; i < problem.sessions.length; i++) {
    for (let j = 0; j < problem.sessions.length; j++) {
      if (i !== j) {
        queue.push([problem.sessions[i].id, problem.sessions[j].id]);
      }
    }
  }

  // Process arcs
  while (queue.length > 0) {
    const [xi, xj] = queue.shift()!;

    if (revise(domains, xi, xj, problem.sessions, problem.timeSlots)) {
      // Domain of Xi was reduced, add all neighbors back to queue
      const xiSession = problem.sessions.find((s) => s.id === xi)!;
      for (const session of problem.sessions) {
        if (session.id !== xi && session.id !== xj) {
          queue.push([session.id, xi]);
        }
      }
    }
  }

  // Convert back to Domain objects
  const result: Domain[] = [];
  for (const session of problem.sessions) {
    const slotStrings = domains.get(session.id) || new Set();
    const availableSlots = Array.from(slotStrings).map(stringToSlot);
    result.push({
      sessionId: session.id,
      availableSlots,
    });
  }

  return result;
}

/**
 * Revise function for AC-3
 * Returns true if the domain of Xi was reduced
 */
function revise(
  domains: Map<string, Set<string>>,
  xi: string,
  xj: string,
  sessions: Session[],
  timeSlots: TimeSlot[]
): boolean {
  const xiDomain = domains.get(xi)!;
  const xjDomain = domains.get(xj)!;
  let revised = false;

  const xiSession = sessions.find((s) => s.id === xi)!;
  const xjSession = sessions.find((s) => s.id === xj)!;

  for (const xiValueStr of xiDomain) {
    const xiValue = stringToSlot(xiValueStr);

    // Check if there's any value in xj's domain that's compatible with xiValue
    let hasCompatible = false;

    for (const xjValueStr of xjDomain) {
      const xjValue = stringToSlot(xjValueStr);

      // Check if these two assignments are compatible
      if (areCompatible(xiSession, xiValue, xjSession, xjValue)) {
        hasCompatible = true;
        break;
      }
    }

    // If no compatible value, remove xiValue from Xi's domain
    if (!hasCompatible) {
      xiDomain.delete(xiValueStr);
      revised = true;
    }
  }

  return revised;
}

/**
 * Check if two session assignments are compatible
 */
function areCompatible(
  session1: Session,
  slot1: TimeSlot,
  session2: Session,
  slot2: TimeSlot
): boolean {
  // Same group cannot have overlapping sessions
  if (session1.groupId === session2.groupId) {
    if (
      slot1.day === slot2.day &&
      slotsOverlap(slot1.slot, session1.duration, slot2.slot, session2.duration)
    ) {
      return false;
    }
  }

  // Same teacher cannot have overlapping sessions
  if (session1.teacherId === session2.teacherId) {
    if (
      slot1.day === slot2.day &&
      slotsOverlap(slot1.slot, session1.duration, slot2.slot, session2.duration)
    ) {
      return false;
    }
  }

  // Same course cannot be scheduled more than once per day for the same group
  if (
    session1.groupId === session2.groupId &&
    session1.courseId === session2.courseId &&
    session1.id !== session2.id &&
    slot1.day === slot2.day
  ) {
    return false;
  }

  return true;
}

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

function slotToString(slot: TimeSlot): string {
  return `${slot.day}:${slot.slot}`;
}

function stringToSlot(str: string): TimeSlot {
  const [day, slot] = str.split(':');
  return { day, slot: parseInt(slot, 10) };
}
