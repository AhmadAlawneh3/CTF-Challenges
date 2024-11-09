const ac = require('../roles');

const checkAccess = (action,resource ) => {
    return (req, res, next) => {
        const role = req.session.role; 
        if (!role) {
            return res.status(403).send('Access denied: No role specified');
        }

        const permission = ac.can(role)[action](resource);

        if (!permission.granted) {
            return res.status(403).send('Access denied: Insufficient permissions');
        }

        next();
    };
};

module.exports = checkAccess ;
