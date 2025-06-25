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
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
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

@api_router.put("/listings/{listing_id}", response_model=Listing)
async def update_listing(
    listing_id: str, 
    listing_data: ListingCreate, 
    current_user: User = Depends(get_current_user)
):
    # Check if listing exists and belongs to current user
    existing_listing = await db.listings.find_one({"id": listing_id, "seller_id": current_user.id})
    if not existing_listing:
        raise HTTPException(status_code=404, detail="Listing not found or you don't have permission to edit it")
    
    # Update listing
    listing_dict = listing_data.dict()
    listing_dict["seller_id"] = current_user.id
    listing_dict["seller_name"] = current_user.full_name
    listing_dict["seller_email"] = current_user.email
    listing_dict["seller_phone"] = current_user.phone
    listing_dict["updated_at"] = datetime.utcnow()
    
    await db.listings.update_one({"id": listing_id}, {"$set": listing_dict})
    
    # Return updated listing
    updated_listing = await db.listings.find_one({"id": listing_id})
    return Listing(**updated_listing)

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, current_user: User = Depends(get_current_user)):
    # Check if listing exists and belongs to current user
    existing_listing = await db.listings.find_one({"id": listing_id, "seller_id": current_user.id})
    if not existing_listing:
        raise HTTPException(status_code=404, detail="Listing not found or you don't have permission to delete it")
    
    # Soft delete by setting is_active to False
    await db.listings.update_one(
        {"id": listing_id}, 
        {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
    )
    
    return {"message": "Listing deleted successfully"}

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

# DSGVO/Privacy API endpoints
@api_router.get("/privacy/data-export")
async def export_user_data(current_user: User = Depends(get_current_user)):
    """DSGVO Art. 20 - Recht auf Datenübertragbarkeit"""
    # Collect all user data
    user_data = {
        "user_info": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "is_active": current_user.is_active
        },
        "listings": [],
        "export_date": datetime.utcnow().isoformat()
    }
    
    # Get user's listings
    listings = await db.listings.find({"seller_id": current_user.id}).to_list(1000)
    for listing in listings:
        # Remove internal fields
        listing.pop("_id", None)
        user_data["listings"].append(listing)
    
    return user_data

@api_router.delete("/privacy/delete-account")
async def delete_user_account(current_user: User = Depends(get_current_user)):
    """DSGVO Art. 17 - Recht auf Löschung"""
    try:
        # Soft delete user account
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "is_active": False,
                    "deleted_at": datetime.utcnow(),
                    "username": f"deleted_user_{current_user.id}",
                    "email": f"deleted_{current_user.id}@deleted.local",
                    "full_name": "Gelöschter Benutzer",
                    "phone": None
                }
            }
        )
        
        # Deactivate all user's listings
        await db.listings.update_many(
            {"seller_id": current_user.id},
            {
                "$set": {
                    "is_active": False,
                    "deleted_at": datetime.utcnow(),
                    "seller_name": "Gelöschter Benutzer",
                    "seller_email": "deleted@deleted.local",
                    "seller_phone": None
                }
            }
        )
        
        return {"message": "Account successfully deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")

@api_router.post("/privacy/data-correction")
async def request_data_correction(
    correction_request: dict,
    current_user: User = Depends(get_current_user)
):
    """DSGVO Art. 16 - Recht auf Berichtigung"""
    # Log data correction request
    correction_log = {
        "user_id": current_user.id,
        "request": correction_request,
        "timestamp": datetime.utcnow(),
        "status": "pending"
    }
    
    # In a real application, this would trigger a review process
    # For now, we'll just log it
    await db.data_correction_requests.insert_one(correction_log)
    
    return {
        "message": "Datenkorrektur-Anfrage wurde eingereicht und wird bearbeitet",
        "request_id": str(correction_log["_id"]) if "_id" in correction_log else "unknown"
    }

@api_router.get("/privacy/consent-status")
async def get_consent_status(current_user: User = Depends(get_current_user)):
    """Get user's current consent status"""
    # This would typically be stored in the database
    # For now, return a default status
    return {
        "necessary": True,
        "functional": False,
        "analytics": False,
        "marketing": False,
        "last_updated": datetime.utcnow().isoformat()
    }

@api_router.post("/privacy/update-consent")
async def update_consent(
    consent_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update user's consent preferences"""
    # Update consent in database
    consent_record = {
        "user_id": current_user.id,
        "necessary": consent_data.get("necessary", True),
        "functional": consent_data.get("functional", False),
        "analytics": consent_data.get("analytics", False),
        "marketing": consent_data.get("marketing", False),
        "timestamp": datetime.utcnow()
    }
    
    await db.user_consent.update_one(
        {"user_id": current_user.id},
        {"$set": consent_record},
        upsert=True
    )
    
    return {"message": "Consent preferences updated successfully"}
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
