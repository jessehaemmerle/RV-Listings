from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MimeMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Listing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    vehicle_type: str  # caravan, motorhome, camper_van
    make: str
    model: str
    year: int
    mileage: Optional[int] = None
    length: Optional[float] = None  # in meters
    fuel_type: Optional[str] = None
    location: Dict[str, Any]  # {address: str, latitude: float, longitude: float}
    images: List[str] = []  # base64 encoded images
    seller_id: str
    seller_name: str
    seller_email: str
    seller_phone: Optional[str] = None
    show_phone: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    vehicle_type: str
    make: str
    model: str
    year: int
    mileage: Optional[int] = None
    length: Optional[float] = None
    fuel_type: Optional[str] = None
    location: Dict[str, Any]
    images: List[str] = []
    show_phone: bool = False

class ContactMessage(BaseModel):
    listing_id: str
    sender_name: str
    sender_email: EmailStr
    message: str

class SearchFilter(BaseModel):
    vehicle_type: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    location_radius: Optional[float] = None  # in km
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    search_text: Optional[str] = None

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return User(**user)

# Email sending function (simple SMTP - can be enhanced with proper email service)
async def send_email(to_email: str, subject: str, body: str, from_email: str = "noreply@rvclassifieds.com"):
    try:
        # This is a basic implementation - in production, use proper email service
        print(f"EMAIL SENT TO: {to_email}")
        print(f"SUBJECT: {subject}")
        print(f"BODY: {body}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# Authentication routes
@api_router.post("/register", response_model=dict)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user.username}, {"email": user.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    del user_dict["password"]
    user_obj = User(**user_dict)
    user_data = user_obj.dict()
    user_data["hashed_password"] = hashed_password
    
    result = await db.users.insert_one(user_data)
    return {"message": "User registered successfully", "user_id": user_obj.id}

@api_router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Listing routes
@api_router.post("/listings", response_model=Listing)
async def create_listing(listing_data: ListingCreate, current_user: User = Depends(get_current_user)):
    listing_dict = listing_data.dict()
    listing_dict["seller_id"] = current_user.id
    listing_dict["seller_name"] = current_user.full_name
    listing_dict["seller_email"] = current_user.email
    listing_dict["seller_phone"] = current_user.phone
    
    listing_obj = Listing(**listing_dict)
    result = await db.listings.insert_one(listing_obj.dict())
    return listing_obj

@api_router.get("/listings", response_model=List[Listing])
async def get_listings(
    skip: int = 0,
    limit: int = 20,
    vehicle_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search_text: Optional[str] = None
):
    query = {"is_active": True}
    
    if vehicle_type:
        query["vehicle_type"] = vehicle_type
    if min_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = min_price
    if max_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = max_price
    if search_text:
        query["$or"] = [
            {"title": {"$regex": search_text, "$options": "i"}},
            {"description": {"$regex": search_text, "$options": "i"}},
            {"make": {"$regex": search_text, "$options": "i"}},
            {"model": {"$regex": search_text, "$options": "i"}}
        ]
    
    listings = await db.listings.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    return [Listing(**listing) for listing in listings]

@api_router.get("/listings/{listing_id}", response_model=Listing)
async def get_listing(listing_id: str):
    listing = await db.listings.find_one({"id": listing_id, "is_active": True})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return Listing(**listing)

@api_router.get("/my-listings", response_model=List[Listing])
async def get_my_listings(current_user: User = Depends(get_current_user)):
    listings = await db.listings.find({"seller_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [Listing(**listing) for listing in listings]

@api_router.post("/contact-seller")
async def contact_seller(message_data: ContactMessage):
    # Get listing details
    listing = await db.listings.find_one({"id": message_data.listing_id, "is_active": True})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Send email to seller
    subject = f"Inquiry about your {listing['title']}"
    body = f"""
    You have received an inquiry about your listing: {listing['title']}
    
    From: {message_data.sender_name} ({message_data.sender_email})
    
    Message:
    {message_data.message}
    
    You can reply directly to this email to respond to the inquiry.
    """
    
    email_sent = await send_email(listing["seller_email"], subject, body)
    
    if email_sent:
        return {"message": "Message sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send message")

# Vehicle types endpoint
@api_router.get("/vehicle-types")
async def get_vehicle_types():
    return [
        {"value": "caravan", "label": "Caravan"},
        {"value": "motorhome", "label": "Motorhome"},
        {"value": "camper_van", "label": "Camper Van"}
    ]

# Stats endpoint
@api_router.get("/stats")
async def get_stats():
    total_listings = await db.listings.count_documents({"is_active": True})
    total_users = await db.users.count_documents({"is_active": True})
    
    # Group by vehicle type
    pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {"_id": "$vehicle_type", "count": {"$sum": 1}}}
    ]
    vehicle_counts = await db.listings.aggregate(pipeline).to_list(10)
    
    return {
        "total_listings": total_listings,
        "total_users": total_users,
        "vehicle_counts": vehicle_counts
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
