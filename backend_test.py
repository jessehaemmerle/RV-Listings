#!/usr/bin/env python3
import requests
import json
import random
import string
import base64
import time
import os
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = None
try:
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BACKEND_URL = line.strip().split('=')[1].strip('"\'')
                break
except Exception as e:
    print(f"Error reading frontend/.env file: {e}")
    sys.exit(1)

if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in frontend/.env")
    sys.exit(1)

# Ensure the URL doesn't have quotes
BACKEND_URL = BACKEND_URL.strip('"\'')
API_URL = f"{BACKEND_URL}/api"

print(f"Using backend API URL: {API_URL}")

# Test data
test_users = []
test_listings = []
auth_token = None

# Helper functions
def random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def create_test_user():
    """Create a random user for testing"""
    username = f"test_user_{random_string()}"
    return {
        "username": username,
        "email": f"{username}@example.com",
        "password": "Test@123",
        "full_name": f"Test User {random_string()}",
        "phone": f"+1{random.randint(1000000000, 9999999999)}"
    }

def create_test_listing():
    """Create a random listing for testing"""
    vehicle_types = ["caravan", "motorhome", "camper_van"]
    makes = ["Airstream", "Winnebago", "Jayco", "Thor", "Forest River"]
    models = ["Classic", "Minnie", "Eagle", "Outback", "Sprinter"]
    fuel_types = ["diesel", "petrol", "hybrid", "electric"]
    
    # Create a small base64 image for testing
    dummy_image = base64.b64encode(b"dummy image data").decode('utf-8')
    
    return {
        "title": f"{random.choice(makes)} {random.choice(models)} {random.randint(2010, 2023)}",
        "description": f"This is a test listing for a {random.choice(vehicle_types)}. It's in excellent condition.",
        "price": random.randint(10000, 100000),
        "vehicle_type": random.choice(vehicle_types),
        "make": random.choice(makes),
        "model": random.choice(models),
        "year": random.randint(2010, 2023),
        "mileage": random.randint(1000, 100000),
        "length": round(random.uniform(4.0, 12.0), 1),
        "fuel_type": random.choice(fuel_types),
        "location": {
            "address": f"{random.randint(1, 999)} Test Street, Test City, Test Country",
            "latitude": round(random.uniform(-90, 90), 6),
            "longitude": round(random.uniform(-180, 180), 6)
        },
        "images": [dummy_image],
        "show_phone": random.choice([True, False])
    }

def print_test_result(test_name, success, message=""):
    """Print test result in a formatted way"""
    result = "PASSED" if success else "FAILED"
    print(f"[{result}] {test_name}")
    if message:
        print(f"       {message}")
    print()

# Test functions
def test_register_user():
    """Test user registration endpoint"""
    print("\n=== Testing User Registration ===")
    
    # Test valid registration
    user_data = create_test_user()
    test_users.append(user_data)
    
    response = requests.post(f"{API_URL}/register", json=user_data)
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Register valid user", success, message)
    
    # Test duplicate registration
    response = requests.post(f"{API_URL}/register", json=user_data)
    success = response.status_code == 400
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Register duplicate user (should fail)", success, message)
    
    # Test invalid email
    invalid_user = create_test_user()
    invalid_user["email"] = "invalid-email"
    response = requests.post(f"{API_URL}/register", json=invalid_user)
    success = response.status_code != 200
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Register with invalid email (should fail)", success, message)
    
    return success

def test_login():
    """Test user login endpoint"""
    print("\n=== Testing User Login ===")
    global auth_token
    
    # Test valid login
    if not test_users:
        print("No test users available. Creating one...")
        test_register_user()
    
    user_data = test_users[0]
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    response = requests.post(f"{API_URL}/login", json=login_data)
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Login with valid credentials", success, message)
    
    if success:
        try:
            auth_token = response.json()["access_token"]
            print(f"Obtained auth token: {auth_token[:10]}...")
        except Exception as e:
            print(f"Error extracting token: {e}")
            success = False
    
    # Test invalid login
    invalid_login = {
        "username": user_data["username"],
        "password": "wrong_password"
    }
    
    response = requests.post(f"{API_URL}/login", json=invalid_login)
    invalid_success = response.status_code == 401
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Login with invalid credentials (should fail)", invalid_success, message)
    
    return success and invalid_success

def test_protected_endpoint():
    """Test protected endpoint access"""
    print("\n=== Testing Protected Endpoint (/me) ===")
    global auth_token
    
    if not auth_token:
        print("No auth token available. Logging in...")
        test_login()
    
    # Test with valid token
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(f"{API_URL}/me", headers=headers)
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Access protected endpoint with valid token", success, message)
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token"}
    response = requests.get(f"{API_URL}/me", headers=headers)
    invalid_success = response.status_code == 401
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Access protected endpoint with invalid token (should fail)", invalid_success, message)
    
    return success and invalid_success

