const co = require('co');
const connection = require('../../../JOS/DALMYSQLConnection');
const query = require('../../queries/qAuthenticate/AuthenticateQuery');
const Query = require('../../queries/qEmployeeManagement/EmployeeManagementQuery');
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

  const { userName, roleId, loginName, bAccess, limit, offset } = req.body;

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
      if (bAccess === "read") {
        quer += " AND access.bAccessHrms = 0";
      }
      if (bAccess === "write") {
        quer += " AND access.bAccessHrms = 1";
      }
      if (bAccess === "none") {
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

exports.updateUser = async (req, res) => {
  let mysqlDB;
  let user;

  // Connect to the database
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to the database" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error connecting to the database",
      error: error.message,
    });
  }

  const { loginId, bAccess } = req.body;

  // Validate request data
  if (!loginId || bAccess === undefined || bAccess === null) {
    return res.status(400).json({
      status: false,
      message: "All fields are required",
    });
  }

  // Check if the user exists in the database
  try {
    user = await connection.query(mysqlDB, query.checkUser, [loginId]);
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message || "Error querying the database",
    });
  }

  // Update or insert the user
  try {
    if (user.length === 0) {
      // If the user does not exist, insert a new user
      if (bAccess === "noAccess") {
        await connection.query(mysqlDB, query.insertUserNull, [
          null,
          req.user.username,
          loginId,
        ]);
      } else {
        await connection.query(mysqlDB, query.insertUser, [
          bAccess,
          req.user.username,
          loginId,
        ]);
      }
    } else {
      // If the user exists, update the existing user
      if (bAccess === "noAccess") {
        await connection.query(mysqlDB, query.updateUserNull, [
          null,
          req.user.username,
          loginId,
        ]);
      } else {
        await connection.query(mysqlDB, query.updateUser, [
          bAccess,
          req.user.username,
          loginId,
        ]);
      }
    }

    // Return success response
    return res.status(200).json({
      status: true,
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message || "Error updating the user",
    });
  }
};

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
    let systemUser;
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
        systemUser = false
        //blocking the user access
        if (rows[0].bAccess === null) {
          return ({
            status: false,
            message: "You Are Not Authorized to Open This Site",
          });
        }
      } else {
        systemUser = true
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
        { username: admin.vsLoginName, loginId: admin.pklLoginId, bAccess: admin.bAccess },
        secret,
        { expiresIn: "30d" }
      );

      return ({
        status: true,
        message: "Login successful",
        token: token,
        access: admin.bAccess,
        systemUser: systemUser,
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

  exports.master = co.wrap(async function (postParam) {
    let queryResultObj = {};
    let mysqlCon = null;
    let resultObj = {};
    try {
      try {
        mysqlCon = await connection.getDB();
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (postParam.bankId) {
        try {
          queryResultObj.branch = await connection.query(mysqlCon, Query.branch, [postParam.bankId])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.branch !== null && queryResultObj.branch !== undefined && queryResultObj.branch.length > 0) {
          resultObj.branch = queryResultObj.branch
        }
      }
      if (postParam.branchId) {
        try {
          queryResultObj.ifsc = await connection.query(mysqlCon, Query.ifsc, [postParam.branchId])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.ifsc !== null && queryResultObj.ifsc !== undefined && queryResultObj.ifsc.length > 0) {
          resultObj.ifsc = queryResultObj.ifsc[0].ifsc
        }
      } else {
        try {
          queryResultObj.district = await connection.query(mysqlCon, Query.district, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.district !== null && queryResultObj.district !== undefined && queryResultObj.district.length > 0) {
          resultObj.district = queryResultObj.district
        }
        try {
          queryResultObj.gender = await connection.query(mysqlCon, Query.gender, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.gender !== null && queryResultObj.gender !== undefined && queryResultObj.gender.length > 0) {
          resultObj.gender = queryResultObj.gender
        }
        try {
          queryResultObj.caste = await connection.query(mysqlCon, Query.caste, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.caste !== null && queryResultObj.caste !== undefined && queryResultObj.caste.length > 0) {
          resultObj.caste = queryResultObj.caste
        }
  
        try {
          queryResultObj.idType = await connection.query(mysqlCon, Query.idType, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.idType !== null && queryResultObj.idType !== undefined && queryResultObj.idType.length > 0) {
          resultObj.idType = queryResultObj.idType
        }
  
        try {
          queryResultObj.marital = await connection.query(mysqlCon, Query.marital, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.marital !== null && queryResultObj.marital !== undefined && queryResultObj.marital.length > 0) {
          resultObj.marital = queryResultObj.marital
        }
  
        try {
          queryResultObj.religion = await connection.query(mysqlCon, Query.religion, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.religion !== null && queryResultObj.religion !== undefined && queryResultObj.religion.length > 0) {
          resultObj.religion = queryResultObj.religion
        }
        try {
          queryResultObj.blood = await connection.query(mysqlCon, Query.blood, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.blood !== null && queryResultObj.blood !== undefined && queryResultObj.blood.length > 0) {
          resultObj.blood = queryResultObj.blood
        }
        try {
          queryResultObj.state = await connection.query(mysqlCon, Query.state, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.state !== null && queryResultObj.state !== undefined && queryResultObj.state.length > 0) {
          resultObj.state = queryResultObj.state
        }
        try {
          queryResultObj.relationship = await connection.query(mysqlCon, Query.relationship, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.relationship !== null && queryResultObj.relationship !== undefined && queryResultObj.relationship.length > 0) {
          resultObj.relationship = queryResultObj.relationship
        }
        try {
          queryResultObj.qualification = await connection.query(mysqlCon, Query.qualification, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.qualification !== null && queryResultObj.qualification !== undefined && queryResultObj.qualification.length > 0) {
          resultObj.qualification = queryResultObj.qualification
        }
        
        try {
          queryResultObj.designation = await connection.query(mysqlCon, Query.designation, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.designation !== null && queryResultObj.designation !== undefined && queryResultObj.designation.length > 0) {
          resultObj.designation = queryResultObj.designation
        }
        try {
          queryResultObj.bank = await connection.query(mysqlCon, Query.bank, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.bank !== null && queryResultObj.bank !== undefined && queryResultObj.bank.length > 0) {
          resultObj.bank = queryResultObj.bank
        }
        try {
          queryResultObj.location = await connection.query(mysqlCon, Query.location, [])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        if (queryResultObj.location !== null && queryResultObj.location !== undefined && queryResultObj.location.length > 0) {
          resultObj.location = queryResultObj.location
        }
        
      }
      if (queryResultObj.prefetch) {
        resultObj.formDisabled = true
        resultObj.prefetch = queryResultObj.prefetch
      }
      if (!queryResultObj.prefetch) {
        resultObj.formDisabled = false
      }
      resultObj.status = "success"
      return resultObj;
    } catch (error) {
      console.error(error)
      throw error;
    } finally {
      if (mysqlCon !== null) {
        mysqlCon.release();
      }
      if (queryResultObj !== null) {
        queryResultObj = null;
      }
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


