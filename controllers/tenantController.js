const db = require('../config/db');

exports.getAllTenants = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id,
        t.user_id,
        t.room_id,
        t.identity_number,
        t.start_date,
        u.full_name,
        u.phone,
        u.email,
        r.room_name,
        r.price,
        r.status AS room_status
      FROM tenants t
      JOIN users u ON t.user_id = u.id
      JOIN rooms r ON t.room_id = r.id
      ORDER BY t.id DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.createTenant = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { user_id, room_id, identity_number, start_date } = req.body;

    if (!user_id || !room_id) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Vui long nhap user_id va room_id'
      });
    }

    if (identity_number && !/^\d+$/.test(identity_number)) {
      await connection.rollback();
      return res.status(400).json({
        message: 'CCCD/CMND chi duoc chua chu so'
      });
    }

    const [userRows] = await connection.query(
      'SELECT id, full_name, role FROM users WHERE id = ?',
      [user_id]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Khong tim thay tai khoan nguoi thue'
      });
    }

    if (userRows[0].role !== 'tenant') {
      await connection.rollback();
      return res.status(400).json({
        message: 'Tai khoan nay khong phai tenant'
      });
    }

    const [existTenantRows] = await connection.query(
      'SELECT id FROM tenants WHERE user_id = ?',
      [user_id]
    );

    if (existTenantRows.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Nguoi dung nay da duoc gan vao phong'
      });
    }

    const [roomRows] = await connection.query(
      'SELECT id, room_name, status FROM rooms WHERE id = ?',
      [room_id]
    );

    if (roomRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Khong tim thay phong'
      });
    }

    if (roomRows[0].status === 'occupied') {
      await connection.rollback();
      return res.status(400).json({
        message: 'Phong nay da co nguoi thue'
      });
    }

    const [result] = await connection.query(
      'INSERT INTO tenants (user_id, room_id, identity_number, start_date) VALUES (?, ?, ?, ?)',
      [user_id, room_id, identity_number || null, start_date || null]
    );

    await connection.query(
      'UPDATE rooms SET status = ? WHERE id = ?',
      ['occupied', room_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Them nguoi thue thanh cong',
      tenant: {
        id: result.insertId,
        user_id,
        room_id,
        identity_number: identity_number || null,
        start_date: start_date || null
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

exports.updateTenant = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { user_id, room_id, identity_number, start_date } = req.body;

    if (!user_id || !room_id) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Vui long nhap user_id va room_id'
      });
    }

    if (identity_number && !/^\d+$/.test(identity_number)) {
      await connection.rollback();
      return res.status(400).json({
        message: 'CCCD/CMND chi duoc chua chu so'
      });
    }

    const [tenantRows] = await connection.query(
      'SELECT * FROM tenants WHERE id = ?',
      [id]
    );

    if (tenantRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Khong tim thay nguoi thue'
      });
    }

    const oldTenant = tenantRows[0];
    const oldRoomId = oldTenant.room_id;

    const [userRows] = await connection.query(
      'SELECT id, role FROM users WHERE id = ?',
      [user_id]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Khong tim thay tai khoan nguoi thue'
      });
    }

    if (userRows[0].role !== 'tenant') {
      await connection.rollback();
      return res.status(400).json({
        message: 'Tai khoan nay khong phai tenant'
      });
    }

    const [duplicateRows] = await connection.query(
      'SELECT id FROM tenants WHERE user_id = ? AND id <> ?',
      [user_id, id]
    );

    if (duplicateRows.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Nguoi dung nay da duoc gan vao phong khac'
      });
    }

    const [roomRows] = await connection.query(
      'SELECT id, status FROM rooms WHERE id = ?',
      [room_id]
    );

    if (roomRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Khong tim thay phong'
      });
    }

    if (Number(room_id) !== Number(oldRoomId)) {
      if (roomRows[0].status === 'occupied') {
        await connection.rollback();
        return res.status(400).json({
          message: 'Phong moi da co nguoi thue'
        });
      }
    }

    await connection.query(
      'UPDATE tenants SET user_id = ?, room_id = ?, identity_number = ?, start_date = ? WHERE id = ?',
      [user_id, room_id, identity_number || null, start_date || null, id]
    );

    if (Number(room_id) !== Number(oldRoomId)) {
      await connection.query(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['available', oldRoomId]
      );

      await connection.query(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['occupied', room_id]
      );
    }

    await connection.commit();

    res.json({
      message: 'Cap nhat nguoi thue thanh cong'
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

exports.deleteTenant = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [tenantRows] = await connection.query(
      'SELECT * FROM tenants WHERE id = ?',
      [id]
    );

    if (tenantRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Khong tim thay nguoi thue'
      });
    }

    const roomId = tenantRows[0].room_id;

    await connection.query(
      'DELETE FROM tenants WHERE id = ?',
      [id]
    );

    await connection.query(
      'UPDATE rooms SET status = ? WHERE id = ?',
      ['available', roomId]
    );

    await connection.commit();

    res.json({
      message: 'Xoa nguoi thue thanh cong'
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  } finally {
    connection.release();
  }
};