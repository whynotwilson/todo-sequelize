const express = require('express')
const app = express()
const port = 3000

const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const session = require('express-session')
const passport = require('passport')

const db = require('./models')
const Todo = db.Todo
const User = db.User

app.use(session({
  secret: 'todo-sequelize',
  resave: 'false',
  saveUninitialized: 'false'
}))

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// 設定 passport & session
app.use(passport.initialize())
app.use(passport.session())

require('./config/passport')(passport)

app.use((req, res, next) => {
  res.locals.user = req.user

  // 辨識使用者是否已經登入的變數，讓 View 可以使用
  res.locals.isAuthenticated = req.isAuthenticated()
  next()
})

// 使用路由器
app.use('/', require('./routes/home'))
app.use('/users', require('./routes/user'))
app.use('/todos', require('./routes/todo'))

app.listen(port, () => {
  console.log('app is running......')
})
