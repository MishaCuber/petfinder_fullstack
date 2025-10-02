import express, { Response } from 'express';
import Favorite from '../models/Favorite.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', auth, async (req: any, res: Response) => {
  try {
    const favorites = await Favorite.find({ user: req.userId })
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'name email' }
      })
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to favorites
router.post('/:postId', auth, async (req: any, res: Response) => {
  try {
    const favorite = new Favorite({
      user: req.userId,
      post: req.params.postId
    });

    await favorite.save();
    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    if ((error as any).code === 11000) {
      return res.status(400).json({ message: 'Already in favorites' });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/:postId', auth, async (req: any, res: Response) => {
  try {
    await Favorite.findOneAndDelete({
      user: req.userId,
      post: req.params.postId
    });
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
