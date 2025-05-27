export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      analytics: {
        Row: {
          average_grading_time: number | null;
          created_at: string | null;
          essays_graded: number | null;
          id: string;
          last_activity: string | null;
          rubrics_created: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          average_grading_time?: number | null;
          created_at?: string | null;
          essays_graded?: number | null;
          id?: string;
          last_activity?: string | null;
          rubrics_created?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          average_grading_time?: number | null;
          created_at?: string | null;
          essays_graded?: number | null;
          id?: string;
          last_activity?: string | null;
          rubrics_created?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      assignments: {
        Row: {
          classroom_id: string | null;
          created_at: string | null;
          due_date: string | null;
          id: string;
          instructions: string;
          rubric_id: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          classroom_id?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          id?: string;
          instructions: string;
          rubric_id?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          classroom_id?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          id?: string;
          instructions?: string;
          rubric_id?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classrooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_rubric_id_fkey";
            columns: ["rubric_id"];
            isOneToOne: false;
            referencedRelation: "rubrics";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_students: {
        Row: {
          classroom_id: string | null;
          id: string;
          joined_at: string | null;
          student_id: string | null;
        };
        Insert: {
          classroom_id?: string | null;
          id?: string;
          joined_at?: string | null;
          student_id?: string | null;
        };
        Update: {
          classroom_id?: string | null;
          id?: string;
          joined_at?: string | null;
          student_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_students_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classrooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classroom_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      classrooms: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          teacher_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          teacher_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          teacher_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classrooms_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback_comments: {
        Row: {
          comment_type: string | null;
          content: string;
          created_at: string | null;
          graded_essay_id: string | null;
          id: string;
          position_end: number | null;
          position_start: number | null;
          updated_at: string | null;
        };
        Insert: {
          comment_type?: string | null;
          content: string;
          created_at?: string | null;
          graded_essay_id?: string | null;
          id?: string;
          position_end?: number | null;
          position_start?: number | null;
          updated_at?: string | null;
        };
        Update: {
          comment_type?: string | null;
          content?: string;
          created_at?: string | null;
          graded_essay_id?: string | null;
          id?: string;
          position_end?: number | null;
          position_start?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_comments_graded_essay_id_fkey";
            columns: ["graded_essay_id"];
            isOneToOne: false;
            referencedRelation: "graded_essays";
            referencedColumns: ["id"];
          },
        ];
      };
      graded_essays: {
        Row: {
          answer: string;
          assignment_id: string | null;
          assignment_title: string;
          classroom_id: string | null;
          created_at: string | null;
          feedback: Json;
          id: string;
          instructions: string;
          max_score: number;
          rubric: Json;
          rubric_id: string | null;
          student_name: string | null;
          submission_id: string | null;
          summary: string;
          total_score: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          answer: string;
          assignment_id?: string | null;
          assignment_title: string;
          classroom_id?: string | null;
          created_at?: string | null;
          feedback: Json;
          id?: string;
          instructions: string;
          max_score: number;
          rubric: Json;
          rubric_id?: string | null;
          student_name?: string | null;
          submission_id?: string | null;
          summary: string;
          total_score: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          answer?: string;
          assignment_id?: string | null;
          assignment_title?: string;
          classroom_id?: string | null;
          created_at?: string | null;
          feedback?: Json;
          id?: string;
          instructions?: string;
          max_score?: number;
          rubric?: Json;
          rubric_id?: string | null;
          student_name?: string | null;
          submission_id?: string | null;
          summary?: string;
          total_score?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "graded_essays_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "graded_essays_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "classrooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "graded_essays_rubric_id_fkey";
            columns: ["rubric_id"];
            isOneToOne: false;
            referencedRelation: "rubrics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "graded_essays_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      rubric_criteria: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          max_score: number;
          position: number;
          rubric_id: string | null;
          title: string;
          updated_at: string | null;
          weight: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_score: number;
          position: number;
          rubric_id?: string | null;
          title: string;
          updated_at?: string | null;
          weight?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_score?: number;
          position?: number;
          rubric_id?: string | null;
          title?: string;
          updated_at?: string | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_rubric_id_fkey";
            columns: ["rubric_id"];
            isOneToOne: false;
            referencedRelation: "rubrics";
            referencedColumns: ["id"];
          },
        ];
      };
      rubrics: {
        Row: {
          created_at: string | null;
          description: string | null;
          grade_type: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          usage_count: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          grade_type?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          usage_count?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          grade_type?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          usage_count?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rubrics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          accessibility_high_contrast: boolean | null;
          accessibility_large_text: boolean | null;
          created_at: string | null;
          email_notifications_enabled: boolean | null;
          id: string;
          notifications_enabled: boolean | null;
          theme: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          accessibility_high_contrast?: boolean | null;
          accessibility_large_text?: boolean | null;
          created_at?: string | null;
          email_notifications_enabled?: boolean | null;
          id?: string;
          notifications_enabled?: boolean | null;
          theme?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          accessibility_high_contrast?: boolean | null;
          accessibility_large_text?: boolean | null;
          created_at?: string | null;
          email_notifications_enabled?: boolean | null;
          id?: string;
          notifications_enabled?: boolean | null;
          theme?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      submissions: {
        Row: {
          assignment_id: string | null;
          content: string;
          id: string;
          status: string | null;
          student_id: string | null;
          submitted_at: string | null;
        };
        Insert: {
          assignment_id?: string | null;
          content: string;
          id?: string;
          status?: string | null;
          student_id?: string | null;
          submitted_at?: string | null;
        };
        Update: {
          assignment_id?: string | null;
          content?: string;
          id?: string;
          status?: string | null;
          student_id?: string | null;
          submitted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          user_type: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          user_type?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          user_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
