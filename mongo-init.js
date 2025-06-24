// MongoDB initialization script for production
db = db.getSiblingDB('rv_classifieds');

// Create user for the application with secure password
db.createUser({
  user: 'rvuser',
  pwd: 'SecureRVPass456!',
  roles: [
    {
      role: 'readWrite',
      db: 'rv_classifieds'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('listings');

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.listings.createIndex({ "seller_id": 1 });
db.listings.createIndex({ "vehicle_type": 1 });
db.listings.createIndex({ "price": 1 });
db.listings.createIndex({ "created_at": -1 });
db.listings.createIndex({ "location.latitude": 1, "location.longitude": 1 });

// Create text index for search functionality
db.listings.createIndex({
  "title": "text",
  "description": "text",
  "vehicle_type": "text",
  "make": "text",
  "model": "text"
});

print('Production database initialized successfully with secure configuration');
