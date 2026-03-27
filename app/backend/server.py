"from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix=\"/api\")


# ==================== MODELS ====================

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatSession(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatSessionCreate(BaseModel):
    title: str = \"New Chat\"

class Task(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: str = \"medium\"  # low, medium, high
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = \"medium\"
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class ImageGeneration(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prompt: str
    image_data: str  # base64 encoded image
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ImageGenerateRequest(BaseModel):
    prompt: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = \"User\"
    email: Optional[str] = None
    theme: str = \"light\"  # light or dark
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    theme: Optional[str] = None


# ==================== CHAT ENDPOINTS ====================

@api_router.post(\"/chat\", response_model=ChatMessage)
async def send_chat_message(request: ChatRequest):
    \"\"\"Send a message to the AI assistant and get a response\"\"\"
    try:
        # Get chat history for this session
        history = await db.chat_messages.find(
            {\"session_id\": request.session_id},
            {\"_id\": 0}
        ).sort(\"timestamp\", 1).to_list(100)
        
        # Save user message
        user_msg = ChatMessage(
            session_id=request.session_id,
            role=\"user\",
            content=request.message
        )
        user_doc = user_msg.model_dump()
        user_doc['timestamp'] = user_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(user_doc)
        
        # Initialize LLM chat
        api_key = os.getenv(\"EMERGENT_LLM_KEY\")
        chat = LlmChat(
            api_key=api_key,
            session_id=request.session_id,
            system_message=\"You are NexusAI, a helpful and intelligent AI assistant. You help users with various tasks including answering questions, providing advice, and solving problems. Be concise, friendly, and professional.\"
        )
        chat.with_model(\"openai\", \"gpt-5.2\")
        
        # Get AI response
        user_message = UserMessage(text=request.message)
        ai_response = await chat.send_message(user_message)
        
        # Save AI response
        ai_msg = ChatMessage(
            session_id=request.session_id,
            role=\"assistant\",
            content=ai_response
        )
        ai_doc = ai_msg.model_dump()
        ai_doc['timestamp'] = ai_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(ai_doc)
        
        # Update session updated_at
        await db.chat_sessions.update_one(
            {\"id\": request.session_id},
            {\"$set\": {\"updated_at\": datetime.now(timezone.utc).isoformat()}}
        )
        
        return ai_msg
        
    except Exception as e:
        logging.error(f\"Error in chat: {str(e)}\")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get(\"/chat/sessions\", response_model=List[ChatSession])
async def get_chat_sessions():
    \"\"\"Get all chat sessions\"\"\"
    sessions = await db.chat_sessions.find({}, {\"_id\": 0}).sort(\"updated_at\", -1).to_list(100)
    for session in sessions:
        if isinstance(session['created_at'], str):
            session['created_at'] = datetime.fromisoformat(session['created_at'])
        if isinstance(session['updated_at'], str):
            session['updated_at'] = datetime.fromisoformat(session['updated_at'])
    return sessions

@api_router.post(\"/chat/sessions\", response_model=ChatSession)
async def create_chat_session(session: ChatSessionCreate):
    \"\"\"Create a new chat session\"\"\"
    new_session = ChatSession(title=session.title)
    doc = new_session.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.chat_sessions.insert_one(doc)
    return new_session

@api_router.get(\"/chat/sessions/{session_id}/messages\", response_model=List[ChatMessage])
async def get_session_messages(session_id: str):
    \"\"\"Get all messages for a specific session\"\"\"
    messages = await db.chat_messages.find(
        {\"session_id\": session_id},
        {\"_id\": 0}
    ).sort(\"timestamp\", 1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg['timestamp'], str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    return messages

@api_router.delete(\"/chat/sessions/{session_id}\")
async def delete_chat_session(session_id: str):
    \"\"\"Delete a chat session and all its messages\"\"\"
    await db.chat_sessions.delete_one({\"id\": session_id})
    await db.chat_messages.delete_many({\"session_id\": session_id})
    return {\"message\": \"Session deleted successfully\"}


# ==================== IMAGE GENERATION ENDPOINTS ====================

@api_router.post(\"/images/generate\", response_model=ImageGeneration)
async def generate_image(request: ImageGenerateRequest):
    \"\"\"Generate an image from text prompt using Gemini Nano Banana\"\"\"
    try:
        api_key = os.getenv(\"EMERGENT_LLM_KEY\")
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=\"You are a helpful AI assistant\"
        )
        chat.with_model(\"gemini\", \"gemini-3.1-flash-image-preview\").with_params(modalities=[\"image\", \"text\"])
        
        msg = UserMessage(text=request.prompt)
        text, images = await chat.send_message_multimodal_response(msg)
        
        if not images or len(images) == 0:
            raise HTTPException(status_code=500, detail=\"No image generated\")
        
        # Get the first generated image
        image_data = images[0]['data']
        
        # Save to database
        img_gen = ImageGeneration(
            prompt=request.prompt,
            image_data=image_data
        )
        doc = img_gen.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.generated_images.insert_one(doc)
        
        return img_gen
        
    except Exception as e:
        logging.error(f\"Error generating image: {str(e)}\")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get(\"/images\", response_model=List[ImageGeneration])
async def get_generated_images():
    \"\"\"Get all generated images\"\"\"
    images = await db.generated_images.find({}, {\"_id\": 0}).sort(\"created_at\", -1).limit(50).to_list(50)
    for img in images:
        if isinstance(img['created_at'], str):
            img['created_at'] = datetime.fromisoformat(img['created_at'])
    return images

@api_router.delete(\"/images/{image_id}\")
async def delete_image(image_id: str):
    \"\"\"Delete a generated image\"\"\"
    await db.generated_images.delete_one({\"id\": image_id})
    return {\"message\": \"Image deleted successfully\"}


# ==================== TASK MANAGEMENT ENDPOINTS ====================

@api_router.get(\"/tasks\", response_model=List[Task])
async def get_tasks():
    \"\"\"Get all tasks\"\"\"
    tasks = await db.tasks.find({}, {\"_id\": 0}).sort(\"created_at\", -1).to_list(1000)
    for task in tasks:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if isinstance(task['updated_at'], str):
            task['updated_at'] = datetime.fromisoformat(task['updated_at'])
        if task.get('due_date') and isinstance(task['due_date'], str):
            task['due_date'] = datetime.fromisoformat(task['due_date'])
    return tasks

@api_router.post(\"/tasks\", response_model=Task)
async def create_task(task: TaskCreate):
    \"\"\"Create a new task\"\"\"
    new_task = Task(**task.model_dump())
    doc = new_task.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['due_date']:
        doc['due_date'] = doc['due_date'].isoformat()
    await db.tasks.insert_one(doc)
    return new_task

@api_router.put(\"/tasks/{task_id}\", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    \"\"\"Update a task\"\"\"
    update_data = {k: v for k, v in task_update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    if 'due_date' in update_data and update_data['due_date']:
        update_data['due_date'] = update_data['due_date'].isoformat()
    
    await db.tasks.update_one({\"id\": task_id}, {\"$set\": update_data})
    
    task = await db.tasks.find_one({\"id\": task_id}, {\"_id\": 0})
    if task:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if isinstance(task['updated_at'], str):
            task['updated_at'] = datetime.fromisoformat(task['updated_at'])
        if task.get('due_date') and isinstance(task['due_date'], str):
            task['due_date'] = datetime.fromisoformat(task['due_date'])
        return Task(**task)
    raise HTTPException(status_code=404, detail=\"Task not found\")

@api_router.delete(\"/tasks/{task_id}\")
async def delete_task(task_id: str):
    \"\"\"Delete a task\"\"\"
    result = await db.tasks.delete_one({\"id\": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Task not found\")
    return {\"message\": \"Task deleted successfully\"}


# ==================== ANALYTICS ENDPOINTS ====================

@api_router.get(\"/analytics\")
async def get_analytics():
    \"\"\"Get user activity analytics\"\"\"
    try:
        # Count various metrics
        total_chats = await db.chat_sessions.count_documents({})
        total_messages = await db.chat_messages.count_documents({})
        total_images = await db.generated_images.count_documents({})
        total_tasks = await db.tasks.count_documents({})
        completed_tasks = await db.tasks.count_documents({\"completed\": True})
        
        # Get recent activity
        recent_sessions = await db.chat_sessions.find({}, {\"_id\": 0}).sort(\"updated_at\", -1).limit(5).to_list(5)
        
        return {
            \"total_chats\": total_chats,
            \"total_messages\": total_messages,
            \"total_images\": total_images,
            \"total_tasks\": total_tasks,
            \"completed_tasks\": completed_tasks,
            \"pending_tasks\": total_tasks - completed_tasks,
            \"recent_sessions\": recent_sessions
        }
    except Exception as e:
        logging.error(f\"Error getting analytics: {str(e)}\")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== USER PROFILE ENDPOINTS ====================

@api_router.get(\"/user/profile\", response_model=UserProfile)
async def get_user_profile():
    \"\"\"Get user profile (creates default if not exists)\"\"\"
    profile = await db.user_profiles.find_one({}, {\"_id\": 0})
    if not profile:
        # Create default profile
        default_profile = UserProfile()
        doc = default_profile.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.user_profiles.insert_one(doc)
        return default_profile
    
    if isinstance(profile['created_at'], str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    if isinstance(profile['updated_at'], str):
        profile['updated_at'] = datetime.fromisoformat(profile['updated_at'])
    return UserProfile(**profile)

@api_router.put(\"/user/profile\", response_model=UserProfile)
async def update_user_profile(profile_update: UserProfileUpdate):
    \"\"\"Update user profile\"\"\"
    update_data = {k: v for k, v in profile_update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.user_profiles.update_one({}, {\"$set\": update_data}, upsert=True)
    
    profile = await db.user_profiles.find_one({}, {\"_id\": 0})
    if isinstance(profile['created_at'], str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    if isinstance(profile['updated_at'], str):
        profile['updated_at'] = datetime.fromisoformat(profile['updated_at'])
    return UserProfile(**profile)


# ==================== BASIC ENDPOINTS ====================

@api_router.get(\"/\")
async def root():
    return {\"message\": \"Welcome to NexusAI API\"}

@api_router.get(\"/health\")
async def health_check():
    return {\"status\": \"healthy\", \"service\": \"NexusAI\"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
"
Observation: Overwrite successful: /app/backend/server.py
