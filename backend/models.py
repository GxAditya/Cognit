from pydantic import BaseModel, Field
from typing import List, Optional


class Resource(BaseModel):
    """Resource model for study materials."""
    title: str = Field(..., description="Title of the resource")
    url: str = Field(..., description="URL of the resource")
    type: str = Field(..., description="Type of resource (e.g., video, article, course)")


class Milestone(BaseModel):
    """Milestone model for weekly study objectives."""
    week: int = Field(..., description="Week number")
    title: str = Field(..., description="Title of the milestone")
    objectives: List[str] = Field(default_factory=list, description="List of learning objectives")
    resources: List[Resource] = Field(default_factory=list, description="List of resources")
    daily_tasks: List[str] = Field(default_factory=list, description="List of daily tasks")


class StudyPlan(BaseModel):
    """Complete study plan output from the Architect agent."""
    goal: str = Field(..., description="The academic goal")
    weeks: int = Field(..., description="Number of weeks for the study plan")
    milestones: List[Milestone] = Field(default_factory=list, description="List of weekly milestones")


class GeneratePlanRequest(BaseModel):
    """Request model for generating a study plan."""
    goal: str = Field(..., min_length=1, description="The academic goal to achieve")
    weeks: int = Field(..., ge=1, le=52, description="Number of weeks for the study plan")


class GeneratePlanResponse(BaseModel):
    """Response model for the generated study plan."""
    success: bool = Field(..., description="Whether the plan generation was successful")
    plan: Optional[StudyPlan] = Field(None, description="The generated study plan")
    error: Optional[str] = Field(None, description="Error message if generation failed")


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str = Field(..., description="Service status")
    message: str = Field(..., description="Status message")


class SavePlanRequest(BaseModel):
    """Request model for saving a study plan."""
    goal: str = Field(..., min_length=1, description="The academic goal")
    weeks: int = Field(..., ge=1, le=52, description="Number of weeks for the study plan")
    plan: StudyPlan = Field(..., description="The complete study plan to save")


class SavePlanResponse(BaseModel):
    """Response model for saving a study plan."""
    success: bool = Field(..., description="Whether the save operation was successful")
    plan_id: Optional[str] = Field(None, description="The ID of the saved plan")
    exists: bool = Field(False, description="Whether a plan with the same goal and weeks already exists")
    message: str = Field(..., description="Status message")


class StudyPlanListItem(BaseModel):
    """Simplified study plan item for list views."""
    id: str = Field(..., description="Plan ID")
    goal: str = Field(..., description="The academic goal")
    weeks: int = Field(..., description="Number of weeks")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")


class StudyPlanListResponse(BaseModel):
    """Response model for listing user's study plans."""
    success: bool = Field(..., description="Whether the request was successful")
    plans: List[StudyPlanListItem] = Field(default_factory=list, description="List of study plans")





class UpdatePlanRequest(BaseModel):
    """Request model for updating a study plan."""
    goal: str = Field(..., min_length=1, description="The academic goal")
    weeks: int = Field(..., ge=1, le=52, description="Number of weeks for the study plan")
    plan: StudyPlan = Field(..., description="The updated study plan")


# Task Completion Models

class TaskCompletion(BaseModel):
    """Model for a single task completion state."""
    id: str = Field(..., description="Task ID")
    study_plan_id: str = Field(..., description="Study plan ID")
    week_number: int = Field(..., ge=1, description="Week number")
    day_number: int = Field(..., ge=1, le=7, description="Day number (1-7)")
    task_text: str = Field(..., description="Task description")
    is_completed: bool = Field(default=False, description="Whether the task is completed")
    completed_at: Optional[str] = Field(None, description="Completion timestamp")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")


class WeekTasks(BaseModel):
    """Model for tasks grouped by week."""
    week_number: int = Field(..., description="Week number")
    tasks: List[TaskCompletion] = Field(default_factory=list, description="List of tasks for this week")


class StudyPlanWithTasks(BaseModel):
    """Study plan data including task completions."""
    id: str = Field(..., description="Plan ID")
    user_id: str = Field(..., description="User ID")
    goal: str = Field(..., description="The academic goal")
    weeks: int = Field(..., description="Number of weeks")
    plan_data: dict = Field(..., description="The study plan data")
    tasks: List[WeekTasks] = Field(default_factory=list, description="Tasks grouped by week")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")


class StudyPlanDetailResponse(BaseModel):
    """Response model for retrieving a single study plan."""
    success: bool = Field(..., description="Whether the request was successful")
    plan: Optional[StudyPlanWithTasks] = Field(None, description="The study plan data with tasks")


class TasksListResponse(BaseModel):
    """Response model for listing tasks for a study plan."""
    success: bool = Field(..., description="Whether the request was successful")
    tasks: List[WeekTasks] = Field(default_factory=list, description="Tasks grouped by week")


class UpdateTaskRequest(BaseModel):
    """Request model for updating a task completion state."""
    is_completed: bool = Field(..., description="Whether the task is completed")


class UpdateTaskResponse(BaseModel):
    """Response model for updating a task."""
    success: bool = Field(..., description="Whether the update was successful")
    task: Optional[TaskCompletion] = Field(None, description="The updated task")


class CompletionStats(BaseModel):
    """Model for completion statistics."""
    total_tasks: int = Field(..., description="Total number of tasks")
    completed_tasks: int = Field(..., description="Number of completed tasks")
    completion_percentage: float = Field(..., description="Completion percentage (0-100)")
    completed_weeks: int = Field(..., description="Number of weeks with all tasks completed")
    current_week: int = Field(..., description="Current week based on creation date")


class CompletionStatsResponse(BaseModel):
    """Response model for completion statistics."""
    success: bool = Field(..., description="Whether the request was successful")
    stats: Optional[CompletionStats] = Field(None, description="Completion statistics")