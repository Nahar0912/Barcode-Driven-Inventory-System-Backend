const express = require('express');
const { addProductByBarcode, getAllProducts, updateProductCategory } = require('../controllers/productController');

const router = express.Router();

router.post('/add', addProductByBarcode);
router.get('/all', getAllProducts);
router.put('/update-category', updateProductCategory);

module.exports = router;
