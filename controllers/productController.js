const axios = require('axios');
const Product = require('../models/Product');

// Add product by barcode
const addProductByBarcode = async (req, res) => {
    const { barcode } = req.body;
    try {
        // Check if already exists
        const existingProduct = await Product.findOne({ barcode });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product already exists.' });
        }

        // Fetch product details from external API
        const response = await axios.get(`http://localhost:5000/product/${barcode}`);
        const productData = response.data;

        const newProduct = new Product({
            barcode,
            name: `Test Product ${barcode}`,
            description: 'This is a dummy product description.',
            price: Math.floor(Math.random() * 1000) + 100,
            image: 'https://via.placeholder.com/150',
            category: 'Uncategorized'
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product data.', error: error.message });
    }
};

// Get all products (with optional category filter)
const getAllProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products.' });
    }
};

// Update product category
const updateProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(id, { category }, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product category.' });
    }
};

module.exports = { addProductByBarcode, getAllProducts, updateProductCategory };
