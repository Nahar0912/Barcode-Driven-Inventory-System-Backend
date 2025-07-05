const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5000;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware
app.use(cookieParser());
app.use(express.json());

// Set manual headers for CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// MongoDB connection
mongoose.connect('mongodb+srv://anika:pTnhynCIOg4QJc9G@cluster0.o0nwk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT Secret
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Schemas
const productSchema = new mongoose.Schema({
  material: String,
  barcode: String,
  description: String,
  category: { type: String, default: 'Uncategorized' }
}, { versionKey: false, timestamps: true }); 

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { versionKey: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { versionKey: false });

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const User = mongoose.model('User', userSchema);

// Auth middleware
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ email, passwordHash });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }).json({ message: 'Registered and logged in successfully' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    }).json({ message: 'Login successful' });

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
});

app.get('/api/auth/check', authenticateJWT, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

// PRODUCT ROUTES
app.post('/api/products/scan', async (req, res) => {
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

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
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

// CATEGORY ROUTES
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

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

// ANALYTICS ROUTE
app.get('/api/analytics', async (req, res) => {
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

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
