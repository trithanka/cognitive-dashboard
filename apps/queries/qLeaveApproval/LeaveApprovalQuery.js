const query = {
  employeeList: `SELECT fklEmpCode AS id, pdtl.vsFirstName AS firstName, IFNULL(pdtl.vsMiddleName, "") AS middleName, pdtl.vsLastName AS lastName,
    lallot.iCasualLeave AS casualLeave, lallot.iSickLeave AS sickLeave
    FROM nw_employee_personal_dtls pdtl 
    INNER JOIN nw_staff_attendance_dtl adtl ON pdtl.pklEmployeeRegID = adtl.fklEmployeeRegId
    INNER JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
    INNER JOIN nw_mams_year year ON year.pklYearId = lallot.fklYearId 
    WHERE year.vsYear = YEAR(CURDATE()) AND bReleased = 0`,

  leaveApproval: `UPDATE nw_staff_attendance_leave_applications SET bApproval = ?, bPending = 0, vsRejectionReason = ? WHERE pklLeaveApplicationId = ?;`,
  //////////////////////////////////////////////////////////////////
  tempApprove: `UPDATE nw_staff_attendance_leave_applications SET tempApproval = ? WHERE pklLeaveApplicationId = ?;`,
  tempApproveR:`SELECT tempApproval
      FROM nw_staff_attendance_leave_applications
      WHERE pklLeaveApplicationId = ?;`,
 
  tempApprovePL: `UPDATE nw_staff_attendance_parental_leave SET tempApproval = ? WHERE pklParentalLeaveApplicationId = ?;`,
  tempApprovePLr:`SELECT tempApproval
  FROM nw_staff_attendance_parental_leave
  WHERE pklParentalLeaveApplicationId = ?;`,
  //////////////////////////////////////////////////////////////////

  leaveBalance: `SELECT fklEmpCode AS empId, iCasualLeave AS CL, iSickLeave AS ML, iParentalLeave AS PL, y.vsYear AS year
                    FROM nw_staff_attendance_leaves_allotted 
                    LEFT JOIN nw_mams_year y ON y.pklYearId = fklYearId
                    WHERE fklEmpCode = ?`,

  leaveDetails: `SELECT fklEmpCode AS empId, iLeaveDuration AS duration, vsType AS type 
                    FROM nw_staff_attendance_leave_applications WHERE bApproval = 1 AND fklEmpCode = ? AND vsType = ?`,

  leavesAlloted: `INSERT INTO nw_staff_attendance_leaves_allotted (fklEmpCode, iCasualLeave, iSickLeave, iParentalLeave, fklYearId) VALUES (?,?,?,?,?)`,

  pendingLeaveExport: `SELECT 
        CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS 'Name',
        dsgn.vsDesignationName AS 'Designation',
        CONCAT("EMP00000", adtl.pklEmpCode) AS 'Employee Code',
        DATE_FORMAT(dtAppliedDate, '%d-%m-%Y') AS 'Applied Date',
        iLeaveDuration AS 'Leave Duration',
        vsReason AS 'Leave Reason',
        DATE_FORMAT(dtLeaveDate, '%d-%m-%Y') AS 'Leave Date',
        last.leaveDate AS 'Last Leave',
        vsType AS 'Type',
        '' AS 'Comments From HR (If Any)',
        '' AS 'Comments',
        '' AS 'Approval (Yes/No)',
        '' AS 'Signature'
        FROM nw_staff_attendance_leave_applications lapply
        INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
        INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
        LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
        LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
        INNER JOIN (SELECT fklEmpCode, DATE_FORMAT(MAX(dtLeaveDate), '%d-%m-%Y') AS leaveDate FROM nw_staff_attendance_leave_applications WHERE bApproval = 1 GROUP BY fklEmpCode ) last ON last.fklEmpCode = lapply.fklEmpCode
        WHERE bPending = 1 
        UNION 
        SELECT 
        CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS 'Name',
        dsgn.vsDesignationName AS 'Designation',
        CONCAT("EMP00000", adtl.pklEmpCode) AS 'Employee Code',
        DATE_FORMAT(dtAppliedDate, '%d-%m-%Y') AS 'Applied Date',
        DATEDIFF(dtEndDate, dtStartDate) + 1 AS 'Leave Duration',
        'Parental Leave' AS 'Leave Reason',
        CONCAT(DATE_FORMAT(dtStartDate, '%d-%m-%Y'), ' to ', DATE_FORMAT(dtEndDate, '%d-%m-%Y') ) AS 'Leave Date',
        '' AS 'Last Leave',
        'PL' AS 'Type',
        '' AS 'Comments From HR (If Any)',
        '' AS 'Comments',
        '' AS 'Approval (Yes/No)',
        '' AS 'Signature'
        FROM nw_staff_attendance_parental_leave pleave
        INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
        INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
        LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
        LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
        WHERE bPending = 1`,
 
  leaveList:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  lapply.bpending,
  lapply.bApproval,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_leave_applications lapply
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation 
  GROUP BY appliedDate
  UNION 
  SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  pleave.bPending,
  pleave.bApproved,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_parental_leave pleave
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  GROUP BY appliedDate;`,
        //remove the max and min ,add min applicationId
        //adding minDates and maxdates
  leaveListPending:`SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  lapply.iLeaveDuration AS leaveDuration,
  lapply.vsReason AS reason,
  DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
  lapply.vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_leave_applications lapply
INNER JOIN (
  SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
  SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
-- Added the condition to get the correct last leave date for CL
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
-- Added the condition to get the correct last leave date for ML
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
UNION
SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(pleave.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  DATEDIFF(pleave.dtEndDate, pleave.dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS reason,
  DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(pleave.dtEndDate, '%Y-%m-%d') AS endDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', pleave.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_parental_leave pleave
INNER JOIN (
  SELECT fklEmpCode, MIN(pklParentalLeaveApplicationId) AS minParentalApplicationId
  FROM nw_staff_attendance_parental_leave
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minPleave ON pleave.fklEmpCode = minPleave.fklEmpCode AND pleave.pklParentalLeaveApplicationId = minPleave.minParentalApplicationId
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON pleave.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON pleave.fklEmpCode = mlLastLeave.fklEmpCode
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY pleave.pklParentalLeaveApplicationId, adtl.pklEmpCode;

`,
  leaveListPendingPl:`
SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(pleave.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  DATEDIFF(pleave.dtEndDate, pleave.dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS reason,
  DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(pleave.dtEndDate, '%Y-%m-%d') AS endDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', pleave.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_parental_leave pleave
INNER JOIN (
  SELECT fklEmpCode, MIN(pklParentalLeaveApplicationId) AS minParentalApplicationId
  FROM nw_staff_attendance_parental_leave
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minPleave ON pleave.fklEmpCode = minPleave.fklEmpCode AND pleave.pklParentalLeaveApplicationId = minPleave.minParentalApplicationId
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON pleave.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON pleave.fklEmpCode = mlLastLeave.fklEmpCode
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY pleave.pklParentalLeaveApplicationId, adtl.pklEmpCode;

`,
  leaveListPendingCl:`SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  lapply.iLeaveDuration AS leaveDuration,
  lapply.vsReason AS reason,
  DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
  lapply.vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_leave_applications lapply
INNER JOIN (
  SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1 and vsType="CL"
  GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
  SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
-- Added the condition to get the correct last leave date for CL
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
-- Added the condition to get the correct last leave date for ML
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
`,
  leaveListPendingMl:`SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  lapply.iLeaveDuration AS leaveDuration,
  lapply.vsReason AS reason,
  DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
  lapply.vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_leave_applications lapply
INNER JOIN (
  SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1 and vsType="ML"
  GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
  SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
-- Added the condition to get the correct last leave date for CL
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
-- Added the condition to get the correct last leave date for ML
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
`,
  leaveListPendingFilter:`SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  lapply.iLeaveDuration AS leaveDuration,
  lapply.vsReason AS reason,
  DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
  lapply.vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_leave_applications lapply
INNER JOIN (
  SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1 AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ?
  GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
  SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
-- Added the condition to get the correct last leave date for CL
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
-- Added the condition to get the correct last leave date for ML
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
UNION
SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(pleave.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  DATEDIFF(pleave.dtEndDate, pleave.dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS reason,
  DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(pleave.dtEndDate, '%Y-%m-%d') AS endDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', pleave.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_parental_leave pleave
INNER JOIN (
  SELECT fklEmpCode, MIN(pklParentalLeaveApplicationId) AS minParentalApplicationId
  FROM nw_staff_attendance_parental_leave
  WHERE bPending = 1 AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ?
  GROUP BY fklEmpCode
) AS minPleave ON pleave.fklEmpCode = minPleave.fklEmpCode AND pleave.pklParentalLeaveApplicationId = minPleave.minParentalApplicationId
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON pleave.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON pleave.fklEmpCode = mlLastLeave.fklEmpCode
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY pleave.pklParentalLeaveApplicationId, adtl.pklEmpCode;

`,
  leaveListPendingFilterPl:`
SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(pleave.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  DATEDIFF(pleave.dtEndDate, pleave.dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS reason,
  DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(pleave.dtEndDate, '%Y-%m-%d') AS endDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', pleave.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_parental_leave pleave
INNER JOIN (
  SELECT fklEmpCode, MIN(pklParentalLeaveApplicationId) AS minParentalApplicationId
  FROM nw_staff_attendance_parental_leave
  WHERE bPending = 1 AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ?
  GROUP BY fklEmpCode
) AS minPleave ON pleave.fklEmpCode = minPleave.fklEmpCode AND pleave.pklParentalLeaveApplicationId = minPleave.minParentalApplicationId
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON pleave.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON pleave.fklEmpCode = mlLastLeave.fklEmpCode
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY pleave.pklParentalLeaveApplicationId, adtl.pklEmpCode;

`,
  leaveListPendingFilterCl:`SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  lapply.iLeaveDuration AS leaveDuration,
  lapply.vsReason AS reason,
  DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
  lapply.vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_leave_applications lapply
INNER JOIN (
  SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1 AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? and vsType="CL"
  GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
  SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
-- Added the condition to get the correct last leave date for CL
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
-- Added the condition to get the correct last leave date for ML
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
`,
  leaveListPendingFilterMl:`SELECT 
  CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
  lapply.iLeaveDuration AS leaveDuration,
  lapply.vsReason AS reason,
  DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
  lapply.vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
  geoloc.vsGeolocationName AS location,
  DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
  DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
  clLeaveBalance.iCasualLeave AS clLeaveBalance,
  mlLeaveBalance.iSickLeave AS mlLeaveBalance,
  tempApproval AS tempApproval
FROM 
  nw_staff_attendance_leave_applications lapply
INNER JOIN (
  SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1 AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? and vsType="ML"
  GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
  SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
  FROM nw_staff_attendance_leave_applications
  WHERE bPending = 1
  GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
-- Added the condition to get the correct last leave date for CL
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
-- Added the condition to get the correct last leave date for ML
LEFT JOIN (
  SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
  FROM nw_staff_attendance_leave_applications
  WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
    SELECT MAX(dtLeaveDate) 
    FROM nw_staff_attendance_leave_applications 
    WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
  )
  GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
-- Added the join to get CL leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
-- Added the join to get ML leave balance
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
`,

leaveListPendingDateRangeFilter:`SELECT 
CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
dsgn.vsDesignationName AS designation,
lapply.pklLeaveApplicationId AS applicationId,
adtl.pklEmpCode AS empCode,
adtl.vsEmpName AS empName,
DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
lapply.iLeaveDuration AS leaveDuration,
lapply.vsReason AS reason,
DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
lapply.vsType AS type,
CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
geoloc.vsGeolocationName AS location,
DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
clLeaveBalance.iCasualLeave AS clLeaveBalance,
mlLeaveBalance.iSickLeave AS mlLeaveBalance,
tempApproval AS tempApproval
FROM 
nw_staff_attendance_leave_applications lapply
INNER JOIN (
SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1 AND dtAppliedDate BETWEEN ? AND ADDDATE(?,INTERVAL 1 DAY)
GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1
GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1
GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
UNION
SELECT 
CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
dsgn.vsDesignationName AS designation,
pleave.pklParentalLeaveApplicationId AS applicationId,
adtl.pklEmpCode AS empCode,
adtl.vsEmpName AS empName,
DATE_FORMAT(pleave.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
DATEDIFF(pleave.dtEndDate, pleave.dtStartDate) + 1 AS leaveDuration,
'Parental Leave' AS reason,
DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS startDate,
DATE_FORMAT(pleave.dtEndDate, '%Y-%m-%d') AS endDate,
'PL' AS type,
CONCAT('https://hrms.skillmissionassam.org/CDN/', pleave.vsSupporting) AS supporting,
geoloc.vsGeolocationName AS location,
DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
clLeaveBalance.iCasualLeave AS clLeaveBalance,
mlLeaveBalance.iSickLeave AS mlLeaveBalance,
tempApproval AS tempApproval
FROM 
nw_staff_attendance_parental_leave pleave
INNER JOIN (
SELECT fklEmpCode, MIN(pklParentalLeaveApplicationId) AS minParentalApplicationId
FROM nw_staff_attendance_parental_leave
WHERE bPending = 1 AND dtAppliedDate BETWEEN ? AND ADDDATE(?,INTERVAL 1 DAY)
GROUP BY fklEmpCode
) AS minPleave ON pleave.fklEmpCode = minPleave.fklEmpCode AND pleave.pklParentalLeaveApplicationId = minPleave.minParentalApplicationId
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS clLastLeave ON pleave.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS mlLastLeave ON pleave.fklEmpCode = mlLastLeave.fklEmpCode
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY pleave.pklParentalLeaveApplicationId, adtl.pklEmpCode, pleave.dtEndDate;

`,
leaveListPendingDateRangeFilterPl:`
SELECT 
CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
dsgn.vsDesignationName AS designation,
pleave.pklParentalLeaveApplicationId AS applicationId,
adtl.pklEmpCode AS empCode,
adtl.vsEmpName AS empName,
DATE_FORMAT(pleave.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
DATEDIFF(pleave.dtEndDate, pleave.dtStartDate) + 1 AS leaveDuration,
'Parental Leave' AS reason,
DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS startDate,
DATE_FORMAT(pleave.dtEndDate, '%Y-%m-%d') AS endDate,
'PL' AS type,
CONCAT('https://hrms.skillmissionassam.org/CDN/', pleave.vsSupporting) AS supporting,
geoloc.vsGeolocationName AS location,
DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
clLeaveBalance.iCasualLeave AS clLeaveBalance,
mlLeaveBalance.iSickLeave AS mlLeaveBalance,
tempApproval AS tempApproval
FROM 
nw_staff_attendance_parental_leave pleave
INNER JOIN (
SELECT fklEmpCode, MIN(pklParentalLeaveApplicationId) AS minParentalApplicationId
FROM nw_staff_attendance_parental_leave
WHERE bPending = 1 AND dtAppliedDate BETWEEN ? AND ADDDATE(?,INTERVAL 1 DAY)
GROUP BY fklEmpCode
) AS minPleave ON pleave.fklEmpCode = minPleave.fklEmpCode AND pleave.pklParentalLeaveApplicationId = minPleave.minParentalApplicationId
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS clLastLeave ON pleave.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS mlLastLeave ON pleave.fklEmpCode = mlLastLeave.fklEmpCode
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY pleave.pklParentalLeaveApplicationId, adtl.pklEmpCode, pleave.dtEndDate;

`,
leaveListPendingDateRangeFilterCl:`SELECT 
CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
dsgn.vsDesignationName AS designation,
lapply.pklLeaveApplicationId AS applicationId,
adtl.pklEmpCode AS empCode,
adtl.vsEmpName AS empName,
DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
lapply.iLeaveDuration AS leaveDuration,
lapply.vsReason AS reason,
DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
lapply.vsType AS type,
CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
geoloc.vsGeolocationName AS location,
DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
clLeaveBalance.iCasualLeave AS clLeaveBalance,
mlLeaveBalance.iSickLeave AS mlLeaveBalance,
tempApproval AS tempApproval
FROM 
nw_staff_attendance_leave_applications lapply
INNER JOIN (
SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1 AND dtAppliedDate BETWEEN ? AND ADDDATE(?,INTERVAL 1 DAY) and vsType="CL"
GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1
GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1
GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode

`,
leaveListPendingDateRangeFilterMl:`SELECT 
CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
dsgn.vsDesignationName AS designation,
lapply.pklLeaveApplicationId AS applicationId,
adtl.pklEmpCode AS empCode,
adtl.vsEmpName AS empName,
DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
lapply.iLeaveDuration AS leaveDuration,
lapply.vsReason AS reason,
DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
lapply.vsType AS type,
CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
geoloc.vsGeolocationName AS location,
DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
clLeaveBalance.iCasualLeave AS clLeaveBalance,
mlLeaveBalance.iSickLeave AS mlLeaveBalance,
tempApproval AS tempApproval
FROM 
nw_staff_attendance_leave_applications lapply
INNER JOIN (
SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1 AND dtAppliedDate BETWEEN ? AND ADDDATE(?,INTERVAL 1 DAY) and vsType="ML"
GROUP BY fklEmpCode
) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
INNER JOIN (
SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1
GROUP BY fklEmpCode
) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
INNER JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
FROM nw_staff_attendance_leave_applications
WHERE bPending = 1
GROUP BY fklEmpCode
) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
LEFT JOIN (
SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
FROM nw_staff_attendance_leave_applications
WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
  SELECT MAX(dtLeaveDate) 
  FROM nw_staff_attendance_leave_applications 
  WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
)
GROUP BY fklEmpCode
) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode

`,
  pdfDataQuery:`SELECT * FROM (
    SELECT 
      CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
      dsgn.vsDesignationName AS designation,
      lapply.pklLeaveApplicationId AS applicationId,
      adtl.pklEmpCode AS empCode,
      adtl.vsEmpName AS empName,
      DATE_FORMAT(lapply.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
      lapply.iLeaveDuration AS leaveDuration,
      lapply.vsReason AS reason,
      DATE_FORMAT(minDates.minStartDate, '%Y-%m-%d') AS startDate,
      DATE_FORMAT(maxDates.maxEndDate, '%Y-%m-%d') AS endDate,
      lapply.vsType AS type,
      CONCAT('https://hrms.skillmissionassam.org/CDN/', lapply.vsSupporting) AS supporting,
      geoloc.vsGeolocationName AS location,
      DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
      DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
      clLeaveBalance.iCasualLeave AS clLeaveBalance,
      mlLeaveBalance.iSickLeave AS mlLeaveBalance
    FROM 
      nw_staff_attendance_leave_applications lapply
    INNER JOIN (
      SELECT fklEmpCode, MIN(pklLeaveApplicationId) AS minApplicationId
      FROM nw_staff_attendance_leave_applications
      WHERE bPending = 1
      GROUP BY fklEmpCode
    ) AS minLapply ON lapply.fklEmpCode = minLapply.fklEmpCode AND lapply.pklLeaveApplicationId = minLapply.minApplicationId
    INNER JOIN (
      SELECT fklEmpCode, MIN(dtLeaveDate) AS minStartDate
      FROM nw_staff_attendance_leave_applications
      WHERE bPending = 1
      GROUP BY fklEmpCode
    ) AS minDates ON lapply.fklEmpCode = minDates.fklEmpCode
    INNER JOIN (
      SELECT fklEmpCode, MAX(dtLeaveDate) AS maxEndDate
      FROM nw_staff_attendance_leave_applications
      WHERE bPending = 1
      GROUP BY fklEmpCode
    ) AS maxDates ON lapply.fklEmpCode = maxDates.fklEmpCode
    -- Added the condition to get the correct last leave date for CL
    LEFT JOIN (
      SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
      FROM nw_staff_attendance_leave_applications
      WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
        SELECT MAX(dtLeaveDate) 
        FROM nw_staff_attendance_leave_applications 
        WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
      )
      GROUP BY fklEmpCode
    ) AS clLastLeave ON lapply.fklEmpCode = clLastLeave.fklEmpCode
    -- Added the condition to get the correct last leave date for ML
    LEFT JOIN (
      SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
      FROM nw_staff_attendance_leave_applications
      WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
        SELECT MAX(dtLeaveDate) 
        FROM nw_staff_attendance_leave_applications 
        WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
      )
      GROUP BY fklEmpCode
    ) AS mlLastLeave ON lapply.fklEmpCode = mlLastLeave.fklEmpCode
    LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
    LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
    -- Added the join to get CL leave balance
    LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
    -- Added the join to get ML leave balance
    LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
    GROUP BY lapply.pklLeaveApplicationId, adtl.pklEmpCode
    UNION
    SELECT 
      CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
      dsgn.vsDesignationName AS designation,
      pleave.pklParentalLeaveApplicationId AS applicationId,
      adtl.pklEmpCode AS empCode,
      adtl.vsEmpName AS empName,
      DATE_FORMAT(pleave.dtAppliedDate, '%Y-%m-%d') AS appliedDate,
      DATEDIFF(pleave.dtEndDate, pleave.dtStartDate) + 1 AS leaveDuration,
      'Parental Leave' AS reason,
      DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS startDate,
      DATE_FORMAT(pleave.dtEndDate, '%Y-%m-%d') AS endDate,
      'PL' AS type,
      CONCAT('https://hrms.skillmissionassam.org/CDN/', pleave.vsSupporting) AS supporting,
      geoloc.vsGeolocationName AS location,
      DATE_FORMAT(clLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastCLDate,
      DATE_FORMAT(mlLastLeave.lastLeaveDate, '%Y-%m-%d') AS lastMLDate,
      clLeaveBalance.iCasualLeave AS clLeaveBalance,
      mlLeaveBalance.iSickLeave AS mlLeaveBalance
    FROM 
      nw_staff_attendance_parental_leave pleave
    INNER JOIN (
      SELECT fklEmpCode, MIN(pklParentalLeaveApplicationId) AS minParentalApplicationId
      FROM nw_staff_attendance_parental_leave
      WHERE bPending = 1
      GROUP BY fklEmpCode
    ) AS minPleave ON pleave.fklEmpCode = minPleave.fklEmpCode AND pleave.pklParentalLeaveApplicationId = minPleave.minParentalApplicationId
    LEFT JOIN (
      SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
      FROM nw_staff_attendance_leave_applications
      WHERE vsType = 'CL' AND bApproval = 1 AND dtLeaveDate < (
        SELECT MAX(dtLeaveDate) 
        FROM nw_staff_attendance_leave_applications 
        WHERE vsType = 'CL' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
      )
      GROUP BY fklEmpCode
    ) AS clLastLeave ON pleave.fklEmpCode = clLastLeave.fklEmpCode
    LEFT JOIN (
      SELECT fklEmpCode, MAX(dtLeaveDate) AS lastLeaveDate
      FROM nw_staff_attendance_leave_applications
      WHERE vsType = 'ML' AND bApproval = 1 AND dtLeaveDate < (
        SELECT MAX(dtLeaveDate) 
        FROM nw_staff_attendance_leave_applications 
        WHERE vsType = 'ML' AND bApproval = 1 AND fklEmpCode = nw_staff_attendance_leave_applications.fklEmpCode
      )
      GROUP BY fklEmpCode
    ) AS mlLastLeave ON pleave.fklEmpCode = mlLastLeave.fklEmpCode
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
    LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
    -- Added the join to get CL leave balance
    LEFT JOIN nw_staff_attendance_leaves_allotted AS clLeaveBalance ON adtl.pklEmpCode = clLeaveBalance.fklEmpCode
    -- Added the join to get ML leave balance
    LEFT JOIN nw_staff_attendance_leaves_allotted AS mlLeaveBalance ON adtl.pklEmpCode = mlLeaveBalance.fklEmpCode
    GROUP BY pleave.pklParentalLeaveApplicationId, adtl.pklEmpCode
    ) AS subquery
    WHERE applicationId = ?
    
`,


//   leaveListPending: `SELECT 
//   CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
//   dsgn.vsDesignationName AS designation,
//   lapply.pklLeaveApplicationId AS applicationId,
//   adtl.pklEmpCode AS empCode,
//   adtl.vsEmpName AS empName,
//   DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
//   iLeaveDuration AS leaveDuration,
//   vsReason AS reason,
//   MIN(DATE_FORMAT(dtLeaveDate, '%Y-%m-%d')) AS startDate,  MAX(DATE_FORMAT(dtLeaveDate, '%Y-%m-%d')) AS endDate, 
//   vsType AS type,
//   CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting,
//   geoloc.vsGeolocationName AS location
//   FROM nw_staff_attendance_leave_applications lapply
//   INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
//   INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
//   LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
//   LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
//   LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
//   LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
//   WHERE bPending = 1 
//   UNION 
//   SELECT 
//   CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
//   dsgn.vsDesignationName AS designation,
//   pleave.pklParentalLeaveApplicationId AS applicationId,
//   adtl.pklEmpCode AS empCode,
//   adtl.vsEmpName AS empName,
//   DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
//   DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
//  'Parental Leave' AS leaveReason,
//   DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS startDate,  DATE_FORMAT(dtEndDate, '%Y-%m-%d') AS startDate, 
//   'PL' AS type,
//   CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting,
//   geoloc.vsGeolocationName AS location
//   FROM nw_staff_attendance_parental_leave pleave
//   INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
//   INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
//   LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
//   LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
//     LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = adtl.pklEmpCode
//   LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
//   WHERE bPending = 1`,

  leaveListRejected: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 
    UNION 
    SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    pleave.pklParentalLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
    'Parental Leave' AS leaveReason,
    DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
    'PL' AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_parental_leave pleave
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproved = 0 `,
  leaveListRejectedPl: `
    SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    pleave.pklParentalLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
    'Parental Leave' AS leaveReason,
    DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
    'PL' AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_parental_leave pleave
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproved = 0 `,
  leaveListRejectedCl: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 and vsType="CL"
    `,
  leaveListRejectedMl: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 and vsType="ML"
    `,
  leaveListRejectedFilter: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ?
    UNION 
    SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    pleave.pklParentalLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
    'Parental Leave' AS leaveReason,
    DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
    'PL' AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_parental_leave pleave
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproved = 0
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? `,
  leaveListRejectedFilterPl: `
    SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    pleave.pklParentalLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
    'Parental Leave' AS leaveReason,
    DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
    'PL' AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_parental_leave pleave
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproved = 0
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? `,
  leaveListRejectedFilterCl: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? and vsType="CL"
    `,
  leaveListRejectedFilterMl: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? and vsType="ML"
    `,

    leaveListRejectedDateRangeFilter: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ?
    UNION 
    SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    pleave.pklParentalLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
    'Parental Leave' AS leaveReason,
    DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
    'PL' AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_parental_leave pleave
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproved = 0
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? `,
    leaveListRejectedDateRangeFilterPl: `
    SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    pleave.pklParentalLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
    'Parental Leave' AS leaveReason,
    DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
    'PL' AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_parental_leave pleave
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproved = 0
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? `,
    leaveListRejectedDateRangeFilterCl: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? and vsType="CL"
    `,
    leaveListRejectedDateRangeFilterMl: `SELECT 
    CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
    dsgn.vsDesignationName AS designation,
    lapply.pklLeaveApplicationId AS applicationId,
    adtl.pklEmpCode AS empCode,
    adtl.vsEmpName AS empName,
    DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
    iLeaveDuration AS leaveDuration,
    vsReason AS reason,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS type,
    CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
    INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    WHERE bPending = 0 AND bApproval = 0 
    AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? and vsType="ML"
    `,
    
  leaveListApproved: `SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_leave_applications lapply
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  WHERE bPending = 0 AND bApproval = 1 
  GROUP BY appliedDate
  UNION 
  SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_parental_leave pleave
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  WHERE bPending = 0 AND bApproved = 1 
  GROUP BY appliedDate;`,
  leaveListApprovedPl: `
  SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_parental_leave pleave
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  WHERE bPending = 0 AND bApproved = 1 
  GROUP BY appliedDate;`,
  leaveListPl: `
  SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  pleave.bPending,
  pleave.bApproved,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_parental_leave pleave
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  GROUP BY appliedDate;`,
  leaveListApprovedCl: `SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_leave_applications lapply
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  WHERE bPending = 0 AND bApproval = 1 and vsType="CL"
  GROUP BY appliedDate
  `,
  leaveListCl: `SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  lapply.bPending,
  lapply.bApproval,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_leave_applications lapply
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  WHERE vsType="CL"
  GROUP BY appliedDate
  `,
  leaveListApprovedMl: `SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_leave_applications lapply
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  WHERE bPending = 0 AND bApproval = 1 and vsType="ML"
  GROUP BY appliedDate
  `,
  leaveListMl: `SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  lapply.bPending,
  lapply.bApproval,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
  FROM nw_staff_attendance_leave_applications lapply
  INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
  INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
  LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
  LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
  WHERE vsType="ML"
  GROUP BY appliedDate
  `,

  leaveListApprovedFilter:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproval = 1 
  AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ?  -- This is the filter for dtAppliedDate
GROUP BY appliedDate
UNION 
SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_parental_leave pleave
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproved = 1 
  AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ?  -- This is the filter for dtAppliedDate
GROUP BY appliedDate;`,
  leaveListApprovedFilterPl:`
SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_parental_leave pleave
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproved = 1 
  AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ?  -- This is the filter for dtAppliedDate
GROUP BY appliedDate;`,
  leaveListApprovedFilterCl:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproval = 1 
  AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? and vsType="CL"
GROUP BY appliedDate
`,
  leaveListApprovedFilterMl:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproval = 1 
  AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') = ? and vsType="ML"
GROUP BY appliedDate
`,
leaveListApprovedDateRangeFilter:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproval = 1 
AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ?
GROUP BY appliedDate
UNION 
SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_parental_leave pleave
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproved = 1 
AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? 
GROUP BY appliedDate;`,
leaveListDateRangeFilter:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  lapply.bPending,
  lapply.bApproval,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE 
DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ?
GROUP BY appliedDate
UNION 
SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  pleave.bPending,
  pleave.bApproved,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_parental_leave pleave
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE
 DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? 
GROUP BY appliedDate;`,
leaveListApprovedDateRangeFilterPl:`
SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_parental_leave pleave
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproved = 1 
AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? 
GROUP BY appliedDate;`,
leaveListDateRangeFilterPl:`
SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  pleave.pklParentalLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
  'Parental Leave' AS leaveReason,
  DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
  'PL' AS type,
  pleave.bPending,
  pleave.bApproved,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_parental_leave pleave
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? 
GROUP BY appliedDate;`,
leaveListApprovedDateRangeFilterCl:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproval = 1 
AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? and vsType='CL'
GROUP BY appliedDate
`,
leaveListDateRangeFilterCl:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  lapply.bPending,
  lapply.bApproval,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? and vsType='CL'
GROUP BY appliedDate
`,
leaveListApprovedDateRangeFilterMl:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE bPending = 0 AND bApproval = 1 
AND DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? and vsType='ML'
GROUP BY appliedDate
`,
leaveListDateRangeFilterMl:`SELECT 
  CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
  dsgn.vsDesignationName AS designation,
  lapply.pklLeaveApplicationId AS applicationId,
  adtl.pklEmpCode AS empCode,
  adtl.vsEmpName AS empName,
  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d %H:%i:%s') AS appliedDate,
  iLeaveDuration AS leaveDuration,
  vsReason AS reason,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS type,
  lapply.bPending,
  lapply.bApproval,
  CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
FROM nw_staff_attendance_leave_applications lapply
INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
WHERE DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') BETWEEN ? AND ? and vsType='ML'
GROUP BY appliedDate
`,

  leaveDetail: `SELECT 
  pklLeaveApplicationId AS id,
  bApproval AS approval,
  DATE_FORMAT(dtAppliedDate, "%Y-%m-%d") AS appliedDate,
  iLeaveDuration AS duration,
  vsLeaveHeader AS reason,
  DATE_FORMAT(dtLeaveDate, "%Y-%m-%d") AS leaveDate,
  vsType AS leaveType,
  bPending AS pending,
  pklEmpCode AS employeeId,
  CONCAT(vsFirstName, " ", IFNULL(vsMiddleName, ""), " ", vslastName) AS name,
  vsPhoneNumber AS phoneNumber,
  vsEmail AS email,
  iCasualLeave AS casualLeave,
  iSickLeave AS sickLeave,
  iParentalLeave AS parentalLeave,
  tempApproval AS tempApproval
  FROM nw_staff_attendance_leave_applications lapply 
  LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
  LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
  LEFT JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
  LEFT JOIN nw_mams_year year ON lallot.fklYearId = year.pklYearId 
  LEFT JOIN nw_mams_leave_header ON fklReasonId = pklLeaveHeaderId
  WHERE lapply.pklLeaveApplicationId = ?`,

  parentalLeaveDetail: `SELECT pklParentalLeaveApplicationId AS id, bApproved AS approval, DATE_FORMAT(dtAppliedDate, "%Y-%m-%d") AS appliedDate,dtAppliedDate as dateApplied,
    DATE_FORMAT(dtStartDate, "%Y-%m-%d") AS startDate,  DATE_FORMAT(dtEndDate, "%Y-%m-%d") AS endDate,  
       DATEDIFF(dtEndDate, dtStartDate) + 1 AS duration, bPending AS pending, pklEmpCode AS employeeId,
       CONCAT(vsFirstName, " ", IFNULL(vsMiddleName, ""), " ", vslastName) AS name,vsPhoneNumber AS phoneNumber,vsEmail AS email,iCasualLeave AS casualLeave,
       iSickLeave AS sickLeave,iParentalLeave AS parentalLeave, 'PL' AS leaveType, 'N/A' AS reaseon
       FROM nw_staff_attendance_parental_leave pl
       LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pl.fklEmpCode
       LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
       LEFT JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
       LEFT JOIN nw_mams_year year ON lallot.fklYearId = year.pklYearId 
       WHERE pl.pklParentalLeaveApplicationId = ?`,

  leaveHistory: `SELECT
    pklLeaveApplicationId AS applicationId, 
    CASE
        WHEN bPending = 1 THEN 'Pending'
        WHEN bApproval = 1 THEN 'Approved'
        WHEN bApproval = 0 THEN 'Rejected'
    END AS status,
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsType AS leaveType
FROM nw_staff_attendance_leave_applications lapply
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
WHERE adtl.pklEmpCode = ? AND lapply.bPending = 1
ORDER BY 1 DESC;
`,
  leaveHistoryApproved:`SELECT
  lapply.applicationId, 
  lapply.status,
  lapply.leaveDate,
  lapply.leaveType
FROM (
    SELECT 
      pklLeaveApplicationId AS applicationId, 
      CASE
          WHEN bPending = 1 THEN 'Pending'
          WHEN bApproval = 1 THEN 'Approved'
          WHEN bApproval = 0 THEN 'Rejected'
      END AS status,
      DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
      vsType AS leaveType,
      dtAppliedDate AS appliedDate,
      fklEmpCode AS empCode
    FROM nw_staff_attendance_leave_applications
    WHERE bApproval = 1

    UNION ALL 

    SELECT
      pklParentalLeaveApplicationId AS applicationId, 
      CASE
          WHEN bPending = 1 THEN 'Pending'
          WHEN bApproved = 1 THEN 'Approved'
          WHEN bApproved = 0 THEN 'Rejected'
      END AS status,
      DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
      'Parental Leave' AS leaveType,
      dtAppliedDate AS appliedDate,
      fklEmpCode AS empCode
    FROM nw_staff_attendance_parental_leave
    WHERE bApproved = 1
) AS lapply
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.empCode
WHERE 
  adtl.pklEmpCode = ?
  AND LEFT(lapply.appliedDate, 16) = LEFT(?, 16)
ORDER BY lapply.applicationId DESC;


`,
//   leaveHistoryApproved:`SELECT
//   lapply.pklLeaveApplicationId AS applicationId, 
//   CASE
//       WHEN lapply.bPending = 1 THEN 'Pending'
//       WHEN lapply.bApproval = 1 THEN 'Approved'
//       WHEN lapply.bApproval = 0 THEN 'Rejected'
//   END AS status,
//   DATE_FORMAT(lapply.dtLeaveDate, '%Y-%m-%d') AS leaveDate,
//   lapply.vsType AS leaveType
// FROM nw_staff_attendance_leave_applications lapply
// LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
// WHERE 
//   adtl.pklEmpCode = ?
//   AND lapply.bApproval = 1
//   AND LEFT(lapply.dtAppliedDate, 16) = LEFT(?, 16)
// UNION 
// SELECT
//   pleave.pklParentalLeaveApplicationId AS applicationId, 
//   CASE
//       WHEN pleave.bPending = 1 THEN 'Pending'
//       WHEN pleave.bApproved = 1 THEN 'Approved'
//       WHEN pleave.bApproved = 0 THEN 'Rejected'
//   END AS status,
//   DATE_FORMAT(pleave.dtStartDate, '%Y-%m-%d') AS leaveDate,
//   'Parental Leave' AS leaveType
// FROM nw_staff_attendance_parental_leave pleave
// LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
// WHERE 
//   adtl.pklEmpCode = ?
//   AND pleave.bApproved = 1
//   AND LEFT(pleave.dtAppliedDate, 16) = LEFT(?, 16)
// ORDER BY 1 DESC;

// `,
  leaveHistoryReject:`SELECT
  pklLeaveApplicationId AS applicationId, 
  CASE
      WHEN bPending = 1 THEN 'Pending'
      WHEN bApproval = 1 THEN 'Approved'
      WHEN bApproval = 0 THEN 'Rejected'
  END AS status,
  DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
  vsType AS leaveType
FROM nw_staff_attendance_leave_applications lapply
LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
WHERE adtl.pklEmpCode = ? AND lapply.bApproval = 0
ORDER BY 1 DESC;`,


  parentalLeaveHistory: `  SELECT pklParentalLeaveApplicationId AS applicationId,
    CASE WHEN bPending = 1 THEN 'Pending'
         WHEN bApproved = 1 THEN 'Approved'
         WHEN bApproved = 0 THEN 'Rejected'
    END AS status, 
    DATE_FORMAT(dtStartDate, "%Y-%m-%d") AS startDate,  DATE_FORMAT(dtEndDate, "%Y-%m-%d") AS endDate, 
    'PL' AS type 
    FROM nw_staff_attendance_parental_leave pl
    LEFT JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pl.fklEmpCode
    WHERE adtl.pklEmpCode = ? ORDER BY 1 DESC LIMIT 0,5`,
  
  pLeaveHistory:`SELECT
  pklParentalLeaveApplicationId AS applicationId, 
  CASE
      WHEN bPending = 1 THEN 'Pending'
      WHEN bApproved = 1 THEN 'Approved'
      WHEN bApproved = 0 THEN 'Rejected'
  END AS status,
  DATE_FORMAT(dtStartDate, "%Y-%m-%d") AS startDate,  DATE_FORMAT(dtEndDate, "%Y-%m-%d") AS endDate,
  'PL' AS type 
FROM nw_staff_attendance_parental_leave
WHERE bApproved = 1 and
fklEmpCode = ?
AND LEFT(dtAppliedDate, 16) = LEFT(?, 16)
ORDER BY applicationId DESC;`,

  pLeaveHistoryRejected:`SELECT
  pklParentalLeaveApplicationId AS applicationId, 
  CASE
      WHEN bPending = 1 THEN 'Pending'
      WHEN bApproved = 1 THEN 'Approved'
      WHEN bApproved = 0 THEN 'Rejected'
  END AS status,
  DATE_FORMAT(dtStartDate, "%Y-%m-%d") AS startDate,  DATE_FORMAT(dtEndDate, "%Y-%m-%d") AS endDate,
  'PL' AS type 
FROM nw_staff_attendance_parental_leave
WHERE bApproved = 0 and
fklEmpCode = ?
AND LEFT(dtAppliedDate, 16) = LEFT(?, 16)
ORDER BY applicationId DESC;`,

  updateBalanceCL: `UPDATE nw_staff_attendance_leaves_allotted SET iCasualLeave = ? WHERE fklEmpCode = ? AND iCasualLeave > 0`,
  updateBalanceSL: `UPDATE nw_staff_attendance_leaves_allotted SET iSickLeave = ? WHERE fklEmpCode = ? AND iSickLeave > 0`,

  leaveApprovalPL: `UPDATE nw_staff_attendance_parental_leave SET bPending = 0, bApproved = ? WHERE pklParentalLeaveApplicationId = ?`,

  PLleaveBalance : `SELECT fklEmpCode AS empId, iCasualLeave AS CL, iSickLeave AS ML, iParentalLeave AS PL, y.vsYear AS year
  FROM nw_staff_attendance_leaves_allotted 
  LEFT JOIN nw_mams_year y ON y.pklYearId = fklYearId
  WHERE fklEmpCode = ?`,

  leaveDetailsPL : `SELECT fklEmpCode AS empId, timestampdiff(DAY,dtStartDate,dtEndDate) AS duration FROM nw_staff_attendance_parental_leave
                    WHERE bApproved = 1 AND fklEmpCode = ?;`,

  updateBalancePL : `UPDATE nw_staff_attendance_leaves_allotted SET iParentalLeave = ? WHERE fklEmpCode = ? AND iParentalLeave > 0`,
};

// employment details to be inner joined later

module.exports = exports = query;


//









// SELECT 
//   CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
//   dsgn.vsDesignationName AS designation,
//   lapply.pklLeaveApplicationId AS applicationId,
//   adtl.pklEmpCode AS empCode,
//   adtl.vsEmpName AS empName,
//   DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
//   iLeaveDuration AS leaveDuration,
//   vsReason AS reason,
//   DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
//   vsType AS type,
//   CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
//   FROM nw_staff_attendance_leave_applications lapply
//   INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = lapply.fklEmpCode
//   INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
//   LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
//   LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
//   WHERE bPending = 1 
//   UNION 
//   SELECT 
//   CONCAT(pdtl.vsFirstName, " " , IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name,
//   dsgn.vsDesignationName AS designation,
//   pleave.pklParentalLeaveApplicationId AS applicationId,
//   adtl.pklEmpCode AS empCode,
//   adtl.vsEmpName AS empName,
//   DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS appliedDate,
//   DATEDIFF(dtEndDate, dtStartDate) + 1 AS leaveDuration,
//   'Parental Leave' AS leaveReason,
//   DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS leaveDate,
//   'PL' AS type,
//   CONCAT('https://hrms.skillmissionassam.org/CDN/', vsSupporting) AS supporting
//   FROM nw_staff_attendance_parental_leave pleave
//   INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = pleave.fklEmpCode
//   INNER JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId 
//   LEFT JOIN nw_employee_employment_dtls edtl ON edtl.fklEmployeeRegId = pdtl.pklEmployeeRegId
//   LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
//   WHERE bPending = 1