db = db.getSiblingDB('pwnsecShop');

// db.createUser({
//   user: 'admin',
//   pwd: 'password',
//   roles: [{ role: 'readWrite', db: 'pwnsecShop' }]
// });

db.users.insertMany([
  { username: 'pwnsec_vendor', password: 'hashed_password', role: 'vendor' },
  { username: 'pwnsec_admin', password: 'hashed_password', role: 'admin' }
]);

const vendor = db.users.findOne({ username: 'pwnsec_vendor' });

db.products.insertMany([
  { name: 'PwnSec T-Shirt', description: 'T-Shirt', price: 10.99, category: 'Clothes', stock: 100, image: '/images/tshirt.webp', status: 'approved', vendor: vendor._id },
  { name: 'PwnSec Mug', description: 'Mug', price: 14.99, category: 'Accessories', stock: 100, image: '/images/mug.webp', status: 'approved', vendor: vendor._id },
  { name: 'PwnSec Hoodie', description: 'Hoodie', price: 30.99, category: 'Clothes', stock: 100, image: '/images/hoodie.jpg', status: 'approved', vendor: vendor._id },
  { name: 'Water Bottle', description: 'Water Bottle', price: 20.99, category: 'Accessories', stock: 200, image: '/images/water_bottle.jpg', status: 'approved', vendor: vendor._id },
  { name: 'Mouse Pad', description: 'Mouse Pad', price: 9.99, category: 'Accessories', stock: 300, image: '/images/mousepad.webp', status: 'approved', vendor: vendor._id },
  { name: 'Fake Flag', description: 'Just a fake flag', price: 10.99, category: 'Flag', stock: 100, image: '/images/fakeflag.webp', status: 'approved', vendor: vendor._id }
]);