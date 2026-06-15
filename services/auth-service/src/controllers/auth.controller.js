const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const store = require('../data/users.store');
const config = require('../config');

const BCRYPT_ROUNDS = 10;

/** Strips password from user object before sending to client. */
const sanitiseUser = ({ id, email, name, role, createdAt }) => ({
  id,
  email,
  name,
  role,
  createdAt,
});

const signAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'auth-service',
    subject: user.id,
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user.id, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'auth-service',
    subject: user.id,
  });

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }

  const { email, password, name } = req.body;

  if (store.findByEmail(email)) {
    return res.status(409).json({ status: 'error', message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = store.create({ email, name, hashedPassword });

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
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = store.findByEmail(email.toLowerCase().trim());

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
};

const refresh = (req, res) => {
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

    const user = store.findById(decoded.id);
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
