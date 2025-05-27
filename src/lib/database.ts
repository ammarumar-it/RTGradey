import { supabase } from "../../supabase/supabase";
import { db } from "@vercel/postgres";
import {
  User,
  Classroom,
  Rubric,
  GradedEssay,
  Settings,
} from "../types/database.types";

// Initialize Vercel Postgres client
let client;
async function getClient() {
  if (!client) {
    client = await db.connect();
  }
  return client;
}

// User related functions
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateUserProfile(updates: Partial<User>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };

  return await supabase.from("users").update(updates).eq("id", user.id);
}

// Classroom related functions
export async function getClassrooms() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "Not authenticated" } };

  const { data: userDetails } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (userDetails?.user_type === "teacher") {
    return await supabase
      .from("classrooms")
      .select("*")
      .eq("teacher_id", user.id);
  } else {
    return await supabase
      .from("classroom_students")
      .select("classroom:classrooms(*)")
      .eq("student_id", user.id);
  }
}

export async function createClassroom(classroom: Partial<Classroom>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };

  return await supabase.from("classrooms").insert({
    ...classroom,
    teacher_id: user.id,
  });
}

// Rubric related functions
export async function getRubrics() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "Not authenticated" } };

  return await supabase
    .from("rubrics")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
}

export async function getRubricById(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "Not authenticated" } };

  return await supabase
    .from("rubrics")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
}

export async function getRubricCriteria(rubricId: string) {
  return await supabase
    .from("rubric_criteria")
    .select("*")
    .eq("rubric_id", rubricId)
    .order("order", { ascending: true });
}

export async function createRubric(rubric: Partial<Rubric>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };

  return await supabase
    .from("rubrics")
    .insert({
      ...rubric,
      user_id: user.id,
    })
    .select();
}

export async function updateRubric(id: string, updates: Partial<Rubric>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };

  return await supabase
    .from("rubrics")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();
}

export async function deleteRubric(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };

  // First delete all criteria
  await supabase.from("rubric_criteria").delete().eq("rubric_id", id);

  // Then delete the rubric
  return await supabase
    .from("rubrics")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
}

// Graded essays related functions
export async function getGradedEssays() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "Not authenticated" } };

  return await supabase
    .from("graded_essays")
    .select("*")
    .eq("user_id", user.id);
}

export async function saveGradedEssay(essay: Partial<GradedEssay>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };

  return await supabase.from("graded_essays").insert({
    ...essay,
    user_id: user.id,
  });
}

// Settings related functions
export async function getUserSettings() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "Not authenticated" } };

  return await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .single();
}

export async function updateUserSettings(settings: Partial<Settings>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };

  const { data: existingSettings } = await supabase
    .from("settings")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingSettings) {
    return await supabase
      .from("settings")
      .update(settings)
      .eq("user_id", user.id);
  } else {
    return await supabase.from("settings").insert({
      ...settings,
      user_id: user.id,
    });
  }
}
