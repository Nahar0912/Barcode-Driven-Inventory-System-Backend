const express = require('express');
const { scanProduct, getProducts, updateProductCategory, deleteProduct } = require('../controllers/productController');

const router = express.Router();

router.post('/scan', scanProduct);
router.get('/', getProducts);
router.put('/:id', updateProductCategory);
router.delete('/:id', deleteProduct);

module.exports = router;
