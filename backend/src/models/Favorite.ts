import mongoose from 'mongoose';

export interface IFavorite extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique user-post combination
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);
