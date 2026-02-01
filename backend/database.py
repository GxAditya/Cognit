import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_db_connection():
    """Create and return a database connection."""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def get_session_by_token(token: str):
    """
    Query the session table for a valid session.
    Returns the session record if found and not expired, None otherwise.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT * FROM session 
                WHERE token = %s AND "expiresAt" > NOW()
                """,
                (token,)
            )
            result = cur.fetchone()
            return result
    except Exception as e:
        print(f"Database error in get_session_by_token: {e}")
        return None
    finally:
        if conn:
            conn.close()


def get_user_by_id(user_id: str):
    """
    Query the user table by user ID.
    Returns the user record if found, None otherwise.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM \"user\" WHERE id = %s",
                (user_id,)
            )
            result = cur.fetchone()
            return result
    except Exception as e:
        print(f"Database error in get_user_by_id: {e}")
        return None
    finally:
        if conn:
            conn.close()


def check_existing_plan(user_id: str, goal: str, weeks: int) -> dict | None:
    """
    Check if user already has a study plan with the same goal and weeks.
    Goal matching is case-insensitive.
    
    Args:
        user_id: The user's ID
        goal: The study goal (case-insensitive match)
        weeks: Number of weeks
        
    Returns:
        dict | None: The existing plan if found, None otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT * FROM study_plans 
                WHERE user_id = %s 
                AND LOWER(goal) = LOWER(%s) 
                AND weeks = %s
                """,
                (user_id, goal, weeks)
            )
            result = cur.fetchone()
            return result
    except Exception as e:
        print(f"Database error in check_existing_plan: {e}")
        return None
    finally:
        if conn:
            conn.close()


def save_study_plan(user_id: str, goal: str, weeks: int, plan_data: dict) -> dict:
    """
    Save a new study plan to the database.
    
    Args:
        user_id: The user's ID
        goal: The study goal
        weeks: Number of weeks
        plan_data: The complete study plan as a dictionary
        
    Returns:
        dict: The saved plan with id, created_at, and updated_at
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Serialize plan_data to JSON for PostgreSQL JSONB column
            plan_data_json = json.dumps(plan_data)
            cur.execute(
                """
                INSERT INTO study_plans (user_id, goal, weeks, plan_data)
                VALUES (%s, %s, %s, %s)
                RETURNING id, user_id, goal, weeks, plan_data, created_at, updated_at
                """,
                (user_id, goal, weeks, plan_data_json)
            )
            result = cur.fetchone()
            conn.commit()
            return result
    except Exception as e:
        print(f"Database error in save_study_plan: {e}")
        raise
    finally:
        if conn:
            conn.close()


def get_user_study_plans(user_id: str) -> list:
    """
    Get all study plans for a user.
    
    Args:
        user_id: The user's ID
        
    Returns:
        list: List of study plans ordered by created_at desc
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, user_id, goal, weeks, plan_data, created_at, updated_at 
                FROM study_plans 
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (user_id,)
            )
            result = cur.fetchall()
            return result
    except Exception as e:
        print(f"Database error in get_user_study_plans: {e}")
        return []
    finally:
        if conn:
            conn.close()


def get_study_plan_by_id(plan_id: str, user_id: str) -> dict | None:
    """
    Get a specific study plan by ID.
    
    Args:
        plan_id: The plan's UUID
        user_id: The user's ID (for authorization)
        
    Returns:
        dict | None: The study plan if found and belongs to user, None otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT * FROM study_plans 
                WHERE id = %s AND user_id = %s
                """,
                (plan_id, user_id)
            )
            result = cur.fetchone()
            return result
    except Exception as e:
        print(f"Database error in get_study_plan_by_id: {e}")
        return None
    finally:
        if conn:
            conn.close()


def delete_study_plan(plan_id: str, user_id: str) -> bool:
    """
    Delete a study plan.
    
    Args:
        plan_id: The plan's UUID
        user_id: The user's ID (for authorization)
        
    Returns:
        bool: True if deleted, False if not found or not authorized
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM study_plans 
                WHERE id = %s AND user_id = %s
                """,
                (plan_id, user_id)
            )
            conn.commit()
            return cur.rowcount > 0
    except Exception as e:
        print(f"Database error in delete_study_plan: {e}")
        return False
    finally:
        if conn:
            conn.close()


def update_study_plan(plan_id: str, user_id: str, plan_data: dict) -> dict | None:
    """
    Update an existing study plan.
    
    Args:
        plan_id: The plan's UUID
        user_id: The user's ID (for authorization)
        plan_data: The updated plan data
        
    Returns:
        dict | None: The updated plan if found and belongs to user, None otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Serialize plan_data to JSON for PostgreSQL JSONB column
            plan_data_json = json.dumps(plan_data)
            cur.execute(
                """
                UPDATE study_plans
                SET plan_data = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
                RETURNING id, user_id, goal, weeks, plan_data, created_at, updated_at
                """,
                (plan_data_json, plan_id, user_id)
            )
            result = cur.fetchone()
            conn.commit()
            return result
    except Exception as e:
        print(f"Database error in update_study_plan: {e}")
        return None
    finally:
        if conn:
            conn.close()


# Task Completion Operations

