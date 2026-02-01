import os
from crewai import Agent, LLM
from crewai_tools import TavilySearchTool
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini LLM via google-generativeai
# CrewAI uses LangChain under the hood, so we configure the Gemini model
gemini_api_key = os.getenv("GOOGLE_API_KEY")

# LLM configuration for Gemini using CrewAI's LLM class
gemini_llm = LLM(
    model="gemini/gemini-2.5-flash-lite",
    api_key=gemini_api_key,
    temperature=0.7,
)

# Initialize Tavily search tool if API key is available
tavily_api_key = os.getenv("TAVILY_API_KEY")
search_tool = None
if tavily_api_key:
    search_tool = TavilySearchTool(api_key=tavily_api_key)


def create_strategist_agent() -> Agent:
    """
    Create the Strategist Agent that decomposes academic goals into learning objectives.
    """
    return Agent(
        role="Academic Strategist",
        goal="Decompose academic goals into clear, actionable learning objectives and milestones",
        backstory="""You are an expert academic strategist with years of experience in curriculum design 
        and learning pathway creation. You excel at breaking down complex subjects into manageable 
        learning chunks, identifying prerequisites, and creating logical progressions. You understand 
        how to structure learning over time to maximize retention and understanding.""",
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm,
    )


def create_scout_agent() -> Agent:
    """
    Create the Scout Agent that researches and finds learning resources.
    """
    tools = [search_tool] if search_tool else []
    
    return Agent(
        role="Resource Scout",
        goal="Find high-quality learning resources including courses, tutorials, articles, and videos",
        backstory="""You are a skilled researcher and resource curator with expertise in finding 
        the best learning materials across the internet. You know how to evaluate content quality, 
        check for credibility, and match resources to specific learning objectives. You have access 
        to search tools to find the most current and relevant resources available.""",
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm,
        tools=tools,
    )


def create_architect_agent() -> Agent:
    """
    Create the Architect Agent that creates structured study schedules in JSON format.
    """
    return Agent(
        role="Study Plan Architect",
        goal="Create a detailed, structured study schedule in valid JSON format with weekly milestones",
        backstory="""You are a master study plan architect who specializes in creating detailed, 
        actionable schedules. You take learning objectives and resources and organize them into 
        a coherent weekly plan. You are meticulous about outputting valid JSON and ensuring all 
        fields are properly populated. You understand the importance of pacing, review periods, 
        and balancing workload across weeks.""",
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm,
    )