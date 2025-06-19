const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { auth, authorize } = require('../middleware/auth');
const { validateRestaurant } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant (Restaurant Owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */
router.post('/', auth, authorize('restaurant_owner'), validateRestaurant, async (req, res) => {
  try {
    const restaurant = new Restaurant({
      ...req.body,
      owner: req.user._id
    });

    await restaurant.save();
    await restaurant.populate('owner', 'fullName email');

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants with filters
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: isOpen
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get('/', async (req, res) => {
  try {
    const { cuisine, city, isOpen, page = 1, limit = 10 } = req.query;
    const filters = { isActive: true };

    if (cuisine) filters.cuisineTypes = { $in: [cuisine] };
    if (city) filters['address.city'] = new RegExp(city, 'i');
    if (isOpen !== undefined) filters.isOpen = isOpen === 'true';

    const restaurants = await Restaurant.find(filters)
      .populate('owner', 'fullName')
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Restaurant.countDocuments(filters);

    res.json({
      restaurants,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant details
 */
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'fullName email');

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update restaurant (Owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 */
router.put('/:id', auth, authorize('restaurant_owner'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/restaurants/{id}/menu:
 *   get:
 *     summary: Get restaurant menu
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant menu items
 */
router.get('/:id/menu', async (req, res) => {
  try {
    const { category, isAvailable } = req.query;
    const filters = { restaurant: req.params.id };

    if (category) filters.category = category;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

    const menuItems = await MenuItem.find(filters)
      .sort({ category: 1, name: 1 });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
