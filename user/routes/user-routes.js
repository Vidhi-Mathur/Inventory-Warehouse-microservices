const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')

router.get('/:id', userController.getUser)

router.post('/signup', userController.postSignup)

router.post('/login', userController.postLogin)

router.post('/logout', userController.postLogout)

module.exports = router