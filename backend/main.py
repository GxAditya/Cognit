import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from auth import get_current_user
from models import (
    GeneratePlanRequest, GeneratePlanResponse, HealthResponse, StudyPlan,
    SavePlanRequest, SavePlanResponse, StudyPlanListResponse, StudyPlanListItem,
    StudyPlanDetailResponse, UpdatePlanRequest, WeekTasks, TaskCompletion,
    TasksListResponse, UpdateTaskRequest, UpdateTaskResponse,
    CompletionStatsResponse
)
from crew_manager import generate_study_plan
from database import (
    check_existing_plan, save_study_plan, get_user_study_plans,
    get_study_plan_by_id, delete_study_plan, update_study_plan,
    initialize_tasks_for_plan, get_task_completions_for_plan,
    update_task_completion, get_completion_stats
)

# Load environment variables
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="Autonomous Study Planner API",
    description="Backend API for generating AI-powered study plans using CrewAI",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify the API is running.
    """
    return HealthResponse(
        status="healthy",
        message="Autonomous Study Planner API is running"
    )


@app.post("/api/generate-plan", response_model=GeneratePlanResponse)
async def generate_plan(
    request: GeneratePlanRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Generate a personalized study plan based on the user's goal and timeframe.
    
    This endpoint requires authentication via Bearer token (Better Auth session).
    The CrewAI pipeline will:
    1. Decompose the goal into learning objectives (Strategist)
    2. Research relevant resources (Scout)
    3. Create a structured weekly schedule (Architect)
    
    Args:
        request: GeneratePlanRequest containing goal and weeks
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        GeneratePlanResponse with the generated study plan or error details
    """
    try:
        # Validate weeks parameter
        if request.weeks < 1 or request.weeks > 52:
            raise HTTPException(
                status_code=400,
                detail="Weeks must be between 1 and 52"
            )
        
        # Validate goal parameter
        if not request.goal or not request.goal.strip():
            raise HTTPException(
                status_code=400,
                detail="Goal cannot be empty"
            )
        
        # Run the CrewAI pipeline
        plan_data = generate_study_plan(
            goal=request.goal.strip(),
            weeks=request.weeks
        )
        
        # Validate the response against our model
        study_plan = StudyPlan(**plan_data)
        
        return GeneratePlanResponse(
            success=True,
            plan=study_plan,
            error=None
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate valid study plan: {str(e)}"
        )
    except Exception as e:
        # Handle all other errors
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the study plan: {str(e)}"
        )


@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "name": "Autonomous Study Planner API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "generate_plan": "/api/generate-plan (POST, requires Bearer token)",
            "save_plan": "/api/save-plan (POST, requires Bearer token)",
            "list_plans": "/api/study-plans (GET, requires Bearer token)",
            "get_plan": "/api/study-plans/{plan_id} (GET, requires Bearer token)",
            "delete_plan": "/api/study-plans/{plan_id} (DELETE, requires Bearer token)",
            "update_plan": "/api/study-plans/{plan_id} (PUT, requires Bearer token)"
        }
    }


