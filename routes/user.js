const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')

// 載入 user model
const db = require('../models')
const User = db.User
// 登入頁面
router.get('/login', (req, res) => {
  res.render('login')
})
// 登入檢查
router.post('/login', (req, res, next) => {
  const { email, password } = req.body
  const errors = []
  if (!email || !password) {
    errors.push({ message: '請填寫全部欄位' })
    res.render('login', { errors })
  } else {
    passport.authenticate('local', (err, user, info) => {
      if (err) throw err
      if (user) {
        passport.authenticate('local', { successRedirect: '/' })(req, res, next)
      } else {
        req.flash('warning_msg', info.message)
        return res.redirect('/users/login')
      }
    })(req, res, next)
  }
})
// 註冊頁面
router.get('/register', (req, res) => {
  res.render('register')
})
// 註冊檢查
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body
  // 錯誤訊息提示
  const errors = []
  if (!name || !email || !password || !password2) {
    errors.push({ message: '請填寫全部欄位' })
  }

  if (password !== password2) {
    errors.push({ message: '二次密碼不一致' })
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    })
  } else {
    User.findOne({ where: { email: email } }).then(user => {
      if (user) {
        errors.push({ message: '此 email 已存在' })
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        })
      } else {
        const newUser = new User({ //  如果 email 不存在就直接新增
          name,
          email,
          password
        })

        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err

          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err

            newUser.password = hash
            newUser
              .save()
              .then(user => {
                res.redirect('/') // 新增完成導回首頁
              })
              .catch(err => console.log(err))
          })
        })
      }
    })
  }
})
// 登出
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '你已經成功登出')
  res.redirect('/users/login')
})
module.exports = router
