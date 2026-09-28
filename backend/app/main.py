#this is the main file as if naming it main was not enough to tell you that this is the main file of the backend app... just kidding.
from fastapi import FastAPI

from app.auth.router import router as auth_router


app = FastAPI(
    title="NSS Management & Community Engagement System"
)


app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "message": "NSS Backend is running"
    }