const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const attachUser = require('./middleware/attachUser');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const crypto = require('crypto');

// Routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin')
const vendorRoutes = require('./routes/vendor');

const app = express();

require('dotenv').config();

// Session
app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
}));

// Middleware
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/payment', paymentRoutes);
app.use('/products', productRoutes);
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);
app.use('/vendor', vendorRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: 'Home Page'});
});

app.use(express.static(path.join('public')));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
