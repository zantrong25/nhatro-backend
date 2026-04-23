const db = require('../config/db');

exports.getAllRegulations = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM regulations ORDER BY id DESC'
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.createRegulation = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: 'Vui long nhap day du tieu de va noi dung'
      });
    }

    const [result] = await db.query(
      'INSERT INTO regulations (title, content) VALUES (?, ?)',
      [title, content]
    );

    res.status(201).json({
      message: 'Them noi quy thanh cong',
      regulation: {
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

exports.updateRegulation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: 'Vui long nhap day du tieu de va noi dung'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM regulations WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay noi quy'
      });
    }

    await db.query(
      'UPDATE regulations SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );

    res.json({
      message: 'Cap nhat noi quy thanh cong'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.deleteRegulation = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM regulations WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay noi quy'
      });
    }

    await db.query(
      'DELETE FROM regulations WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Xoa noi quy thanh cong'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};