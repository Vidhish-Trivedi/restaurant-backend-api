const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/agents/me/orders:
 *   get:
 *     summary: Get delivery agent's assigned orders
 *     tags: [Delivery Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent's orders
 */
router.get('/me/orders', auth, authorize('delivery_agent'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filters = { deliveryAgent: req.user._id };

    if (status) filters.status = status;

    const orders = await Order.find(filters)
      .populate('customer', 'fullName mobile')
      .populate('restaurant', 'name address contact')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filters);

    res.json({
      orders,
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
 * /api/agents/me/status:
 *   put:
 *     summary: Update delivery agent availability status
 *     tags: [Delivery Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put('/me/status', auth, authorize('delivery_agent'), async (req, res) => {
  try {
    const { isAvailable, currentLocation } = req.body;
    
    const updates = {};
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (currentLocation) updates.currentLocation = currentLocation;

    const agent = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Status updated successfully',
      agent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/agents/available:
 *   get:
 *     summary: Get available delivery agents (for assignment)
 *     tags: [Delivery Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available agents
 */
router.get('/available', auth, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const agents = await User.find({
      role: 'delivery_agent',
      isAvailable: true,
      isActive: true
    }).select('fullName mobile currentLocation');

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;