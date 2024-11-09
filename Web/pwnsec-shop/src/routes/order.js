const express = require('express');
const router = express.Router();
const checkAccess = require('../middleware/accessControl');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');


router.get('/', authenticateToken, checkAccess('readOwn', 'order'), async (req, res) => {
    let orders;
    orders = await Order.find({ user: req.session.userId }).populate('products.product');
    res.json(orders);
});     



router.post('/', authenticateToken, checkAccess('createOwn', 'order'), async (req, res) => {
    const { products } = req.body;

    
    if (!products || products.length === 0) {
        return res.status(400).json({ error: 'Invalid order details' });
    }

    try {
        
        let totalAmount = 0;
        const productDetails = [];

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
            }
            // check if quantity is available
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Product ${product.name} is out of stock` });
            }
            // check if quantity is valid
            if (item.quantity <= 0) {
                return res.status(400).json({ error: `Invalid quantity for product ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
            productDetails.push({
                product: product._id, 
                quantity: item.quantity
            });
            // update stock
            product.stock -= item.quantity;
            // save product
            await product.save();
        }

        
        const newOrder = new Order({
            user: req.session.userId,  
            products: productDetails,
            totalAmount: totalAmount
        });

        await newOrder.save();

        
        req.session.cart = { products: [] };

        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});

module.exports = router;
