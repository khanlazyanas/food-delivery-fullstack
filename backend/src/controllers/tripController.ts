import { Request, Response } from 'express';
import Driver from '../models/Driver';
import Trip from '../models/Trip';

// ================= DRIVERS =================
export const getDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await Driver.find({});
    res.json(drivers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = new Driver(req.body);
    const createdDriver = await driver.save();
    res.status(201).json(createdDriver);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleDriverStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (driver) {
      driver.isAvailable = !driver.isAvailable;
      await driver.save();
      res.json(driver);
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ================= TRIPS =================
export const getTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const trips = await Trip.find({}).populate('driver').sort({ createdAt: -1 });
    res.json(trips);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = new Trip(req.body);
    const createdTrip = await trip.save();
    res.status(201).json(createdTrip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const assignDriverToTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    const driver = await Driver.findById(driverId);

    if (!trip || !driver) {
      res.status(404).json({ message: 'Trip or Driver not found' });
      return;
    }

    trip.driver = driver._id as any;
    trip.driverInfo = {
      name: driver.name,
      phone: driver.phone,
      vehicleNumber: driver.vehicleNumber,
    };
    trip.status = 'driver-assigned';

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTripStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (trip) {
      trip.status = status;
      if (status === 'cancelled' && trip.paymentStatus === 'paid') {
        trip.paymentStatus = 'refunded';
      }
      const updatedTrip = await trip.save();
      res.json(updatedTrip);
    } else {
      res.status(404).json({ message: 'Trip not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};