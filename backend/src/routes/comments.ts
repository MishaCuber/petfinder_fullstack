import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create comment
router.post('/', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }),
  body('post').isMongoId()
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = new Comment({
      content: req.body.content,
      post: req.body.post,
      author: req.userId
    });

    await comment.save();
    await comment.populate('author', 'name');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
