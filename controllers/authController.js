const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { full_name, phone, email, password, role } = req.body;

    if (!full_name || !phone || !password) {
      return res.status(400).json({
        message: 'Vui long nhap day du ho ten, so dien thoai va mat khau'
      });
    }

    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({
        message: 'So dien thoai chi duoc chua chu so'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Mat khau phai co it nhat 6 ky tu'
      });
    }

    const [phoneRows] = await db.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (phoneRows.length > 0) {
      return res.status(400).json({
        message: 'So dien thoai da ton tai'
      });
    }

    if (email) {
      const [emailRows] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (emailRows.length > 0) {
        return res.status(400).json({
          message: 'Email da ton tai'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role === 'admin' ? 'admin' : 'tenant';

    const [result] = await db.query(
      'INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, phone, email || null, hashedPassword, userRole]
    );

    res.status(201).json({
      message: 'Dang ky thanh cong',
      user: {
        id: result.insertId,
        full_name,
        phone,
        email: email || null,
        role: userRole
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      return res.status(400).json({
        message: 'Vui long nhap tai khoan va mat khau'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE phone = ? OR email = ? LIMIT 1',
      [account, account]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: 'Tai khoan khong ton tai'
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Mat khau khong dung'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Dang nhap thanh cong',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, phone, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay nguoi dung'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};