const db = require('../config/db');

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT id, full_name, phone, email, role, created_at FROM users WHERE id = ?',
      [userId]
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

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, email } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({
        message: 'Vui long nhap day du ho ten va so dien thoai'
      });
    }

    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({
        message: 'So dien thoai chi duoc chua chu so'
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Email khong dung dinh dang'
        });
      }
    }

    const [userRows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay nguoi dung'
      });
    }

    const [phoneRows] = await db.query(
      'SELECT id FROM users WHERE phone = ? AND id <> ?',
      [phone, userId]
    );

    if (phoneRows.length > 0) {
      return res.status(400).json({
        message: 'So dien thoai da ton tai'
      });
    }

    if (email) {
      const [emailRows] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id <> ?',
        [email, userId]
      );

      if (emailRows.length > 0) {
        return res.status(400).json({
          message: 'Email da ton tai'
        });
      }
    }

    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, email = ? WHERE id = ?',
      [full_name, phone, email || null, userId]
    );

    res.json({
      message: 'Cap nhat thong tin ca nhan thanh cong',
      user: {
        id: userId,
        full_name,
        phone,
        email: email || null,
        role: userRows[0].role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.getMyRoom = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(`
      SELECT
        t.id AS tenant_id,
        t.identity_number,
        t.start_date,
        r.id AS room_id,
        r.room_name,
        r.price,
        r.area,
        r.status,
        r.description
      FROM tenants t
      JOIN rooms r ON t.room_id = r.id
      WHERE t.user_id = ?
      LIMIT 1
    `, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Tai khoan nay chua duoc gan phong'
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