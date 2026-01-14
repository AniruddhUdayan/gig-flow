import mongoose from 'mongoose';
import { Response } from 'express';
import Bid from '../models/Bid';
import Gig from '../models/Gig';
import { AuthRequest } from '../middleware/auth';

// Submit a bid for a gig
export const createBid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gigId, message, price } = req.body;

    // Check if gig exists and is still open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      res.status(404).json({ message: 'Gig not found' });
      return;
    }

    if (gig.status !== 'open') {
      res.status(400).json({ message: 'This gig is no longer accepting bids' });
      return;
    }

    // Check if user is trying to bid on their own gig
    if (gig.ownerId.toString() === req.user?._id.toString()) {
      res.status(400).json({ message: 'You cannot bid on your own gig' });
      return;
    }

    // Check if user already submitted a bid for this gig
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user?._id
    });

    if (existingBid) {
      res.status(400).json({ message: 'You have already submitted a bid for this gig' });
      return;
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user?._id,
      message,
      price
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    res.status(201).json(populatedBid);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bids for a specific gig (only gig owner can see this)
export const getBidsByGig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      res.status(404).json({ message: 'Gig not found' });
      return;
    }

    // Only gig owner can see bids
    if (gig.ownerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'You are not authorized to view these bids' });
      return;
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Hire a freelancer (BONUS 1: Using MongoDB Transactions)
export const hireBid = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Find the bid and populate gigId
    const bid = await Bid.findById(bidId).populate('gigId').session(session);
    if (!bid) {
      await session.abortTransaction();
      res.status(404).json({ message: 'Bid not found' });
      return;
    }

    const gig: any = bid.gigId;

    // Check if user is the gig owner
    if (gig.ownerId.toString() !== req.user?._id.toString()) {
      await session.abortTransaction();
      res.status(403).json({ message: 'Only the gig owner can hire for this job' });
      return;
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      res.status(400).json({ message: 'This gig has already been assigned' });
      return;
    }

    // Update the gig status to 'assigned'
    await Gig.findByIdAndUpdate(
      gig._id,
      { status: 'assigned' },
      { session }
    );

    // Update the selected bid to 'hired'
    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { session }
    );

    // Reject all other bids for this gig
    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' },
      { session }
    );

    await session.commitTransaction();

    const updatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title description budget');

    // Send real-time notification via Socket.io
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const freelancerSocketId = userSockets.get(bid.freelancerId.toString());

    if (freelancerSocketId) {
      io.to(freelancerSocketId).emit('hired', {
        gigTitle: gig.title
      });
    }

    // Return the hired bid along with gig info
    res.json({
      message: 'Freelancer hired successfully',
      bid: updatedBid,
      gigTitle: gig.title,
      freelancerId: bid.freelancerId
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get user's bids (as a freelancer)
export const getMyBids = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bids = await Bid.find({ freelancerId: req.user?._id })
      .populate('gigId', 'title description budget status')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
