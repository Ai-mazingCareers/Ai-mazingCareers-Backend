const jwt = require('jsonwebtoken');

const secret = "oisjfihrfr"; 
function setUser(user){
    
    const payload = {
        _id: user._id,
        email: user.email,
    }
    return jwt.sign(payload, secret);
}

function getUser(token){
    return jwt.verify(token, secret);

}

module.exports = {setUser, getUser};