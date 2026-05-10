const pool = require('../config/db')


function requireRole(...roles) {

    return async (req, res, next) => {
        try {
            console.log("userId:", req.user.userId)
            console.log("projectId:", req.params.projectId)
            const projectId = req.params.projectId || req.body.projectId
            const [rows] = await pool.query(
                `SELECT role FROM project_members  WHERE project_id = ?  AND user_id = ? `,
                [projectId, req.user.userId]
            )

            if (!rows.length) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            const userRole = rows[0].role

            if (!roles.includes(userRole)) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            next()
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' })
        }
    }
}

module.exports = requireRole