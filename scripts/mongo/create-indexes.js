db = db.getSiblingDB('data');  // Replace with your actual database name
collection = db.getCollection('parser');  // Replace with your collection name

// Create a unique index on the "url" field
collection.createIndex({ "url": 1 }, {
    unique: true,
    name: "unique_url_index"  // Give the index a descriptive name
});

print("Index creation script completed");