import os
import time
import json
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, Request, Response, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import httpx

app = FastAPI(title="LinkedIn Data Exposure Demo - Scraper Dashboard API")

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://mugil1206:mugilan@cluster0.zhm3u.mongodb.net/")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["linkedin_scraper"]

# Global control for scraping process
SCRAPING_ACTIVE = False
CURRENT_TARGET_URL = ""

# Schemas
class ConnectPayload(BaseModel):
    target_url: str

class ScrapedUser(BaseModel):
    id: str
    name: str
    headline: str
    jobTitle: str
    company: str
    email: str
    phone: str
    location: str
    education: str
    experienceYears: int
    skills: List[str]
    profileImage: str
    scrapedAt: str

@app.post("/api/scrape/connect")
async def connect_target(payload: ConnectPayload):
    """Validates target URL API connectivity."""
    global CURRENT_TARGET_URL
    target = payload.target_url.strip().rstrip("/")
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client_http:
            res = await client_http.get(f"{target}/api/users")
            if res.status_code == 200:
                CURRENT_TARGET_URL = target
                users = res.json()
                return {
                    "status": "connected",
                    "message": "Connected successfully",
                    "profilesCount": len(users)
                }
            else:
                return JSONResponse(
                    status_code=res.status_code,
                    content={
                        "status": "failed",
                        "message": f"Connection failed with status code {res.status_code}"
                    }
                )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": "failed",
                "message": f"Could not reach target URL: {str(e)}"
            }
        )

@app.post("/api/scrape/stop")
async def stop_scraping():
    """Stops the active scraping process."""
    global SCRAPING_ACTIVE
    SCRAPING_ACTIVE = False
    return {"status": "stopped"}

@app.post("/api/scrape/reset")
async def reset_scraped_data():
    """Clears all scraped users and past runs from the scraper database."""
    global SCRAPING_ACTIVE
    SCRAPING_ACTIVE = False
    await db["scraped_users"].delete_many({})
    await db["scrape_runs"].delete_many({})
    return {"status": "reset_completed"}

# SSE Scraping Stream Generator
async def scrape_generator(target_url: str):
    global SCRAPING_ACTIVE
    SCRAPING_ACTIVE = True
    
    yield f"data: {json.dumps({'type': 'log', 'message': 'Initializing scraping session...'})}\n\n"
    await asyncio.sleep(0.5)
    
    start_time = time.time()
    
    # 1. Fetch public directory list
    yield f"data: {json.dumps({'type': 'log', 'message': 'Requesting target public directory /api/users...'})}\n\n"
    
    # Configure custom Headers to mimic standard Python script or allow customization
    # We use python user agent by default so the target bot detection middleware can catch it if Protection is ON!
    headers = {
        "User-Agent": "python-requests/2.31.0"
    }
    
    try:
        async with httpx.AsyncClient(headers=headers, timeout=10.0) as client_http:
            res = await client_http.get(f"{target_url}/api/users")
            
            if res.status_code == 403:
                yield f"data: {json.dumps({'type': 'blocked', 'reason': '403 Forbidden: Access Blocked by Bot Detection'})}\n\n"
                SCRAPING_ACTIVE = False
                return
            elif res.status_code == 429:
                yield f"data: {json.dumps({'type': 'blocked', 'reason': '429 Too Many Requests: Rate Limit Exceeded'})}\n\n"
                SCRAPING_ACTIVE = False
                return
            elif res.status_code != 200:
                yield f"data: {json.dumps({'type': 'error', 'message': f'Failed to retrieve directory: Status {res.status_code}'})}\n\n"
                SCRAPING_ACTIVE = False
                return
                
            users = res.json()
            total_users = len(users)
            
            yield f"data: {json.dumps({'type': 'log', 'message': f'Found {total_users} profiles. Starting automated retrieval...'})}\n\n"
            if total_users == 0:
                yield f"data: {json.dumps({'type': 'log', 'message': 'Notice: Target database has 0 profiles. Please seed the target database using the seeding script.'})}\n\n"
            await asyncio.sleep(0.5)
            
            collected_count = 0
            exit_reason = None
            
            # 2. Iterate and scrape each user detail
            for idx, user_brief in enumerate(users):
                if not SCRAPING_ACTIVE:
                    yield f"data: {json.dumps({'type': 'stopped', 'message': 'Scraping stopped by user'})}\n\n"
                    exit_reason = "stopped"
                    break
                    
                user_id = user_brief["id"]
                yield f"data: {json.dumps({'type': 'log', 'message': f'Collecting User {idx + 1}/{total_users} (ID: {user_id})...'})}\n\n"
                
                # Fetch details
                detail_res = await client_http.get(f"{target_url}/api/users/{user_id}")
                
                if detail_res.status_code == 403:
                    yield f"data: {json.dumps({'type': 'blocked', 'reason': '403 Forbidden: Access Blocked by Bot Detection'})}\n\n"
                    exit_reason = "blocked"
                    break
                elif detail_res.status_code == 429:
                    yield f"data: {json.dumps({'type': 'blocked', 'reason': '429 Too Many Requests: Rate Limit Exceeded'})}\n\n"
                    exit_reason = "blocked"
                    break
                elif detail_res.status_code != 200:
                    yield f"data: {json.dumps({'type': 'log', 'message': f'Warning: Failed to fetch user details for {user_id}. Status {detail_res.status_code}'})}\n\n"
                    continue
                
                # Success
                user_detail = detail_res.json()
                
                # Save to local database
                user_detail["scrapedAt"] = datetime.now(timezone.utc).isoformat()
                # Store _id matching target id
                user_detail["_id"] = user_detail["id"]
                await db["scraped_users"].replace_one(
                    {"_id": user_detail["id"]},
                    user_detail,
                    upsert=True
                )
                
                collected_count += 1
                progress = int((collected_count / total_users) * 100)
                
                # Small simulation delay to show visual logs in frontend (make it feel realistic)
                # If we scrap too fast, it will finish in 0.1s. Let's make it scrap with 50-100ms interval for demonstration.
                # If rate limiting is OFF, we can complete in about 5 seconds.
                await asyncio.sleep(0.05)
                
                yield f"data: {json.dumps({'type': 'progress', 'collected': collected_count, 'total': total_users, 'percent': progress, 'current_user': user_detail['name']})}\n\n"
            
            if exit_reason is None:
                end_time = time.time()
                duration = round(end_time - start_time, 2)
                speed = round(collected_count / duration, 1) if duration > 0 else collected_count
                
                # Save run statistics
                run_doc = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "profilesCollected": collected_count,
                    "durationSeconds": duration,
                    "speed": speed,
                    "status": "completed" if (total_users > 0 and collected_count == total_users) or total_users == 0 else "partial"
                }
                await db["scrape_runs"].insert_one(run_doc)
                
                yield f"data: {json.dumps({'type': 'completed', 'profilesCollected': collected_count, 'timeTaken': f'{duration} seconds', 'speed': f'{speed} profiles/sec'})}\n\n"
            
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': f'Connection Error: {str(e)}'})}\n\n"
        
    SCRAPING_ACTIVE = False

