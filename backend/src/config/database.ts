import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Blueprints26DB';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️  Server will continue without database connection');
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
