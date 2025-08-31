import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resetUserPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinetra');
    console.log('Connected to MongoDB');

    const email = 'rohan2100254@gmail.com';
    const newPassword = 'rohan123'; // Set your desired password

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    const result = await User.updateOne(
      { email: email.toLowerCase() },
      { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Password updated successfully for ${email}`);
      console.log(`New password: ${newPassword}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }

    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
};

resetUserPassword();
