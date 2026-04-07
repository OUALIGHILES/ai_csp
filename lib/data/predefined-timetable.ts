import { Session } from '@/lib/csp/types';

// Week structure
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
export const SLOTS_PER_DAY: Record<string, number> = {
  Sunday: 5,
  Monday: 5,
  Tuesday: 3, // Morning only
  Wednesday: 5,
  Thursday: 5,
};

// Student groups
export const GROUPS = ['Group1', 'Group2', 'Group3'];

// Predefined sessions based on the exact dataset
// Each course appears ONCE per group per week
export const PREDEFINED_SESSIONS: Session[] = [
  // Sécurité
  { id: 'sec-1', courseId: 'sec', courseName: 'Sécurité', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher1', teacherName: 'Teacher1', duration: 1 },
  { id: 'sec-2', courseId: 'sec', courseName: 'Sécurité', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher1', teacherName: 'Teacher1', duration: 1 },
  { id: 'sec-3', courseId: 'sec', courseName: 'Sécurité', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher1', teacherName: 'Teacher1', duration: 1 },

  // Méthodes Formelles
  { id: 'mf-1', courseId: 'mf', courseName: 'Méthodes Formelles', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher2', teacherName: 'Teacher2', duration: 1 },
  { id: 'mf-2', courseId: 'mf', courseName: 'Méthodes Formelles', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher2', teacherName: 'Teacher2', duration: 1 },
  { id: 'mf-3', courseId: 'mf', courseName: 'Méthodes Formelles', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher2', teacherName: 'Teacher2', duration: 1 },

  // Analyse Numérique
  { id: 'an-1', courseId: 'an', courseName: 'Analyse Numérique', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher3', teacherName: 'Teacher3', duration: 1 },
  { id: 'an-2', courseId: 'an', courseName: 'Analyse Numérique', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher3', teacherName: 'Teacher3', duration: 1 },
  { id: 'an-3', courseId: 'an', courseName: 'Analyse Numérique', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher3', teacherName: 'Teacher3', duration: 1 },

  // Entrepreneuriat
  { id: 'ent-1', courseId: 'ent', courseName: 'Entrepreneuriat', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher4', teacherName: 'Teacher4', duration: 1 },
  { id: 'ent-2', courseId: 'ent', courseName: 'Entrepreneuriat', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher4', teacherName: 'Teacher4', duration: 1 },
  { id: 'ent-3', courseId: 'ent', courseName: 'Entrepreneuriat', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher4', teacherName: 'Teacher4', duration: 1 },

  // Recherche Opérationnelle 2
  { id: 'ro2-1', courseId: 'ro2', courseName: 'Recherche Opérationnelle 2', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher5', teacherName: 'Teacher5', duration: 1 },
  { id: 'ro2-2', courseId: 'ro2', courseName: 'Recherche Opérationnelle 2', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher5', teacherName: 'Teacher5', duration: 1 },
  { id: 'ro2-3', courseId: 'ro2', courseName: 'Recherche Opérationnelle 2', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher5', teacherName: 'Teacher5', duration: 1 },

  // Distributed Architecture & Intensive Computing
  { id: 'daic-1', courseId: 'daic', courseName: 'Distributed Architecture & Intensive Computing', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher6', teacherName: 'Teacher6', duration: 1 },
  { id: 'daic-2', courseId: 'daic', courseName: 'Distributed Architecture & Intensive Computing', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher6', teacherName: 'Teacher6', duration: 1 },
  { id: 'daic-3', courseId: 'daic', courseName: 'Distributed Architecture & Intensive Computing', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher6', teacherName: 'Teacher6', duration: 1 },

  // Réseaux 2
  { id: 'res2-1', courseId: 'res2', courseName: 'Réseaux 2', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher7', teacherName: 'Teacher7', duration: 1 },
  { id: 'res2-2', courseId: 'res2', courseName: 'Réseaux 2', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher7', teacherName: 'Teacher7', duration: 1 },
  { id: 'res2-3', courseId: 'res2', courseName: 'Réseaux 2', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher7', teacherName: 'Teacher7', duration: 1 },

  // Artificial Intelligence
  { id: 'ai-1', courseId: 'ai', courseName: 'Artificial Intelligence', groupId: 'Group1', groupName: 'Group1', teacherId: 'Teacher10', teacherName: 'Teacher10', duration: 1 },
  { id: 'ai-2', courseId: 'ai', courseName: 'Artificial Intelligence', groupId: 'Group2', groupName: 'Group2', teacherId: 'Teacher10', teacherName: 'Teacher10', duration: 1 },
  { id: 'ai-3', courseId: 'ai', courseName: 'Artificial Intelligence', groupId: 'Group3', groupName: 'Group3', teacherId: 'Teacher10', teacherName: 'Teacher10', duration: 1 },
];
