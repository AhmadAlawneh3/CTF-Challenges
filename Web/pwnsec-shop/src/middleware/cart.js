module.exports = (req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = { products: [] };
    }
    res.locals.cart = req.session.cart;
    next();
};