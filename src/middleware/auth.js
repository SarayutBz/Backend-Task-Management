const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    // console.log("authenticateToken : ", authHeader)
    const token = authHeader && authHeader.split(' ')[1]
    // console.log("token : ", token)

    if (!token) {
        return res.sendStatus(401).json({ message: 'Unauthorized' })
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload
        next()
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden' })
    }


}

module.exports = authenticateToken