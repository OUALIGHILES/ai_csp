import { Session, TimeSlot } from './types';
import { Domain } from './ac3';

/**
 * Shuffle array with optional seed for reproducibility
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  // Simple seeded PRNG (mulberry32)
  let s = seed || Date.now();
  const random = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Minimum Remaining Values (MRV) heuristic
 * Selects the variable with the smallest domain (with randomization among equals)
 */
export function selectMRVVariable(
  unassignedSessions: Session[],
  domains: Map<string, TimeSlot[]>,
  seed?: number
): Session | null {
  if (unassignedSessions.length === 0) return null;

  // Find the minimum domain size
  let minDomainSize = Infinity;
  for (const session of unassignedSessions) {
    const domainSize = (domains.get(session.id) || []).length;
    if (domainSize < minDomainSize) {
      minDomainSize = domainSize;
    }
  }

  // Get all sessions with minimum domain size
  const minDomainSessions = unassignedSessions.filter(
    (s) => (domains.get(s.id) || []).length === minDomainSize
  );

  // If there's only one, return it
  if (minDomainSessions.length === 1) {
    return minDomainSessions[0];
  }

  // Randomize among sessions with equal domain size
  const shuffled = shuffleArray(minDomainSessions, seed);
  return shuffled[0];
}

/**
 * Degree heuristic
 * Among variables with equal domain size, select the one involved in most constraints
 */
export function selectDegreeVariable(
  sessions: Session[],
  domains: Map<string, TimeSlot[]>
): Session | null {
  if (sessions.length === 0) return null;

  // Find sessions with minimum domain size
  let minDomainSize = Infinity;
  for (const session of sessions) {
    const domainSize = (domains.get(session.id) || []).length;
    if (domainSize < minDomainSize) {
      minDomainSize = domainSize;
    }
  }

  const minDomainSessions = sessions.filter(
    (s) => (domains.get(s.id) || []).length === minDomainSize
  );

  // Among those, select the one with highest degree (most constraints)
  return minDomainSessions.reduce((maxSession, session) => {
    const maxDegree = countConstraintDegree(maxSession, sessions);
    const currentDegree = countConstraintDegree(session, sessions);

    return currentDegree > maxDegree ? session : maxSession;
  });
}

/**
 * Least Constraining Value (LCV) heuristic
 * Orders values to prefer those that rule out fewer choices for neighbors (with randomization among equals)
 */
export function orderValuesByLCV(
  session: Session,
  domain: TimeSlot[],
  otherSessions: Session[],
  assignment: Map<string, TimeSlot>,
  seed?: number
): TimeSlot[] {
  const valueCounts = new Map<string, number>();

  for (const value of domain) {
    const valueKey = `${value.day}:${value.slot}`;
    let ruledOut = 0;

    // For each unassigned neighbor session
    for (const neighbor of otherSessions) {
      if (assignment.has(neighbor.id)) continue;

      // Count how many of neighbor's domain values are ruled out
      // by assigning this value to session
      if (
        (session.groupId === neighbor.groupId ||
          session.teacherId === neighbor.teacherId) &&
        value // This assignment would conflict with some neighbors
      ) {
        // Rough estimate: if they share a resource, they'll have conflicts
        ruledOut += 2;
      }
    }

    valueCounts.set(valueKey, ruledOut);
  }

  // Group values by their constraint count
  const groups = new Map<number, TimeSlot[]>();
  for (const value of domain) {
    const key = `${value.day}:${value.slot}`;
    const count = valueCounts.get(key) || 0;
    if (!groups.has(count)) {
      groups.set(count, []);
    }
    groups.get(count)!.push(value);
  }

  // Sort groups by constraint count, but shuffle within each group
  const sortedCounts = Array.from(groups.keys()).sort((a, b) => a - b);
  const result: TimeSlot[] = [];
  
  for (const count of sortedCounts) {
    const groupValues = groups.get(count)!;
    const shuffled = shuffleArray(groupValues, seed ? seed + count : undefined);
    result.push(...shuffled);
  }

  return result;
}

/**
 * Count the number of constraints a variable is involved in
 */
function countConstraintDegree(session: Session, allSessions: Session[]): number {
  let degree = 0;

  for (const other of allSessions) {
    if (session.id === other.id) continue;

    // Same group or same teacher = constraint
    if (session.groupId === other.groupId || session.teacherId === other.teacherId) {
      degree++;
    }
  }

  return degree;
}
