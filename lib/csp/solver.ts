import { Session, TimeSlot, CSPProblem, SolverResult, Timetable } from './types';
import { hardConstraints } from './constraints';
import { ac3, Domain } from './ac3';
import { selectMRVVariable, orderValuesByLCV } from './heuristics';

interface SearchState {
  assignment: Map<string, TimeSlot>;
  domains: Map<string, TimeSlot[]>;
  backtracks: number;
  constraintChecks: number;
}

/**
 * Advanced CSP Solver using backtracking + AC-3 + heuristics
 */
export async function solveCSPAdvanced(
  problem: CSPProblem,
  timeoutMs: number = 30000,
  useAC3: boolean = true,
  seed?: number
): Promise<SolverResult> {
  const startTime = Date.now();
  const randomSeed = seed ?? Math.floor(Math.random() * 1000000);

  try {
    // Step 1: Apply AC-3 for initial constraint propagation
    let domains: Map<string, TimeSlot[]> = new Map();
    if (useAC3) {
      const ac3Domains = ac3(problem);
      for (const domain of ac3Domains) {
        domains.set(domain.sessionId, domain.availableSlots);
      }

      // Check if any variable has empty domain (unsolvable)
      for (const [sessionId, domainSlots] of domains) {
        if (domainSlots.length === 0) {
          return {
            success: false,
            error: 'Problem is unsolvable after AC-3 constraint propagation',
            stats: {
              backtracks: 0,
              constraintChecks: 0,
              solveTime: Date.now() - startTime,
            },
          };
        }
      }
    } else {
      // Initialize domains with all time slots
      for (const session of problem.sessions) {
        domains.set(session.id, [...problem.timeSlots]);
      }
    }

    const state: SearchState = {
      assignment: new Map(),
      domains,
      backtracks: 0,
      constraintChecks: 0,
    };

    const result = await backtrackingSearchAdvanced(
      problem,
      state,
      0,
      startTime,
      timeoutMs,
      seed
    );

    if (result) {
      return {
        success: true,
        timetable: {
          assignments: state.assignment,
          sessions: problem.sessions,
        },
        stats: {
          backtracks: state.backtracks,
          constraintChecks: state.constraintChecks,
          solveTime: Date.now() - startTime,
        },
        seed: randomSeed,
      };
    } else {
      return {
        success: false,
        error: 'No valid timetable found. Try relaxing some constraints.',
        stats: {
          backtracks: state.backtracks,
          constraintChecks: state.constraintChecks,
          solveTime: Date.now() - startTime,
        },
        seed: randomSeed,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stats: {
        backtracks: 0,
        constraintChecks: 0,
        solveTime: Date.now() - startTime,
      },
    };
  }
}

async function backtrackingSearchAdvanced(
  problem: CSPProblem,
  state: SearchState,
  depth: number,
  startTime: number,
  timeoutMs: number,
  seed?: number
): Promise<boolean> {
  // Check timeout
  if (Date.now() - startTime > timeoutMs) {
    throw new Error('Solver timeout exceeded');
  }

  // Check if all variables are assigned
  if (state.assignment.size === problem.sessions.length) {
    return true;
  }

  // Select next unassigned variable using MRV heuristic
  const unassignedSessions = problem.sessions.filter(
    (s) => !state.assignment.has(s.id)
  );

  const selectedSession = selectMRVVariable(unassignedSessions, state.domains, seed);
  if (!selectedSession) {
    return false;
  }

  // Get domain for selected variable
  const domain = state.domains.get(selectedSession.id) || problem.timeSlots;

  // Order values using LCV heuristic
  const orderedValues = orderValuesByLCV(
    selectedSession,
    domain,
    unassignedSessions,
    state.assignment,
    seed
  );

  // Try each value in the ordered domain
  for (const timeSlot of orderedValues) {
    if (
      isConsistentAdvanced(
        selectedSession,
        timeSlot,
        state.assignment,
        problem.sessions,
        problem.timeSlots,
        state
      )
    ) {
      // Make assignment
      state.assignment.set(selectedSession.id, timeSlot);
      const oldDomains = new Map(state.domains);

      // Recursively search
      const result = await backtrackingSearchAdvanced(
        problem,
        state,
        depth + 1,
        startTime,
        timeoutMs,
        seed
      );

      if (result) {
        return true;
      }

      // Backtrack: restore old domains
      state.assignment.delete(selectedSession.id);
      state.domains = oldDomains;
      state.backtracks++;
    }
  }

  return false;
}

function isConsistentAdvanced(
  session: Session,
  timeSlot: TimeSlot,
  assignment: Map<string, TimeSlot>,
  allSessions: Session[],
  allTimeSlots: TimeSlot[],
  state: SearchState
): boolean {
  // Temporarily add the assignment
  assignment.set(session.id, timeSlot);

  // Check hard constraints
  for (const constraint of hardConstraints) {
    state.constraintChecks++;
    if (!constraint.check(assignment, allSessions, allTimeSlots)) {
      assignment.delete(session.id);
      return false;
    }
  }

  assignment.delete(session.id);
  return true;
}

/**
 * Try both simple and advanced solver, return the better result
 */
export async function solveCSPHybrid(
  problem: CSPProblem,
  timeoutMs: number = 30000,
  seed?: number
): Promise<SolverResult> {
  // Try advanced solver with AC-3 first
  const advancedResult = await solveCSPAdvanced(problem, timeoutMs, true, seed);

  if (advancedResult.success) {
    return advancedResult;
  }

  // Fall back to simple backtracking if AC-3 fails
  return await solveCSPAdvanced(problem, timeoutMs, false, seed);
}
