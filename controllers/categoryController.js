const Category = require('../models/Category');
const Product = require('../models/Product');
const connectDB = require('../utils/db');

exports.getCategories = async (req, res) => {
  try {
    await connectDB();

    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name required' });

  try {
    await connectDB();

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { name } = req.params;

  try {
    await connectDB();

    const category = await Category.findOneAndDelete({ name });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Product.updateMany({ category: name }, { category: 'Uncategorized' });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
