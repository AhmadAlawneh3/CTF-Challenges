const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const checkAccess = require('../middleware/accessControl');

router.use(authenticateToken);


router.get('/', (req, res) => {
    const cart = req.session.cart || { products: [] }; 
    res.render('cart/index', { cart, title: "Your Cart" });
});


router.post('/add', async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        
        const cart = req.session.cart || { products: [] };

        
        const existingProductIndex = cart.products.findIndex(p => p._id.toString() === productId);
        if (existingProductIndex !== -1) {
            
            cart.products[existingProductIndex].quantity += parseInt(quantity, 10);
        } else {
            
            cart.products.push({ ...product.toObject(), quantity: parseInt(quantity, 10) });
        }

        
        req.session.cart = cart;
        res.redirect('/cart');  
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product to cart' });
    }
});


router.post('/update/:productId', (req, res) => {
    const { productId } = req.params;
    const { quantity, action } = req.body; 

    const cart = req.session.cart || { products: [] };
    const existingProductIndex = cart.products.findIndex(p => p._id.toString() === productId);

    if (existingProductIndex > -1) {
        if (action === 'remove') {
            
            cart.products.splice(existingProductIndex, 1);
        } else {
            
            const newQuantity = parseInt(quantity, 10);
            if (newQuantity > 0) {
                cart.products[existingProductIndex].quantity = newQuantity;
            } else {
                
                cart.products.splice(existingProductIndex, 1);
            }
        }
    }

    
    req.session.cart = cart;
    res.redirect('/cart'); 
});













































module.exports = router;