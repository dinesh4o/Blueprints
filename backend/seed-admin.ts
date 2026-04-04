import mongoose from 'mongoose';
import { User } from './src/models/User';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Blueprints26DB';

(async () => {
  await mongoose.connect(uri);
  await User.deleteOne({ email: 'admin@blueprints.demo' });
  const u = new User({
    email: 'admin@blueprints.demo',
    name: 'Admin',
    password: 'Admin@1234',
    authProvider: 'local',
    role: 'admin',
    plan: 'organization',
    isActive: true,
  });
  await u.save();
  console.log('Done — admin@blueprints.demo created with password Admin@1234');
  await mongoose.disconnect();
  process.exit(0);
})();
