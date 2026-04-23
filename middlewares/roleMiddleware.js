const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        message: 'Ban khong co quyen truy cap'
      });
    }

    next();
  };
};

module.exports = roleMiddleware;