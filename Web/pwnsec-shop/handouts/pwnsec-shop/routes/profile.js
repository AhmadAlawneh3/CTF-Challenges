const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).render('error', { title: 'Error', message: 'User not found', user });
        }

        res.render('profile/index', { title: 'User Profile', user });
    } catch (error) {
        res.status(500).render('error', { title: 'Error', message: 'An error occurred while fetching user data' });
    }
});


router.post('/', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).render('error', { title: 'Error', message: 'User not found', user });
        }

        Object.keys(req.body).forEach(key => {
            if (key === 'password') {
                user[key] = bcrypt.hashSync(req.body[key], 10);
            } else {
                user[key] = req.body[key];
            }
        });

        await user.save();
        req.session.destroy();
        res.redirect('/auth/login');
    } catch (error) {
        res.status(500).render('error', { title: 'Error', message: 'An error occurred while updating user data' });
    }
});

module.exports = router;