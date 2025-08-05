import os
import aiohttp
import json
import logging
import asyncio
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY",'api-key')
        self.api_url = "https://api.openai.com/v1/chat/completions"
        
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")
    
    async def process_project_documentation(self) -> Dict[str, Any]:
        """
        Process tyrio.txt document and extract project plan
        """
        try:
            document_path = os.path.join(os.getcwd(), 'examples/tyrio.txt')
            
            if not os.path.exists(document_path):
                raise FileNotFoundError(f"Document not found at path: {document_path}")
            
            with open(document_path, 'r', encoding='utf-8') as file:
                document_content = file.read()

            prompt = f"""Analyze the document and create a comprehensive project plan in JSON format.

            DOCUMENT:
            {document_content}

            REQUIREMENTS:
            - Generate DETAILED analysis for enterprise-level planning
            - Focus ONLY on epics (no user stories or tasks)
            - All descriptions must be comprehensive (min 240 chars)
            - Include business value and risk assessment for each epic
            - Leave userStories array empty []

            CRITICAL: Generate 5-8 epics based on project complexity.

            EPIC CATEGORIES TO CONSIDER:
            Authentication & Authorization, Core Features & Business Logic, UI/UX, Data Management, API Development, Infrastructure & DevOps, Security & Compliance, Testing & QA, Documentation, Performance & Scalability, Monitoring & Analytics, Deployment, Third-party Integrations, Mobile Development, Advanced Analytics, Workflow Automation, Multi-tenancy, Internationalization, Accessibility, Disaster Recovery

            RESPONSE FORMAT:
            {{
            "projectMetadata": {{
                "name": "Detailed project name",
                "description": "Comprehensive description with purpose, features, users, business context, market analysis, success criteria (min 300 chars)",
                "projectType": "Specific project type with sub-categories",
                "industry": "Specific industry with sub-domain details",
                "businessValue": "Detailed business value with ROI, competitive advantages, stakeholder benefits, strategic alignment (min 300 chars)",
                "stakeholders": ["Comprehensive stakeholder list with roles and influence levels"],
                "technologies": {{
                    "frontend": ["Technologies with versions and selection rationale"],
                    "backend": ["Technologies with versions and selection rationale"],
                    "database": ["Technologies with versions and selection rationale"],
                    "infrastructure": ["Technologies with versions and selection rationale"],
                    "ai": ["AI/ML technologies with models and algorithms if applicable"],
                    "security": ["Security tools, protocols, and compliance frameworks"],
                    "monitoring": ["Monitoring and observability tools"],
                    "testing": ["Testing frameworks and methodologies"]
                }},
                "team": [
                    {{
                        "position": "Detailed role with seniority level",
                        "responsibilities": ["Comprehensive responsibilities with deliverables and success metrics (min 5 per role)"]
                    }}
                ]
            }},
            "projectStructure": {{
                "methodology": "Detailed methodology with specific practices and tools",
                "epics": [
                    {{
                        "id": "epic-001",
                        "name": "Comprehensive epic name",
                        "description": "Detailed description with scope, objectives, technical approach, architecture, integrations, business rules, performance, security, workflows, APIs, error handling, testing, documentation, data flow, scalability, compliance, disaster recovery, monitoring, deployment, maintenance (min 300 chars)",
                        "priority": "High|Medium|Low",
                        "businessValue": "Detailed business value with metrics, ROI, benefits, competitive advantages, stakeholder impact, strategic alignment, cost-benefit analysis (min 200 chars)",
                        "risks": [
                            {{
                                "risk": "Specific risk category",
                                "description": "Detailed risk description with scenarios, consequences, triggers, probability, impact severity, mitigation strategies (min 150 chars)",
                                "impact": "High|Medium|Low"
                            }}
                        ],
                        "userStories": []
                    }}
                ]
            }}
            }}

            CRITICAL: Return ONLY raw JSON without markdown formatting. Generate 5-8 epics for this enterprise project."""

            # Retry logic with exponential backoff
            max_retries = 3
            base_delay = 2
            
            for attempt in range(max_retries):
                try:
                    headers = {
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                    
                    data = {
                        "model": "gpt-4o-mini",
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.1,
                        "max_tokens": 8000, 
                        "response_format": {"type": "json_object"}
                    }
                    
                    timeout = aiohttp.ClientTimeout(total=300)  # 5 minute total timeout
                    
                    async with aiohttp.ClientSession(timeout=timeout) as session:
                        async with session.post(
                            self.api_url,
                            headers=headers,
                            json=data
                        ) as response:
                            if response.status == 200:
                                result = await response.json()
                                
                                if not result.get('choices') or not result['choices'][0] or not result['choices'][0].get('message'):
                                    raise ValueError('Invalid response from OpenAI API')
                                
                                content = result['choices'][0]['message']['content']
                                
                                try:
                                    parsed_result = json.loads(content)
                                    logger.info("Tyrio document analysis completed successfully")
                                    
                                    if "projectMetadata" not in parsed_result:
                                        return {
                                            "error": "Invalid response format - missing 'projectMetadata' section"
                                        }
                                    
                                    return parsed_result
                                except json.JSONDecodeError as error:
                                    return {
                                        "error": "Invalid JSON response from OpenAI",
                                        "rawResponse": content,
                                        "errorDetails": str(error)
                                    }
                            elif response.status == 408 or response.status == 504:
                                # Timeout error
                                if attempt < max_retries - 1:
                                    delay = base_delay * (2 ** attempt)
                                    logger.warning(f"Timeout on attempt {attempt + 1}, retrying in {delay} seconds...")
                                    await asyncio.sleep(delay)
                                    continue
                                else:
                                    return {
                                        "error": "Request timed out after multiple attempts. Please try again later."
                                    }
                            else:
                                error_text = await response.text()
                                logger.error(f"OpenAI API error: {response.status} - {error_text}")
                                
                                if "insufficient_quota" in error_text or response.status == 429:
                                    return {
                                        "error": "AI service is currently experiencing high demand. Please try again later or contact support."
                                    }
                                else:
                                    return {
                                        "error": f"Error communicating with AI service: {response.status} - {error_text}"
                                    }
                                    
                except asyncio.TimeoutError:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Timeout on attempt {attempt + 1}, retrying in {delay} seconds...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        return {
                            "error": "Request timed out after multiple attempts. Please try again later."
                        }
                except Exception as api_error:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"API error on attempt {attempt + 1}: {str(api_error)}, retrying in {delay} seconds...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error(f"API Error after all retries: {str(api_error)}")
                        return {
                            "error": f"API Error: {str(api_error)}"
                        }

        except Exception as error:
            error_message = str(error) if isinstance(error, Exception) else 'Unknown error occurred'
            logger.error(f"Error processing tyrio document: {error_message}")
            return {
                "error": f"Error processing tyrio document: {error_message}"
            } 