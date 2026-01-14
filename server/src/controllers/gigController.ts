import { Response } from 'express';
import Gig from '../models/Gig';
import { AuthRequest } from '../middleware/auth';

// Get all gigs with optional search
export const getGigs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    let query: any = {};

    // Search by title if search query provided
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new gig
export const createGig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, budget } = req.body;

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user?._id
    });

    const populatedGig = await Gig.findById(gig._id).populate('ownerId', 'name email');

    res.status(201).json(populatedGig);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single gig by ID
export const getGigById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email');

    if (!gig) {
      res.status(404).json({ message: 'Gig not found' });
      return;
    }

    res.json(gig);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
