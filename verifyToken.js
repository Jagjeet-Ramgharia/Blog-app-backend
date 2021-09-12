const jwt = require("jsonwebtoken");

function verify(req, res, next) {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1].toString();

    jwt.verify(token, process.env.SECREATE_KEY, (err, user) => {
      if (err) {
        res.status(403).json("Token not valid!");
        console.log(err);
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated");
  }
}

module.exports = verify;
