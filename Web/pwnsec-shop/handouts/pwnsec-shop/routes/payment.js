const express = require('express');
const router = express.Router();
const checkAccess  = require('../middleware/accessControl'); 
const authenticateToken = require('../middleware/auth');



router.post('/', authenticateToken, checkAccess('createOwn','order'), (req, res) => {
    
    res.send('Payment processed successfully');
});

module.exports = router;
