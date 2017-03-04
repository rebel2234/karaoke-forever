const db = require('sqlite')
const squel = require('squel')
const jwtSign = require('jsonwebtoken').sign
const bcrypt = require('../../thunks/bcrypt')
const KoaRouter = require('koa-router')
const router = KoaRouter()
const debug = require('debug')
const log = debug('app:account')

// list available rooms
router.get('/api/account/rooms', async (ctx, next) => {
  const q = squel.select()
    .from('rooms')
    .where('status = ?', 'open')

  try {
    const { text, values } = q.toParam()
    ctx.body = await db.all(text, values)
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }
})

// login
router.post('/api/account/login', async (ctx, next) => {
  const { email, password, roomId } = ctx.request.body
  let user

  // check presence of all fields
  if (!email || !password || !roomId) {
    ctx.status = 422
    return ctx.body = 'Email, password, and room are required'
  }

  // get user
  try {
    const q = squel.select()
      .from('users')
      .where('email = ?', email.trim().toLowerCase())

    const { text, values } = q.toParam()
    user = await db.get(text, values)
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  // validate password
  if (!user || !await bcrypt.compare(password, user.password)) {
    return ctx.status = 401
  }

  // validate roomId
  try {
    const q = squel.select()
      .from('rooms')
      .where('roomId = ?', roomId)

    const { text, values } = q.toParam()
    const row = await db.get(text, values)

    if (!row || row.status !== 'open') {
      ctx.status = 401
      return ctx.body = 'Invalid Room'
    }
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  delete user.password
  user.roomId = roomId
  user.isAdmin = (user.isAdmin === 1)

  // set httpOnly cookie containing signed JWT
  const token = jwtSign(user, 'shared-secret')
  ctx.cookies.set('id_token', token, {
    httpOnly: true,
  })

  // user JSON as response body
  ctx.body = user
})

// logout
router.get('/api/account/logout', async (ctx, next) => {
  ctx.cookies.set('id_token', '')
  ctx.status = 200
})

// create
router.post('/api/account/create', async (ctx, next) => {
  let {name, email, newPassword, newPasswordConfirm} = ctx.request.body

  name = name.trim()
  email = email.trim().toLowerCase()

  // check presence of all fields
  if (!name || !email || !newPassword || !newPasswordConfirm) {
    ctx.status = 422
    return ctx.body = 'All fields are required'
  }

  // validate email
  if (!validateEmail(email)) {
    ctx.status = 422
    return ctx.body = 'Invalid email address'
  }

  // check for duplicate email
  try {
    const q = squel.select()
      .from('users')
      .where('email = ?', email)

    const { text, values } = q.toParam()

    if (await db.get(text, values)) {
      ctx.status = 401
      return ctx.body = 'Email address is already registered'
    }
  } catch(err) {
    log(err.message)
    return Promise.reject(err)
  }

  // check that passwords match
  if (newPassword !== newPasswordConfirm) {
    ctx.status = 422
    return ctx.body = 'Passwords do not match'
  }

  // hash new password
  let hashedPwd
  try {
    hashedPwd = await bcrypt.hash(newPassword, 10)
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  // insert user
  try {
    const q = squel.insert()
      .into('users')
      .set('email', email)
      .set('password', hashedPwd)
      .set('name', name)

    const { text, values } = q.toParam()
    const res = await db.run(text, values)

    if (res.changes !== 1) {
      throw new Error('insert failed')
    }
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  // @todo: send user creds (log in automatically)
  ctx.status = 200
})

// update
router.post('/api/account/update', async (ctx, next) => {
  let user

  // check jwt validity
  if (!ctx.state.user) {
    ctx.status = 401
    return ctx.body = 'Invalid token'
  }

  // find user by id (from token)
  try {
    const q = squel.select()
      .from('users')
      .where('userId = ?', ctx.state.user.userId)

    const { text, values } = q.toParam()
    user = await db.get(text, values)
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  if (!user) {
    ctx.status = 401
    return ctx.body = 'Invalid user id'
  }

  let { name, email, password, newPassword, newPasswordConfirm } = ctx.request.body

  name = name.trim()
  email = email.trim().toLowerCase()

  // check presence of required fields
  if (!name || !email || !password) {
    ctx.status = 422
    return ctx.body = 'Name, email and current password are required'
  }

  // validate current password
  if (!await bcrypt.compare(password, user.password)) {
    ctx.status = 401
    return ctx.body = 'Current password is incorrect'
  }

  // changing password?
  if (newPassword && newPasswordConfirm) {
    if (newPassword !== newPasswordConfirm) {
      ctx.status = 422
      return ctx.body = 'New passwords do not match'
    }

    try {
      password = await bcrypt.hash(newPassword, 10)
    } catch(err) {
      log(err.message)
      ctx.status = 500
      return Promise.reject(err)
    }
  } else {
    password = user.password
  }

  // validate email
  if (!validateEmail(email)) {
    ctx.status = 422
    return ctx.body = 'Invalid email address'
  }

  // check for duplicate email
  try {
    const q = squel.select()
      .from('users')
      .where('userId != ?', ctx.state.user.userId)
      .where('email = ? COLLATE NOCASE', email)

    const { text, values } = q.toParam()

    if (await db.get(text, values)) {
      ctx.status = 401
      return ctx.body = 'Email address is already registered'
    }
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  // do update!
  try {
    const q = squel.update()
      .table('users')
      .where('userId = ?', ctx.state.user.userId)
      .set('name', name)
      .set('email', email)
      .set('password', password)

    const { text, values } = q.toParam()
    await db.run(text, values)
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  // return user (shape should match /login)
  try {
    const q = squel.select()
      .from('users')
      .where('email = ?', email)

    const { text, values } = q.toParam()
    user = await db.get(text, values)
    if (!user) throw new Error('couldn\'t get updated user')
  } catch(err) {
    log(err.message)
    ctx.status = 500
    return Promise.reject(err)
  }

  delete user.password
  user.roomId = ctx.state.user.roomId
  user.isAdmin = (user.isAdmin === 1)

  // generate new JWT
  const token = jwtSign(user, 'shared-secret')

  // client saves this to localStorage
  ctx.body = { user }
})

module.exports = router

// email validation helper from
// http://www.moreofless.co.uk/validate-email-address-without-regex/
function validateEmail(email) {
  var at = email.indexOf( "@" )
  var dot = email.lastIndexOf( "\." )
  return email.length > 0 &&
         at > 0 &&
         dot > at + 1 &&
         dot < email.length &&
         email[at + 1] !== "." &&
         email.indexOf( " " ) === -1 &&
         email.indexOf( ".." ) === -1
}
