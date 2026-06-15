const express = require('express');
const { register, login, refresh } = require('../controllers/auth.controller');
const { registerRules, loginRules, refreshRules } = require('../middleware/validate.middleware');

const router = express.Router();

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/refresh', refreshRules, refresh);

module.exports = router;
