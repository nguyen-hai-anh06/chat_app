import os
import sys
import json
import logging
from typing import List, Optional
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("chat_app")

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set in environment or .env file!")

# Initialize Google GenAI client
ai_client = None
if GEMINI_API_KEY:
    try:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Google GenAI client initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing GenAI client: {e}")

# Primary & Fallback Models
MODELS_PRIORITY = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest"
]

SYSTEM_INSTRUCTION = (
    "Bạn là một trợ lý AI thông minh, chuyên nghiệp, lịch sự và hữu ích, "
    "được xây dựng bởi tác giả Nguyễn Hải Anh. "
    "Bạn hỗ trợ người dùng giải quyết các vấn đề về lập trình, logic, viết lách, phân tích dữ liệu và học tập. "
    "Hãy luôn trả lời chi tiết, chính xác, định dạng câu trả lời bằng Markdown đẹp mắt (sử dụng tiêu đề, danh sách, bảng, và code blocks kèm ngôn ngữ khi viết mã nguồn)."
)

# Store chat sessions: session_id -> list of {"role": str, "content": str}
sessions = {}

app = FastAPI(title="Nguyễn Hải Anh — AI Chat Studio", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files setup
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    history: Optional[List[Message]] = []


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "author": "Nguyễn Hải Anh",
        "has_api_key": bool(GEMINI_API_KEY),
        "available_models": MODELS_PRIORITY,
        "default_model": MODELS_PRIORITY[0],
    }


@app.get("/api/author")
def get_author():
    return {
        "name": "Nguyễn Hải Anh",
        "role": "Creator & Full-stack Engineer",
        "avatar": "/static/background_author.png",
        "bio": "Ứng dụng AI Chat Studio thông minh, tối ưu trải nghiệm Light Mode B2B SaaS hiện đại."
    }


@app.post("/api/reset")
async def reset_session(request: Request):
    try:
        data = await request.json()
    except Exception:
        data = {}
    session_id = data.get("session_id", "default")
    if session_id in sessions:
        sessions[session_id] = []
    return {"status": "success", "message": f"Session {session_id} reset."}


def generate_with_fallback(contents, system_instruction=SYSTEM_INSTRUCTION):
    if not ai_client:
        raise HTTPException(status_code=500, detail="Gemini API Key chưa được cấu hình.")

    last_error = None
    for model_name in MODELS_PRIORITY:
        try:
            logger.info(f"Attempting generation with model: {model_name}")
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=2048,
            )
            response = ai_client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            return response.text, model_name
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}. Trying fallback...")
            last_error = e

    raise HTTPException(status_code=503, detail=f"Không thể kết nối đến mô hình Gemini: {last_error}")


def generate_stream_with_fallback(contents, system_instruction=SYSTEM_INSTRUCTION):
    if not ai_client:
        yield f"data: {json.dumps({'error': 'Gemini API Key chưa được cấu hình.'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
        max_output_tokens=2048,
    )

    for model_name in MODELS_PRIORITY:
        try:
            logger.info(f"Attempting stream with model: {model_name}")
            stream = ai_client.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=config,
            )
            yield f"data: {json.dumps({'type': 'start', 'model': model_name})}\n\n"
            for chunk in stream:
                if chunk.text:
                    yield f"data: {json.dumps({'type': 'chunk', 'text': chunk.text})}\n\n"
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
            yield "data: [DONE]\n\n"
            return
        except Exception as e:
            logger.warning(f"Stream on model {model_name} failed: {e}. Trying fallback...")
            continue

    yield f"data: {json.dumps({'error': 'Máy chủ AI đang bận hoặc quá tải. Vui lòng thử lại sau.'})}\n\n"
    yield "data: [DONE]\n\n"


@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    session_id = payload.session_id or "default"
    user_msg = payload.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống.")

    history = sessions.setdefault(session_id, [])
    contents = []
    for h in history:
        role = "user" if h["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=h["content"])]))
    
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_msg)]))

    answer, model_used = generate_with_fallback(contents)

    history.append({"role": "user", "content": user_msg})
    history.append({"role": "model", "content": answer})

    if len(history) > 40:
        sessions[session_id] = history[-40:]

    return {
        "reply": answer,
        "model": model_used,
        "session_id": session_id,
        "author": "Nguyễn Hải Anh"
    }


@app.post("/api/chat/stream")
async def chat_stream_endpoint(payload: ChatRequest):
    session_id = payload.session_id or "default"
    user_msg = payload.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống.")

    history = sessions.setdefault(session_id, [])
    contents = []
    for h in history:
        role = "user" if h["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=h["content"])]))
    
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_msg)]))

    history.append({"role": "user", "content": user_msg})

    async def event_generator():
        full_reply = []
        for line in generate_stream_with_fallback(contents):
            if '"type": "chunk"' in line or "'type': 'chunk'" in line:
                try:
                    data_str = line.replace("data: ", "").strip()
                    parsed = json.loads(data_str)
                    if parsed.get("text"):
                        full_reply.append(parsed["text"])
                except Exception:
                    pass
            yield line

        if full_reply:
            history.append({"role": "model", "content": "".join(full_reply)})
            if len(history) > 40:
                sessions[session_id] = history[-40:]

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/", response_class=HTMLResponse)
def index_page():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return HTMLResponse(content=index_file.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Trang đang khởi động... Vui lòng thử lại sau.</h1>")


if __name__ == "__main__":
    import uvicorn
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print("\n" + "="*50)
    print("NGUYEN HAI ANH - AI CHAT STUDIO IS RUNNING")
    print("URL: http://127.0.0.1:8000")
    print("="*50 + "\n")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

