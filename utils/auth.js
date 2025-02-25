const jwt = require('jsonwebtoken');

function setUser(user){
    
    return jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } 
      );
}

function getUser(token){
    return jwt.verify(token, JWT_SECRET);

}

function logoutUser(res) {
    res.clearCookie("uid"); // Clear cookie (if using cookies)
    return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {setUser, getUser, logoutUser};