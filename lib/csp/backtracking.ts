import { Session, TimeSlot, CSPProblem, SolverResult, Timetable } from './types';
import { hardConstraints, softConstraints } from './constraints';

interface SearchState {
  assignment: Map<string, TimeSlot>;
  backtracks: number;
  constraintChecks: number;
}

export async function solveCSPWithBacktracking(
  problem: CSPProblem,
  timeoutMs: number = 30000
): Promise<SolverResult> {
  const startTime = Date.now();
  const state: SearchState = {
    assignment: new Map(),
    backtracks: 0,
    constraintChecks: 0,
  };

  try {
    const result = await backtrackingSearch(
      problem,
      state,
      0,
      startTime,
      timeoutMs
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
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stats: {
        backtracks: state.backtracks,
        constraintChecks: state.constraintChecks,
        solveTime: Date.now() - startTime,
      },
    };
  }
}

async function backtrackingSearch(
  problem: CSPProblem,
  state: SearchState,
  depth: number,
  startTime: number,
  timeoutMs: number
): Promise<boolean> {
  // Check timeout
  if (Date.now() - startTime > timeoutMs) {
    throw new Error('Solver timeout exceeded');
  }

  // Check if all variables are assigned
  if (state.assignment.size === problem.sessions.length) {
    // Verify all hard constraints one final time
    for (const constraint of hardConstraints) {
      state.constraintChecks++;
      if (!constraint.check(state.assignment, problem.sessions, problem.timeSlots)) {
        return false;
      }
    }
    return true;
  }

  // Select next unassigned variable (simple ordering for now)
  const unassignedSession = problem.sessions.find(
    (s) => !state.assignment.has(s.id)
  );

  if (!unassignedSession) {
    return false;
  }

  // Try each value in the domain
  for (const timeSlot of problem.timeSlots) {
    // Check if this assignment is valid (doesn't violate hard constraints)
    const isValid = isConsistentAssignment(
      unassignedSession,
      timeSlot,
      state.assignment,
      problem.sessions,
      problem.timeSlots,
      state
    );

    if (isValid) {
      // Make assignment
      state.assignment.set(unassignedSession.id, timeSlot);

      // Recursively search
      const result = await backtrackingSearch(
        problem,
        state,
        depth + 1,
        startTime,
        timeoutMs
      );

      if (result) {
        return true;
      }

      // Backtrack
      state.assignment.delete(unassignedSession.id);
      state.backtracks++;
    }
  }

  return false;
}

function isConsistentAssignment(
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
