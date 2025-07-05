const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');

const router = express.Router();

router.post('/scan', async (req, res) => {
  const { barcode } = req.body;

  try {
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct)
      return res.status(200).json({ message: 'Product already exists' });

    const response = await axios.get(`https://products-test-aci.onrender.com/product/${barcode}`);
    if (!response.data.status)
      return res.status(404).json({ message: 'Product not found' });

    const { material, barcode: fetchedBarcode, description } = response.data.product;

    const newProduct = new Product({ material, barcode: fetchedBarcode, description });
    await newProduct.save();

    res.status(201).json({ message: 'Product saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving product', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(id, { category }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product category updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
