import { Database as DatabaseGenerated } from "./supabase";

export type Database = DatabaseGenerated;

// User types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

// Classroom types
export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}
export type ClassroomInsert = Omit<Classroom, "id">;
export type ClassroomUpdate = Partial<Classroom>;

// Classroom students types
export interface ClassroomStudent {
  id: string;
  classroom_id: string;
  student_id: string;
  created_at?: string;
  updated_at?: string;
}
export type ClassroomStudentInsert = Omit<ClassroomStudent, "id">;
export type ClassroomStudentUpdate = Partial<ClassroomStudent>;

// Rubric types
export type Rubric = Database["public"]["Tables"]["rubrics"]["Row"] & {
  criteria_count?: number;
};
export type RubricInsert = Database["public"]["Tables"]["rubrics"]["Insert"];
export type RubricUpdate = Database["public"]["Tables"]["rubrics"]["Update"];

// Rubric criteria types
export type RubricCriteria =
  Database["public"]["Tables"]["rubric_criteria"]["Row"];
export type RubricCriteriaInsert =
  Database["public"]["Tables"]["rubric_criteria"]["Insert"];
export type RubricCriteriaUpdate =
  Database["public"]["Tables"]["rubric_criteria"]["Update"];

// Graded essay types
export type GradedEssay = Database["public"]["Tables"]["graded_essays"]["Row"];
export type GradedEssayInsert =
  Database["public"]["Tables"]["graded_essays"]["Insert"];
export type GradedEssayUpdate =
  Database["public"]["Tables"]["graded_essays"]["Update"];

// Manual interface definitions for tables not in the generated types

// Assignment types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  rubric_id?: string;
  classroom_id?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}
export type AssignmentInsert = Omit<Assignment, "id">;
export type AssignmentUpdate = Partial<Assignment>;

// Submission types
export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  status: string;
  grade?: number;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}
export type SubmissionInsert = Omit<Submission, "id">;
export type SubmissionUpdate = Partial<Submission>;

// Feedback comment types
export interface FeedbackComment {
  id: string;
  submission_id: string;
  user_id: string;
  content: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
}
export type FeedbackCommentInsert = Omit<FeedbackComment, "id">;
export type FeedbackCommentUpdate = Partial<FeedbackComment>;

// Analytics types
export interface Analytics {
  id: string;
  user_id: string;
  essays_graded: number;
  average_grading_time: number;
  rubrics_created: number;
  created_at?: string;
  updated_at?: string;
}
export type AnalyticsInsert = Omit<Analytics, "id">;
export type AnalyticsUpdate = Partial<Analytics>;

// Settings types
export interface Settings {
  id: string;
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}
export type SettingsInsert = Omit<Settings, "id">;
export type SettingsUpdate = Partial<Settings>;
