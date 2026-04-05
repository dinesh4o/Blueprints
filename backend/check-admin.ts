import mongoose from 'mongoose';
import { User } from './src/models/User';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Blueprints26DB';

(async () => {
  await mongoose.connect(uri);
  const db = mongoose.connection.db?.databaseName;
  console.log('Connected to DB:', db);
  const user = await User.findOne({ email: 'admin@blueprints.demo' }).select('+password');
  if (!user) {
    console.log('User NOT FOUND');
  } else {
    console.log('User found:', user.email, '| role:', user.role, '| authProvider:', user.authProvider, '| hasPassword:', !!user.password);
    const ok = await user.comparePassword('Admin@1234');
    console.log('Password valid:', ok);
  }
  await mongoose.disconnect();
  process.exit(0);
})();
