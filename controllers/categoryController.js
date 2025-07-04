const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

// Add new category
exports.addCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const newCategory = new Category({ name });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error adding category' });
    }
};
