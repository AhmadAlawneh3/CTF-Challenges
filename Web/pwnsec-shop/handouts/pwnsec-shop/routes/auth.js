const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const authenticateToken = require('../middleware/auth');


router.get('/register', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/products');
    }
    res.render('auth/register',{ title: 'Register'});
});

router.post('/register', async (req, res) => {
    const { username, password, role, email } = req.body;

    if (role.toLowerCase() !== 'customer' && role.toLowerCase() !== 'vendor') {
        return res.status(400).send('Invalid role. Only "Customer" or "Vendor" roles are allowed.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
        username,
        password: hashedPassword,
        email,
        role: role.toLowerCase()
    });

    try {
        await user.save();
        res.status(201).send('User registered successfully');
        
    } catch (err) {
        res.status(400).send('Error registering user');
    }
});



router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/products');
    }
    res.render('auth/login',{ title: 'Login'});
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).send('Invalid credentials');

    
    
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.userId = user._id;
    req.session.email = user.email;
    req.session.loggedIn = true;
    
    res.send('Logged in successfully');
});


router.get('/logout', authenticateToken, (req, res) => {
    
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
