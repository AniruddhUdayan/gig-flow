import express from 'express';
import { getGigs, createGig, getGigById } from '../controllers/gigController';
import authenticate from '../middleware/auth';

const router = express.Router();

router.get('/', getGigs);
router.post('/', authenticate, createGig);
router.get('/:id', getGigById);

export default router;
