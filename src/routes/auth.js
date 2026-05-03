const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const router = express.Router()

router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name } = req.body
        if (!email || !password, !name)
            return res.status(400).json({ message: 'Please fill out the form.' })

        const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
        if (rows.length > 0)
            return res.status(409).json({ message: 'This email is already in use.' })

        const hash = await bcrypt.hash(password, 10)
        const [result] = await pool.query(
            'INSERT INTO users (email,password_hash,name) VALUES (?,?,?)', [email, hash, name]
        )

        res.status(201).json({ message: 'Register Success', userId: result.insertId })
    } catch (err) {
        console.log("error : ", err)
        next(err)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ message: 'Please fill out the email and password' })

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
        if (row.length === 0)
            return res.status(401).json({ message: 'email or password incorrect' })
        console.log("row : ",[row])
        console.log("row : ",[row])
        const user = rows[0]
        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid)
            return res.status(401).json({ message: 'email or password incorrect' })


        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        })
    } catch (err) {
        console.log("error : ", err)
        next(err)
    }
})

module.exports = router