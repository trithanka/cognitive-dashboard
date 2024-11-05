const co = require('co');
const connection = require('../../../JOS/DALMYSQLConnection');
const query = require('../../queries/qAuthenticate/AuthenticateQuery');
const { createHash } = require('node:crypto');
const crypto = require("crypto")

var jwt = require('jsonwebtoken');
const secret = "3nc4ypt!0n"

function encrypt(data) {
  const cipher = crypto.createCipher(
    "aes256",
    "3ncryp7i0n"
  );
  let encrypted = cipher.update("" + data, "utf8", "hex") + cipher.final("hex");
  return encrypted;
};

function CreateDBHash(plainText) {
  const hash = createHash('sha256');
  hash.update(plainText)
  return hash.digest('hex')
}

function CleanSQLObject(SQLObject) {
  return JSON.parse(JSON.stringify(SQLObject))
}

exports.login = co.wrap(async function (postParam) {

  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Authenticate-10');
    }
    // console.log()
    try {
      try {
        queryResultObj.loginValid = await connection.query(mysqlDB, query.loginValid, [postParam.username, CreateDBHash(postParam.password)])
      } catch (error) {
        console.log(error)
        throw new Error('Internal Server Error Dashboard-20');
      }

      if (queryResultObj.loginValid !== null && queryResultObj.loginValid !== undefined && queryResultObj.loginValid.length > 0) {
        if (queryResultObj.loginValid[0].count === 1) {
          queryResultObj.loginDetails = await connection.query(mysqlDB, query.loginDetails, [postParam.username])
          // console.log("queryResultObj.loginValid...............", queryResultObj.loginDetails[0]);
          if (queryResultObj.loginDetails !== null && queryResultObj.loginDetails !== undefined && queryResultObj.loginDetails.length > 0)
            resultObj.token = jwt.sign(CleanSQLObject(queryResultObj.loginDetails[0]), secret, { expiresIn: '1d' });
          resultObj.message = 'Login Successful...'
          resultObj.status = "success"
        } else {
          resultObj.message = 'Invalid Credentials'
          resultObj.status = "failed"
        }

      } else {
        resultObj.message = "Invalid Login Details"
        resultObj.status = "failed"
      }

    } catch (error) {
      console.log(error)
      resultObj.message = error.message
      resultObj.status = "error"
    }


    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Authenticate-40');
  } finally {
    mysqlDB.release()
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
exports.getAllUser = async (req, res) => {
  let mysqlDB;
  try {
      mysqlDB = await connection.getDB();
      if (!mysqlDB) {
          return res
              .status(500)
              .json({ status: false, message: "Error connecting to db" });
      }
  } catch (error) {
      return res
          .status(500)
          .json({
              status: false,
              message: "Error connecting to db",
              error: error.message,
          });
  }

  const { userName, roleId, loginName, bAccess , limit ,offset } = req.body;

  try {
      // Base query
      let quer = query.getAllUser;

      const params = [];

      // Add conditions based on provided parameters
      if (roleId) {
          quer += " AND role.pklRoleId = ?";
          params.push(roleId);
      }
      if (userName) {
          quer += " AND enms.vsEntityName LIKE ?";
          params.push(`%${userName}%`);
      }
      if (loginName) {
          quer += " AND loms.vsLoginName LIKE ?";
          params.push(`%${loginName}%`);
      }
      if (bAccess) {
          if(bAccess === "read"){
              quer += " AND access.bAccessHrms = 0";
          }
          if(bAccess === "write"){
              quer += " AND access.bAccessHrms = 1";
          }
          if(bAccess==="none"){
              quer += " AND access.bAccessHrms IS NULL";
          }
      }
      if (limit && offset !== undefined) {
          quer += " LIMIT ? OFFSET ?";
          params.push(parseInt(limit, 10), parseInt(offset, 10));
      }


      const userData = await connection.query(mysqlDB, quer, params);
      if (!userData || userData.length === 0) {
          return res.status(200).json({
              status: false,
              message: "No user found",
          });
      }

      res.status(200).send({
          status: true,
          message: "User retrieved successfully",
          data: userData,
      });

  } catch (error) {
      return res.status(400).json({
          status: false,
          message: error.message || error,
      });
  }
};

exports.updateUser = async(req,res) =>{
  let mysqlDB;
  let user;
  try {
      mysqlDB = await connection.getDB();
      if (!mysqlDB) {
          return res
              .status(500)
              .json({ status: false, message: "Error connecting to db" });
      }
  } catch (error) {
      return res
          .status(500)
          .json({
              status: false,
              message: "Error connecting to db",
              error: error.message,
          });
  }
  const {loginId,bAccess} =req.body

  // console.log("here---", req.user.username)

  if(!loginId || bAccess === undefined || bAccess === null){
      res.status(200).send({
          status: false,
          message: "All Fields are Required"
      });
  }
    user = await connection.query(mysqlDB, query.checkUser, [loginId]);
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message || error,
  });
  }//cheking if user is available in the update table
  try {
  
  try {
    console.log("kfsjfa------------------",user.length)
    if(user.length === 0){
      if (bAccess === "noAccess"){
        await connection.query(mysqlDB, query.insertUserNull, [null,req.user.username,loginId]);
      }else{
          await connection.query(mysqlDB, query.insertUser, [bAccess,req.user.username,loginId]);
      }
      return res.status(200).send({
      status: true,
      message: "User updated successfully"
      });
    }else{
      if (bAccess === "noAccess"){
          await connection.query(mysqlDB, query.updateUserNull, [null,req.user.username,loginId]);
      }else{
          await connection.query(mysqlDB, query.updateUser, [bAccess,req.user.username,loginId]);
      }
      return res.status(200).send({
      status: true,
      message: "User updated successfully"
       });
    }
  } catch (error) {
      return res.status(400).json({
          status: false,
          message: error.message || error,
      });
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////

// exports.loginNew = co.wrap(async function (postParam) {

//   let queryResultObj = {};
//   let resultObj = {};
//   let mysqlDB;
//   try {
//     try {
//       mysqlDB = await connection.getDB();
//     } catch (error) {
//       console.log(error);
//       throw new Error('Internal Server Error Authenticate-10');
//     }
    
//     try {
//       try {
//         queryResultObj.loginValid = await connection.query(mysqlDB, query.loginValidNew, [postParam.username, encrypt(postParam.password)])
//         console.log("queryResultObj.loginValid...............", queryResultObj.loginValid);
//       } catch (error) {
//         console.log(error)
//         throw new Error('Internal Server Error Dashboard-20');
//       }

//       if (queryResultObj.loginValid !== null && queryResultObj.loginValid !== undefined && queryResultObj.loginValid.length > 0) {
//         if (queryResultObj.loginValid[0].count === 1) {

//           queryResultObj.loginDetails = await connection.query(mysqlDB, query.loginDetailsNew, [postParam.username])
//           //check for system user////////////////////////////////////////////////////////////////
//           queryResultObj.loginDetails = await connection.query(mysqlDB, query.checkSystemUser, [postParam.username])
//           if (queryResultObj.loginDetails == null && queryResultObj.loginDetails == undefined && queryResultObj.loginDetails.length == 0){
//             resultObj.message ="You Are Not Authorized to Open This Site"
//           }

//             //////////////////////////////////////////////////////////////////////////////////////
//           console.log("queryResultObj.loginValid...............", queryResultObj.loginDetails[0]);
//           if (queryResultObj.loginDetails !== null && queryResultObj.loginDetails !== undefined && queryResultObj.loginDetails.length > 0)
//             resultObj.token = jwt.sign(CleanSQLObject(queryResultObj.loginDetails[0]), secret, { expiresIn: '1d' });
//           resultObj.message = 'Login Successful...'
//           resultObj.status = "success"
//         } else {
//           resultObj.message = 'Invalid Credentials'
//           resultObj.status = "failed"
//         }

//       } else {
//         resultObj.message = "Invalid Login Details"
//         resultObj.status = "failed"
//       }

//     } catch (error) {
//       console.log(error)
//       resultObj.message = error.message
//       resultObj.status = "error"
//     }


//     return resultObj;
//   } catch (error) {
//     console.log(error);
//     throw new Error('Internal Server Error Authenticate-40');
//   } finally {
//     mysqlDB.release()
//   }
// });

exports.loginNew = co.wrap(async function (postParam) {
  let mysqlDB = await connection.getDB();
  let systemUser ;
  if (!mysqlDB) {
      throw new Error("Error connecting to db");
  }
  console.log(postParam)
  const { username, password } = postParam;

  try {
    //chech user 
      const rows = await connection.query(mysqlDB, query.getAdminbyUsername, [
          username,
      ]);
      if (rows.length === 0) {
        return ({
            status: false,
            message: "Invalid email or password",
        });
    }
      const system = await connection.query(mysqlDB, query.checkSystemUser, [
          username
      ]);
      // console.log("fjfjjfjf",rows[0])
      if (system.length === 0) {
          systemUser=false
          //blocking the user access
          if(rows[0].bAccess === null){
              return ({
                  status: false,
                  message: "You Are Not Authorized to Open This Site",
              });
          }
      }else{
          systemUser=true
      }
      // if (rows.length === 0) {
      //     return ({
      //         status: false,
      //         message: "Invalid email or password",
      //     });
      // }
      const admin = rows[0];

      const encryptedInputPassword = encrypt(password); // Encrypt the input password

      if (encryptedInputPassword !== admin.vsPassword) {
          return ({ status: false, message: "Invalid username or password" });
      }

      //generate token
      const token = jwt.sign(
          { username: admin.vsLoginName, loginId: admin.pklLoginId , bAccess:admin.bAccess},
          secret,
          { expiresIn: "30d" }
      );
      
      return ({
          status: true,
          message: "Login successful",
          token: token,
          access: admin.bAccess,
          systemUser:systemUser,
          name: admin.vsLoginName
      });
  } catch (error) {
      console.error(error);
      return ({
          status: false,
          message: error,
      });
  } finally {
      if (mysqlDB) mysqlDB.release();
  }
});

exports.add = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Authenticate-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Authenticate-40');
  } finally {
    mysqlDB.release()
  }
});

exports.update = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Authenticate-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Authenticate-40');
  } finally {
    mysqlDB.release()
  }
});

exports.delete = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Authenticate-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Authenticate-40');
  } finally {
    mysqlDB.release()
  }
});


