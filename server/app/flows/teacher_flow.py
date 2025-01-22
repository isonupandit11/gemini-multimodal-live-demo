from typing import Dict
from pipecat_flows import FlowManager
from loguru import logger


def create_teacher_flow_config(subject: str, chapter: str, topic: str) -> Dict:
    return {
        "initial_node": "introduction",
        "nodes": {
            "introduction": {
                "role_messages": [{
                    "role": "system",
                    "content": f"""You are an expert instructor teaching about {subject},
                    specifically {chapter} - {topic}. Use a clear, structured teaching style
                    and check for understanding frequently."""
                }],
                "task_messages": [{
                    "role": "system",
                    "content": "Introduce the topic and outline what will be covered."
                }],
                "functions": [{
                    "type": "function",
                    "function": {
                        "name": "check_understanding",
                        "description": "Check if student understands and wants to continue",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "understood": {"type": "boolean"}
                            }
                        },
                        "transition_to": "teach_concept"
                    }
                }]
            },
            "teach_concept": {
                "task_messages": [{
                    "role": "system",
                    "content": "Explain the current concept in detail and provide examples."
                }],
                "functions": [{
                    "type": "function",
                    "function": {
                        "name": "assess_progress",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "continue": {"type": "boolean"},
                                "needs_review": {"type": "boolean"}
                            }
                        },
                        "transition_to": "conclusion"
                    }
                }]
            },
            "conclusion": {
                "task_messages": [{
                    "role": "system",
                    "content": "Summarize key points and check final understanding."
                }],
                "functions": [{
                    "type": "function",
                    "function": {
                        "name": "end_session",
                        "parameters": {
                            "type": "object",
                            "properties": {}
                        }
                    }
                }]
            }
        }
    }


async def check_understanding_handler(args: Dict) -> Dict:
    """Handle checking student understanding."""
    logger.info(f"Student understanding check: {args}")
    return args


async def assess_progress_handler(args: Dict) -> Dict:
    """Handle progress assessment."""
    logger.info(f"Progress assessment: {args}")
    return args


async def end_session_handler(args: Dict) -> Dict:
    """Handle session ending."""
    logger.info("Ending teaching session")
    return {}


def setup_teacher_flow(
    task,
    llm,
    context_aggregator,
    tts,
    subject: str,
    chapter: str,
    topic: str
) -> FlowManager:
    """Set up FlowManager for teacher mode."""

    flow_config = create_teacher_flow_config(subject, chapter, topic)

    flow_manager = FlowManager(
        task=task,
        llm=llm,
        context_aggregator=context_aggregator,
        tts=tts,
        flow_config=flow_config
    )

    # Register function handlers
    flow_manager.register_function(
        "check_understanding", check_understanding_handler)
    flow_manager.register_function("assess_progress", assess_progress_handler)
    flow_manager.register_function("end_session", end_session_handler)

    return flow_manager
