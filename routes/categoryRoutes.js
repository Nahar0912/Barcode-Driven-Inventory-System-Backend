const express = require('express');
const { getCategories, addCategory, deleteCategory } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories);
router.post('/', addCategory);
router.delete('/:name', deleteCategory);

module.exports = router;
