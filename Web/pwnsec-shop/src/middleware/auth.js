const authenticateToken = (req, res, next) => {
    const loggedIn = req.session.loggedIn;
    if (!loggedIn) {
        return res.redirect('/auth/login');
    }
    next();
};

module.exports = authenticateToken;
