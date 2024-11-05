const co = require('co');
const moment = require('moment');
const connection = require('../../../JOS/DALMYSQLConnection');
const query = require('../../queries/qLeaveApproval/LeaveApprovalQuery');
const multer=require("multer");

exports.get = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }
    console.log('here')

    try {

      try {
        queryResultObj.employeeList = await connection.query(mysqlDB, query.employeeList, [])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error LeaveApproval-20');
      }
      if (queryResultObj.employeeList !== null && queryResultObj.employeeList !== undefined && queryResultObj.employeeList.length > 0) {
        resultObj.employeeList = queryResultObj.employeeList
      }


      resultObj.message = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});

//temp approve///////////////////////////////////////////////////////////////////////////////////////

exports.tempApprove=co.wrap(async function(postParam){
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;

  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }
    try {
      if (postParam.type == "CL" || postParam.type == 'ML' || postParam.type == "RH") {

        try {
          await connection.query(mysqlDB, query.tempApprove, [postParam.Tapprove, postParam.id])
          const rows=await connection.query(mysqlDB, query.tempApproveR, [postParam.id])
          queryResultObj.leaveApproval = rows[0].tempApproval;
          resultObj.message = "successful";
          resultObj.tempApproval = rows[0].tempApproval; 
          
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LeaveApproval-20');
        }

      } else {

        try {
          await connection.query(mysqlDB, query.tempApprovePL, [postParam.Tapprove, postParam.id])
          const rows=await connection.query(mysqlDB, query.tempApprovePLr, [postParam.id])
          queryResultObj.leaveApproval = rows[0].tempApproval;
          resultObj.message = "successful";
          resultObj.tempApproval = rows[0].tempApproval; 
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error leaveApprovalPL-20');
        }
        
      }

    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }
    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
})
////submit//////////
exports.submitApprove = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;

  try {
    // Establish the database connection
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {
      if (postParam.type == "CL" || postParam.type == 'ML' || postParam.type == "RH"){
      // Fetch the ids and tempApproval values based on the employeeId
      const idQuery = `
        SELECT pklLeaveApplicationId, tempApproval, vsType
        FROM nw_staff_attendance_leave_applications
        WHERE fklEmpCode = ?;
      `;
      const idResult = await connection.query(mysqlDB, idQuery, [postParam.employeeId]);
      
      let isLeaveApproved = false;
      let leaveType = null;

      // Iterate through the results and perform leave approval for each ID
      for (const row of idResult) {
        const id = row.pklLeaveApplicationId;
        const tempApprovalValue = row.tempApproval;
        leaveType = row.vsType;

        // determine the reason based on tempApproval
        const reason = tempApprovalValue === 0 ? postParam.reason : null;

        // Execute the query to update bApproval and other fields for the current ID
        const leaveApprovalQuery = `
          UPDATE nw_staff_attendance_leave_applications
          SET bApproval = ?,
              vsRejectionReason = ?,
              bPending = 0,
              vsFilename = ?
          WHERE pklLeaveApplicationId = ?;
        `;
        await connection.query(mysqlDB, leaveApprovalQuery, [tempApprovalValue, reason,postParam.filename, id]);
         // Check if any leave is approved
        if (tempApprovalValue === 1) {
          isLeaveApproved = true;
        }
      }
      // If the leave is approved, update the leave balance
      if (isLeaveApproved && leaveType !== null) {
        queryResultObj.leaveBalance = await connection.query(mysqlDB, query.leaveBalance, [postParam.employeeId]);
        queryResultObj.leaveDetails = await connection.query(mysqlDB, query.leaveDetails, [postParam.employeeId, leaveType]);

        if (leaveType == "CL") {
          const CL = (queryResultObj.leaveBalance[0].CL - 1);
          await connection.query(mysqlDB, query.updateBalanceCL, [CL, postParam.employeeId]);
        }
        if (leaveType == "ML") {
          const ML = (queryResultObj.leaveBalance[0].ML - 1);
          await connection.query(mysqlDB, query.updateBalanceSL, [ML, postParam.employeeId]);
        }
      }
    }
      else{
        try {
          // Fetch the parental leave applications for the employee
          const parentalLeaveQuery = `
            UPDATE nw_staff_attendance_parental_leave
            SET bApproved = tempApproval,
                vsFilename = ?,
                bPending = 0
            WHERE fklEmpCode = ?;
          `;
          
          // Execute the update query
          const updateResult = await connection.query(mysqlDB, parentalLeaveQuery, [postParam.filename,postParam.employeeId]);
        
          if (updateResult.affectedRows > 0) {
            // Fetch parental leave balance
            queryResultObj.PLleaveBalance = await connection.query(mysqlDB, query.PLleaveBalance, [postParam.employeeId]);
            
            // Fetch parental leave details
            queryResultObj.PLleaveDetails = await connection.query(mysqlDB, query.leaveDetailsPL, [postParam.employeeId]);
            
            // Calculate updated parental leave balance
            const PLleaveBalance = queryResultObj.PLleaveBalance[0].PL;
            const PLleaveDuration = queryResultObj.PLleaveDetails[0].duration;
            const updatedPLBalance = PLleaveBalance - PLleaveDuration;
            
            // Update parental leave balance in the database
            await connection.query(mysqlDB, query.updateBalancePL, [updatedPLBalance, postParam.employeeId]);
            
            // Return success message
            resultObj.message = "Leave Approved Successfully";
            resultObj.status = "success";
        } else {
            // Return failure message if leave approval failed
            resultObj.message = "Leave Approval Failed";
            resultObj.status = "failed";
        }
        
        } catch (error) {
          console.error(error);
          resultObj = {
            message: error.message,
            status: "error"
          };
        }
      }

      // Return success message
      resultObj.message = "Successful";
      resultObj.status = "success";
    } catch (error) {
      console.error(error);
      resultObj = {
        message: error.message,
        status: "error"
      };
    }
    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    if (mysqlDB) {
      mysqlDB.release();
    }
  }
});




