// Core CSP data types

export interface TimeSlot {
  day: string;
  slot: number;
}

export interface Session {
  id: string;
  courseId: string;
  courseName: string;
  groupId: string;
  groupName: string;
  teacherId: string;
  teacherName: string;
  duration: number; // number of consecutive slots
}

export interface Assignment {
  sessionId: string;
  timeSlot: TimeSlot;
}

export interface Timetable {
  assignments: Map<string, TimeSlot>;
  sessions: Session[];
}

export interface Domain {
  sessionId: string;
  availableSlots: TimeSlot[];
}

export interface HardConstraint {
  type: 'hard';
  name: string;
  check: (assignment: Map<string, TimeSlot>, sessions: Session[], allSlots: TimeSlot[]) => boolean;
}

export interface SoftConstraint {
  type: 'soft';
  name: string;
  penalty: (assignment: Map<string, TimeSlot>, sessions: Session[], allSlots: TimeSlot[]) => number;
}

export type Constraint = HardConstraint | SoftConstraint;

export interface CSPProblem {
  sessions: Session[];
  timeSlots: TimeSlot[];
  constraints: Constraint[];
}

export interface AlgorithmStep {
  stepNumber: number;
  phase: 'initialization' | 'ac3-propagation' | 'variable-selection' | 'value-ordering' | 'constraint-check' | 'backtrack' | 'assignment' | 'completion';
  description: string;
  detail?: string;
  timestamp: number;
}

export interface SolverResult {
  success: boolean;
  timetable?: Timetable;
  error?: string;
  stats?: {
    backtracks: number;
    constraintChecks: number;
    solveTime: number;
  };
  steps?: AlgorithmStep[];
  generatedAt?: string;
  seed?: number; // Random seed used for generation (for reproducibility)
}
