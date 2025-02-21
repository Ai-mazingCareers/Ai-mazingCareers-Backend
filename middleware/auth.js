const { getUser } = require('../utils/auth');

async function restrictToLoggedInUsers(req, res, next) {
  const token = req.cookies?.uid;
  const user = getUser(token);
  console.log("WOohooo!!");
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.user=user;
  next();
}

module.exports = { restrictToLoggedInUsers };