import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Additional options for better connection handling
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Set up TTL indexes after connection
    await setupIndexes();
  } catch (error) {
    console.error('Database connection error:', error.message);

    // More specific error handling
    if (error.name === 'MongoNetworkError') {
      console.error('❌ MongoDB is not running or not accessible');
      console.error('💡 Please check if MongoDB service is started');
    }

    process.exit(1);
  }
};

const setupIndexes = async () => {
  try {
    const db = mongoose.connection.db;

    // Create collections if they don't exist
    const collections = ['users', 'posts', 'comments'];
    for (const collName of collections) {
      try {
        await db.createCollection(collName);
        console.log(`✅ Collection ${collName} ready`);
      } catch (_err) {
        // Collection might already exist, ignore error
        console.log(`ℹ️  Collection ${collName} already exists`);
      }
    }

    // Create indexes
    // TTL index for posts (expire after 3 days)
    await db.collection('posts').createIndex(
      { 'expiresAt': 1 },
      { expireAfterSeconds: 0 }
    );

    // TTL index for comments (expire after 3 days)
    await db.collection('comments').createIndex(
      { 'expiresAt': 1 },
      { expireAfterSeconds: 0 }
    );

    // Geospatial index for posts location
    await db.collection('posts').createIndex({ 'location': '2dsphere' });

    // Compound index for efficient queries
    await db.collection('posts').createIndex({
      'status': 1,
      'createdAt': -1
    });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error setting up indexes:', error.message);
  }
};

export default connectDB;
