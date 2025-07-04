const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://anika:pTnhynCIOg4QJc9G@cluster0.o0nwk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const productSchema = new mongoose.Schema({
    material: String,
    barcode: String,
    description: String,
    category: { type: String, default: 'Uncategorized' }
}, { versionKey: false });

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
},{ versionKey: false });

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);

// Product APIs

// Scan and add product
app.post('/api/products/scan', async (req, res) => {
    const { barcode } = req.body;

    try {
        const existingProduct = await Product.findOne({ barcode });
        if (existingProduct) {
            return res.status(200).json({ message: 'Product already exists' });
        }

        const response = await axios.get(`https://products-test-aci.onrender.com/product/${barcode}`);

        if (!response.data.status) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { material, barcode: fetchedBarcode, description } = response.data.product;

        const newProduct = new Product({
            material,
            barcode: fetchedBarcode,
            description
        });

        await newProduct.save();

        res.status(201).json({ message: 'Product saved successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error saving product', error: error.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Update product category
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { category } = req.body;

    try {
        const product = await Product.findByIdAndUpdate(id, { category }, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product category updated', product });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Category APIs----------->

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Add new category
app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;

        const exists = await Category.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({ name });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});

// Delete category
app.delete('/api/categories/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const category = await Category.findOneAndDelete({ name });
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await Product.updateMany({ category: name }, { category: 'Uncategorized' });

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
