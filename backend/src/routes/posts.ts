import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Favorite from '../models/Favorite.js';
import { auth } from '../middleware/auth.js';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const { type, petType, location, page = 1, limit = 10 } = req.query;
    const query: any = { status: 'active' };

    if (type) query.type = type;
    if (petType) query.petType = new RegExp(petType as string, 'i');
    if (location) query.location = new RegExp(location as string, 'i');

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user', auth, async (req: any, res: Response) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/comments', auth, async (req: any, res: Response) => {
  try {
    const content: string = (req.body?.content || '').toString().trim();
    if (!content || content.length < 1 || content.length > 500) {
      return res.status(400).json({ message: 'Комментарий должен быть от 1 до 500 символов' });
    }

    // Ensure post exists
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      post: req.params.id,
      author: req.userId
    });
    await comment.save();
    await comment.populate('author', 'name');
    res.status(201).json(comment);
  } catch (error) {
    console.error('Create post comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, upload.array('photos', 5), async (req: any, res: Response) => {
  try {
    // Валидация данных
    const { title, description, type, petType, location, contactInfo } = req.body;
    
    if (!title || title.trim().length < 5 || title.trim().length > 200) {
      return res.status(400).json({ message: 'Заголовок должен содержать от 5 до 200 символов' });
    }
    
    if (!description || description.trim().length < 10 || description.trim().length > 2000) {
      return res.status(400).json({ message: 'Описание должно содержать от 10 до 2000 символов' });
    }
    
    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json({ message: 'Тип должен быть "lost" или "found"' });
    }
    
    if (!petType || petType.trim().length < 2) {
      return res.status(400).json({ message: 'Тип животного должен содержать минимум 2 символа' });
    }
    
    if (!location || location.trim().length < 2) {
      return res.status(400).json({ message: 'Местоположение должно содержать минимум 2 символа' });
    }
    
    if (!contactInfo || contactInfo.trim().length < 5) {
      return res.status(400).json({ message: 'Контактная информация должна содержать минимум 5 символов' });
    }

    // Обработка загруженных файлов
    const photos = req.files ? req.files.map((file: any) => `/uploads/${file.filename}`) : [];

    const postData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      petType: req.body.petType,
      breed: req.body.breed || '',
      color: req.body.color || '',
      size: req.body.size || 'medium',
      location: req.body.location,
      contactInfo: req.body.contactInfo,
      photos: photos,
      author: req.userId,
      status: 'active'
    };

    const post = new Post(postData);
    await post.save();
    await post.populate('author', 'name email');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', auth, upload.array('photos', 5), async (req: any, res: Response) => {
  try {
    // Валидация данных
    const { title, description, type, petType, location, contactInfo } = req.body;
    
    if (title && (title.trim().length < 5 || title.trim().length > 200)) {
      return res.status(400).json({ message: 'Заголовок должен содержать от 5 до 200 символов' });
    }
    
    if (description && (description.trim().length < 10 || description.trim().length > 2000)) {
      return res.status(400).json({ message: 'Описание должно содержать от 10 до 2000 символов' });
    }
    
    if (type && !['lost', 'found'].includes(type)) {
      return res.status(400).json({ message: 'Тип должен быть "lost" или "found"' });
    }
    
    if (petType && petType.trim().length < 2) {
      return res.status(400).json({ message: 'Тип животного должен содержать минимум 2 символа' });
    }
    
    if (location && location.trim().length < 2) {
      return res.status(400).json({ message: 'Местоположение должно содержать минимум 2 символа' });
    }
    
    if (contactInfo && contactInfo.trim().length < 5) {
      return res.status(400).json({ message: 'Контактная информация должна содержать минимум 5 символов' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Проверяем, что пользователь является автором поста
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updateData: any = {};
    
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.petType) updateData.petType = req.body.petType;
    if (req.body.breed) updateData.breed = req.body.breed;
    if (req.body.color) updateData.color = req.body.color;
    if (req.body.size) updateData.size = req.body.size;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.contactInfo) updateData.contactInfo = req.body.contactInfo;
    if (req.body.status) updateData.status = req.body.status;

    // Обработка загруженных файлов
    if (req.files && req.files.length > 0) {
      const photos = req.files.map((file: any) => `/uploads/${file.filename}`);
      updateData.photos = photos;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('author', 'name email');

    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Favorites routes
// Add to favorites
router.post('/:id/favorites', auth, async (req: any, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.userId,
      post: req.params.id
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    const favorite = new Favorite({
      user: req.userId,
      post: req.params.id
    });

    await favorite.save();
    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/:id/favorites', auth, async (req: any, res: Response) => {
  try {
    await Favorite.findOneAndDelete({
      user: req.userId,
      post: req.params.id
    });
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if post is in favorites
router.get('/:id/favorites/check', auth, async (req: any, res: Response) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.userId,
      post: req.params.id
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
