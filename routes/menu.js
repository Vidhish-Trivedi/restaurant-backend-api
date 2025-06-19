const express = require('express');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { auth, authorize } = require('../middleware/auth');
const { validateMenuItem } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/menu:
 *   post:
 *     summary: Add menu item (Restaurant Owner only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Menu item created successfully
 */
router.post('/', auth, authorize('restaurant_owner'), validateMenuItem, async (req, res) => {
  try {
    const { restaurantId, ...itemData } = req.body;

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const menuItem = new MenuItem({
      ...itemData,
      restaurant: restaurantId
    });

    await menuItem.save();
    await menuItem.populate('restaurant', 'name');

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     summary: Update menu item (Restaurant Owner only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 */
router.put('/:id', auth, authorize('restaurant_owner'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurant', 'owner');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Menu item updated successfully',
      menuItem: updatedItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     summary: Delete menu item (Restaurant Owner only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 */
router.delete('/:id', auth, authorize('restaurant_owner'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurant', 'owner');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;