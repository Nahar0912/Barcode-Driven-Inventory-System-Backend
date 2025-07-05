const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', authenticateJWT, (req, res) => res.json({ message: 'Authenticated', user: req.user }));

module.exports = router;