/////////////////////////////////////////////////////////////////////////////////////////////////////

exports.approveLeave = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;

  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }
    try {
      if (postParam.type == "CL" || postParam.type == 'ML' || postParam.type == "RH") {

        try {
          queryResultObj.leaveApproval = await connection.query(mysqlDB, query.leaveApproval, [postParam.approve, postParam.reason, postParam.id])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LeaveApproval-20');
        }

        if (queryResultObj.leaveApproval.affectedRows) {
          resultObj.message = postParam.approve ? "Leave Approved Successfully" : "Leave Rejected Successfully"
          resultObj.status = "success"
        } else {
          resultObj.message = "Leave Approval Failed"
          resultObj.status = "failed"
        }
        if (postParam.approve === 1) {

          queryResultObj.leaveBalance = await connection.query(mysqlDB, query.leaveBalance, [postParam.employeeId])
          queryResultObj.leaveDetails = await connection.query(mysqlDB, query.leaveDetails, [postParam.employeeId, postParam.type])

       
          if (postParam.type == "CL") {

            const CL = (queryResultObj.leaveBalance[0].CL - 1)
            queryResultObj.updateBalanceCL = await connection.query(mysqlDB, query.updateBalanceCL, [CL, postParam.employeeId])

          }
          if (postParam.type == "ML") {

            const ML = (queryResultObj.leaveBalance[0].ML - 1)
            queryResultObj.updateBalanceSL = await connection.query(mysqlDB, query.updateBalanceSL, [ML, postParam.employeeId])
          }
        }
      } else {

        try {
          queryResultObj.leaveApprovalPL = await connection.query(mysqlDB, query.leaveApprovalPL, [postParam.approve, postParam.id])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error leaveApprovalPL-20');
        }
        if (queryResultObj.leaveApprovalPL.affectedRows) {
        
          queryResultObj.PLleaveBalance = await connection.query(mysqlDB, query.PLleaveBalance, [postParam.employeeId])
          
          queryResultObj.PLleaveDetails = await connection.query(mysqlDB, query.leaveDetailsPL, [postParam.employeeId])
         
          const PL = (queryResultObj.PLleaveBalance[0].PL - queryResultObj.PLleaveDetails[0].duration)

      
          queryResultObj.updateBalancePL = await connection.query(mysqlDB, query.updateBalancePL, [PL, postParam.employeeId])

          
          
          resultObj.message = postParam.approve ? "Leave Approved Successfully" : "Leave Rejected Successfully"
          resultObj.status = "success"
        } else {

          resultObj.message = "Leave Approval Failed"
          resultObj.status = "failed"
        }
      }


    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }
    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});

