import express from 'express';
import { addOrderItems, getOrders, updateOrderStatus } from '../controllers/orderController';

const router = express.Router();

router.route('/')
  .post(addOrderItems)
  .get(getOrders);

router.route('/:id/status')
  .put(updateOrderStatus);

export default router;