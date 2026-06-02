import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/userModel.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const user = await User.findByIdAndUpdate(
    '6a1a8aca38c07823fc8aeb51',
    { role: 'worker' },
    { new: true, runValidators: false }
  );
  console.log('Updated user:', user);
  mongoose.disconnect();
});