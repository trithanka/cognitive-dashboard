const co = require('co');
const connection = require('../../../JOS/DALMYSQLConnection');
const query = require('../../queries/qEmployeeManagement/EmployeeManagementQuery');

exports.get = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.employeeList = await connection.query(mysqlDB, query.employeeList, [])

      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.employeeList !== null && queryResultObj.employeeList !== undefined && queryResultObj.employeeList.length > 0) {
        resultObj.employeeList = queryResultObj.employeeList
      } else {
        resultObj.employeeList = []
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});


exports.getReport = co.wrap(async function (postParam) {
    let queryResultObj = {};
    let resultObj = {}; // Initialize resultObj
    let mysqlDB;

    try {
        try {
            mysqlDB = await connection.getDB();
        } catch (error) {
            console.error(error);
            throw new Error('Internal Server Error EmployeeManagement-10');
        }

        // Extract parameters from postParam
        const { bReleased, designation, locationName, joiningDateStart, joiningDateEnd } = postParam;
        
        // Base query
        let queryStr = `
            SELECT 
            adtl.pklEmpCode AS id, 
            pdtl.vsFirstName AS firstName, 
            IFNULL(pdtl.vsMiddleName, "") AS middleName, 
            pdtl.vsLastName AS lastName,
            pdtl.vsPhoneNumber AS phoneNumber, 
            pdtl.vsEmail AS emailId, 
            dsgn.vsDesignationName AS designation, 
            adtl.vsEmpName AS employeeId, 
            geo.pklLocationId AS locationId, 
            geo.vsGeolocationName AS locationName,
            edtl.dtDateOfJoining AS joiningDate,
            CASE
                WHEN bReleased = 0 THEN 'Active' 
                WHEN bReleased = 1 THEN 'Inactive'
            END AS status
            FROM nw_employee_personal_dtls pdtl 
            LEFT JOIN nw_employee_employment_dtls edtl ON pdtl.pklEmployeeRegId = edtl.fklEmployeeRegId 
            LEFT JOIN nw_staff_attendance_dtl adtl ON pdtl.pklEmployeeRegID = adtl.fklEmployeeRegId
            LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
            LEFT JOIN nw_mams_geolocation geo ON geo.pklLocationId = adtl.fklLocationId
            WHERE 1=1 
        `;

        // Adding filters
        let queryParams = [];

        if (bReleased != null) {
            queryStr += ` AND bReleased = ?`;
            queryParams.push(bReleased);
        }

        if (designation) {
            queryStr += ` AND dsgn.vsDesignationName = ?`;
            queryParams.push(designation);
        }

        if (locationName) {
            queryStr += ` AND geo.vsGeolocationName = ?`;
            queryParams.push(locationName);
        }

        if (joiningDateStart && joiningDateEnd) {
            queryStr += ` AND edtl.dtDateOfJoining BETWEEN ? AND ?`;
            queryParams.push(joiningDateStart, joiningDateEnd);
        }

        // Execute query with parameterization
        try {
            queryResultObj.employeeList = await connection.query(mysqlDB, queryStr, queryParams);
        } catch (error) {
            console.error(error);
            throw new Error('Internal Server Error EmployeeManagement-20');
        }

        if (queryResultObj.employeeList !== null && queryResultObj.employeeList !== undefined && queryResultObj.employeeList.length > 0) {
            resultObj.employeeList = queryResultObj.employeeList;
        } else {
            resultObj.employeeList = [];
        }
        
        resultObj.status = "success";

        return resultObj;
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message
        };
    } finally {
        if (mysqlDB) {
            mysqlDB.release();
        }
    }
});

