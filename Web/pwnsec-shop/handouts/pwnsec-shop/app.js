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


// Add users and products to the database
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Product = require('./models/Product');


async function createUser(username, password, role) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  await user.save();
  console.log(`${username} created successfully`);
  return user;
}

async function createProduct(name, description, price, category, stock, image, vendorId, status) {
  const product = new Product({ name, description, price, category, stock, image, vendor: vendorId, status });
  await product.save();
  console.log(`${name} created successfully`);
  return product;
}

async function initializeData() {
  try {
    // Users
    const vendor = await createUser("pwnsec_vendor", crypto.randomBytes(32).toString('hex'), "vendor");
    const admin = await createUser("pwnsec_admin", crypto.randomBytes(32).toString('hex'), "admin");

    // Products
    await createProduct('PwnSec T-Shirt', 'T-Shirt', 10.99, 'Clothes', 100, '/images/tshirt.webp', vendor._id, 'approved');
    await createProduct('PwnSec Mug', 'Mug', 14.99, 'Accessories', 100, '/images/mug.webp', vendor._id, 'approved');
    await createProduct('PwnSec Hoodie', 'Hoodie', 30.99, 'Clothes', 100, '/images/hoodie.jpg', vendor._id, 'approved');
    await createProduct('Water Bottle', 'Water Bottle', 20.99, 'Accessories', 200, '/images/water_bottle.jpg', vendor._id, 'approved');
    await createProduct('Mouse Pad', 'Mouse Pad', 9.99, 'Accessories', 300, '/images/mousepad.webp', vendor._id, 'approved');
    await createProduct('Fake Flag', 'Just a fake flag', 10.99, 'Flag', 100, '/images/fakeflag.webp', vendor._id, 'approved');
    // await createProduct('PwnSec Sticker', 'Sticker', 10.99, 'Accessories', 100, '/images/sticker.webp', vendor._id, 'approved');
    // await createProduct('PwnSec Hat', 'Hat', 10.99, 'Accessories', 100, '/images/hat.webp', vendor._id, 'approved');
    // await createProduct('PwnSec Socks', 'Socks', 10.99, 'Clothes', 100, '/images/socks.webp', vendor._id, 'approved');
    // await createProduct('PwnSec Backpack', 'Backpack', 10.99, 'Accessories', 100, '/images/backpack.webp', vendor._id, 'approved');
    // await createProduct('PwnSec Keychain', 'Keychain', 10.99, 'Accessories', 100, '/images/keychain.webp', vendor._id, 'approved');
    // await createProduct('PwnSec Phone Case', 'Phone Case', 10.99, 'Accessories', 100, '/images/phonecase.webp', vendor._id, 'approved');
    // await createProduct('PwnSec Poster', 'Poster', 10.99, 'Accessories', 100, '/images/poster.webp', vendor._id, 'approved');

  } catch (error) {
    console.error('Error creating user or product:', error);
  }
}

// Call the async function to initialize data
initializeData();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
