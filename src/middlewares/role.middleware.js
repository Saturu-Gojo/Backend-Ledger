const ApiError = require('../utils/ApiError');

// Usage: router.get('/admin/stuff', authMiddleware, roleMiddleware('admin'), handler)
const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  if (!allowedRoles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
  next();
};

module.exports = roleMiddleware;
