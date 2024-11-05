const co = require('co');
const connection = require('../../../JOS/DALMYSQLConnection');
const query = require('../../queries/qDashboard/DashboardQuery');

exports.get = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }

    try {

      try {
        queryResultObj.employeeCount = await connection.query(mysqlDB, query.employeeCount, [])
        console.log(queryResultObj.employeeCount);
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.employeeCount !== null && queryResultObj.employeeCount !== undefined && queryResultObj.employeeCount.length > 0) {
        resultObj.employeeCount = queryResultObj.employeeCount[0].count
      }

      try {
        queryResultObj.leaveRequestPending = await connection.query(mysqlDB, query.leaveRequestPending, [])

      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.leaveRequestPending !== null && queryResultObj.leaveRequestPending !== undefined && queryResultObj.leaveRequestPending.length > 0) {
        resultObj.leaveRequestPending = queryResultObj.leaveRequestPending[0].count
      }

      try {
        queryResultObj.leaveRequestDecided = await connection.query(mysqlDB, query.leaveRequestDecided, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.leaveRequestDecided !== null && queryResultObj.leaveRequestDecided !== undefined && queryResultObj.leaveRequestDecided.length > 0) {
        resultObj.leaveRequestDecided = queryResultObj.leaveRequestDecided[0].count
      }

      try {
        queryResultObj.leaveRequestRejected = await connection.query(mysqlDB, query.leaveRequestRejected, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.leaveRequestRejected !== null && queryResultObj.leaveRequestRejected !== undefined && queryResultObj.leaveRequestRejected.length > 0) {
        resultObj.leaveRequestRejected = queryResultObj.leaveRequestRejected[0].count
      }

      try {
        queryResultObj.leaveRequestApproved = await connection.query(mysqlDB, query.leaveRequestApproved, [])

      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.leaveRequestApproved !== null && queryResultObj.leaveRequestApproved !== undefined && queryResultObj.leaveRequestApproved.length > 0) {
        resultObj.leaveRequestApproved = queryResultObj.leaveRequestApproved[0].count
      }

      try {
        queryResultObj.genderWise = await connection.query(mysqlDB, query.genderWise, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.genderWise !== null && queryResultObj.genderWise !== undefined && queryResultObj.genderWise.length > 0) {
        resultObj.genderWise = queryResultObj.genderWise
      } else {
        resultObj.genderWise = []
      }

      try {
        queryResultObj.ageWise = await connection.query(mysqlDB, query.ageWise, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.ageWise !== null && queryResultObj.ageWise !== undefined && queryResultObj.ageWise.length > 0) {
        resultObj.ageWise = queryResultObj.ageWise
      } else {
        resultObj.ageWise = []
      }

      try {
        queryResultObj.leaveCommonReason = await connection.query(mysqlDB, query.leaveCommonReason, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.leaveCommonReason !== null && queryResultObj.leaveCommonReason !== undefined && queryResultObj.leaveCommonReason.length > 0) {
        resultObj.leaveCommonReason = queryResultObj.leaveCommonReason
      } else {
        resultObj.leaveCommonReason = []
      }

      try {
        queryResultObj.holidays = await connection.query(mysqlDB, query.holidays, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.holidays !== null && queryResultObj.holidays !== undefined && queryResultObj.holidays.length > 0) {
        resultObj.holidays = queryResultObj.holidays
      } else {
        resultObj.holidays = []
      }

      try {
        queryResultObj.leaveTodayCount = await connection.query(mysqlDB, query.leaveTodayCount, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.leaveTodayCount !== null && queryResultObj.leaveTodayCount !== undefined && queryResultObj.leaveTodayCount.length > 0) {
        resultObj.leaveTodayCount = queryResultObj.leaveTodayCount[0].count
      }

      try {
        queryResultObj.qualificationWise = await connection.query(mysqlDB, query.qualificationWise, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.qualificationWise !== null && queryResultObj.qualificationWise !== undefined && queryResultObj.qualificationWise.length > 0) {
        resultObj.qualificationWise = queryResultObj.qualificationWise[0].count
      }

      try {
        queryResultObj.presentToday = await connection.query(mysqlDB, query.presentToday, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.presentToday !== null && queryResultObj.presentToday !== undefined && queryResultObj.presentToday.length > 0) {
        resultObj.presentToday = queryResultObj.presentToday[0].count
      }
      try {
        queryResultObj.departmentGenderWise = await connection.query(mysqlDB, query.departmentGenderWise, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.departmentGenderWise !== null && queryResultObj.departmentGenderWise !== undefined && queryResultObj.departmentGenderWise.length > 0) {
        resultObj.departmentGenderWise = queryResultObj.departmentGenderWise
      } else {
        resultObj.departmentGenderWise = []
      }

      try {
        queryResultObj.districtWise = await connection.query(mysqlDB, query.districtWise, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.districtWise !== null && queryResultObj.districtWise !== undefined && queryResultObj.districtWise.length > 0) {
        resultObj.districtWise = queryResultObj.districtWise
      } else {
        resultObj.districtWise = []
      }

      try {
        queryResultObj.leavesToday = await connection.query(mysqlDB, query.leavesToday, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.leavesToday !== null && queryResultObj.leavesToday !== undefined && queryResultObj.leavesToday.length > 0) {
        resultObj.leavesToday = queryResultObj.leavesToday
      } else {
        resultObj.leavesToday = []
      }

      try {
        queryResultObj.activeStatusCount = await connection.query(mysqlDB, query.activeStatusCount, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.activeStatusCount !== null && queryResultObj.activeStatusCount !== undefined && queryResultObj.activeStatusCount.length > 0) {
        resultObj.activeStatusCount = queryResultObj.activeStatusCount[0].count
      }
      try {
        queryResultObj.regignationCount = await connection.query(mysqlDB, query.regignationCount, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.regignationCount !== null && queryResultObj.regignationCount !== undefined && queryResultObj.regignationCount.length > 0) {
        resultObj.regignationCount = queryResultObj.regignationCount[0].count
      }
   

      resultObj.absentToday = queryResultObj.employeeCount[0].count - queryResultObj.leaveTodayCount[0].count - queryResultObj.presentToday[0].count
      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
});



exports.attendanceRateDepartmentWise = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }

    try {

      try {
        queryResultObj.departmentWiseLeave = await connection.query(mysqlDB, query.departmentWiseLeave, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.departmentWiseLeave !== null && queryResultObj.departmentWiseLeave !== undefined && queryResultObj.departmentWiseLeave.length > 0) {
        resultObj.departmentWiseLeave = queryResultObj.departmentWiseLeave
      }


      try {
        queryResultObj.internalDepartment = await connection.query(mysqlDB, query.internalDepartment, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.internalDepartment !== null && queryResultObj.internalDepartment !== undefined && queryResultObj.internalDepartment.length > 0) {
        resultObj.internalDepartment = queryResultObj.internalDepartment
      } else {
        resultObj.internalDepartment = []
      }
      resultObj.type = ["CL", "ML"]
      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
});

exports.getEmployeeGroup = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }

    try {

      try {
        queryResultObj.departmentWiseCount = await connection.query(mysqlDB, query.departmentWiseCount, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.departmentWiseCount !== null && queryResultObj.departmentWiseCount !== undefined && queryResultObj.departmentWiseCount.length > 0) {
        resultObj.departmentWiseCount = queryResultObj.departmentWiseCount
      } else {
        resultObj.departmentWiseCount = []
      }

      try {
        queryResultObj.designationWiseCount = await connection.query(mysqlDB, query.designationWiseCount, [])
      } catch (error) {
        throw new Error('Internal Server Error Dashboard-20');
      }
      if (queryResultObj.designationWiseCount !== null && queryResultObj.designationWiseCount !== undefined && queryResultObj.designationWiseCount.length > 0) {
        resultObj.designationWiseCount = queryResultObj.designationWiseCount
      } else {
        resultObj.designationWiseCount = []
      }

      resultObj.status = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
});


exports.attendanceChart = co.wrap(async function (postParam) {

  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }

    try {
      if (postParam.month > 12 || postParam.month < 1) {
        resultObj.status = "failed"
      } else {

        try {
          queryResultObj.departments = await connection.query(mysqlDB, query.departments, [])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error Dashboard-20');
        }
        resultObj.data = []
        for (let i = 0; i < queryResultObj.departments.length; i++) {
          try {

            queryResultObj.attendanceChart = await connection.query(mysqlDB, query.attendanceChart, [postParam.month, queryResultObj.departments[i].department])

          } catch (error) {
            console.error(error)
            throw new Error('Internal Server Error Dashboard-20');
          }
          if (queryResultObj.attendanceChart !== null && queryResultObj.attendanceChart !== undefined && queryResultObj.attendanceChart.length > 0) {
            resultObj.data.push(
              {
                "id": queryResultObj.departments[i].departmentName,
                "color": "hsl(344, 70%, 50%)",
                "data": queryResultObj.attendanceChart
              },
            )
          }
        }
        resultObj.status = "success"
      }
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }
    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
});

exports.absenteeism = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }

    try {
      if (postParam.month > 12 || postParam.month < 1) {
        resultObj.status = "failed"
      } else {
        try {
          queryResultObj.absenteeism = await connection.query(mysqlDB, query.absenteeism, [postParam.month, postParam.month])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error Dashboard-20');
        }
        if (queryResultObj.absenteeism !== null && queryResultObj.absenteeism !== undefined && queryResultObj.absenteeism.length > 0) {
          resultObj.data = queryResultObj.absenteeism
        }
        console.log(resultObj)
        resultObj.status = "success"
      }
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }
    console.log(resultObj)
    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
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
      throw new Error('Internal Server Error Dashboard-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
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
      throw new Error('Internal Server Error Dashboard-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
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
      throw new Error('Internal Server Error Dashboard-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
});


exports.employerData = co.wrap(async function (postParam) {
  // console.log(postParam.postParam.designationId)

  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }
    //console.log("postParam.designationId:", postParam.designationId);
    //console.log("postParam", postParam.departmentId);

    try {
      if (postParam.postParam.designationId) {

        queryResultObj.designationWishData = await connection.query(mysqlDB, query.designationWishData, [postParam.postParam.designationId]);

        resultObj.data = queryResultObj.designationWishData;


      } else if (postParam.postParam.departmentId) {

        queryResultObj.departmentWiseData = await connection.query(mysqlDB, query.departmentWiseData, [postParam.postParam.departmentId]);

        resultObj.data = queryResultObj.departmentWiseData;
      } else {
        throw new Error('Neither designationId nor departmentId provided');
      }

    } catch (error) {
      console.error(error)
      throw new Error('Internal Server Error Dashboard-20');
    }

    resultObj.status = "Success";



    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
});

exports.leaveActivitiesId = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }

    const { candidateId, startDate, endDate } = postParam;
    const candidateId1=candidateId.slice(-3)
    
    // Step 1: Create the temporary table for the date range
    try {
      await connection.query(mysqlDB, `
        DROP TEMPORARY TABLE IF EXISTS DateRange;
      `);

      await connection.query(mysqlDB, `
        CREATE TEMPORARY TABLE DateRange (
          attendanceDate DATE
        );
      `);

      await connection.query(mysqlDB, `
        INSERT INTO DateRange (attendanceDate)
        SELECT DATE(?) + INTERVAL seq DAY
        FROM (SELECT @row := @row + 1 AS seq
              FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
                    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t1,
                   (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
                    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t2,
                   (SELECT @row := -1) t3
             ) seqs
        WHERE DATE(?) + INTERVAL seq DAY <= DATE(?);
      `, [startDate, startDate, endDate]);
    } catch (error) {
      console.log(error);
      throw new Error('Error creating temporary table');
    }

    // Step 2: Run the main query
    queryResultObj.leaveActivities = await connection.query(mysqlDB, `
      SELECT 
        dr.attendanceDate,
        personal.pklEmployeeRegId AS registrationId,
         CONCAT(personal.vsFirstName, ' ', personal.vsMiddleName, ' ', personal.vsLastName) AS empName,
        staff.vsEmpName AS empId,
        MIN(attendance.vsTime) AS punchIn,
        CASE 
            WHEN COUNT(attendance.vsTime) > 1 THEN MAX(attendance.vsTime)
            ELSE NULL
        END AS punchOut,
        (SELECT bOutdoor 
         FROM nw_staff_attendance att 
         WHERE att.vsTime = MIN(attendance.vsTime) AND att.fklEmpCode = attendance.fklEmpCode) AS punchInOutdoor,
        (SELECT bOutdoor 
         FROM nw_staff_attendance att 
         WHERE att.vsTime = MAX(attendance.vsTime) AND att.fklEmpCode = attendance.fklEmpCode) AS punchOutOutdoor,
        geo.vsGeolocationName AS location,  
        desig.vsDesignationName AS designation  
      FROM 
        DateRange dr
      LEFT JOIN 
        nw_staff_attendance attendance ON DATE(attendance.vsTime) = dr.attendanceDate AND attendance.fklEmpCode = ?
      LEFT JOIN 
        nw_staff_attendance_dtl staff ON attendance.fklEmpCode = staff.pklEmpCode
      LEFT JOIN 
        nw_employee_personal_dtls personal ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
      LEFT JOIN 
        nw_employee_employment_dtls emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
      LEFT JOIN 
        nw_mams_internal_department dept ON emp.vsDepartment = dept.pklInternalDepartmentId
      LEFT JOIN 
        nw_mams_geolocation geo ON staff.fklLocationId = geo.pklLocationId
      LEFT JOIN 
        nw_mams_designation desig ON emp.vsDesignation = desig.pklDesignationId
      WHERE 
        personal.pklEmployeeRegId = ? OR attendance.vsTime IS NULL
      GROUP BY 
        dr.attendanceDate, personal.pklEmployeeRegId, staff.vsEmpName, geo.vsGeolocationName, desig.vsDesignationName
      ORDER BY 
        dr.attendanceDate, registrationId;
    `, [candidateId1, candidateId1]);
    
    if (queryResultObj.leaveActivities && queryResultObj.leaveActivities.length > 0) {
      resultObj.data = queryResultObj.leaveActivities;
    } else {
      resultObj.data = [];
    }
    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
})

exports.leaveActivities = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }


    try {
      if (postParam.staff === 'leave') {
        queryResultObj.staffOnLeave = await connection.query(mysqlDB, query.staffOnLeave, [postParam.staff]);
        if (queryResultObj.staffOnLeave !== null && queryResultObj.staffOnLeave !== undefined && queryResultObj.staffOnLeave.length > 0) {
          resultObj.data = queryResultObj.staffOnLeave;
        } else {
          resultObj.data = [];
        }

      } else if (postParam.staff === 'joined') {
        queryResultObj.joiningToday = await connection.query(mysqlDB, query.joiningToday, [postParam.staff]);
        if (queryResultObj.joiningToday !== null && queryResultObj.joiningToday !== undefined && queryResultObj.joiningToday.length > 0) {
          resultObj.data = queryResultObj.joiningToday;
        } else {
          resultObj.data = [];
        }

      } else if (postParam.staff === 'present') {
        const date = postParam.date || new Date().toISOString().split('T')[0]; // Default to current date
        const month = postParam.month || null; // Default to null if not provided

        if(postParam.startDate && postParam.endDate){
          if(postParam.type === 'inside'){
            console.log("inside date");
            queryResultObj.staffPresentToday = await connection.query(mysqlDB, query.staffPresentTodayFilterInside, [postParam.startDate, postParam.endDate]);
        }else if(postParam.type === 'outside'){
          console.log("outside date");
            queryResultObj.staffPresentToday = await connection.query(mysqlDB, query.staffPresentTodayFilterOutside, [postParam.startDate, postParam.endDate]);
          }else{
            queryResultObj.staffPresentToday = await connection.query(mysqlDB, query.staffPresentTodayFilter, [postParam.startDate, postParam.endDate]);
          }
        }else if(postParam.type === 'inside'){
            queryResultObj.staffPresentToday = await connection.query(mysqlDB, query.staffPresentTodayInside, [date, date, month, month]);
        }else if(postParam.type === 'outside'){
            queryResultObj.staffPresentToday = await connection.query(mysqlDB, query.staffPresentTodayOutside, [date, date, month, month]);
          }
        else{
          queryResultObj.staffPresentToday = await connection.query(mysqlDB, query.staffPresentToday, [date, date, month, month]);
        }
        

        if (queryResultObj.staffPresentToday !== null && queryResultObj.staffPresentToday !== undefined && queryResultObj.staffPresentToday.length > 0) {
          resultObj.data = queryResultObj.staffPresentToday;
        } else {
          resultObj.data = [];
        }
 
      } else if (postParam.staff === 'absent') {
        const date = postParam.date || new Date().toISOString().split('T')[0]; // Default to current date
        const month = postParam.month || null; // Default to null if not provided

        if(postParam.startDate && postParam.endDate){
          queryResultObj.staffAbsentToday = await connection.query(mysqlDB, query.staffAbsentTodayFilter, [postParam.startDate, postParam.endDate,postParam.startDate]);
        }else{
          queryResultObj.staffAbsentToday = await connection.query(mysqlDB, query.staffAbsentToday, [date, date, month, month]);
        }
        
        if (queryResultObj.staffAbsentToday !== null && queryResultObj.staffAbsentToday !== undefined && queryResultObj.staffAbsentToday.length > 0) {
          resultObj.data = queryResultObj.staffAbsentToday
        } else {
          resultObj.data = [];
        }

      } else if (postParam.staff === 'active') {
        queryResultObj.activeEmployee = await connection.query(mysqlDB, query.activeEmployee, [postParam.staff]);
        if (queryResultObj.activeEmployee !== null && queryResultObj.activeEmployee !== undefined && queryResultObj.activeEmployee.length > 0) {
          resultObj.data = queryResultObj.activeEmployee
        } else {
          resultObj.data = [];
        }

      } else if (postParam.staff === 'resigned') {
        queryResultObj.resignedEmploye = await connection.query(mysqlDB, query.resignedEmploye, [postParam.staff]);
        if (queryResultObj.resignedEmploye !== null && queryResultObj.resignedEmploye !== undefined && queryResultObj.resignedEmploye.length > 0) {

          resultObj.data = queryResultObj.resignedEmploye

        } else {
          resultObj.data = [];
        }

      }

      else {
        throw new Error('Invalid staff parameter');
      }

    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error Dashboard-10');
    }

    resultObj.status = "Success"

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error Dashboard-40');
  } finally {
    mysqlDB.release()
  }
});
