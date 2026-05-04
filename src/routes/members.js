const express = require('express')
const pool = require('../config/db')
const authenticate = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')

const router = express.Router()

// GET /api/members/:projectId — ดู members ใน project
router.get('/:projectId', authenticate, requireRole('owner', 'member'), async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
            [req.params.projectId]
        )
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/members/:projectId — invite member
router.post('/:projectId', authenticate, requireRole('owner'), async (req, res, next) => {
    try {
        const { email } = req.body
        if (!email)
            return res.status(400).json({ message: 'กรุณาระบุ email' })

        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
        if (users.length === 0)
            return res.status(404).json({ message: 'ไม่พบ user นี้ในระบบ' })

        const userId = users[0].id
        await pool.query(
            'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [req.params.projectId, userId, 'member']
        )
        res.status(201).json({ message: 'เพิ่ม member สำเร็จ' })
    } catch (err) { next(err) }
})

// DELETE /api/members/:projectId/:userId — kick member
router.delete('/:projectId/:userId', authenticate, requireRole('owner'), async (req, res, next) => {
    try {
        await pool.query(
            'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
            [req.params.projectId, req.params.userId]
        )
        res.json({ message: 'ลบ member สำเร็จ' })
    } catch (err) { next(err) }
})

module.exports = router