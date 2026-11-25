import express from 'express';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController';

const router = express.Router();

router.route('/')
  .get(getMenuItems)      // GET /api/menu
  .post(createMenuItem);  // POST /api/menu

router.route('/:id')
  .put(updateMenuItem)    // PUT /api/menu/:id
  .delete(deleteMenuItem); // DELETE /api/menu/:id

export default router;