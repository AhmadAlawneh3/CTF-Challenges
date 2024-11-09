const express = require('express');
const router = express.Router();
const checkAccess = require('../middleware/accessControl');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');


router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' });
        res.render('products/index', { title: 'Products', products });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, status: 'approved' });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.render('products/detail', { title: product.name, product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});


router.post('/', authenticateToken, checkAccess('createAny', 'product'), async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
});


router.put('/:id', authenticateToken, checkAccess('updateAny', 'product'), async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
});


router.delete('/:id', authenticateToken, checkAccess('deleteAny', 'product'), async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
});


router.post('/', authenticateToken, checkAccess('createOwn', 'product'), async (req, res) => {
    const productData = req.body; 
    const product = new Product({ ...productData, vendorId: req.session._id }); 

    try {
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product' });
    }
});

module.exports = router;
