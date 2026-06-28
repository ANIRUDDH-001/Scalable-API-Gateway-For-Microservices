const express = require('express');
const request = require('supertest');
const { validationResult } = require('express-validator');
const { createAccountRules, updateAccountRules } = require('../../middleware/validate.middleware');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }
  next();
};

const app = express();
app.use(express.json());
app.post('/accounts', createAccountRules, handleValidation, (req, res) => res.json({ ok: true }));
app.put('/accounts/:id', updateAccountRules, handleValidation, (req, res) =>
  res.json({ ok: true })
);

describe('Accounts Validate Middleware', () => {
  describe('createAccountRules', () => {
    it('returns 422 if type is invalid', async () => {
      const res = await request(app).post('/accounts').send({ type: 'invalid' });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/type must be/i);
    });

    it('returns 422 if currency is not 3 uppercase letters', async () => {
      const res = await request(app).post('/accounts').send({ type: 'savings', currency: 'us' });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/currency must be/i);
    });

    it('returns 200 for valid input', async () => {
      const res = await request(app).post('/accounts').send({ type: 'savings', currency: 'USD' });
      expect(res.status).toBe(200);
    });
  });

  describe('updateAccountRules', () => {
    it('returns 422 if balance is negative', async () => {
      const res = await request(app).put('/accounts/1').send({ balance: -100 });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/balance must be a positive number/i);
    });

    it('returns 422 if status is invalid', async () => {
      const res = await request(app).put('/accounts/1').send({ status: 'unknown' });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/status must be/i);
    });

    it('returns 422 if trying to update id', async () => {
      const res = await request(app).put('/accounts/1').send({ id: '2' });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/id cannot be updated/i);
    });

    it('returns 200 for valid update', async () => {
      const res = await request(app).put('/accounts/1').send({ balance: 100, status: 'active' });
      expect(res.status).toBe(200);
    });
  });
});
