const db = require('../config/db');

exports.getAllNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications ORDER BY id DESC'
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: 'Vui long nhap day du tieu de va noi dung'
      });
    }

    const [result] = await db.query(
      'INSERT INTO notifications (title, content) VALUES (?, ?)',
      [title, content]
    );

    res.status(201).json({
      message: 'Them thong bao thanh cong',
      notification: {
        id: result.insertId,
        title,
        content
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: 'Vui long nhap day du tieu de va noi dung'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay thong bao'
      });
    }

    await db.query(
      'UPDATE notifications SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );

    res.json({
      message: 'Cap nhat thong bao thanh cong'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay thong bao'
      });
    }

    await db.query(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Xoa thong bao thanh cong'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};