import express from 'express';
import {
  getDrivers, createDriver, toggleDriverStatus,
  getTrips, createTrip, assignDriverToTrip, updateTripStatus
} from '../controllers/tripController';

const router = express.Router();

// Driver Routes
router.route('/drivers')
  .get(getDrivers)
  .post(createDriver);

router.route('/drivers/:id/toggle')
  .put(toggleDriverStatus);

// Trip Routes
router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id/assign')
  .put(assignDriverToTrip);

router.route('/:id/status')
  .put(updateTripStatus);

export default router;