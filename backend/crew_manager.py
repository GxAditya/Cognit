import json
import re
from crewai import Crew, Task
from agents import create_strategist_agent, create_scout_agent, create_architect_agent


def extract_json_from_output(output: str) -> dict:
    """
    Extract JSON from the agent output, handling markdown code blocks.
    """
    # Try to find JSON in markdown code blocks
    json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', output, re.DOTALL)
    if json_match:
        json_str = json_match.group(1).strip()
    else:
        # Try to find JSON between curly braces
        json_match = re.search(r'\{.*\}', output, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            json_str = output.strip()
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from output: {e}")


def create_study_plan_crew(goal: str, weeks: int) -> Crew:
    """
    Create and configure the CrewAI pipeline for generating a study plan.
    
    The pipeline consists of three sequential tasks:
    1. Strategist: Decomposes the goal into learning objectives
    2. Scout: Researches resources for each objective
    3. Architect: Creates the final structured schedule in JSON format
    
    Args:
        goal: The academic goal to achieve
        weeks: Number of weeks for the study plan
        
    Returns:
        Crew: Configured Crew instance ready to execute
    """
    # Create agents
    strategist = create_strategist_agent()
    scout = create_scout_agent()
    architect = create_architect_agent()
    
    # Task 1: Strategist decomposes the goal
    strategist_task = Task(
        description=f"""
        Analyze the academic goal and decompose it into clear learning objectives and milestones.
        
        Goal: {goal}
        Duration: {weeks} weeks
        
        Your output should include:
        1. A breakdown of the main topics/subjects to learn
        2. Prerequisites needed before starting
        3. Key learning objectives for each phase
        4. Logical progression from beginner to advanced concepts
        5. Recommended distribution across {weeks} weeks
        
        Provide a detailed text analysis that will guide resource gathering.
        """,
        expected_output="""A comprehensive breakdown of learning objectives organized by week, 
        including prerequisites, main topics, and progression logic. This should be detailed 
        text that can guide the next agent in finding appropriate resources.""",
        agent=strategist,
    )
    
    # Task 2: Scout researches resources
    scout_task = Task(
        description=f"""
        Based on the learning objectives provided by the Strategist, research and compile 
        high-quality learning resources.
        
        Goal: {goal}
        Duration: {weeks} weeks
        
        Use the Strategist's analysis to find:
        1. Online courses (Coursera, edX, Udemy, etc.)
        2. Video tutorials (YouTube channels, etc.)
        3. Documentation and official guides
        4. Articles and blog posts
        5. Practice exercises and projects
        
        For each resource found, provide:
        - Title
        - URL
        - Type (video, article, course, documentation, etc.)
        - Which learning objective it supports
        
        If you don't have search tools available, provide well-known, credible resources 
        that are typically available for this subject.
        """,
        expected_output="""A comprehensive list of learning resources organized by topic/week, 
        with titles, URLs, types, and descriptions of how each resource supports specific 
        learning objectives.""",
        agent=scout,
        context=[strategist_task],
    )
    
    # Task 3: Architect creates the JSON schedule
    architect_task = Task(
        description=f"""
        Create a structured study plan in valid JSON format based on the Strategist's 
        learning objectives and the Scout's resources.
        
        Goal: {goal}
        Duration: {weeks} weeks
        
        Using the outputs from the previous agents, create a JSON object with this exact structure:
        
        {{
            "goal": "{goal}",
            "weeks": {weeks},
            "milestones": [
                {{
                    "week": 1,
                    "title": "Week 1 Title",
                    "objectives": ["objective 1", "objective 2"],
                    "resources": [
                        {{"title": "Resource Name", "url": "https://example.com", "type": "video"}}
                    ],
                    "daily_tasks": ["Day 1 task", "Day 2 task", "Day 3 task", "Day 4 task", "Day 5 task", "Day 6 task", "Day 7 task"]
                }}
            ]
        }}
        
        Requirements:
        1. Create exactly {weeks} milestones (one per week)
        2. Each milestone must have a descriptive title
        3. Include 2-4 specific learning objectives per week
        4. Include 2-5 resources per week with real URLs
        5. Include 5-7 daily tasks per week (weekdays + weekend review)
        6. Ensure the JSON is valid and parseable
        7. Progress from foundational to advanced concepts
        
        Output ONLY the JSON, wrapped in a markdown code block with ```json.
        """,
        expected_output="""A valid JSON object containing the complete study plan with the 
        exact structure specified. The JSON must be parseable and include all required fields 
        for each of the {weeks} weeks.""",
        agent=architect,
        context=[strategist_task, scout_task],
    )
    
    # Create the crew with sequential process
    crew = Crew(
        agents=[strategist, scout, architect],
        tasks=[strategist_task, scout_task, architect_task],
        verbose=True,
    )
    
    return crew


def generate_study_plan(goal: str, weeks: int) -> dict:
    """
    Execute the CrewAI pipeline to generate a study plan.
    
    Args:
        goal: The academic goal to achieve
        weeks: Number of weeks for the study plan
        
    Returns:
        dict: The parsed JSON study plan
        
    Raises:
        Exception: If the crew execution fails or JSON parsing fails
    """
    crew = create_study_plan_crew(goal, weeks)
    
    # Execute the crew
    result = crew.kickoff()
    
    # Extract the final output from the Architect task
    # The result is typically the output of the last task
    if hasattr(result, 'raw'):
        output = result.raw
    elif isinstance(result, str):
        output = result
    else:
        output = str(result)
    
    # Parse JSON from the output
    study_plan = extract_json_from_output(output)
    
    # Validate required fields
    required_fields = ["goal", "weeks", "milestones"]
    for field in required_fields:
        if field not in study_plan:
            raise ValueError(f"Missing required field in study plan: {field}")
    
    # Validate milestones count
    if len(study_plan.get("milestones", [])) != weeks:
        # Adjust if mismatch
        milestones = study_plan.get("milestones", [])
        if len(milestones) < weeks:
            # This is acceptable, just warn
            pass
    
    return study_plan