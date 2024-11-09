const express = require('express');
const router = express.Router();
const User = require('../models/User');
const checkAccess = require('../middleware/accessControl');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', checkAccess('readAny','user'), async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


router.get('/:id', checkAccess('readOwn','user'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});


router.put('/:id', checkAccess('updateOwn','user'), async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});


router.delete('/:id', checkAccess('deleteAny','user'), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});



router.patch('/:id', checkAccess('updateOwn', 'user'), async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
});



module.exports = router;
