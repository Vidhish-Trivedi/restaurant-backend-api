const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  restaurantRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  deliveryRating: {
    type: Number,
    min: 1,
    max: 5
  },
  restaurantComment: String,
  deliveryComment: String,
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one review per customer per order
reviewSchema.index({ customer: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);