import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const router = express.Router();

// Admin middleware
const adminAuth = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (admin only)
router.get('/posts', auth, adminAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post fields (admin only)
router.patch('/posts/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed: any = {};
    const { title, description, location, petType, breed, color, size, contactInfo, type } = req.body || {};
    if (typeof title === 'string') allowed.title = title;
    if (typeof description === 'string') allowed.description = description;
    if (typeof location === 'string') allowed.location = location;
    if (typeof petType === 'string') allowed.petType = petType;
    if (typeof breed === 'string') allowed.breed = breed;
    if (typeof color === 'string') allowed.color = color;
    if (typeof size === 'string') allowed.size = size;
    if (typeof contactInfo === 'string') allowed.contactInfo = contactInfo;
    if (typeof type === 'string') allowed.type = type;

    const post = await Post.findByIdAndUpdate(id, allowed, { new: true })
      .populate('author', 'name email');
    if (!post) return res.status(404).json({ message: 'Пост не найден' });
    res.json(post);
  } catch (error) {
    console.error('Admin update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post status (admin only)
router.patch('/posts/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус' });
    }

    const post = await Post.findByIdAndUpdate(id, { status }, { new: true })
      .populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }
    res.json(post);
  } catch (error) {
    console.error('Update post status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List comments (admin only)
router.get('/comments', auth, adminAuth, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('author', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment (admin only)
router.delete('/comments/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }
    res.json({ message: 'Комментарий удалён' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics (admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      postsByType,
      postsByStatus,
      recentUsers,
      recentPosts
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Post.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Post.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Post.find().populate('author', 'name email').sort({ createdAt: -1 }).limit(5)
    ]);

    const postsByPetType = await Post.aggregate([
      { $group: { _id: '$petType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const postGrowth = await Post.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const commentGrowth = await Comment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      postsByType,
      postsByStatus,
      postsByPetType,
      userGrowth,
      postGrowth,
      commentGrowth,
      recentUsers,
      recentPosts
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Не позволяем удалить администратора
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Нельзя удалить администратора' });
    }

    // Удаляем пользователя и все его посты
    await Post.deleteMany({ author: id });
    await Comment.deleteMany({ author: id });
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Недопустимая роль' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/Unblock user (admin only)
router.patch('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: !!isBlocked },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post (admin only)
router.delete('/posts/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }
    
    // Удаляем комментарии к посту
    await Comment.deleteMany({ post: id });
    
    res.json({ message: 'Пост успешно удален' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
