const jwt = require('jsonwebtoken');
const dbOperations = require('../utils/dbOperations');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies) {
    // if cookie exists
    token = req.cookies.token;
  }

  let errors = [];
  if (!token) {
    errors.push({ message: 'Not authorized to access this route' });
    res.render('login', { errors });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await dbOperations.checkUserExistsById(decoded.id);

    let userObj = JSON.stringify(user.rows[0]);
    userObj = JSON.parse(userObj);

    if (userObj.role == 'user') {
      errors.push({ message: 'Not authorized to access this route' });
      res.render('register', {
        errors
      });
    }

    return next();
  } catch (err) {
    errors.push({ message: 'Not authorized to access this route' });
  }

  return res.render('login', errors);
};