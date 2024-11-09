const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const ProductRequest = require('../models/ProductRequest');
const checkAccess = require('../middleware/accessControl');
const authenticateToken = require('../middleware/auth');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('', authenticateToken, (req, res) => {
    res.redirect('/vendor/products');
});


router.get('/products/new', authenticateToken, checkAccess('createOwn', 'product'), (req, res) => {
    res.render('vendor/new-product', { title: 'Submit New Product' });
});


router.get('/products', authenticateToken, checkAccess('readOwn', 'product'), async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.session.userId });
        res.render('vendor/products', { title: 'My Products', products });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


router.get('/products/:id/edit', authenticateToken, checkAccess('updateOwn', 'product'), async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, vendor: req.session.userId });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.render('vendor/edit-product', { title: 'Edit Product', product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});


router.post('/products', authenticateToken, checkAccess('createOwn', 'product'), upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            vendor: req.session.userId,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        await product.save();

        const productRequest = new ProductRequest({
            product: product._id,
            vendor: req.session.userId
        });
        await productRequest.save();

        res.redirect('/vendor/products');
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});


router.post('/products/:id/edit', authenticateToken, checkAccess('updateOwn', 'product'), upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productRequest = await ProductRequest.findOne({ product: product._id });
        if (productRequest && productRequest.status === 'approved') {
            return res.status(403).json({ error: 'Cannot update product after approval' });
        }

        
        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.category = req.body.category;
        product.stock = req.body.stock;
        if (req.file) {
            product.image = `/uploads/${req.file.filename}`;
        }

        await product.save();
        res.redirect('/vendor/products');
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});

module.exports = router;