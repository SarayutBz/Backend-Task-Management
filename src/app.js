const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

const router = express.Router()

app.use(cors())
app.use(express.json())

const authenticate = require('./middleware/auth')
const requireRole = require('./middleware/requireRole')


app.get('/', async (req, res) => {
    console.log("you can pass let's goooo")
    res.send('OK')
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/tasks', require('./routes/tasks'))
app.use('/api/members', require('./routes/members'))
app.use('/api/comments', require('./routes/comments'))


app.use((err, req, res, next) => {
    console.log()
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))