@app.post("/api/save-plan", response_model=SavePlanResponse)
async def save_plan(
    request: SavePlanRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Save a study plan for the authenticated user.
    
    This endpoint checks for duplicate plans (same goal and weeks) before saving.
    If a duplicate exists, it returns exists=true without creating a new plan.
    
    Args:
        request: SavePlanRequest containing goal, weeks, and plan data
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        SavePlanResponse with success status, plan_id, and duplicate info
    """
    try:
        # Validate request
        if not request.goal or not request.goal.strip():
            raise HTTPException(
                status_code=400,
                detail="Goal cannot be empty"
            )
        
        if request.weeks < 1 or request.weeks > 52:
            raise HTTPException(
                status_code=400,
                detail="Weeks must be between 1 and 52"
            )
        
        # Check for existing plan with same goal and weeks
        existing_plan = check_existing_plan(user_id, request.goal.strip(), request.weeks)
        
        if existing_plan:
            return SavePlanResponse(
                success=True,
                plan_id=str(existing_plan["id"]),
                exists=True,
                message="A plan with this goal and timeframe already exists"
            )
        
        # Save the new plan
        plan_dict = request.plan.model_dump()
        saved_plan = save_study_plan(
            user_id=user_id,
            goal=request.goal.strip(),
            weeks=request.weeks,
            plan_data=plan_dict
        )
        
        # Initialize task records for the new plan
        plan_id = str(saved_plan["id"])
        initialize_tasks_for_plan(plan_id, plan_dict)
        
        return SavePlanResponse(
            success=True,
            plan_id=plan_id,
            exists=False,
            message="Study plan saved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save study plan: {str(e)}"
        )


@app.get("/api/study-plans", response_model=StudyPlanListResponse)
async def list_study_plans(
    user_id: str = Depends(get_current_user)
):
    """
    Get all saved study plans for the authenticated user.
    
    Args:
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        StudyPlanListResponse with list of study plans
    """
    try:
        plans = get_user_study_plans(user_id)
        
        # Convert to list items (excluding full plan_data for list view)
        plan_items = [
            StudyPlanListItem(
                id=str(plan["id"]),
                goal=plan["goal"],
                weeks=plan["weeks"],
                created_at=str(plan["created_at"]),
                updated_at=str(plan["updated_at"])
            )
            for plan in plans
        ]
        
        return StudyPlanListResponse(
            success=True,
            plans=plan_items
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve study plans: {str(e)}"
        )


@app.get("/api/study-plans/{plan_id}", response_model=StudyPlanDetailResponse)
async def get_study_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get a specific study plan by ID.
    
    Args:
        plan_id: The UUID of the study plan
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        StudyPlanDetailResponse with the plan data
    """
    try:
        plan = get_study_plan_by_id(plan_id, user_id)
        
        if not plan:
            raise HTTPException(
                status_code=404,
                detail="Study plan not found"
            )
        
        # Get task completions for the plan
        tasks = get_task_completions_for_plan(plan_id, user_id)
        
        # Group tasks by week
        week_map = {}
        for task in tasks:
            week_num = task["week_number"]
            if week_num not in week_map:
                week_map[week_num] = []
            
            week_map[week_num].append(TaskCompletion(
                id=str(task["id"]),
                study_plan_id=str(task["study_plan_id"]),
                week_number=task["week_number"],
                day_number=task["day_number"],
                task_text=task["task_text"],
                is_completed=task["is_completed"],
                completed_at=str(task["completed_at"]) if task["completed_at"] else None,
                created_at=str(task["created_at"]),
                updated_at=str(task["updated_at"])
            ))
        
        # Convert to WeekTasks list
        week_tasks = [
            WeekTasks(week_number=week, tasks=tasks_list)
            for week, tasks_list in sorted(week_map.items())
        ]
        
        # Format the plan data for response with tasks
        plan_data = {
            "id": str(plan["id"]),
            "user_id": plan["user_id"],
            "goal": plan["goal"],
            "weeks": plan["weeks"],
            "plan_data": plan["plan_data"],
            "tasks": week_tasks,
            "created_at": str(plan["created_at"]),
            "updated_at": str(plan["updated_at"])
        }
        
        return StudyPlanDetailResponse(
            success=True,
            plan=plan_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve study plan: {str(e)}"
        )


@app.delete("/api/study-plans/{plan_id}")
async def delete_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Delete a study plan.
    
    Args:
        plan_id: The UUID of the study plan to delete
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        JSON response with success status
    """
    try:
        deleted = delete_study_plan(plan_id, user_id)
        
        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Study plan not found or not authorized to delete"
            )
        
        return {"success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete study plan: {str(e)}"
        )


@app.put("/api/study-plans/{plan_id}", response_model=StudyPlanDetailResponse)
async def update_plan(
    plan_id: str,
    request: UpdatePlanRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Update an existing study plan.
    
    Args:
        plan_id: The UUID of the study plan to update
        request: UpdatePlanRequest containing updated goal, weeks, and plan data
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        StudyPlanDetailResponse with the updated plan data
    """
    try:
        # Validate request
        if not request.goal or not request.goal.strip():
            raise HTTPException(
                status_code=400,
                detail="Goal cannot be empty"
            )
        
        if request.weeks < 1 or request.weeks > 52:
            raise HTTPException(
                status_code=400,
                detail="Weeks must be between 1 and 52"
            )
        
        # First check if plan exists and belongs to user
        existing_plan = get_study_plan_by_id(plan_id, user_id)
        
        if not existing_plan:
            raise HTTPException(
                status_code=404,
                detail="Study plan not found"
            )
        
        # Update the plan with new data
        plan_dict = request.plan.model_dump()
        updated_plan = update_study_plan(plan_id, user_id, plan_dict)
        
        if not updated_plan:
            raise HTTPException(
                status_code=500,
                detail="Failed to update study plan"
            )
        
        # Format the plan data for response
        plan_data = {
            "id": str(updated_plan["id"]),
            "user_id": updated_plan["user_id"],
            "goal": updated_plan["goal"],
            "weeks": updated_plan["weeks"],
            "plan_data": updated_plan["plan_data"],
            "created_at": str(updated_plan["created_at"]),
            "updated_at": str(updated_plan["updated_at"])
        }
        
        return StudyPlanDetailResponse(
            success=True,
            plan=plan_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update study plan: {str(e)}"
        )


# Task Completion Endpoints

@app.get("/api/study-plans/{plan_id}/tasks", response_model=TasksListResponse)
async def get_plan_tasks(
    plan_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get all task completions for a study plan.
    
    Args:
        plan_id: The UUID of the study plan
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        TasksListResponse with tasks grouped by week
    """
    try:
        # Verify plan exists and belongs to user
        plan = get_study_plan_by_id(plan_id, user_id)
        if not plan:
            raise HTTPException(
                status_code=404,
                detail="Study plan not found"
            )
        
        # Get task completions
        tasks = get_task_completions_for_plan(plan_id, user_id)
        
        # Group tasks by week
        week_map = {}
        for task in tasks:
            week_num = task["week_number"]
            if week_num not in week_map:
                week_map[week_num] = []
            
            week_map[week_num].append(TaskCompletion(
                id=str(task["id"]),
                study_plan_id=str(task["study_plan_id"]),
                week_number=task["week_number"],
                day_number=task["day_number"],
                task_text=task["task_text"],
                is_completed=task["is_completed"],
                completed_at=str(task["completed_at"]) if task["completed_at"] else None,
                created_at=str(task["created_at"]),
                updated_at=str(task["updated_at"])
            ))
        
        # Convert to WeekTasks list
        week_tasks = [
            WeekTasks(week_number=week, tasks=tasks_list)
            for week, tasks_list in sorted(week_map.items())
        ]
        
        return TasksListResponse(success=True, tasks=week_tasks)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve tasks: {str(e)}"
        )


@app.put("/api/study-plans/{plan_id}/tasks/{task_id}", response_model=UpdateTaskResponse)
async def update_task(
    plan_id: str,
    task_id: str,
    request: UpdateTaskRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Update a task's completion state.
    
    Args:
        plan_id: The UUID of the study plan
        task_id: The UUID of the task to update
        request: UpdateTaskRequest containing the new completion state
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        UpdateTaskResponse with the updated task
    """
    try:
        # Update the task
        updated_task = update_task_completion(
            task_id=task_id,
            plan_id=plan_id,
            user_id=user_id,
            is_completed=request.is_completed
        )
        
        if not updated_task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or not authorized to update"
            )
        
        return UpdateTaskResponse(
            success=True,
            task=TaskCompletion(
                id=str(updated_task["id"]),
                study_plan_id=str(updated_task["study_plan_id"]),
                week_number=updated_task["week_number"],
                day_number=updated_task["day_number"],
                task_text=updated_task["task_text"],
                is_completed=updated_task["is_completed"],
                completed_at=str(updated_task["completed_at"]) if updated_task["completed_at"] else None,
                created_at=str(updated_task["created_at"]),
                updated_at=str(updated_task["updated_at"])
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update task: {str(e)}"
        )


@app.get("/api/study-plans/{plan_id}/stats", response_model=CompletionStatsResponse)
async def get_plan_stats(
    plan_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get completion statistics for a study plan.
    
    Args:
        plan_id: The UUID of the study plan
        user_id: The authenticated user's ID (from session token)
        
    Returns:
        CompletionStatsResponse with completion statistics
    """
    try:
        # Get completion stats
        stats = get_completion_stats(plan_id, user_id)
        
        if not stats:
            raise HTTPException(
                status_code=404,
                detail="Study plan not found"
            )
        
        return CompletionStatsResponse(
            success=True,
            stats=stats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve completion stats: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )