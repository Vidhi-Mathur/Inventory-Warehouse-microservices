require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongodbStore = require('connect-mongodb-session')(session)
const warehouseRoutes = require('./routes/warehouse-routes')

//Setting views

//Parse
app.use(bodyParser.json())

const store = new MongodbStore({
    uri: process.env.URI,
    collection: 'sessions'
})

app.use(session({
    secret: process.env.SECRET,
    //Not saved on every request. But only is something changes
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true, 
        expiresIn: '1m' 
    },
    store: store
}))

//Forwarding
app.use('/warehouse', warehouseRoutes)

//Error handling
app.use((err, req, res, next) => {
    const code = err.statusCode || 500; 
    const message = err.message || 'Internal Server Error'; 
    return res.status(code).json({ message: message });
});

//DataBase connection/ listen to server
mongoose.connect(process.env.URI).then(() => app.listen(3003, () => console.log('Warehouse running on port 3003'))).catch((err) => console.log(err))