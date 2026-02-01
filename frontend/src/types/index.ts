export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface Milestone {
  week: number;
  title: string;
  objectives: string[];
  resources: Resource[];
  daily_tasks: string[];
}

export interface StudyPlan {
  goal: string;
  weeks: number;
  milestones: Milestone[];
}

// Saved Study Plan (from database)
export interface SavedStudyPlan {
  id: string;
  user_id: string;
  goal: string;
  weeks: number;
  plan_data: StudyPlan;
  created_at: string;
  updated_at: string;
}

// API Request/Response types for saving plans
export interface SavePlanRequest {
  goal: string;
  weeks: number;
  plan: StudyPlan;
}

export interface SavePlanResponse {
  success: boolean;
  plan_id: string;
  exists: boolean;
  message: string;
}

// List view types
export interface StudyPlanListItem {
  id: string;
  goal: string;
  weeks: number;
  created_at: string;
  updated_at: string;
}

export interface StudyPlanListResponse {
  success: boolean;
  plans: StudyPlanListItem[];
}

export interface StudyPlanDetailResponse {
  success: boolean;
  plan: StudyPlanWithTasks;
}

// Update plan request
export interface UpdatePlanRequest {
  goal: string;
  weeks: number;
  plan: StudyPlan;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

// Task Completion Types

export interface TaskCompletion {
  id: string;
  study_plan_id: string;
  week_number: number;
  day_number: number;
  task_text: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeekTasks {
  week_number: number;
  tasks: TaskCompletion[];
}

export interface StudyPlanWithTasks {
  id: string;
  user_id: string;
  goal: string;
  weeks: number;
  plan_data: StudyPlan;
  tasks: WeekTasks[];
  created_at: string;
  updated_at: string;
}

export interface TasksListResponse {
  success: boolean;
  tasks: WeekTasks[];
}

export interface UpdateTaskRequest {
  is_completed: boolean;
}

export interface UpdateTaskResponse {
  success: boolean;
  task: TaskCompletion | null;
}

export interface CompletionStats {
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  completed_weeks: number;
  current_week: number;
}

export interface CompletionStatsResponse {
  success: boolean;
  stats: CompletionStats | null;
}
