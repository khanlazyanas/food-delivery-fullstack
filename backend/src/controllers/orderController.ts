import { Request, Response } from 'express';
import Order from '../models/Order';

// @desc    Create new order
// @route   POST /api/orders
export const addOrderItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customer,
      items,
      orderType,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total,
      user
    } = req.body;

    if (items && items.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const order = new Order({
      user,
      customer,
      items,
      orderType,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (For Admin)
// @route   GET /api/orders
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (For Admin/Driver)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      // Agar cancel hua hai aur paid tha, toh refund status set karo
      if (status === 'cancelled' && order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded';
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};