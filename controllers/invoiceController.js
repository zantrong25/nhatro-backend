const db = require('../config/db');

exports.getAllInvoices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.tenant_id,
        i.room_id,
        i.month,
        i.year,
        i.room_fee,
        i.electric_fee,
        i.water_fee,
        i.service_fee,
        i.total_amount,
        i.status,
        i.created_at,
        u.full_name,
        u.phone,
        r.room_name
      FROM invoices i
      JOIN tenants t ON i.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN rooms r ON i.room_id = r.id
      ORDER BY i.id DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const {
      tenant_id,
      room_id,
      month,
      year,
      room_fee,
      electric_fee,
      water_fee,
      service_fee
    } = req.body;

    if (!tenant_id || !room_id || !month || !year || room_fee === undefined || room_fee === null) {
      return res.status(400).json({
        message: 'Vui long nhap day du tenant_id, room_id, month, year, room_fee'
      });
    }

    if (isNaN(month) || Number(month) < 1 || Number(month) > 12) {
      return res.status(400).json({
        message: 'Thang phai tu 1 den 12'
      });
    }

    if (isNaN(year) || Number(year) < 2000) {
      return res.status(400).json({
        message: 'Nam khong hop le'
      });
    }

    const fees = [room_fee, electric_fee || 0, water_fee || 0, service_fee || 0];
    for (const fee of fees) {
      if (isNaN(fee) || Number(fee) < 0) {
        return res.status(400).json({
          message: 'Cac khoan phi phai la so va khong am'
        });
      }
    }

    const [tenantRows] = await db.query(
      'SELECT * FROM tenants WHERE id = ?',
      [tenant_id]
    );

    if (tenantRows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay tenant'
      });
    }

    if (Number(tenantRows[0].room_id) !== Number(room_id)) {
      return res.status(400).json({
        message: 'Tenant nay khong thuoc phong da chon'
      });
    }

    const [duplicateRows] = await db.query(
      'SELECT id FROM invoices WHERE tenant_id = ? AND month = ? AND year = ?',
      [tenant_id, month, year]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message: 'Hoa don thang nay da ton tai cho tenant nay'
      });
    }

    const total_amount =
      Number(room_fee) +
      Number(electric_fee || 0) +
      Number(water_fee || 0) +
      Number(service_fee || 0);

    const [result] = await db.query(
      `INSERT INTO invoices 
      (tenant_id, room_id, month, year, room_fee, electric_fee, water_fee, service_fee, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenant_id,
        room_id,
        month,
        year,
        Number(room_fee),
        Number(electric_fee || 0),
        Number(water_fee || 0),
        Number(service_fee || 0),
        total_amount,
        'unpaid'
      ]
    );

    res.status(201).json({
      message: 'Tao hoa don thanh cong',
      invoice: {
        id: result.insertId,
        tenant_id,
        room_id,
        month: Number(month),
        year: Number(year),
        room_fee: Number(room_fee),
        electric_fee: Number(electric_fee || 0),
        water_fee: Number(water_fee || 0),
        service_fee: Number(service_fee || 0),
        total_amount,
        status: 'unpaid'
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unpaid', 'paid'].includes(status)) {
      return res.status(400).json({
        message: 'Trang thai chi duoc la unpaid hoac paid'
      });
    }

    const [invoiceRows] = await db.query(
      'SELECT * FROM invoices WHERE id = ?',
      [id]
    );

    if (invoiceRows.length === 0) {
      return res.status(404).json({
        message: 'Khong tim thay hoa don'
      });
    }

    await db.query(
      'UPDATE invoices SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      message: 'Cap nhat trang thai hoa don thanh cong'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};

exports.getMyInvoices = async (req, res) => {
  try {
    const userId = req.user.id;

    const [tenantRows] = await db.query(
      'SELECT id FROM tenants WHERE user_id = ?',
      [userId]
    );

    if (tenantRows.length === 0) {
      return res.status(404).json({
        message: 'Tai khoan nay chua duoc gan phong'
      });
    }

    const tenantId = tenantRows[0].id;

    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.month,
        i.year,
        i.room_fee,
        i.electric_fee,
        i.water_fee,
        i.service_fee,
        i.total_amount,
        i.status,
        i.created_at,
        r.room_name
      FROM invoices i
      JOIN rooms r ON i.room_id = r.id
      WHERE i.tenant_id = ?
      ORDER BY i.year DESC, i.month DESC, i.id DESC
    `, [tenantId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Loi server',
      error: error.message
    });
  }
};