exports.leaveDetail = co.wrap(async function (postParam) {

  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {

      try {
        queryResultObj.leaveDetail = await connection.query(mysqlDB, query.leaveDetail, [postParam.applicationId])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error LeaveApproval-20');
      }

      if (queryResultObj.leaveDetail !== null && queryResultObj.leaveDetail !== undefined && queryResultObj.leaveDetail.length > 0) {
        resultObj.data = queryResultObj.leaveDetail[0]

      } else {
        resultObj.data = []
      }

      ///////////condition//////
      if(postParam.type=="pending"){
        try {
          queryResultObj.leaveHistory = await connection.query(mysqlDB, query.leaveHistory, [queryResultObj.leaveDetail[0].employeeId])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LeaveApproval-20');
        }

        if (queryResultObj.leaveHistory !== null && queryResultObj.leaveHistory !== undefined && queryResultObj.leaveHistory.length > 0) {
          resultObj.leaveHistory = queryResultObj.leaveHistory
        } else {
          resultObj.leaveHistory = []
        }
      }
      ////for approve///
      if(postParam.type=="approved"){
        try {
          // const approveData=await connection.query(mysqlDB,query.leaveListApproved,[]);
          const placeholderEmpcode=postParam.empCode
          const placeholderAppliedDate=postParam.appliedDate
          
          queryResultObj.leaveHistory = await connection.query(mysqlDB, query.leaveHistoryApproved, [placeholderEmpcode,placeholderAppliedDate])

          console.log(queryResultObj.leaveHistory )
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LeaveApproval-20');
        }

        if (queryResultObj.leaveHistory !== null && queryResultObj.leaveHistory !== undefined && queryResultObj.leaveHistory.length > 0) {
          resultObj.leaveHistory = queryResultObj.leaveHistory
        } else {
          resultObj.leaveHistory = []
        }
      }
      ////for reject///
      if(postParam.type=="rejected"){
        try {
          queryResultObj.leaveHistory = await connection.query(mysqlDB, query.leaveHistoryReject, [queryResultObj.leaveDetail[0].employeeId])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LeaveApproval-20');
        }

        if (queryResultObj.leaveHistory !== null && queryResultObj.leaveHistory !== undefined && queryResultObj.leaveHistory.length > 0) {
          resultObj.leaveHistory = queryResultObj.leaveHistory
        } else {
          resultObj.leaveHistory = []
        }
      }

      

      resultObj.message = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});


exports.parentalLeaveDetails = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }
    try {
      queryResultObj.parentalLeaveDetails = await connection.query(mysqlDB, query.parentalLeaveDetail, [postParam.applicationId])
      
    } catch (error) {
      console.error(error)
      throw new Error('Internal Server Error LeaveApproval-20');
    }
    if (queryResultObj.parentalLeaveDetails !== null && queryResultObj.parentalLeaveDetails !== undefined) {
      resultObj.data = queryResultObj.parentalLeaveDetails[0]
    } else {
      resultObj.data = []
    }

    try {
      
      const formattedDate = moment(queryResultObj.parentalLeaveDetails[0].dateApplied).format('YYYY-MM-DD HH:mm:ss');
      console.log(formattedDate);
      if(postParam.type=='rejected'){
        queryResultObj.leaveHistory = await connection.query(mysqlDB, query.pLeaveHistoryRejected, [queryResultObj.parentalLeaveDetails[0].employeeId,formattedDate])
      }else{
        queryResultObj.leaveHistory = await connection.query(mysqlDB, query.pLeaveHistory, [queryResultObj.parentalLeaveDetails[0].employeeId,formattedDate])
        console.log(queryResultObj.leaveHistory);
      }
      
    } catch (error) {
      console.error(error)
      throw new Error('Internal Server Error LeaveApproval-20');
    }
    if (queryResultObj.leaveHistory !== null && queryResultObj.leaveHistory !== undefined && queryResultObj.leaveHistory.length > 0) {
      resultObj.leaveHistory = queryResultObj.leaveHistory
    } else {
      resultObj.leaveHistory = []
    }

    resultObj.message = "success"
    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});





