const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

exports.getAnalytics = async (req, res) => {
  try {
    const categories = await Category.find();
    const products = await Product.find().sort({ createdAt: -1 });

    const categoryCounts = {};
    categories.forEach(cat => {
      categoryCounts[cat.name] = products.filter(p => p.category === cat.name).length;
    });
    categoryCounts['Uncategorized'] = products.filter(p => p.category === 'Uncategorized').length;

    const recentProducts = products.slice(0, 5);

    res.json({ categoryCounts, recentProducts, totalProducts: products.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};
