module.exports = (req, res, next) => {

    if (!req.session.userId) {
        req.session.userId = null;
    }
    if (!req.session.role) {
        req.session.role = 'guest'; 
    }
    if (!req.session.loggedIn) {
        req.session.loggedIn = false;
    }

    res.locals.user = {
        userId: req.session.userId,
        role: req.session.role,
        loggedIn: req.session.loggedIn
    };

    next();
};