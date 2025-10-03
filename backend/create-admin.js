import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/petfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Проверяем, есть ли уже админ
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Администратор уже существует:', existingAdmin.email);
      return;
    }

    // Создаем админа
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      email: 'admin@petfinder.com',
      password: hashedPassword,
      name: 'Администратор',
      role: 'admin'
    });

    await admin.save();
    console.log('Администратор создан успешно!');
    console.log('Email: admin@petfinder.com');
    console.log('Пароль: admin123');
  } catch (error) {
    console.error('Ошибка создания администратора:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
