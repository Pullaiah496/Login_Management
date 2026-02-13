const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const multer = require('multer')
const fs = require('fs')

const app = express()
const PORT = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// DB
const db = new sqlite3.Database('./users.db')
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, photo TEXT)")
})

// MULTER setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\\-\\_]/g,'_')
    cb(null, req.body.username + '-' + unique + '-' + safe)
  }
})
const upload = multer({ storage: storage })

// REGISTER (multipart/form-data)
app.post('/register', upload.single('photo'), (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const photo = req.file ? req.file.filename : null

  if (!username || !password) {
    return res.json({ success: false, message: 'Provide username and password' })
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) return res.json({ success: false, message: 'DB error' })
    if (row) {
      // delete uploaded file if user exists
      if (photo) {
        try { fs.unlinkSync(path.join(__dirname, 'uploads', photo)) } catch(e){}
      }
      return res.json({ success: false, message: 'User already exists' })
    }

    db.run("INSERT INTO users (username, password, photo) VALUES (?,?,?)", [username, password, photo], function(err) {
      if (err) return res.json({ success: false, message: 'DB insert error' })
      res.json({ success: true, message: 'Account created' })
    })
  })
})

// LOGIN
app.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) {
    return res.json({ success: false, message: 'Provide username and password' })
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.json({ success: false, message: 'DB error' })
    if (!user) return res.json({ success: false, message: 'User does not exist' })

    if (user.password !== password) return res.json({ success: false, message: 'Incorrect password' })

    res.json({ success: true, message: 'Login successful', username: user.username, photo: user.photo })
  })
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))