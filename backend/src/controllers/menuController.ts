import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';

// @desc    Get all menu items
// @route   GET /api/menu
export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await MenuItem.find({});
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, image, category, subcategory, isVeg, isBestseller } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      price,
      image,
      category,
      subcategory,
      isVeg,
      isBestseller,
    });

    const createdItem = await menuItem.save();
    res.status(201).json(createdItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, image, category, isAvailable } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      menuItem.name = name || menuItem.name;
      menuItem.description = description || menuItem.description;
      menuItem.price = price || menuItem.price;
      menuItem.image = image || menuItem.image;
      menuItem.category = category || menuItem.category;
      
      // Agar isAvailable update karna ho (for out of stock)
      if (isAvailable !== undefined) {
        menuItem.isAvailable = isAvailable;
      }

      const updatedItem = await menuItem.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      await menuItem.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};