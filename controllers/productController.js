const Product = require('../models/productModel');
const axios = require('axios');

exports.scanProduct = async (req, res) => {
  const { barcode } = req.body;

  try {
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) return res.status(200).json({ message: 'Product already exists' });

    const response = await axios.get(`https://products-test-aci.onrender.com/product/${barcode}`);
    if (!response.data.status) return res.status(404).json({ message: 'Product not found' });

    const { material, barcode: fetchedBarcode, description } = response.data.product;

    const newProduct = new Product({ material, barcode: fetchedBarcode, description });
    await newProduct.save();

    res.status(201).json({ message: 'Product saved successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error saving product', error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.updateProductCategory = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { category: req.body.category }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product category updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
