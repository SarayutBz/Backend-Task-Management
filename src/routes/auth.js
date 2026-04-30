const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const router = express.Router()

router.post('/register',async (req,res,next) =>{
    try{
        const {email,password,name} = req.body
        if (!email || !password, !name) 
            return res.status(400).json({message:'Please fill out the form.'})
        
        const [rows] = await pool.query('SELECT id FROM users WHERE email = ?',[email])
        if(rows.length > 0)
            return res.status(409).json({message:'This email is already in use.'})

        const hash = await bcrypt.hash(password,10)
        const [result] = await pool.query(
            'INSERT INTO users (email,password_hash,name) VALUES (?,?,?)',[email,hash,name]
        )

        res.status(201).json({message:'Register Success',userId:result.insertId })
    } catch(err) {
        console.log("error : ",err)
        next(err)
    }
})


module.exports = router