/**
 * In-memory user store.
 * Users are lost on restart — intentional for this demo service.
 * auth-service is stateless in production (JWT is self-contained).
 */
const users = [];

const findByEmail = (email) => users.find((u) => u.email === email) || null;

const findById = (id) => users.find((u) => u.id === id) || null;

const create = ({ email, name, hashedPassword, role = 'customer' }) => {
  const user = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    password: hashedPassword,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
};

const count = () => users.length;

module.exports = { findByEmail, findById, create, count };
