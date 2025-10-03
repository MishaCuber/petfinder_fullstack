import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petfinder';
  const email = process.env.ADMIN_EMAIL || 'admin@petfinder.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Администратор';

  await mongoose.connect(mongoUri);

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, password, name, role: 'admin' });
      await user.save();
      console.log(`[seedAdmin] Создан администратор: ${email}`);
    } else {
      if (user.role !== 'admin') {
        user.role = 'admin';
      }
      // Сброс пароля если задан через env
      if (process.env.RESET_ADMIN_PASSWORD === 'true') {
        user.password = password;
      }
      await user.save();
      console.log(`[seedAdmin] Обновлён администратор: ${email}`);
    }
  } catch (err) {
    console.error('[seedAdmin] Ошибка:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();


