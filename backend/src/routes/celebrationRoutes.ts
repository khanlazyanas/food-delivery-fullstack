import express from 'express';
import {
  createCelebration,
  getCelebrations,
  updateCelebrationStatus,
  updatePreparationStatus,
  updateCardStatus
} from '../controllers/celebrationController';

const router = express.Router();

router.route('/')
  .get(getCelebrations)
  .post(createCelebration);

router.route('/:id/status')
  .put(updateCelebrationStatus);

router.route('/:id/preparation')
  .put(updatePreparationStatus);

router.route('/:id/card')
  .put(updateCardStatus);

export default router;