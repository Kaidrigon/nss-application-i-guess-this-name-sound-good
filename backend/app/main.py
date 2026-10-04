#this is the main file as if naming it main was not enough to tell you that this is the main file of the backend app... just kidding.
from fastapi import FastAPI
from app.cors import setup_cors
from app.auth.router import router as auth_router
from app.events.router import router as events_router
from app.events.registration_router import router as registration_router
from app.events.attendance_router import router as attendance_router
from app.service_hours.router import router as service_hours_router
from app.reports.router import router as reports_router
from app.imagekit_router import router as imagekit_router
from app.files.router import router as files_router


app = FastAPI(
    title="NSS Management & Community Engagement System"
)


app.include_router(auth_router)
app.include_router(events_router)
app.include_router(registration_router)
app.include_router(attendance_router)
app.include_router(service_hours_router)
app.include_router(reports_router)
app.include_router(imagekit_router)
app.include_router(files_router)


setup_cors(app)

@app.get("/")
async def root():
    return {
        "message": "NSS Backend is running"
    }