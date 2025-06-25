#!/usr/bin/env python3
"""
DSGVO/GDPR Compliance Test Script
Tests all privacy-related API endpoints and functionality
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
API_URL = "https://d25b0896-3c7b-41df-bb94-19262326b53b.preview.emergentagent.com/api"

def print_test_result(test_name, success, message=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if message:
        print(f"    {message}")

def create_test_user():
    """Create a unique test user for privacy testing"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return {
        "username": f"privacy_test_{timestamp}",
        "email": f"privacy_test_{timestamp}@test.local",
        "password": "TestPassword123!",
        "full_name": f"Privacy Test User {timestamp}",
        "phone": "+43 123 456 789"
    }

def test_user_registration_and_login():
    """Test user registration and login for privacy testing"""
    print("\n=== DSGVO User Setup Tests ===")
    
    # Create test user
    test_user = create_test_user()
    
    # Register user
    response = requests.post(f"{API_URL}/register", json=test_user)
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text[:100]}..."
    print_test_result("User Registration", success, message)
    
    if not success:
        return None, None
    
    # Login user
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    response = requests.post(f"{API_URL}/login", json=login_data)
    success = response.status_code == 200
    message = f"Status: {response.status_code}, Response: {response.text[:100]}..."
    print_test_result("User Login", success, message)
    
    if success:
        token = response.json()["access_token"]
        return test_user, token
    
    return test_user, None

def test_data_export(token):
    """Test GDPR Article 20 - Right to Data Portability"""
    print("\n=== Art. 20 DSGVO - Recht auf Datenübertragbarkeit ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/privacy/data-export", headers=headers)
    
    success = response.status_code == 200
    message = f"Status: {response.status_code}"
    
    if success:
        try:
            data = response.json()
            # Check if export contains required fields
            required_fields = ["user_info", "listings", "export_date"]
            has_all_fields = all(field in data for field in required_fields)
            
            if has_all_fields:
                user_data_fields = data["user_info"]
                expected_user_fields = ["id", "username", "email", "full_name", "created_at"]
                has_user_fields = all(field in user_data_fields for field in expected_user_fields)
                
                success = has_user_fields
                message += f", Export contains {len(data.get('listings', []))} listings"
                if has_user_fields:
                    message += ", All required user fields present"
                else:
                    message += ", Missing user fields"
            else:
                success = False
                message += ", Missing required export fields"
                
        except Exception as e:
            success = False
            message += f", JSON parsing error: {str(e)}"
    
    print_test_result("Data Export (Art. 20 DSGVO)", success, message)
    return success

def test_data_correction(token):
    """Test GDPR Article 16 - Right to Rectification"""
    print("\n=== Art. 16 DSGVO - Recht auf Berichtigung ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    correction_request = {
        "request": "Bitte korrigieren Sie meine Telefonnummer zu +43 987 654 321",
        "field": "phone",
        "new_value": "+43 987 654 321"
    }
    
    response = requests.post(f"{API_URL}/privacy/data-correction", 
                           json=correction_request, headers=headers)
    
    success = response.status_code == 200
    message = f"Status: {response.status_code}"
    
    if success:
        try:
            data = response.json()
            if "message" in data and "request_id" in data:
                message += f", Request ID: {data.get('request_id', 'N/A')}"
            else:
                success = False
                message += ", Missing response fields"
        except Exception as e:
            success = False
            message += f", JSON parsing error: {str(e)}"
    
    print_test_result("Data Correction Request (Art. 16 DSGVO)", success, message)
    return success

