const express = require('express');
const request = require('supertest');
const { validationResult } = require('express-validator');
const {
  createTransactionRules,
  updateTransactionRules,
} = require('../../middleware/validate.middleware');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }
  next();
};

const app = express();
app.use(express.json());
app.post('/transactions', createTransactionRules, handleValidation, (req, res) =>
  res.json({ ok: true })
);
app.put('/transactions/:id', updateTransactionRules, handleValidation, (req, res) =>
  res.json({ ok: true })
);

describe('Transactions Validate Middleware', () => {
  describe('createTransactionRules', () => {
    it('returns 422 if accountId is missing', async () => {
      const res = await request(app).post('/transactions').send({ type: 'credit', amount: 100 });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/accountId is required/i);
    });

    it('returns 422 if type is invalid', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ accountId: 'a1', type: 'invalid', amount: 100 });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/type must be/i);
    });

    it('returns 422 if amount is negative or zero', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ accountId: 'a1', type: 'credit', amount: 0 });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/amount must be a positive number/i);
    });

    it('returns 200 for valid input', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ accountId: 'a1', type: 'credit', amount: 100 });
      expect(res.status).toBe(200);
    });
  });

  describe('updateTransactionRules', () => {
    it('returns 422 if status is invalid', async () => {
      const res = await request(app).put('/transactions/1').send({ status: 'unknown' });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/status must be/i);
    });

    it('returns 422 if trying to update amount', async () => {
      const res = await request(app).put('/transactions/1').send({ amount: 100 });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/amount cannot be updated/i);
    });

    it('returns 422 if trying to update accountId', async () => {
      const res = await request(app).put('/transactions/1').send({ accountId: 'a2' });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toMatch(/accountId cannot be updated/i);
    });

    it('returns 200 for valid update', async () => {
      const res = await request(app).put('/transactions/1').send({ status: 'completed' });
      expect(res.status).toBe(200);
    });
  });
});
