export type Role = 'admin' | 'teacher' | 'student';
export type Theme = 'light' | 'dark' | 'system' | 'blue' | 'emerald';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: Role;
  grade?: string;
  section?: string; // For students
  assigned_grades?: string[]; // For teachers
  assigned_sections?: string[]; // For teachers
  subject?: string; // Legacy
  assigned_subjects?: string[]; // For teachers
  full_name: string;
  points?: number;
  coins?: number;
}

export interface Subject {
  id: string;
  name: string;
  grade: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  type: 'video' | 'pdf' | 'text';
  url?: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  duration: number;
  type?: 'internal' | 'google_form';
  googleFormUrl?: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  type: 'mcq' | 'tf' | 'short';
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: any;
  sender_name?: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  awarded_at?: string;
}

export interface UserStats {
  points: number;
  coins: number;
  badges: Badge[];
  lessonsCompleted: number;
  streak: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  weeklyActivity: DailyActivity[];
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: 'avatar' | 'theme' | 'badge' | 'discount';
}

export interface DailyActivity {
  day: string;
  count: number;
}

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  points: number;
  grade: string;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  due_date: string;
  subject_name?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  fileUrl?: string;
  file_name?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  assignment_title?: string;
  student_name?: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  content_type: 'lesson' | 'exam' | 'subject';
  content_id: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}
