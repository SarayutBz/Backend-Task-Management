const express = require('express')
const pool = require('../config/db')
const authenticate = require('../middleware/auth')

const router = express.Router()

// GET /api/comments/:taskId — ดู comments ของ task
router.get('/:taskId', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT c.*, u.name AS author_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
            [req.params.taskId]
        )
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/comments/:taskId — เพิ่ม comment
router.post('/:taskId', authenticate, async (req, res, next) => {
    try {
        const { body } = req.body
        if (!body)
            return res.status(400).json({ message: 'กรุณาระบุข้อความ' })

        const [result] = await pool.query(
            'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)',
            [req.params.taskId, req.user.userId, body]
        )
        res.status(201).json({ message: 'เพิ่ม comment สำเร็จ', commentId: result.insertId })
    } catch (err) { next(err) }
})

// DELETE /api/comments/:commentId — ลบ comment (เฉพาะเจ้าของ)
router.delete('/:commentId', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [req.params.commentId])
        if (rows.length === 0)
            return res.status(404).json({ message: 'ไม่พบ comment' })
        if (rows[0].user_id !== req.user.userId)
            return res.status(403).json({ message: 'ลบได้เฉพาะ comment ของตัวเองเท่านั้น' })

        await pool.query('DELETE FROM comments WHERE id = ?', [req.params.commentId])
        res.json({ message: 'ลบ comment สำเร็จ' })
    } catch (err) { next(err) }
})

module.exports = router