exports.getReleased = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.employeeListReleased = await connection.query(mysqlDB, query.employeeListReleased, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.employeeListReleased !== null && queryResultObj.employeeListReleased !== undefined && queryResultObj.employeeListReleased.length > 0) {
        resultObj.employeeListReleased = queryResultObj.employeeListReleased
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.add = co.wrap(async function (postParam, user) {
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
    console.log(postParam.employee_id);
    
    if (!postParam.firstName || postParam.firstName == null || postParam.firstName == undefined || postParam.firstName.length == 0) {
      resultObj.status = "error"
      resultObj.message = "First Name cannot be blank"
    }
    else if (postParam.lastName == null || postParam.lastName == undefined || postParam.lastName.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Last Name cannot be blank"
    }
    else if (postParam.phoneNumber == null || postParam.phoneNumber == undefined || postParam.phoneNumber.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Primary Mobile Number cannot be blank"
    }
    else if (postParam.gender == null || postParam.gender == undefined || postParam.gender.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Gender cannot be blank"
    }
    else if (postParam.dob == null || postParam.dob == undefined || postParam.dob.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Date of Birth cannot be blank"
    }
    else if (postParam.blood == null || postParam.blood == undefined || postParam.blood.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Blood Group cannot be blank"
    }
    else if (postParam.religion == null || postParam.religion == undefined || postParam.religion.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Religion cannot be blank"
    }
    else if (postParam.caste == null || postParam.caste == undefined || postParam.caste.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Caste cannot be blank"
    }
    else if (postParam.addressLine1 == null || postParam.addressLine1 == undefined || postParam.addressLine1.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Address cannot be blank"
    }
    else if (postParam.district == null || postParam.district == undefined || postParam.district.length == 0) {
      resultObj.status = "error"
      resultObj.message = "District cannot be blank"
    }
    else if (postParam.pin == null || postParam.pin == undefined || postParam.pin.length == 0) {
      resultObj.status = "error"
      resultObj.message = "PIN cannot be blank"
    }
    else if (postParam.designation == null || postParam.designation == undefined || postParam.designation.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Designation cannot be blank"
    }
    else if (postParam.dateOfJoining == null || postParam.dateOfJoining == undefined || postParam.dateOfJoining.length == 0) {
      resultObj.status = "error"
      resultObj.message = "Date of Joining cannot be blank"
    }
    
    else {
      try {
        try {
          connection.beginTransaction(mysqlCon);
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */
        try {
          queryResultObj.personal = await connection.query(mysqlCon, query.personal, [postParam.firstName, postParam.middleName, postParam.lastName, postParam.fatherName, postParam.motherName, postParam.phoneNumber, postParam.altPhoneNumber, postParam.gender, postParam.email, postParam.dob, postParam.idType, postParam.uuid, postParam.maritalStatus])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */
        try {
          queryResultObj.emergency = await connection.query(mysqlCon, query.emergency, [queryResultObj.personal.insertId,postParam.emergencyContactName, postParam.relationship, postParam.emergencyContactNumber, postParam.emergencyHomeAddress, postParam.emergencyOfficeAddress, queryResultObj.personal.insertId])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */
        try {
          queryResultObj.address = await connection.query(mysqlCon, query.address, [queryResultObj.personal.insertId,postParam.addressLine1, postParam.addressLine2, postParam.city, postParam.district, postParam.pin, queryResultObj.personal.insertId])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */
        try {
          queryResultObj.addressPermanent = await connection.query(mysqlCon, query.addressPermanent, [queryResultObj.personal.insertId,postParam.addressLine1Permanent, postParam.addressLine2Permanent, postParam.cityPermanent, postParam.districtPermanent, postParam.pinPermanent, queryResultObj.personal.insertId])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */
        //supervisor adding new postparam.supervisorName2
        try {
          queryResultObj.employment = await connection.query(mysqlCon, query.employment, [queryResultObj.personal.insertId,postParam.designation, postParam.dateOfJoining, postParam.department, postParam.supervisorId1, postParam.supervisorId2, postParam.qualification, queryResultObj.personal.insertId, postParam.locationId, postParam.currentLocationJoiningDate])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */
        try {
          queryResultObj.miscellaneous = await connection.query(mysqlCon, query.miscellaneous, [queryResultObj.personal.insertId,postParam.blood, postParam.religion, postParam.caste, postParam.bank, postParam.accountNumber, postParam.ifsc, postParam.branch, queryResultObj.personal.insertId, postParam.PAN])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */

        try {
          queryResultObj.appLogin = await connection.query(mysqlCon, query.appLogin, [queryResultObj.personal.insertId, queryResultObj.personal.insertId, postParam.locationId])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */

        try {
          queryResultObj.loginCreation = await connection.query(mysqlCon, query.loginCreation, [ queryResultObj.personal.insertId, queryResultObj.personal.insertId])

          // const employeeId = `EMP${String(queryResultObj.appLogin.insertId).padStart(6, '0')}`;
          // queryResultObj.loginCreation = await connection.query(mysqlCon, query.loginCreation, [employeeId, queryResultObj.appLogin.insertId]);

        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */

        // try {
        //   queryResultObj.loginDeletion = await connection.query(mysqlCon, query.loginDeletion, [user.id])
        // } catch (error) {
        //   console.error(error);
        //   throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        // }
        /************************************************************************* */
        try {
          queryResultObj.leaveAlloted = await connection.query(mysqlCon, query.leaveAlloted, [queryResultObj.personal.insertId, 15, 15, 180])
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
        }
        /************************************************************************* */
        try{
          queryResultObj.associateEmployeeWithLocationLog = await connection.query(mysqlCon, query.associateEmployeeWithLocationLog, [queryResultObj.personal.insertId, postParam.locationId])
        } catch(error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }

      } catch (error) {
        console.error(error);
        connection.rollback(mysqlCon)
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      try {
        connection.commit(mysqlCon)
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      resultObj.status = "success"
      resultObj.formDisabled = true
      resultObj.message = "Registration Details Captured Successfully. Employee ID is " + queryResultObj.personal.insertId

    }
    return resultObj;
  } catch (error) {
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
        queryResultObj.branch = await connection.query(mysqlCon, query.branch, [postParam.bankId])
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
        queryResultObj.ifsc = await connection.query(mysqlCon, query.ifsc, [postParam.branchId])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.ifsc !== null && queryResultObj.ifsc !== undefined && queryResultObj.ifsc.length > 0) {
        resultObj.ifsc = queryResultObj.ifsc[0].ifsc
      }
    } else {
      try {
        queryResultObj.district = await connection.query(mysqlCon, query.district, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.district !== null && queryResultObj.district !== undefined && queryResultObj.district.length > 0) {
        resultObj.district = queryResultObj.district
      }
      try {
        queryResultObj.gender = await connection.query(mysqlCon, query.gender, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.gender !== null && queryResultObj.gender !== undefined && queryResultObj.gender.length > 0) {
        resultObj.gender = queryResultObj.gender
      }
      try {
        queryResultObj.caste = await connection.query(mysqlCon, query.caste, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.caste !== null && queryResultObj.caste !== undefined && queryResultObj.caste.length > 0) {
        resultObj.caste = queryResultObj.caste
      }

      try {
        queryResultObj.idType = await connection.query(mysqlCon, query.idType, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.idType !== null && queryResultObj.idType !== undefined && queryResultObj.idType.length > 0) {
        resultObj.idType = queryResultObj.idType
      }

      try {
        queryResultObj.marital = await connection.query(mysqlCon, query.marital, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.marital !== null && queryResultObj.marital !== undefined && queryResultObj.marital.length > 0) {
        resultObj.marital = queryResultObj.marital
      }

      try {
        queryResultObj.religion = await connection.query(mysqlCon, query.religion, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.religion !== null && queryResultObj.religion !== undefined && queryResultObj.religion.length > 0) {
        resultObj.religion = queryResultObj.religion
      }
      try {
        queryResultObj.blood = await connection.query(mysqlCon, query.blood, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.blood !== null && queryResultObj.blood !== undefined && queryResultObj.blood.length > 0) {
        resultObj.blood = queryResultObj.blood
      }
      try {
        queryResultObj.state = await connection.query(mysqlCon, query.state, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.state !== null && queryResultObj.state !== undefined && queryResultObj.state.length > 0) {
        resultObj.state = queryResultObj.state
      }
      try {
        queryResultObj.relationship = await connection.query(mysqlCon, query.relationship, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.relationship !== null && queryResultObj.relationship !== undefined && queryResultObj.relationship.length > 0) {
        resultObj.relationship = queryResultObj.relationship
      }
      try {
        queryResultObj.qualification = await connection.query(mysqlCon, query.qualification, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.qualification !== null && queryResultObj.qualification !== undefined && queryResultObj.qualification.length > 0) {
        resultObj.qualification = queryResultObj.qualification
      }
      try {
        queryResultObj.department = await connection.query(mysqlCon, query.department, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.department !== null && queryResultObj.department !== undefined && queryResultObj.department.length > 0) {
        resultObj.department = queryResultObj.department
      }
      try {
        queryResultObj.designation = await connection.query(mysqlCon, query.designation, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.designation !== null && queryResultObj.designation !== undefined && queryResultObj.designation.length > 0) {
        resultObj.designation = queryResultObj.designation
      }
      try {
        queryResultObj.bank = await connection.query(mysqlCon, query.bank, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.bank !== null && queryResultObj.bank !== undefined && queryResultObj.bank.length > 0) {
        resultObj.bank = queryResultObj.bank
      }
      try {
        queryResultObj.location = await connection.query(mysqlCon, query.location, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.location !== null && queryResultObj.location !== undefined && queryResultObj.location.length > 0) {
        resultObj.location = queryResultObj.location
      }
      //supervisor
      try {
        queryResultObj.supervisor = await connection.query(mysqlCon, query.supervisor, [])
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error(" + error.message + "-SEnmsEmployeeEAS-G10)");
      }
      if (queryResultObj.supervisor !== null && queryResultObj.supervisor !== undefined && queryResultObj.supervisor.length > 0) {
        resultObj.supervisor = queryResultObj.supervisor
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
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});


exports.deviceGet = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.deviceList = await connection.query(mysqlDB, query.deviceList, [postParam.id])
     
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.deviceList !== null && queryResultObj.deviceList !== undefined && queryResultObj.deviceList.length > 0) {
        resultObj.deviceList = queryResultObj.deviceList
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

//get all
exports.deviceGetAll = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.deviceListAll = await connection.query(mysqlDB, query.alldeviceList, [])
     
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.deviceListAll !== null && queryResultObj.deviceListAll !== undefined && queryResultObj.deviceListAll.length > 0) {
        resultObj.deviceList = queryResultObj.deviceListAll
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.deviceUpdate = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.deviceDeactivate = await connection.query(mysqlDB, query.deviceDeactivate, [postParam.empCode])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }

      try {
        queryResultObj.deviceActivate = await connection.query(mysqlDB, query.deviceActivate, [postParam.id])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.attendanceGet = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {
      let actualQueryAttendance = query.attendanceList
      let actualParamAttendance = []
      actualParamAttendance.push(postParam.id)

      if (postParam.month) {
        actualQueryAttendance += ` AND MONTH(date) = ?  `
        actualParamAttendance.push(postParam.month)
      }
      if (postParam.year) {
        actualQueryAttendance += ` AND YEAR(date) = ? `
        actualParamAttendance.push(postParam.year)
      }
      try {
        queryResultObj.attendanceList = await connection.query(mysqlDB, actualQueryAttendance, actualParamAttendance)
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.attendanceList !== null && queryResultObj.attendanceList !== undefined && queryResultObj.attendanceList.length > 0) {
        resultObj.attendanceList = queryResultObj.attendanceList
      } else {
        resultObj.attendanceList = []
      }
      try {
        queryResultObj.yearList = await connection.query(mysqlDB, query.yearList, [postParam.id])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.yearList !== null && queryResultObj.yearList !== undefined && queryResultObj.yearList.length > 0) {
        let yearArr = []
        for (let i = 0; i < queryResultObj.yearList.length; i++) {
          yearArr.push(queryResultObj.yearList[i].year)
        }
        resultObj.yearList = yearArr
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj.message = error.message
      resultObj.status = "error"
    }
    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.leaveGet = co.wrap(async function (postParam) {

  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.leaveList = await connection.query(mysqlDB, query.leaveList, [postParam.id])

      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.leaveList !== null && queryResultObj.leaveList !== undefined && queryResultObj.leaveList.length > 0) {
        resultObj.leaveList = queryResultObj.leaveList
      } else {
        resultObj.leaveList = [];
      }
      try {

        queryResultObj.parentalLeaveList = await connection.query(mysqlDB, query.prentalLeaveList, [postParam.id])

      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.parentalLeaveList !== null && queryResultObj.parentalLeaveList !== undefined && queryResultObj.parentalLeaveList.length > 0) {
        resultObj.parentalLeaveList = queryResultObj.parentalLeaveList
      } else {
        resultObj.parentalLeaveList = [];
      }


      try {
        queryResultObj.employeeListSingle = await connection.query(mysqlDB, query.employeeListSingle, [postParam.id])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.employeeListSingle !== null && queryResultObj.employeeListSingle !== undefined && queryResultObj.employeeListSingle.length > 0) {
        resultObj.employeeListSingle = queryResultObj.employeeListSingle[0]
      } else {
        resultObj.employeeList = []
      }
      // profile
      // 

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.leaveAddMaster = co.wrap(async function (postParam) {

  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.empMaster = await connection.query(mysqlDB, query.empMaster, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.empMaster !== null && queryResultObj.empMaster !== undefined && queryResultObj.empMaster.length > 0) {
        resultObj.empMaster = queryResultObj.empMaster
      }

      try {
        queryResultObj.year = await connection.query(mysqlDB, query.year, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.year !== null && queryResultObj.year !== undefined && queryResultObj.year.length > 0) {
        resultObj.year = queryResultObj.year
      } else {
        resultObj.employeeList = []
      }
      // profile
      // 

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});


exports.leaveAdd = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.leaveAdd = await connection.query(mysqlDB, query.leaveAdd, [postParam.id, postParam.casual, postParam.sick, postParam.parental, postParam.year])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.leaveAdd.insertId) {
        resultObj.message = 'Leave Added Sucecssfully'
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});


exports.releaseEmployee = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.releaseEmployee = await connection.query(mysqlDB, query.releaseEmployee, [postParam.id])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }

      try {
        queryResultObj.saveReleaseLog = await connection.query(mysqlDB, query.saveReleaseLog, [postParam.reason, new Date(), postParam.id])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.locationHistory = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {

      try {
        queryResultObj.locationHistory = await connection.query(mysqlDB, query.locationHistory, [postParam.id])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.locationHistory !== null && queryResultObj.locationHistory !== undefined && queryResultObj.locationHistory.length > 0) {
        resultObj.locationHistory = queryResultObj.locationHistory
      } else {
        resultObj.locationHistory = []
      }

      try {
        queryResultObj.locationActive = await connection.query(mysqlDB, query.locationActive, [postParam.id])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error EmployeeManagement-20');
      }
      if (queryResultObj.locationActive !== null && queryResultObj.locationActive !== undefined && queryResultObj.locationActive.length > 0) {
        resultObj.locationActive = queryResultObj.locationActive[0]
      } else {
        resultObj.locationActive = []
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});


exports.getById = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }
    //adding new filed supervisor2 in query
    try {
      queryResultObj.getEmploye = await connection.query(mysqlDB, query.getEmployeById, [postParam.postParam.empId])

    } catch (error) {
      console.error(error)
      throw new Error('Internal Server Error EmployeeManagement-20');
    }
    if (queryResultObj.getEmploye !== null && queryResultObj.getEmploye !== undefined && queryResultObj.getEmploye.length > 0) {
      resultObj.getEmployeData = queryResultObj.getEmploye
    } else {
      resultObj.getEmployeData = []
    }
    resultObj.status = "Success"


    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.updateDetails = co.wrap(async function (postParam) {
console.log("edit details postParam----------", postParam)
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {
      queryResultObj.getEmploye = await connection.query(mysqlDB, query.getEmploye, [postParam.empId])
      console.log(queryResultObj.getEmploye)
    } catch (error) {
      console.error(error)
      throw new Error('Internal Server Error EmployeeManagement-20');
    }
    if (queryResultObj.getEmploye !== null && queryResultObj.getEmploye !== undefined && queryResultObj.getEmploye.length > 0) {

      queryResultObj.updateBank = await connection.query(mysqlDB, query.updateBankDetails, [postParam.bankId, postParam.accountNumber, postParam.ifsc, postParam.branch, new Date(), postParam.empId])

      queryResultObj.updatePersonal = await connection.query(mysqlDB, query.updatePersonalDetails, [postParam.phoneNumber, postParam.email, new Date(), postParam.empId])

      queryResultObj.updateEmployment = await connection.query(mysqlDB, query.updateEmploymentDetails, [postParam.designationId, new Date(), postParam.empId])
    }
    resultObj.status = "Success"


    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});

exports.monthlyAttendanceList = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error EmployeeManagement-10');
    }

    try {
      queryResultObj.attendanceList = await connection.query(mysqlDB, query.monthlyAttendanceList, [])
    } catch (error) {
      console.error(error)
      throw new Error('Internal Server Error EmployeeManagement-20');
    }
    if (queryResultObj.attendanceList !== null && queryResultObj.attendanceList !== undefined && queryResultObj.attendanceList.length > 0) {
      resultObj.status = "Success"
      resultObj.data = queryResultObj.attendanceList

    } else {
      resultObj.status = "Success"
      resultObj.data = []
    }


    return resultObj;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error EmployeeManagement-40');
  } finally {
    mysqlDB.release()
  }
});


