const express = require('express');
const cookieParser = require('cookie-parser');
const corsMiddleware = require('../middleware/corsMiddleware');
const authenticateJWT = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const analyticsController = require('../controllers/analyticsController');

const app = express();

app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/check', authenticateJWT, authController.checkAuth);

// Product routes
app.post('/api/products/scan', productController.scanProduct);
app.get('/api/products', productController.getProducts);
app.put('/api/products/:id', productController.updateProductCategory);
app.delete('/api/products/:id', productController.deleteProduct);

// Category routes
app.get('/api/categories', categoryController.getCategories);
app.post('/api/categories', categoryController.createCategory);
app.delete('/api/categories/:name', categoryController.deleteCategory);

// Analytics route
app.get('/api/analytics', analyticsController.getAnalytics);

module.exports = app;
