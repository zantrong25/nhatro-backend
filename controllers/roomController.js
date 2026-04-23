const db = require('../config/db');

exports.getAllRooms = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id,
        r.room_name,
        r.price,
        r.area,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM tenants t WHERE t.room_id = r.id
          ) THEN 'occupied'
          ELSE 'available'
        END AS status,
        r.description,
        r.created_at
      FROM rooms r
      ORDER BY r.id DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { room_name, price, area, description } = req.body;

    if (!room_name || price === undefined || price === null) {
      return res.status(400).json({
        message: 'Vui long nhap ten phong va gia phong'
      });
    }

    if (isNaN(price) || Number(price) < 0) {
      return res.status(400).json({
        message: 'Gia phong phai la so hop le'
      });
    }

    if (
      area !== undefined &&
      area !== null &&
      area !== '' &&
      (isNaN(area) || Number(area) < 0)
    ) {
      return res.status(400).json({
        message: 'Dien tich phai la so hop le'
      });
    }

    const [result] = await db.query(
      'INSERT INTO rooms (room_name, price, area, status, description) VALUES (?, ?, ?, ?, ?)',
      [
        room_name,
        Number(price),
        area === undefined || area === '' ? null : Number(area),
        'available',
        description || null
      ]
    );

    res.status(201).json({
      message: 'Them phong thanh cong',
      room: {
        id: result.insertId,
        room_name,
        price: Number(price),
        area: area === undefined || area === '' ? null : Number(area),
        status: 'available',
        description: description || null
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_name, price, area, description } = req.body;

    const [roomRows] = await db.query(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay phong'
      });
    }

    if (!room_name || price === undefined || price === null) {
      return res.status(400).json({
        message: 'Vui long nhap ten phong va gia phong'
      });
    }

    if (isNaN(price) || Number(price) < 0) {
      return res.status(400).json({
        message: 'Gia phong phai la so hop le'
      });
    }

    if (
      area !== undefined &&
      area !== null &&
      area !== '' &&
      (isNaN(area) || Number(area) < 0)
    ) {
      return res.status(400).json({
        message: 'Dien tich phai la so hop le'
      });
    }

    const [tenantRows] = await db.query(
      'SELECT id FROM tenants WHERE room_id = ? LIMIT 1',
      [id]
    );

    const autoStatus = tenantRows.length > 0 ? 'occupied' : 'available';

    await db.query(
      'UPDATE rooms SET room_name = ?, price = ?, area = ?, status = ?, description = ? WHERE id = ?',
      [
        room_name,
        Number(price),
        area === undefined || area === '' ? null : Number(area),
        autoStatus,
        description || null,
        id
      ]
    );

    res.json({
      message: 'Cap nhat phong thanh cong'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const [roomRows] = await db.query(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay phong'
      });
    }

    const [tenantRows] = await db.query(
      'SELECT id FROM tenants WHERE room_id = ? LIMIT 1',
      [id]
    );

    if (tenantRows.length > 0) {
      return res.status(400).json({
        message: 'Phong dang co nguoi thue, khong the xoa'
      });
    }

    await db.query(
      'DELETE FROM rooms WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Xoa phong thanh cong'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};