exports.pendingLeaveExport = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {

      let actualLeaveListPendingQuery = query.pendingLeaveExport
      let actualLeaveListPendingParam = []

      if (postParam.id) {
        actualLeaveListPendingQuery = actualLeaveListPendingQuery + ` AND adtl.fklEmpCode = ?`
        postParam.push(postParam.id)
      }
      try {
        queryResultObj.pendingLeaveExport = await connection.query(mysqlDB, actualLeaveListPendingQuery, [actualLeaveListPendingParam])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error LeaveApproval-20');
      }
      if (queryResultObj.pendingLeaveExport !== null && queryResultObj.pendingLeaveExport !== undefined && queryResultObj.pendingLeaveExport.length > 0) {
        resultObj.data = queryResultObj.pendingLeaveExport
      } else {
        resultObj.data = []
      }

      resultObj.message = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});

exports.leaveListPending = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {

      let actualLeaveListPendingQuery = query.leaveListPending
      let actualLeaveListPendingParam = []

      if (postParam.id) {
        actualLeaveListPendingQuery = actualLeaveListPendingQuery + ` AND adtl.fklEmpCode = ?`
        postParam.push(postParam.id)
      }
      //
      if (postParam.appliedDate) {
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingFilterCl, [postParam.appliedDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingFilterMl, [postParam.appliedDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingFilterPl, [postParam.appliedDate]);
          }else{
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingFilter, [postParam.appliedDate, postParam.appliedDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-20');
        }
      }else if(postParam.startDate && postParam.endDate){
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingDateRangeFilterCl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingDateRangeFilterMl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingDateRangeFilterPl, [postParam.startDate, postParam.endDate]);
          }else{
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingDateRangeFilter, [postParam.startDate, postParam.endDate, postParam.startDate, postParam.endDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-21');
        }
      }
      else{
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingCl, []);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingMl, []);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListPending = await connection.query(mysqlDB, query.leaveListPendingPl, []);
          }else{
            queryResultObj.leaveListPending = await connection.query(mysqlDB, actualLeaveListPendingQuery, [actualLeaveListPendingParam])
          }
        
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error LeaveApproval-20');
      }
      }
      
      if (queryResultObj.leaveListPending !== null && queryResultObj.leaveListPending !== undefined && queryResultObj.leaveListPending.length > 0) {
        resultObj.data = queryResultObj.leaveListPending
     
      } else {
        resultObj.data = []
      }

      resultObj.message = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});
/*******************************************************************************/
exports.leaveList = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {
      let actualLeaveListApprovedQuery = query.leaveList;
      let actualLeaveListApprovedParam = [];

      // Check for ID and add to the query
      if (postParam.id) {
        actualLeaveListApprovedQuery += ` AND adtl.fklEmpCode = ?`;
        actualLeaveListApprovedParam.push(postParam.id);
      }

      // Check for applied date and use the alternate query if provided
      if (postParam.appliedDate) {
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilterCl, [postParam.appliedDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilterMl, [postParam.appliedDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilterPl, [postParam.appliedDate]);
          }else{
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilter, [postParam.appliedDate, postParam.appliedDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-20');
        }
      }else if(postParam.startDate && postParam.endDate){
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListDateRangeFilterCl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListDateRangeFilterMl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListDateRangeFilterPl, [postParam.startDate, postParam.endDate]);
          }else{
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListDateRangeFilter, [postParam.startDate, postParam.endDate, postParam.startDate, postParam.endDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-21');
        }
      }else if(postParam.type){
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListCl, []);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListMl, []);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListPl, []);
          }else{
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListDateRangeFilter, [postParam.startDate, postParam.endDate, postParam.startDate, postParam.endDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-21');
        }
      }
      else {
        try {
          queryResultObj.leaveListApproved = await connection.query(mysqlDB, actualLeaveListApprovedQuery, actualLeaveListApprovedParam);
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-20');
        }
      }

      if (queryResultObj.leaveListApproved && queryResultObj.leaveListApproved.length > 0) {
        resultObj.data = queryResultObj.leaveListApproved;
      } else {
        resultObj.data = [];
      }

      resultObj.message = "success";
    } catch (error) {
      resultObj.message = error.message;
      resultObj.status = "error";
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    if (mysqlDB) {
      mysqlDB.release();
    }
  }
});

//pdf data
exports.pdfData = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {
      try {
        queryResultObj.pdfData = await connection.query(mysqlDB, query.pdfDataQuery, [postParam.applicationId])
      } catch (error) {
        console.error(error)
        throw new Error('Internal Server Error LeaveApproval-20');
      }
      if (queryResultObj.pdfData !== null && queryResultObj.pdfData !== undefined && queryResultObj.pdfData.length > 0) {
        resultObj.data = queryResultObj.pdfData
      } else {
        resultObj.data = []
      }
      resultObj.message = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});