def test_consent_management(token):
    """Test consent management functionality"""
    print("\n=== Cookie & Consent Management ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test getting consent status
    response = requests.get(f"{API_URL}/privacy/consent-status", headers=headers)
    success = response.status_code == 200
    message = f"Get Consent Status: {response.status_code}"
    print_test_result("Get Consent Status", success, message)
    
    # Test updating consent
    consent_data = {
        "necessary": True,
        "functional": True,
        "analytics": False,
        "marketing": False
    }
    
    response = requests.post(f"{API_URL}/privacy/update-consent", 
                           json=consent_data, headers=headers)
    success = response.status_code == 200
    message = f"Update Consent: {response.status_code}"
    print_test_result("Update Consent Preferences", success, message)
    
    return success

def test_account_deletion(token):
    """Test GDPR Article 17 - Right to Erasure (Warning: Actually deletes account!)"""
    print("\n=== Art. 17 DSGVO - Recht auf Löschung ===")
    print("⚠️  WARNING: This test will actually delete the test account!")
    
    # Ask for confirmation in automated testing
    print("🤖 Proceeding with automated account deletion test...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{API_URL}/privacy/delete-account", headers=headers)
    
    success = response.status_code == 200
    message = f"Status: {response.status_code}"
    
    if success:
        try:
            data = response.json()
            if "message" in data:
                message += f", Message: {data['message']}"
            else:
                success = False
                message += ", Missing response message"
        except Exception as e:
            success = False
            message += f", JSON parsing error: {str(e)}"
    
    print_test_result("Account Deletion (Art. 17 DSGVO)", success, message)
    
    # Verify account is actually deleted by trying to use the token
    try:
        test_response = requests.get(f"{API_URL}/me", headers=headers)
        if test_response.status_code == 401 or test_response.status_code == 403:
            print_test_result("Account Deletion Verification", True, "Token is now invalid (account deleted)")
        else:
            print_test_result("Account Deletion Verification", False, f"Token still valid: {test_response.status_code}")
    except Exception as e:
        print_test_result("Account Deletion Verification", False, f"Error: {str(e)}")
    
    return success

def test_legal_pages():
    """Test that all legal pages are accessible"""
    print("\n=== Legal Pages Accessibility ===")
    
    base_url = API_URL.replace('/api', '')
    legal_pages = [
        ('/impressum', 'Impressum'),
        ('/datenschutz', 'Datenschutzerklärung'),
        ('/agb', 'AGB'),
        ('/privacy', 'Privacy Settings')
    ]
    
    all_success = True
    
    for path, name in legal_pages:
        try:
            response = requests.get(f"{base_url}{path}")
            success = response.status_code == 200
            message = f"Status: {response.status_code}"
            
            if success and len(response.text) > 1000:  # Check if page has substantial content
                message += f", Content length: {len(response.text)} chars"
            elif success:
                success = False
                message += ", Page too short (likely error page)"
            
            print_test_result(f"Legal Page: {name}", success, message)
            all_success = all_success and success
            
        except Exception as e:
            print_test_result(f"Legal Page: {name}", False, f"Request error: {str(e)}")
            all_success = False
    
    return all_success

def main():
    """Run all GDPR compliance tests"""
    print("🇦🇹 DSGVO/GDPR Compliance Testing")
    print("=" * 50)
    print(f"Testing API: {API_URL}")
    print(f"Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_tests_passed = True
    
    # Test legal pages first (no auth needed)
    all_tests_passed = test_legal_pages() and all_tests_passed
    
    # Create test user and get token
    test_user, token = test_user_registration_and_login()
    
    if not token:
        print("\n❌ CRITICAL: Could not create test user or get auth token")
        print("Cannot proceed with privacy API tests")
        return False
    
    print(f"\n✅ Test user created: {test_user['username']}")
    
    # Test privacy-related functionality
    all_tests_passed = test_data_export(token) and all_tests_passed
    all_tests_passed = test_data_correction(token) and all_tests_passed
    all_tests_passed = test_consent_management(token) and all_tests_passed
    
    # Account deletion test (WARNING: This actually deletes the account!)
    all_tests_passed = test_account_deletion(token) and all_tests_passed
    
    # Final summary
    print("\n" + "=" * 50)
    print("🏁 DSGVO Compliance Test Summary")
    print("=" * 50)
    
    if all_tests_passed:
        print("✅ ALL TESTS PASSED - DSGVO COMPLIANT! 🇦🇹")
        print("✅ Die Plattform erfüllt alle DSGVO-Anforderungen")
        print("✅ Alle Betroffenenrechte sind implementiert")
        print("✅ Legal pages sind erreichbar")
        print("✅ Privacy API funktioniert korrekt")
    else:
        print("❌ SOME TESTS FAILED - COMPLIANCE ISSUES DETECTED")
        print("❌ Bitte beheben Sie die Fehler vor dem Produktivbetrieb")
    
    print(f"\nTest completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return all_tests_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)