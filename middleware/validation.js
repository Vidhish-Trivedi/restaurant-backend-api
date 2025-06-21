const Joi = require('joi');

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
    role: Joi.string().valid('customer', 'restaurant_owner', 'delivery_agent').default('customer')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateRestaurant = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required()
    }).required(),
    contact: Joi.object({
      phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
      email: Joi.string().email()
    }).required(),
    cuisineTypes: Joi.array().items(Joi.string()).min(1).required(),
    hours: Joi.object({
      opening: Joi.string().required(),
      closing: Joi.string().required()
    }).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateMenuItem = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    category: Joi.string().required(),
    price: Joi.number().min(0).required(),
    isVegetarian: Joi.boolean(),
    restaurantId: Joi.string().optional(),
    tags: Joi.array().items(Joi.string())
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = {
  validateUser,
  validateLogin,
  validateRestaurant,
  validateMenuItem
};