@app.get("/api/scrape/start")
async def start_scrape(target_url: str = Query(...)):
    """Initiates the scraping run and returns an SSE stream."""
    return StreamingResponse(
        scrape_generator(target_url),
        media_type="text/event-stream"
    )

@app.get("/api/scraped-users")
async def get_scraped_users(
    search: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    order: str = Query("asc"),
    page: int = Query(1),
    limit: int = Query(10)
):
    """Retrieves all scraped users with search, sort, and pagination."""
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"jobTitle": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}},
                {"skills": {"$regex": search, "$options": "i"}}
            ]
        }
        
    # Build sort criteria
    sort_direction = 1 if order == "asc" else -1
    sort_criteria = [(sort_by, sort_direction)]
    
    total = await db["scraped_users"].count_documents(query)
    
    cursor = db["scraped_users"].find(query).sort(sort_criteria).skip((page - 1) * limit).limit(limit)
    users = []
    async for doc in cursor:
        users.append(ScrapedUser(
            id=doc["_id"],
            name=doc["name"],
            headline=doc["headline"],
            jobTitle=doc["jobTitle"],
            company=doc["company"],
            email=doc["email"],
            phone=doc["phone"],
            location=doc["location"],
            education=doc["education"],
            experienceYears=doc["experienceYears"],
            skills=doc["skills"],
            profileImage=doc["profileImage"],
            scrapedAt=doc["scrapedAt"]
        ))
        
    return {
        "users": users,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@app.get("/api/scraped-users/export")
async def export_scraped_users():
    """Returns all scraped profiles for bulk export (JSON)."""
    cursor = db["scraped_users"].find({})
    users = []
    async for doc in cursor:
        users.append({
            "id": doc["_id"],
            "name": doc["name"],
            "headline": doc["headline"],
            "jobTitle": doc["jobTitle"],
            "company": doc["company"],
            "email": doc["email"],
            "phone": doc["phone"],
            "location": doc["location"],
            "education": doc["education"],
            "experienceYears": doc["experienceYears"],
            "skills": doc["skills"]
        })
    return users

@app.get("/api/scrape/analytics")
async def get_scrape_analytics():
    """Aggregates local scraped data and run history for analytics charts."""
    # 1. General counts
    total_collected = await db["scraped_users"].count_documents({})
    
    # 2. Scrape Runs History
    runs_cursor = db["scrape_runs"].find({}).sort("timestamp", -1).limit(10)
    runs = []
    async for run in runs_cursor:
        runs.append({
            "time": datetime.fromisoformat(run["timestamp"]).strftime("%m-%d %H:%M"),
            "collected": run["profilesCollected"],
            "duration": run["durationSeconds"],
            "speed": run["speed"]
        })
    # Reverse to show chronological order
    runs.reverse()
    
    # 3. Top Locations
    loc_pipeline = [
        {"$group": {"_id": "$location", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    loc_cursor = db["scraped_users"].aggregate(loc_pipeline)
    locations = [{"location": doc["_id"], "count": doc["count"]} async for doc in loc_cursor]
    
    # 4. Top Companies
    comp_pipeline = [
        {"$group": {"_id": "$company", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8}
    ]
    comp_cursor = db["scraped_users"].aggregate(comp_pipeline)
    companies = [{"company": doc["_id"], "count": doc["count"]} async for doc in comp_cursor]
    
    return {
        "totalCollected": total_collected,
        "runHistory": runs,
        "topLocations": locations,
        "topCompanies": companies
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