def test_create_listing():
    """Test creating a listing"""
    print("\n=== Testing Create Listing ===")
    global auth_token
    
    if not auth_token:
        print("No auth token available. Logging in...")
        test_login()
    
    # Test with valid data
    listing_data = create_test_listing()
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    response = requests.post(f"{API_URL}/listings", json=listing_data, headers=headers)
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text[:200]}..."
    print_test_result("Create listing with valid data", success, message)
    
    if success:
        try:
            listing = response.json()
            test_listings.append(listing)
            print(f"Created listing with ID: {listing['id']}")
        except Exception as e:
            print(f"Error extracting listing data: {e}")
    
    # Test without authentication
    response = requests.post(f"{API_URL}/listings", json=listing_data)
    no_auth_success = response.status_code == 401 or response.status_code == 403
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Create listing without authentication (should fail)", no_auth_success, message)
    
    return success and no_auth_success

def test_get_listings():
    """Test retrieving all listings"""
    print("\n=== Testing Get All Listings ===")
    
    # Ensure we have at least one listing
    if not test_listings:
        print("No test listings available. Creating one...")
        test_create_listing()
    
    # Test basic listing retrieval
    response = requests.get(f"{API_URL}/listings")
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text[:200]}..."
    print_test_result("Get all listings", success, message)
    
    if success:
        try:
            listings = response.json()
            print(f"Retrieved {len(listings)} listings")
        except Exception as e:
            print(f"Error extracting listings data: {e}")
            success = False
    
    # Test with filters
    if test_listings:
        listing = test_listings[0]
        vehicle_type = listing["vehicle_type"]
        
        response = requests.get(f"{API_URL}/listings?vehicle_type={vehicle_type}")
        filter_success = response.status_code == 200
        message = f"Status: {response.status_code}, Response: {response.text[:200]}..."
        print_test_result(f"Get listings filtered by vehicle_type={vehicle_type}", filter_success, message)
        
        if filter_success:
            try:
                filtered_listings = response.json()
                print(f"Retrieved {len(filtered_listings)} filtered listings")
            except Exception as e:
                print(f"Error extracting filtered listings data: {e}")
                filter_success = False
        
        success = success and filter_success
    
    return success

def test_get_single_listing():
    """Test retrieving a single listing"""
    print("\n=== Testing Get Single Listing ===")
    
    # Ensure we have at least one listing
    if not test_listings:
        print("No test listings available. Creating one...")
        test_create_listing()
    
    if test_listings:
        listing_id = test_listings[0]["id"]
        
        # Test valid listing ID
        response = requests.get(f"{API_URL}/listings/{listing_id}")
        success = response.status_code == 200
        message = f"Status: {response.status_code}, Response: {response.text[:200]}..."
        print_test_result(f"Get listing with ID {listing_id}", success, message)
        
        # Test invalid listing ID
        invalid_id = "invalid_id_12345"
        response = requests.get(f"{API_URL}/listings/{invalid_id}")
        invalid_success = response.status_code == 404
        message = f"Status: {response.status_code}, Response: {response.text}"
        print_test_result(f"Get listing with invalid ID (should fail)", invalid_success, message)
        
        return success and invalid_success
    else:
        print("Failed to create test listings")
        return False

def test_get_my_listings():
    """Test retrieving user's own listings"""
    print("\n=== Testing Get My Listings ===")
    global auth_token
    
    if not auth_token:
        print("No auth token available. Logging in...")
        test_login()
    
    # Ensure we have at least one listing
    if not test_listings:
        print("No test listings available. Creating one...")
        test_create_listing()
    
    # Test with authentication
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(f"{API_URL}/my-listings", headers=headers)
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text[:200]}..."
    print_test_result("Get my listings with authentication", success, message)
    
    if success:
        try:
            listings = response.json()
            print(f"Retrieved {len(listings)} of my listings")
        except Exception as e:
            print(f"Error extracting my listings data: {e}")
            success = False
    
    # Test without authentication
    response = requests.get(f"{API_URL}/my-listings")
    no_auth_success = response.status_code == 401 or response.status_code == 403
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Get my listings without authentication (should fail)", no_auth_success, message)
    
    return success and no_auth_success

def test_contact_seller():
    """Test contact seller endpoint"""
    print("\n=== Testing Contact Seller ===")
    
    # Ensure we have at least one listing
    if not test_listings:
        print("No test listings available. Creating one...")
        test_create_listing()
    
    if test_listings:
        listing_id = test_listings[0]["id"]
        
        # Test valid contact request
        contact_data = {
            "listing_id": listing_id,
            "sender_name": "Test Buyer",
            "sender_email": "testbuyer@example.com",
            "message": "I'm interested in your RV. Please contact me."
        }
        
        response = requests.post(f"{API_URL}/contact-seller", json=contact_data)
        success = response.status_code == 200
        message = f"Status: {response.status_code}, Response: {response.text}"
        print_test_result("Contact seller with valid data", success, message)
        
        # Test with invalid listing ID
        invalid_contact = contact_data.copy()
        invalid_contact["listing_id"] = "invalid_id_12345"
        
        response = requests.post(f"{API_URL}/contact-seller", json=invalid_contact)
        invalid_success = response.status_code == 404
        message = f"Status: {response.status_code}, Response: {response.text}"
        print_test_result("Contact seller with invalid listing ID (should fail)", invalid_success, message)
        
        return success and invalid_success
    else:
        print("Failed to create test listings")
        return False

