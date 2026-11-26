import { Request, Response } from 'express';
import Celebration from '../models/Celebration';

// @desc    Create a new celebration booking
// @route   POST /api/celebrations
export const createCelebration = async (req: Request, res: Response): Promise<void> => {
  try {
    const celebration = new Celebration(req.body);
    const createdCelebration = await celebration.save();
    res.status(201).json(createdCelebration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all celebrations (For Admin)
// @route   GET /api/celebrations
export const getCelebrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const celebrations = await Celebration.find({}).sort({ createdAt: -1 });
    res.json(celebrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update main status (confirm/cancel/complete)
// @route   PUT /api/celebrations/:id/status
export const updateCelebrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const celebration = await Celebration.findById(req.params.id);

    if (celebration) {
      celebration.status = status;
      if (status === 'cancelled' && celebration.paymentStatus === 'paid') {
        celebration.paymentStatus = 'refunded';
      }
      const updated = await celebration.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Celebration not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update preparation status (for Admin)
// @route   PUT /api/celebrations/:id/preparation
export const updatePreparationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { preparationStatus } = req.body;
    const celebration = await Celebration.findById(req.params.id);

    if (celebration) {
      celebration.preparationStatus = preparationStatus;
      const updated = await celebration.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Celebration not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update wishing card status (for Admin)
// @route   PUT /api/celebrations/:id/card
export const updateCardStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cardStatus } = req.body;
    const celebration = await Celebration.findById(req.params.id);

    if (celebration) {
      celebration.cardStatus = cardStatus;
      const updated = await celebration.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Celebration not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};