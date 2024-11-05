const jwt = require('jsonwebtoken');
const secret = "3nc4ypt!0n"

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(401)
    req.user = user
    next()
  })
}

// exports.authorizeRole = (requiredRole) => {
//   return (req, res, next) => {
//       if (requiredRole==req.user.id ) {
//           return res.status(403).send({
//               status: false,
//               message: "You do not have the required role to perform this action"
//           });
//       }
//       next();
//   };
// };

exports.checkRole = (role) => {
  return (req, res, next) => {
      console.log("user",req.user.bAccess);
      console.log("user",req.user);
      if (!role.includes(req.user.bAccess)) {
          return res.status(200).send({
              status: false,
              message: "You Are Not Authorized To Update"
          });
      }
      next();
  };
};

exports.authenticateTokenBypass = (req, res, next) => {
next()
  }