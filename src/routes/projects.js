const express = require('express')
const pool = require('../config/db')
const authenticate = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')

const router = express.Router()

router.get('/test', async (req, res, next) => {
    try {
        const [rows] = await pool.query(`SELECT p.* FROM projects p`)
        res.json(rows)
    } catch (err) {
        next(err)
    }
})

// GET /api/projects — ดู projects ที่ตัวเองเป็น member
router.get('/', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, pm.role
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY p.created_at DESC`,
            [req.user.userId]
        )
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/projects/:projectId — ดู project เดียว
router.get('/:projectId', authenticate, requireRole('owner', 'member'), async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, u.name AS owner_name, pm.role
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
       WHERE p.id = ?`,
            [req.user.userId, req.params.projectId]
        )
        if (rows.length === 0)
            return res.status(404).json({ message: 'ไม่พบ project' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/projects — สร้าง project ใหม่
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { name, description } = req.body
        if (!name)
            return res.status(400).json({ message: 'กรุณาระบุชื่อ project' })

        const conn = await pool.getConnection()
        try {
            await conn.beginTransaction()

            const [result] = await conn.query(
                'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
                [name, description || null, req.user.userId]
            )
            const projectId = result.insertId

            // เพิ่ม creator เป็น owner ใน project_members อัตโนมัติ
            await conn.query(
                'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
                [projectId, req.user.userId, 'owner']
            )

            await conn.commit()
            res.status(201).json({ message: 'สร้าง project สำเร็จ', projectId })
        } catch (err) {
            await conn.rollback()
            throw err
        } finally {
            conn.release()
        }
    } catch (err) { next(err) }
})

// PATCH /api/projects/:projectId — แก้ไข project
router.patch('/:projectId', authenticate, requireRole('owner'), async (req, res, next) => {
    try {
        const { name, description } = req.body
        await pool.query(
            'UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
            [name || null, description || null, req.params.projectId]
        )
        res.json({ message: 'อัปเดต project สำเร็จ' })
    } catch (err) { next(err) }
})

// DELETE /api/projects/:projectId — ลบ project
router.delete('/:projectId', authenticate, requireRole('owner'), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM projects WHERE id = ?', [req.params.projectId])
        res.json({ message: 'ลบ project สำเร็จ' })
    } catch (err) { next(err) }
})

module.exports = router