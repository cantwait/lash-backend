const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const categoryRoutes = require('./category.route');
const productRoutes = require('./product.route');
const customerRoutes = require('./customer.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);

module.exports = router;