def test_vehicle_types():
    """Test vehicle types endpoint"""
    print("\n=== Testing Vehicle Types ===")
    
    response = requests.get(f"{API_URL}/vehicle-types")
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Get vehicle types", success, message)
    
    if success:
        try:
            types = response.json()
            print(f"Retrieved {len(types)} vehicle types")
            
            # Check if the response contains the expected vehicle types
            expected_types = ["caravan", "motorhome", "camper_van"]
            actual_types = [t["value"] for t in types]
            
            all_types_present = all(t in actual_types for t in expected_types)
            print(f"All expected types present: {all_types_present}")
            success = success and all_types_present
            
        except Exception as e:
            print(f"Error extracting vehicle types data: {e}")
            success = False
    
    return success

def test_stats():
    """Test stats endpoint"""
    print("\n=== Testing Stats ===")
    
    response = requests.get(f"{API_URL}/stats")
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text}"
    print_test_result("Get stats", success, message)
    
    if success:
        try:
            stats = response.json()
            print(f"Stats: {json.dumps(stats, indent=2)}")
            
            # Check if the response contains the expected keys
            expected_keys = ["total_listings", "total_users", "vehicle_counts"]
            all_keys_present = all(k in stats for k in expected_keys)
            print(f"All expected keys present: {all_keys_present}")
            success = success and all_keys_present
            
        except Exception as e:
            print(f"Error extracting stats data: {e}")
            success = False
    
    return success

def test_search_filter():
    """Test search and filter functionality"""
    print("\n=== Testing Search and Filter ===")
    
    # Ensure we have at least one listing
    if not test_listings:
        print("No test listings available. Creating one...")
        test_create_listing()
    
    # Test search by text
    if test_listings:
        listing = test_listings[0]
        search_term = listing["make"]
        
        response = requests.get(f"{API_URL}/listings?search_text={search_term}")
        success = response.status_code == 200
        message = f"Status: {response.status_code}, Response: {response.text[:200]}..."
        print_test_result(f"Search listings with term '{search_term}'", success, message)
        
        if success:
            try:
                search_results = response.json()
                print(f"Found {len(search_results)} listings matching '{search_term}'")
            except Exception as e:
                print(f"Error extracting search results: {e}")
                success = False
        
        # Test price range filter
        min_price = listing["price"] - 10000
        max_price = listing["price"] + 10000
        
        response = requests.get(f"{API_URL}/listings?min_price={min_price}&max_price={max_price}")
        price_success = response.status_code == 200
        message = f"Status: {response.status_code}, Response: {response.text[:200]}..."
        print_test_result(f"Filter listings by price range {min_price}-{max_price}", price_success, message)
        
        if price_success:
            try:
                price_results = response.json()
                print(f"Found {len(price_results)} listings in price range {min_price}-{max_price}")
            except Exception as e:
                print(f"Error extracting price filter results: {e}")
                price_success = False
        
        return success and price_success
    else:
        print("Failed to create test listings")
        return False

def run_all_tests():
    """Run all tests and return overall success status"""
    print("\n======================================")
    print("STARTING RV CLASSIFIEDS API TESTS")
    print("======================================\n")
    print(f"Testing against API URL: {API_URL}")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("======================================\n")
    
    # Authentication tests
    auth_success = test_register_user()
    auth_success = test_login() and auth_success
    auth_success = test_protected_endpoint() and auth_success
    
    # Listings tests
    listings_success = test_create_listing()
    listings_success = test_get_listings() and listings_success
    listings_success = test_get_single_listing() and listings_success
    listings_success = test_get_my_listings() and listings_success
    listings_success = test_search_filter() and listings_success
    
    # Utility tests
    utility_success = test_contact_seller()
    utility_success = test_vehicle_types() and utility_success
    utility_success = test_stats() and utility_success
    
    # Overall results
    print("\n======================================")
    print("TEST RESULTS SUMMARY")
    print("======================================")
    print(f"Authentication Tests: {'PASSED' if auth_success else 'FAILED'}")
    print(f"Listings Tests: {'PASSED' if listings_success else 'FAILED'}")
    print(f"Utility Tests: {'PASSED' if utility_success else 'FAILED'}")
    print("======================================")
    
    overall_success = auth_success and listings_success and utility_success
    print(f"Overall Test Result: {'PASSED' if overall_success else 'FAILED'}")
    print("======================================\n")
    
    return overall_success

if __name__ == "__main__":
    run_all_tests()
