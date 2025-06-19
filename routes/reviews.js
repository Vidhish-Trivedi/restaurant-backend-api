const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create review for restaurant and delivery
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post('/', auth, authorize('customer'), async (req, res) => {
  try {
    const { 
      orderId, 
      restaurantRating, 
      deliveryRating, 
      restaurantComment, 
      deliveryComment 
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ 
      customer: req.user._id, 
      order: orderId 
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    const review = new Review({
      customer: req.user._id,
      restaurant: order.restaurant,
      order: orderId,
      restaurantRating,
      deliveryRating,
      restaurantComment,
      deliveryComment
    });

    await review.save();

    // Update restaurant rating
    const reviews = await Review.find({ restaurant: order.restaurant });
    const avgRating = reviews.reduce((sum, r) => sum + r.restaurantRating, 0) / reviews.length;
    
    await Restaurant.findByIdAndUpdate(order.restaurant, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': reviews.length
    });

    await review.populate('customer', 'fullName');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reviews/restaurant/{restaurantId}:
 *   get:
 *     summary: Get reviews for a restaurant
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant reviews
 */
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ 
      restaurant: req.params.restaurantId,
      isVisible: true 
    })
      .populate('customer', 'fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ 
      restaurant: req.params.restaurantId,
      isVisible: true 
    });

    res.json({
      reviews,
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

module.exports = router;