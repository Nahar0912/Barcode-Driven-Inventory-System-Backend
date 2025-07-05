const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    const products = await Product.find().sort({ createdAt: -1 });

    const categoryCounts = {};
    categories.forEach(cat => {
      categoryCounts[cat.name] = products.filter(product => product.category === cat.name).length;
    });

    categoryCounts['Uncategorized'] = products.filter(product => product.category === 'Uncategorized').length;

    const recentProducts = products.slice(0, 5);

    res.json({
      categoryCounts,
      recentProducts,
      totalProducts: products.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;
