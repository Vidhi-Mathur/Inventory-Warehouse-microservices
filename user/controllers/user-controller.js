const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

//If is protected route
exports.protectedRoute = (req, res, next) => {
    try {
        if (req.session.user) next();
        return res.status(401).json({message: 'Unauthorized'});
    } 
    catch(err){
        next(err)
    }
}

exports.postSignup = async(req, res, next) => {
    try {
        const { username, password } = req.body;
        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(200).json({ message: 'User already exist. Try login instead.' });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } 
    catch (err) {
        next(err)
    }
}

exports.postLogin = async(req, res, next) => {
    try {
        const { username, password } = req.body;
        const existingUsername = await User.findOne({ username });
        if (!existingUsername) return res.status(500).json({message: 'No user found'});
        const validPassword = await bcrypt.compare(password, existingUsername.password);
        if (validPassword) {
            req.session.user = existingUsername._id;
            res.status(200).json({ message: 'Logged in successfully' });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } 
    catch (err) {
        next(err)
    }
}

exports.postLogout = (req, res, next) => {
    try {
        if (req.session.user) {
            req.session.destroy(err => {
                if (err) return res.status(500).json({message: 'Can\'t logout, try again later'});
                res.clearCookie('connect.sid');
                res.status(200).json({ message: 'Logged out successfully' });
            });
        } else {
            res.status(401).json({ message: 'Not logged in yet' });
        }
    } catch (err) {
        next(err)
    }
}

exports.getUser = async() => {
    try {
        const id = req.params
        const user = await User.findById(id)
        if(!user) return res.status(404).json({message: 'User not found'})
        res.status(200).json({user})
    }
    catch(err) {
        next(err)
    }
}