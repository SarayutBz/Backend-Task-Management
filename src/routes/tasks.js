const express      = require('express')
const pool         = require('../config/db')
const authenticate = require('../middleware/auth')
const requireRole  = require('../middleware/requireRole')

const router = express.Router()

// GET /api/tasks/:projectId — ดู tasks ทั้งหมดใน project แยกตาม status
router.get('/:projectId', authenticate, requireRole('owner', 'member'), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.project_id = ?
       ORDER BY t.status, t.position`,
      [req.params.projectId]
    )

    // จัดกลุ่มตาม status ให้ frontend เอาไปใช้กับ Kanban ได้เลย
    const board = { todo: [], in_progress: [], done: [] }
    rows.forEach(task => board[task.status].push(task))

    res.json(board)
  } catch (err) { next(err) }
})

// POST /api/tasks/:projectId — สร้าง task ใหม่
router.post('/:projectId', authenticate, requireRole('owner', 'member'), async (req, res, next) => {
  try {
    const { title, description, assignee_id, due_date } = req.body
    if (!title)
      return res.status(400).json({ message: 'กรุณาระบุชื่อ task' })

    // หา position ถัดไปใน column todo
    const [[{ maxPos }]] = await pool.query(
      `SELECT COALESCE(MAX(position), -1) AS maxPos
       FROM tasks WHERE project_id = ? AND status = 'todo'`,
      [req.params.projectId]
    )

    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, assignee_id, title, description, status, due_date, position)
       VALUES (?, ?, ?, ?, 'todo', ?, ?)`,
      [req.params.projectId, assignee_id || null, title, description || null, due_date || null, maxPos + 1]
    )

    res.status(201).json({ message: 'สร้าง task สำเร็จ', taskId: result.insertId })
  } catch (err) { next(err) }
})

// PATCH /api/tasks/:taskId — แก้ไข task (title, description, assignee, due_date)
router.patch('/:taskId', authenticate, async (req, res, next) => {
  try {
    const { title, description, assignee_id, due_date } = req.body
    await pool.query(
      `UPDATE tasks SET
        title       = COALESCE(?, title),
        description = COALESCE(?, description),
        assignee_id = COALESCE(?, assignee_id),
        due_date    = COALESCE(?, due_date)
       WHERE id = ?`,
      [title || null, description || null, assignee_id || null, due_date || null, req.params.taskId]
    )
    res.json({ message: 'อัปเดต task สำเร็จ' })
  } catch (err) { next(err) }
})

// PATCH /api/tasks/:taskId/move — drag card ย้าย status + reorder position
router.patch('/:taskId/move', authenticate, async (req, res, next) => {
  try {
    const { status, position, project_id } = req.body
    if (!status || position === undefined || !project_id)
      return res.status(400).json({ message: 'ข้อมูลไม่ครบ' })

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // เลื่อน position ของ task อื่นใน column ปลายทางให้ขยับลง
      await conn.query(
        `UPDATE tasks SET position = position + 1
         WHERE project_id = ? AND status = ? AND position >= ?`,
        [project_id, status, position]
      )

      // ย้าย task นี้ไปยัง column และ position ใหม่
      await conn.query(
        'UPDATE tasks SET status = ?, position = ? WHERE id = ?',
        [status, position, req.params.taskId]
      )

      await conn.commit()
      res.json({ message: 'ย้าย task สำเร็จ' })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  } catch (err) { next(err) }
})

// DELETE /api/tasks/:taskId — ลบ task
router.delete('/:taskId', authenticate, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.taskId])
    res.json({ message: 'ลบ task สำเร็จ' })
  } catch (err) { next(err) }
})

module.exports = router