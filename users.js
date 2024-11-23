const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Route
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email }).then(user => {
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const newUser = new User({
            name,
            email,
            password
        });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) throw err;
            newUser.password = hashedPassword;
            newUser.save().then(user => res.json(user));
        });
    });
});

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }).then(user => {
        if (!user) return res.status(400).json({ msg: 'User does not exist' });

        bcrypt.compare(password, user.password).then(isMatch => {
            if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

            const payload = { id: user._id, name: user.name };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                res.json({ token: `Bearer ${token}` });
            });
        });
    });
});

module.exports = router;
