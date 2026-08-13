from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import meetings, transcripts, summaries, action_items

app = FastAPI(
    title="EchoNotes API",
    description="Meeting Notes & Transcription Platform API (Fireflies.ai Clone)",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(summaries.router)
app.include_router(action_items.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "EchoNotes API", "version": "1.0.0"}
