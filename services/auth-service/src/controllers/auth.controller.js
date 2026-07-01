const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const config = require('../config');

const BCRYPT_ROUNDS = 10;

/** Strips password from user object before sending to client. */
const sanitiseUser = (user) => {
  const obj = user.toJSON();
  return obj;
};

const signAccessToken = (user) =>
  jwt.sign({ id: user._id || user.id, email: user.email, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'auth-service',
    subject: String(user._id || user.id),
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id || user.id, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'auth-service',
    subject: String(user._id || user.id),
  });

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ email, name, password: hashedPassword });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.status(201).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.expiresIn,
        user: sanitiseUser(user),
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Constant-time comparison — do not short-circuit on user not found
    // to prevent email enumeration timing attacks
    const dummyHash = '$2a$10$invalidhashtopreventtimingattackonuserenum';
    const passwordToCompare = user ? user.password : dummyHash;
    const isValid = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isValid) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.expiresIn,
        user: sanitiseUser(user),
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const refresh = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }

  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.secret, { issuer: 'auth-service' });

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ status: 'error', message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    const newAccessToken = signAccessToken(user);

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
        expiresIn: config.jwt.expiresIn,
      },
    });
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' });
  }
};

module.exports = { register, login, refresh };
