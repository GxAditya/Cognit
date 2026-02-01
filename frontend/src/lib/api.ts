const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

import type { StudyPlan, SavePlanResponse, StudyPlanListResponse, StudyPlanDetailResponse, UpdatePlanRequest, TasksListResponse, UpdateTaskResponse, CompletionStatsResponse } from '@/types';

export async function generatePlan(goal: string, weeks: number, token: string) {
  const res = await fetch(`${BACKEND_URL}/api/generate-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ goal, weeks }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate plan: ${res.statusText}`);
  }

  const data = await res.json();

  // The API returns { success: true, plan: {...}, error: null }
  // We need to extract the plan object
  if (data.success && data.plan) {
    return data.plan;
  }

  // Fallback: if the response is already the plan structure, return it directly
  if (data.goal && data.milestones) {
    return data;
  }

  throw new Error('Invalid response format from server');
}

// Save a study plan with duplicate detection
export async function savePlan(
  goal: string,
  weeks: number,
  plan: StudyPlan,
  token: string
): Promise<SavePlanResponse> {
  const res = await fetch(`${BACKEND_URL}/api/save-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ goal, weeks, plan }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save plan: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

// Get all user's saved study plans
export async function getUserStudyPlans(token: string): Promise<StudyPlanListResponse> {
  const res = await fetch(`${BACKEND_URL}/api/study-plans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch plans: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

// Get a specific study plan by ID
export async function getStudyPlan(planId: string, token: string): Promise<StudyPlanDetailResponse> {
  const res = await fetch(`${BACKEND_URL}/api/study-plans/${planId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch plan: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

// Delete a study plan
export async function deleteStudyPlan(planId: string, token: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/study-plans/${planId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete plan: ${res.statusText}`);
  }
}

// Get tasks for a study plan
export async function getPlanTasks(planId: string, token: string): Promise<TasksListResponse> {
  const res = await fetch(`${BACKEND_URL}/api/study-plans/${planId}/tasks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

// Update a task's completion status
export async function updateTaskCompletion(
  planId: string,
  taskId: string,
  isCompleted: boolean,
  token: string
): Promise<UpdateTaskResponse> {
  const res = await fetch(`${BACKEND_URL}/api/study-plans/${planId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ is_completed: isCompleted }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update task: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

// Get completion statistics for a study plan
export async function getPlanStats(planId: string, token: string): Promise<CompletionStatsResponse> {
  const res = await fetch(`${BACKEND_URL}/api/study-plans/${planId}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
export async function updateStudyPlan(
  planId: string,
  goal: string,
  weeks: number,
  plan: StudyPlan,
  token: string
): Promise<SavePlanResponse> {
  const res = await fetch(`${BACKEND_URL}/api/study-plans/${planId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ goal, weeks, plan } as UpdatePlanRequest),
  });

  if (!res.ok) {
    throw new Error(`Failed to update plan: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
