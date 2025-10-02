import mongoose from 'mongoose';

export interface IPost extends mongoose.Document {
  title: string;
  description: string;
  type: 'lost' | 'found';
  petType: string;
  breed?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  location: string;
  contactInfo: string;
  photos: string[];
  author: mongoose.Types.ObjectId;
  status: 'active' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  petType: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  contactInfo: {
    type: String,
    required: true,
    trim: true
  },
  photos: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model<IPost>('Post', postSchema);
