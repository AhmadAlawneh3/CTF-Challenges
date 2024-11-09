const express = require('express');
const router = express.Router();
const checkAccess = require('../middleware/accessControl');
const Product = require('../models/Product');
const Order = require('../models/Order');
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');
const ProductRequest = require('../models/ProductRequest');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime');

router.use(authenticateToken);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', checkAccess('readAny', 'product'), async (req, res) => {
   res.redirect('/admin/products');
});


router.get('/products', checkAccess('readAny', 'product'), async (req, res) => {
    try {
        const products = await Product.find().populate('vendor');
        res.render('admin/products', { products, title: 'Manage Products'});
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});


router.post('/products', checkAccess('createAny', 'product'), upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, stock, vendor } = req.body;
        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            vendor, 
            image: req.file ? `/uploads/${req.file.filename}` : null,
            status: 'approved'
        });
        await product.save();
        res.redirect('/admin/');
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});



router.get('/products/new', checkAccess('createAny', 'product'), async (req, res) => {
    
    const vendors = await User.find({ role: 'vendor' });
    res.render('admin/products/new-product', { title: 'Create Product', vendors});
});



router.get('/products/:id/edit', checkAccess('updateAny', 'product'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const vendors = await User.find({ role: 'vendor' });
        res.render('admin/products/edit-product', { title: 'Edit Product', product, vendors });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});


router.post('/products/:id', checkAccess('updateAny', 'product'), upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, stock, status, vendor } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.stock = stock;
        product.status = status;
        product.vendor = vendor;
        if (req.file) {
            product.image = `/uploads/${req.file.filename}`;
        }
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});


router.post('/:id/delete', checkAccess('deleteAny', 'product'), async (req, res) => {
    try {authenticateToken
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/');
    } catch (error) {
        res.status(500).send('Failed to delete product');
    }
});


router.post('/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.stock = stock;
        if (req.file) {
            product.image = `/uploads/${req.file.filename}`;
        }
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});







router.get('/product-requests', checkAccess('readAny', 'product'), async (req, res) => {
    try {
        const pendingRequests = await ProductRequest.find({ status: 'pending' }).populate('product vendor');
        res.render('admin/product-requests', { title: 'Pending Product Requests', pendingRequests });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product requests' });
    }
});


router.post('/product-requests/:id/approve', checkAccess('updateAny', 'product'), async (req, res) => {
    try {
        const request = await ProductRequest.findById(req.params.id).populate('product vendor');
        if (!request) {
            return res.status(404).json({ error: 'Product request not found' });
        }

        request.status = 'approved';
        request.updatedAt = Date.now();
        await request.save();

        const product = await Product.findById(request.product._id);
        product.status = 'approved';
        await product.save();

        res.redirect('/admin/product-requests');
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve product request' });
    }
});


router.post('/product-requests/:id/reject', checkAccess('updateAny', 'product'), async (req, res) => {
    try {
        const request = await ProductRequest.findById(req.params.id).populate('product vendor');
        if (!request) {
            return res.status(404).json({ error: 'Product request not found' });
        }

        request.status = 'rejected';
        request.updatedAt = Date.now();
        await request.save();

        res.redirect('/admin/product-requests');
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject product request' });
    }
});


router.get('/product-requests/:id', authenticateToken, checkAccess('readAny', 'productRequest'), async (req, res) => {
    try {
        const request = await ProductRequest.findById(req.params.id).populate('product').populate('vendor');

        if (!request) {
            return res.status(404).render('error', { title: 'Error', message: 'Product request not found' });
        }

        res.render('admin/product-requests/details', { title: 'Product Request Details', request });
    } catch (error) {
        res.status(500).render('error', { title: 'Error', message: 'An error occurred while fetching product request details' });
    }
});



router.get('/orders', checkAccess('readAny', 'order'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user')
            .populate('products.product')
            .sort({ createdAt: -1 });

        res.render('admin/orders', { title: 'Orders', orders });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});


router.get('/orders/:id', checkAccess('readAny', 'order'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('products.product');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.render('admin/orders/details', { title: 'Order Details', order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});


router.post('/orders/:id/update-status', checkAccess('updateAny', 'order'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = req.body.status;
        order.updatedAt = Date.now();
        await order.save();

        res.redirect(`/admin/orders/${order._id}`);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});



router.get('/product-photos', authenticateToken, checkAccess('readAny', 'product'), (req, res) => {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).render('error', { title: 'Error', message: 'Failed to list product photos' });
        }
        res.render('admin/products/photos', { title: 'Product Photos', files });
    });
});


router.get('/product-photos/view', authenticateToken, checkAccess('readAny', 'product'), (req, res) => {
    const filePath = path.join(__dirname, '../public/uploads', req.query.file);
    fs.readFile(filePath, (err, data) => {
        const mimeType = mime.lookup(filePath);
        res.render('admin/products/view-photo', { title: 'View Photo', content: data.toString('base64'), mimeType });
    });
});



module.exports = router;
