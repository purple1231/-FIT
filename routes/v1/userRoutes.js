const express = require('express');
const router = express.Router();
const db = require('../../db/db');

// GET /api/v1/users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM user');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /api/v1/user/:id
router.get('/user/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    if (rows.length) res.json(rows[0]);
    else res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// POST /api/v1/user
router.post('/user', async (req, res) => {
  const { name, age } = req.body;
  if (!name || !age) {
    return res.status(400).json({ error: 'Missing name or age field' });
  }

  try {
    const [result] = await db.query('INSERT INTO user (name, age) VALUES (?, ?)', [name, age]);
    const [newUser] = await db.query('SELECT * FROM user WHERE id = ?', [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// PUT /api/v1/user/:id
router.put('/user/:id', async (req, res) => {
  const id = req.params.id;
  const { name, age } = req.body;

  try {
    const [check] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    if (!check.length) return res.status(404).json({ error: 'User not found' });

    await db.query('UPDATE user SET name = ?, age = ? WHERE id = ?', [name, age, id]);
    const [updated] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {ㄴ
    res.status(500).json({ error: 'DB error' });
  }
});

// DELETE /api/v1/user/:id
router.delete('/user/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [check] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    if (!check.length) return res.status(404).json({ error: 'User not found' });

    await db.query('DELETE FROM user WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