def initialize_tasks_for_plan(plan_id: str, plan_data: dict) -> bool:
    """
    Initialize task records when a new study plan is saved.
    Creates task entries for each daily task in the plan.
    
    Args:
        plan_id: The study plan's UUID
        plan_data: The study plan data containing milestones with daily_tasks
        
    Returns:
        bool: True if tasks were initialized successfully, False otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Extract milestones from plan data
            milestones = plan_data.get("milestones", [])
            
            for milestone in milestones:
                week_number = milestone.get("week", 1)
                daily_tasks = milestone.get("daily_tasks", [])
                
                # Create a task for each daily task
                for day_number, task_text in enumerate(daily_tasks, start=1):
                    if task_text and task_text.strip():  # Only create tasks for non-empty text
                        cur.execute(
                            """
                            INSERT INTO study_plan_tasks 
                            (study_plan_id, week_number, day_number, task_text)
                            VALUES (%s, %s, %s, %s)
                            ON CONFLICT (study_plan_id, week_number, day_number, task_text) 
                            DO NOTHING
                            """,
                            (plan_id, week_number, day_number, task_text.strip())
                        )
            
            conn.commit()
            return True
    except Exception as e:
        print(f"Database error in initialize_tasks_for_plan: {e}")
        return False
    finally:
        if conn:
            conn.close()


def get_task_completions_for_plan(plan_id: str, user_id: str) -> list:
    """
    Get all task completion states for a study plan.
    
    Args:
        plan_id: The study plan's UUID
        user_id: The user's ID (for authorization)
        
    Returns:
        list: List of task completion records
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # First verify the plan belongs to the user
            cur.execute(
                "SELECT id FROM study_plans WHERE id = %s AND user_id = %s",
                (plan_id, user_id)
            )
            if not cur.fetchone():
                return []
            
            # Get all tasks for the plan
            cur.execute(
                """
                SELECT id, study_plan_id, week_number, day_number, task_text,
                       is_completed, completed_at, created_at, updated_at
                FROM study_plan_tasks
                WHERE study_plan_id = %s
                ORDER BY week_number, day_number, task_text
                """,
                (plan_id,)
            )
            result = cur.fetchall()
            return result
    except Exception as e:
        print(f"Database error in get_task_completions_for_plan: {e}")
        return []
    finally:
        if conn:
            conn.close()


def update_task_completion(task_id: str, plan_id: str, user_id: str, is_completed: bool) -> dict | None:
    """
    Update a single task's completion state.
    
    Args:
        task_id: The task's UUID
        plan_id: The study plan's UUID
        user_id: The user's ID (for authorization)
        is_completed: The new completion state
        
    Returns:
        dict | None: The updated task if successful, None otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # First verify the plan belongs to the user
            cur.execute(
                "SELECT id FROM study_plans WHERE id = %s AND user_id = %s",
                (plan_id, user_id)
            )
            if not cur.fetchone():
                return None
            
            # Update the task
            completed_at = "CURRENT_TIMESTAMP" if is_completed else "NULL"
            cur.execute(
                f"""
                UPDATE study_plan_tasks
                SET is_completed = %s,
                    completed_at = {completed_at},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND study_plan_id = %s
                RETURNING id, study_plan_id, week_number, day_number, task_text,
                          is_completed, completed_at, created_at, updated_at
                """,
                (is_completed, task_id, plan_id)
            )
            result = cur.fetchone()
            conn.commit()
            return result
    except Exception as e:
        print(f"Database error in update_task_completion: {e}")
        return None
    finally:
        if conn:
            conn.close()


def get_completion_stats(plan_id: str, user_id: str) -> dict | None:
    """
    Get completion statistics for a study plan.
    
    Args:
        plan_id: The study plan's UUID
        user_id: The user's ID (for authorization)
        
    Returns:
        dict | None: Completion statistics or None if plan not found
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # First verify the plan belongs to the user and get creation date
            cur.execute(
                "SELECT id, created_at FROM study_plans WHERE id = %s AND user_id = %s",
                (plan_id, user_id)
            )
            plan = cur.fetchone()
            if not plan:
                return None
            
            # Get total and completed task counts
            cur.execute(
                """
                SELECT 
                    COUNT(*) as total_tasks,
                    COUNT(*) FILTER (WHERE is_completed = TRUE) as completed_tasks
                FROM study_plan_tasks
                WHERE study_plan_id = %s
                """,
                (plan_id,)
            )
            task_counts = cur.fetchone()
            
            # Get completed weeks (weeks where all tasks are completed)
            cur.execute(
                """
                SELECT week_number
                FROM study_plan_tasks
                WHERE study_plan_id = %s
                GROUP BY week_number
                HAVING COUNT(*) = COUNT(*) FILTER (WHERE is_completed = TRUE)
                """,
                (plan_id,)
            )
            completed_weeks = len(cur.fetchall())
            
            # Calculate current week based on creation date
            cur.execute(
                """
                SELECT 
                    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - created_at)) / 7 + 1 as current_week
                FROM study_plans
                WHERE id = %s
                """,
                (plan_id,)
            )
            current_week_result = cur.fetchone()
            current_week = int(current_week_result["current_week"]) if current_week_result else 1
            
            total_tasks = task_counts["total_tasks"] or 0
            completed_tasks = task_counts["completed_tasks"] or 0
            completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            return {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "completion_percentage": round(completion_percentage, 2),
                "completed_weeks": completed_weeks,
                "current_week": max(1, current_week)
            }
    except Exception as e:
        print(f"Database error in get_completion_stats: {e}")
        return None
    finally:
        if conn:
            conn.close()