exports.leaveListRejected = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {

      let actualLeaveListRejectedQuery = query.leaveListRejected
      let actualLeaveListRejectedParam = []

      if (postParam.id) {
        actualLeaveListRejectedQuery = actualLeaveListRejectedQuery + ` AND adtl.fklEmpCode = ?`
        postParam.push(postParam.id)
      }
      //
      if (postParam.appliedDate) {
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedFilterCl, [postParam.appliedDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedFilterMl, [postParam.appliedDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedFilterPl, [postParam.appliedDate]);
          }else{
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedFilter, [postParam.appliedDate, postParam.appliedDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-20');
        }
      }else if(postParam.startDate && postParam.endDate){
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedDateRangeFilterCl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedDateRangeFilterMl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedDateRangeFilterPl, [postParam.startDate, postParam.endDate]);
          }else{
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedDateRangeFilter, [postParam.startDate, postParam.endDate, postParam.startDate, postParam.endDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-21');
        }
      }
      else{
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedCl, []);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedMl, []);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, query.leaveListRejectedPl, []);
          }else{
            queryResultObj.leaveListRejected = await connection.query(mysqlDB, actualLeaveListRejectedQuery, [actualLeaveListRejectedParam])
          }
        
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LeaveApproval-20');
        }
      }
      
      if (queryResultObj.leaveListRejected !== null && queryResultObj.leaveListRejected !== undefined && queryResultObj.leaveListRejected.length > 0) {
        resultObj.data = queryResultObj.leaveListRejected
      } else {
        resultObj.data = []
      }

      resultObj.message = "success"
    } catch (error) {
      resultObj = {}
      resultObj.message = error.message
      resultObj.status = "error"
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});

exports.leaveListApproved = co.wrap(async function (postParam) {
  let queryResultObj = {};
  let resultObj = {};
  let mysqlDB;
  try {
    try {
      mysqlDB = await connection.getDB();
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    try {
      let actualLeaveListApprovedQuery = query.leaveListApproved;
      let actualLeaveListApprovedParam = [];

      // Check for ID and add to the query
      if (postParam.id) {
        actualLeaveListApprovedQuery += ` AND adtl.fklEmpCode = ?`;
        actualLeaveListApprovedParam.push(postParam.id);
      }

      // Check for applied date and use the alternate query if provided
      if (postParam.appliedDate) {
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilterCl, [postParam.appliedDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilterMl, [postParam.appliedDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilterPl, [postParam.appliedDate]);
          }else{
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedFilter, [postParam.appliedDate, postParam.appliedDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-20');
        }
      }else if(postParam.startDate && postParam.endDate){
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedDateRangeFilterCl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedDateRangeFilterMl, [postParam.startDate, postParam.endDate]);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedDateRangeFilterPl, [postParam.startDate, postParam.endDate]);
          }else{
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedDateRangeFilter, [postParam.startDate, postParam.endDate, postParam.startDate, postParam.endDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-21');
        }
      }else if(postParam.type){
        try {
          if(postParam.type=="cl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedCl, []);
          }else if(postParam.type=="ml"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedMl, []);
          }else if(postParam.type=="pl"){
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedPl, []);
          }else{
            queryResultObj.leaveListApproved = await connection.query(mysqlDB, query.leaveListApprovedDateRangeFilter, [postParam.startDate, postParam.endDate, postParam.startDate, postParam.endDate]);
          }
          
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-21');
        }
      }
      else {
        try {
          queryResultObj.leaveListApproved = await connection.query(mysqlDB, actualLeaveListApprovedQuery, actualLeaveListApprovedParam);
        } catch (error) {
          console.error(error);
          throw new Error('Internal Server Error LeaveApproval-20');
        }
      }

      if (queryResultObj.leaveListApproved && queryResultObj.leaveListApproved.length > 0) {
        resultObj.data = queryResultObj.leaveListApproved;
      } else {
        resultObj.data = [];
      }

      resultObj.message = "success";
    } catch (error) {
      resultObj.message = error.message;
      resultObj.status = "error";
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    if (mysqlDB) {
      mysqlDB.release();
    }
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
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
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
      throw new Error('Internal Server Error LeaveApproval-10');
    }

    return resultObj;
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error LeaveApproval-40');
  } finally {
    mysqlDB.release()
  }
});


