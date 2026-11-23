import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

// Token generate karne ka function
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// @desc    Login/Signup User (Phone Number based)
// @route   POST /api/auth/login
export const authUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, role } = req.body;

    if (!phone) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }

    // Check karo user pehle se hai ya nahi
    let user = await User.findOne({ phone });

    if (user) {
      // Agar user hai, toh direct login karwa do
      res.json({
        _id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      // Agar nahi hai, toh naya user bana do (Signup)
      user = await User.create({
        name: name || `User_${phone.slice(-4)}`,
        phone,
        role: role || 'customer',
      });

      res.status(201).json({
        _id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token: generateToken(user.id),
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};