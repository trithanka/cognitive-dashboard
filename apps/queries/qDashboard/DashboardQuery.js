const query = {
    employeeCount: `SELECT COUNT(*) AS count FROM (
        SELECT adtl.pklEmpCode AS id, pdtl.vsFirstName AS firstName, IFNULL(pdtl.vsMiddleName, "") AS middleName, pdtl.vsLastName AS lastName,
            pdtl.vsPhoneNumber As phoneNumber, pdtl.vsEmail AS emailId, dsgn.vsDesignationName AS designation, adtl.vsEmpName AS employeeId, 
            CASE
                WHEN adtl.bReleased = 0 THEN 'Active' 
                WHEN adtl.bReleased = 1 THEN 'Inactive'
            END AS status
        FROM nw_employee_personal_dtls pdtl 
        LEFT JOIN nw_employee_employment_dtls edtl ON pdtl.pklEmployeeRegId = edtl.fklEmployeeRegId 
        LEFT JOIN nw_staff_attendance_dtl adtl ON pdtl.pklEmployeeRegID = adtl.fklEmployeeRegId
        LEFT JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
        LEFT JOIN nw_mams_year year ON year.pklYearId = lallot.fklYearId 
        LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
        WHERE adtl.bReleased = 0
    ) AS subquery;`,

    //modified to show only distinct empCode
    leaveRequestPending: `SELECT COUNT(DISTINCT empCode) AS count
    FROM (
        SELECT DISTINCT fklEmpCode AS empCode
        FROM nw_staff_attendance_leave_applications
        WHERE bPending = 1
        UNION 
        SELECT DISTINCT fklEmpCode AS empCode
        FROM nw_staff_attendance_parental_leave
        WHERE bPending = 1
    ) AS combined;
    
    `,
    // leaveRequestPending: `SELECT SUM(count) AS count
    // FROM (
    // SELECT COUNT(*) AS count
    //     FROM nw_staff_attendance_leave_applications
    //     WHERE bPending = 1
    //     UNION ALL
    //     SELECT COUNT(*) AS count
    //     FROM nw_staff_attendance_parental_leave
    //     WHERE bPending = 1
    // ) AS counts;
    // `,
    leaveRequestDecided: `SELECT COUNT(*) AS count FROM nw_staff_attendance_leave_applications WHERE bPending = 0`,
    leaveRequestApproved: `SELECT SUM(count) AS count
    FROM (
    SELECT COUNT(*) AS count
        FROM nw_staff_attendance_leave_applications
        WHERE bPending = 0 AND bApproval = 1
        UNION ALL
        SELECT COUNT(*) AS count
        FROM nw_staff_attendance_parental_leave
        WHERE bPending = 0 AND bApproved = 1
    ) AS counts;
    `,
    leaveRequestRejected: `SELECT SUM(count) AS count
    FROM (
    SELECT COUNT(*) AS count
        FROM nw_staff_attendance_leave_applications
        WHERE bPending = 0 AND bApproval = 0
        UNION ALL
        SELECT COUNT(*) AS count
        FROM nw_staff_attendance_parental_leave
        WHERE bPending = 0 AND bApproved = 0
    ) AS counts;`,
    attendanceChart: `SELECT DATE_FORMAT(vsDate, '%d') AS x, COUNT(*) AS y 
    FROM nw_staff_attendance satt
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = satt.fklEmpCode 
    INNER JOIN nw_employee_employment_dtls edtl ON adtl.fklEmployeeRegId = edtl.fklEmployeeRegId  
    WHERE bInOut = 1 AND MONTH(vsDate) = ? AND vsDepartment = ? 
    GROUP BY DATE_FORMAT(vsDate, '%d') 
    ORDER BY x ASC;
    `,
    departments: `SELECT DISTINCT pklInternalDepartmentId AS department, vsInternalDepartmentName AS departmentName FROM nw_mams_internal_department`,
    leavesToday: `SELECT adtl.vsEmpName AS employeeCode, CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, "") ," ", pdtl.vsLastName) AS name FROM nw_staff_attendance_leave_applications lapply 
        LEFT JOIN nw_staff_attendance_dtl adtl ON lapply.fklEmpCode = adtl.pklEmpCode
        LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId WHERE bApproval = 1 AND dtLeaveDate = CURDATE()`
    ,
    genderWise: `SELECT gender.vsGenderName AS gender, COUNT(*) AS count FROM nw_employee_personal_dtls pdtl 
        INNER JOIN nw_mams_gender gender ON pdtl.vsGender = gender.pklGenderId
        GROUP BY gender.vsGenderName`,
    districtWise: `SELECT district.vsDistrictName AS districtName, COUNT(*) AS count FROM nw_employee_address_dtls addrdtl
    LEFT JOIN nw_mams_district district ON district.pklDistrictId = addrdtl.fklDistrict GROUP BY district.vsDistrictName`,
    ageWise: `SELECT DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(),vsDOB)), '%Y') + 0 AS age, COUNT(*) AS count FROM nw_employee_personal_dtls pdtl GROUP BY age`,
    departmentGenderWise: `SELECT idep.vsInternalDepartmentName AS department, gender.vsGenderName AS gender, COUNT(*) AS count FROM nw_employee_employment_dtls edtl 
        LEFT JOIN nw_mams_internal_department idep ON idep.pklInternalDepartmentId = edtl.vsDepartment
        LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = edtl.fklEmployeeRegId 
        LEFT JOIN nw_mams_gender gender ON gender.pklGenderId = pdtl.vsGender
        GROUP BY department, gender`,
    leaveTodayCount: `SELECT 
    COUNT(DISTINCT personal.pklEmployeeRegId) AS count
FROM 
    nw_employee_personal_dtls personal
LEFT JOIN 
    nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN 
    nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN 
    nw_staff_attendance_leave_applications AS leaves ON leaves.fklEmpCode = personal.pklEmployeeRegId
LEFT JOIN 
    nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
WHERE 
    leaves.bApproval = 1 and
    staff.bReleased=0
    AND leaves.dtLeaveDate = CURDATE();`,
    presentToday: `SELECT COUNT(*) AS count FROM nw_staff_attendance WHERE vsDate = CURDATE() AND bInOut = 0`,
    departmentWiseCount: `SELECT  idep.pklInternalDepartmentId AS departmentId,idep.vsInternalDepartmentName AS department, COUNT(*) AS count FROM nw_employee_employment_dtls edtl 
    LEFT JOIN nw_mams_internal_department idep ON idep.pklInternalDepartmentId = edtl.vsDepartment
    LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = edtl.pklEmployeeRegId
    WHERE staff.bReleased = 0
    GROUP BY department`,
    designationWiseCount: `SELECT edtl.vsDesignation AS department, des.vsDesignationName as designationName, COUNT(*) AS count 
    FROM nw_employee_employment_dtls edtl 
    LEFT JOIN nw_mams_designation des ON pklDesignationId = edtl.vsDesignation
     LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = edtl.pklEmployeeRegId
       WHERE staff.bReleased = 0
    GROUP BY department;`,
    qualificationWise: `SELECT vsQualification AS qualification, COUNT(*) AS count 
        FROM nw_employee_employment_dtls edtl LEFT JOIN nw_mams_qualification qual ON qual.pklQualificationId = edtl.fklQualification GROUP BY qualification`,
    holidays: `SELECT pklLeaveId AS id, vsLeaveName AS leaveName, DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate FROM nw_mams_leave  WHERE dtLeaveDate > NOW() LIMIT 0,4`,
    leaveCommonReason: `SELECT vsLeaveHeader AS reason, COUNT(*) AS count FROM nw_staff_attendance_leave_applications LEFT JOIN nw_mams_leave_header ON fklReasonId = pklLeaveHeaderId GROUP BY vsLeaveHeader`,
    absenteeism: `SELECT((SELECT COUNT(*) FROM nw_staff_attendance_leave_applications WHERE MONTH(dtLeaveDate) = ?)/(SELECT COUNT(*) FROM nw_staff_attendance WHERE MONTH(vsDate) = ?)) * 10  AS absenteeism`,
    departmentWiseLeave: `SELECT vsDepartment AS Id, vsInternalDepartmentName AS department, vsType AS type, COUNT(*) AS count FROM nw_mams_internal_department dept
    LEFT JOIN nw_employee_employment_dtls edtl ON edtl.vsDepartment = dept.pklInternalDepartmentId
    LEFT JOIN nw_staff_attendance_dtl adtl ON edtl.fklEmployeeRegId = adtl.fklEmployeeRegId
    LEFT JOIN nw_staff_attendance_leave_applications lapply ON lapply.fklEmpCode = adtl.pklEmpCode
    WHERE lapply.bApproval = 1 AND MONTH (lapply.dtLeaveDate) = MONTH(CURRENT_DATE())
    GROUP BY vsInternalDepartmentName, vsType;`,
    internalDepartment: `SELECT vsInternalDepartmentName AS department FROM nw_mams_internal_department`,

    designationWishData: `SELECT personal.pklEmployeeRegId AS registrationId, staff.vsEmpName AS empId, personal.vsFirstName AS fisrtName, personal.vsMiddleName AS middleName, personal.vslastName AS lastName,
    personal.vsPhoneNumber AS phone, personal.vsDOB AS DOB,designation.pklDesignationId AS designationId,designation.vsDesignationName AS designation
    FROM nw_employee_personal_dtls personal
    LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
    LEFT JOIN nw_mams_designation AS designation ON emp.vsDesignation = designation.pklDesignationId
    LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
    WHERE emp.vsDesignation = ? AND staff.bReleased = 0;`,

    departmentWiseData: `SELECT personal.pklEmployeeRegId AS registrationId,staff.vsEmpName AS empId, personal.vsFirstName AS fisrtName, personal.vsMiddleName AS middleName, personal.vslastName AS lastName,
    personal.vsPhoneNumber AS phone, personal.vsDOB AS DOB, dept.pklInternalDepartmentId AS departmentId, dept.vsInternalDepartmentName AS departmentName
    FROM nw_employee_personal_dtls personal
    LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
    LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
    LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
    WHERE emp.vsDepartment = ? AND staff.bReleased = 0;`,

    staffOnLeave: `SELECT 
    personal.pklEmployeeRegId AS registrationId,
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    personal.vsMiddleName AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId, 
    dept.vsInternalDepartmentName AS departmentName
FROM 
    nw_employee_personal_dtls personal
LEFT JOIN 
    nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN 
    nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN 
    nw_staff_attendance_leave_applications AS leaves ON leaves.fklEmpCode = personal.pklEmployeeRegId
LEFT JOIN 
    nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
WHERE 
    leaves.bApproval = 1 and
    staff.bReleased=0
    AND leaves.dtLeaveDate = CURDATE()
GROUP BY 
    personal.pklEmployeeRegId;
`,

    joiningToday: `SELECT personal.pklEmployeeRegId AS registrationId, staff.vsEmpName AS empId, personal.vsFirstName AS firsttName, personal.vsMiddleName AS middleName, personal.vslastName AS lastName,
    personal.vsPhoneNumber AS phone, personal.vsDOB AS DOB, dept.pklInternalDepartmentId AS departmentId, dept.vsInternalDepartmentName AS departmentName
    FROM nw_employee_personal_dtls personal
    LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
    LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
    LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
    WHERE personal.dtAddedOn = CURDATE();`,

    staffPresentToday: `SELECT 
    personal.pklEmployeeRegId AS registrationId, 
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    IFNULL(personal.vsMiddleName, '') AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId, 
    dept.vsInternalDepartmentName AS departmentName,
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
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM nw_employee_personal_dtls personal
LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
LEFT JOIN nw_staff_attendance attendance ON attendance.fklEmpCode = staff.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geo ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN nw_mams_designation AS desig ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
WHERE (? IS NULL OR DATE(attendance.vsTime) = ?)
  AND (? IS NULL OR MONTH(attendance.vsTime) = ?)
GROUP BY personal.pklEmployeeRegId, staff.vsEmpName, personal.vsFirstName, personal.vsMiddleName, personal.vsLastName, personal.vsPhoneNumber, personal.vsDOB, dept.pklInternalDepartmentId, dept.vsInternalDepartmentName, geo.vsGeolocationName, desig.vsDesignationName;

`,
    staffPresentTodayInside: `SELECT 
    personal.pklEmployeeRegId AS registrationId, 
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    IFNULL(personal.vsMiddleName, '') AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId, 
    dept.vsInternalDepartmentName AS departmentName,
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
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM nw_employee_personal_dtls personal
LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
LEFT JOIN nw_staff_attendance attendance ON attendance.fklEmpCode = staff.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geo ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN nw_mams_designation AS desig ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
WHERE (? IS NULL OR DATE(attendance.vsTime) = ?)
  AND (? IS NULL OR MONTH(attendance.vsTime) = ?)
GROUP BY personal.pklEmployeeRegId, staff.vsEmpName, personal.vsFirstName, personal.vsMiddleName, personal.vsLastName, personal.vsPhoneNumber, personal.vsDOB, dept.pklInternalDepartmentId, dept.vsInternalDepartmentName, geo.vsGeolocationName, desig.vsDesignationName
HAVING punchInOutdoor = 0;

`,
    staffPresentTodayOutside: `SELECT 
    personal.pklEmployeeRegId AS registrationId, 
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    IFNULL(personal.vsMiddleName, '') AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId, 
    dept.vsInternalDepartmentName AS departmentName,
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
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM nw_employee_personal_dtls personal
LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
LEFT JOIN nw_staff_attendance attendance ON attendance.fklEmpCode = staff.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geo ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN nw_mams_designation AS desig ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
WHERE (? IS NULL OR DATE(attendance.vsTime) = ?)
  AND (? IS NULL OR MONTH(attendance.vsTime) = ?)
GROUP BY personal.pklEmployeeRegId, staff.vsEmpName, personal.vsFirstName, personal.vsMiddleName, personal.vsLastName, personal.vsPhoneNumber, personal.vsDOB, dept.pklInternalDepartmentId, dept.vsInternalDepartmentName, geo.vsGeolocationName, desig.vsDesignationName
HAVING punchInOutdoor = 1;

`,
    staffPresentTodayFilter: `SELECT 
    personal.pklEmployeeRegId AS registrationId, 
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    IFNULL(personal.vsMiddleName, '') AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId, 
    dept.vsInternalDepartmentName AS departmentName,
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
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM nw_employee_personal_dtls personal
LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
LEFT JOIN nw_staff_attendance attendance ON attendance.fklEmpCode = staff.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geo ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN nw_mams_designation AS desig ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
WHERE 
  DATE_FORMAT(attendance.vsTime, '%Y-%m-%d') BETWEEN ? AND ?
GROUP BY personal.pklEmployeeRegId, staff.vsEmpName, personal.vsFirstName, personal.vsMiddleName, personal.vsLastName, personal.vsPhoneNumber, personal.vsDOB, dept.pklInternalDepartmentId, dept.vsInternalDepartmentName, geo.vsGeolocationName, desig.vsDesignationName;

`,
    staffPresentTodayFilterOutside: `SELECT 
    personal.pklEmployeeRegId AS registrationId, 
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    IFNULL(personal.vsMiddleName, '') AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId, 
    dept.vsInternalDepartmentName AS departmentName,
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
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM nw_employee_personal_dtls personal
LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
LEFT JOIN nw_staff_attendance attendance ON attendance.fklEmpCode = staff.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geo ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN nw_mams_designation AS desig ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
WHERE 
  DATE_FORMAT(attendance.vsTime, '%Y-%m-%d') BETWEEN ? AND ?
GROUP BY personal.pklEmployeeRegId, staff.vsEmpName, personal.vsFirstName, personal.vsMiddleName, personal.vsLastName, personal.vsPhoneNumber, personal.vsDOB, dept.pklInternalDepartmentId, dept.vsInternalDepartmentName, geo.vsGeolocationName, desig.vsDesignationName
HAVING punchInOutdoor = 1
`,
    staffPresentTodayFilterInside: `SELECT 
    personal.pklEmployeeRegId AS registrationId, 
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    IFNULL(personal.vsMiddleName, '') AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId, 
    dept.vsInternalDepartmentName AS departmentName,
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
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM nw_employee_personal_dtls personal
LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN nw_staff_attendance_dtl staff ON staff.fklEmployeeRegId = personal.pklEmployeeRegId
LEFT JOIN nw_staff_attendance attendance ON attendance.fklEmpCode = staff.pklEmpCode
LEFT JOIN nw_mams_geolocation AS geo ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN nw_mams_designation AS desig ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
WHERE 
  DATE_FORMAT(attendance.vsTime, '%Y-%m-%d') BETWEEN ? AND ?
GROUP BY personal.pklEmployeeRegId, staff.vsEmpName, personal.vsFirstName, personal.vsMiddleName, personal.vsLastName, personal.vsPhoneNumber, personal.vsDOB, dept.pklInternalDepartmentId, dept.vsInternalDepartmentName, geo.vsGeolocationName, desig.vsDesignationName
HAVING punchInOutdoor = 0
;

`,

staffAbsentToday: `
SELECT 
    personal.pklEmployeeRegId AS registrationId,
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    personal.vsMiddleName AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId,
    dept.vsInternalDepartmentName AS departmentName,
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM 
    nw_staff_attendance_dtl staff
LEFT JOIN 
    nw_employee_personal_dtls personal 
    ON personal.pklEmployeeRegId = staff.fklEmployeeRegId
LEFT JOIN 
    nw_employee_employment_dtls AS emp 
    ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN 
    nw_mams_internal_department AS dept 
    ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN 
    nw_mams_geolocation AS geo 
    ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN 
    nw_mams_designation AS desig 
    ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
LEFT JOIN 
    nw_staff_attendance attendance 
    ON staff.pklEmpCode = attendance.fklEmpCode 
    AND DATE(attendance.vsDate) = ?
LEFT JOIN 
    nw_staff_attendance_leave_applications nsalp 
    ON staff.pklEmpCode = nsalp.fklEmpCode 
    AND DATE(nsalp.dtLeaveDate) = ? 
    AND nsalp.bApproval = 1
WHERE 
    attendance.pklStaffAttendanceId IS NULL 
    AND staff.bReleased = 0
    AND nsalp.fklEmpCode IS NULL
    AND (? IS NULL OR MONTH(attendance.vsDate) = ?);
`,
staffAbsentTodayFilter: `
SELECT 
    personal.pklEmployeeRegId AS registrationId,
    staff.vsEmpName AS empId, 
    personal.vsFirstName AS firstName, 
    personal.vsMiddleName AS middleName, 
    personal.vsLastName AS lastName,
    personal.vsPhoneNumber AS phone, 
    personal.vsDOB AS DOB, 
    dept.pklInternalDepartmentId AS departmentId,
    dept.vsInternalDepartmentName AS departmentName,
    geo.vsGeolocationName AS location,  -- Adding location column
    desig.vsDesignationName AS designation  -- Adding designation column
FROM 
    nw_staff_attendance_dtl staff
LEFT JOIN 
    nw_employee_personal_dtls personal 
    ON personal.pklEmployeeRegId = staff.fklEmployeeRegId
LEFT JOIN 
    nw_employee_employment_dtls AS emp 
    ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN 
    nw_mams_internal_department AS dept 
    ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN 
    nw_mams_geolocation AS geo 
    ON staff.fklLocationId = geo.pklLocationId  -- Join for location
LEFT JOIN 
    nw_mams_designation AS desig 
    ON emp.vsDesignation = desig.pklDesignationId  -- Join for designation
LEFT JOIN 
    nw_staff_attendance attendance 
    ON staff.pklEmpCode = attendance.fklEmpCode 
    AND DATE_FORMAT(attendance.vsDate, '%Y-%m-%d') BETWEEN ? AND ?
LEFT JOIN 
    nw_staff_attendance_leave_applications nsalp 
    ON staff.pklEmpCode = nsalp.fklEmpCode 
    AND DATE_FORMAT(nsalp.dtLeaveDate, '%Y-%m-%d') = ? 
    AND nsalp.bApproval = 1
WHERE 
    attendance.pklStaffAttendanceId IS NULL 
    AND staff.bReleased = 0
    AND nsalp.fklEmpCode IS NULL;
`,

    activeStatusCount: ` SELECT COUNT(*) AS count FROM nw_staff_attendance_dtl WHERE bReleased = 0`,

    regignationCount: `SELECT COUNT(*) AS count FROM nw_staff_attendance_dtl WHERE bReleased = 1`,

    activeEmployee: `SELECT personal.pklEmployeeRegId AS registrationId,staff.vsEmpName AS empId, personal.vsFirstName AS firstName, personal.vsMiddleName AS middleName, personal.vslastName AS lastName,
    personal.vsPhoneNumber AS phone, personal.vsDOB AS DOB, dept.pklInternalDepartmentId AS departmentId, dept.vsInternalDepartmentName AS departmentName, emp.dtDateOfJoining AS joiningDate
    FROM nw_staff_attendance_dtl staff
    LEFT JOIN nw_employee_personal_dtls personal ON personal.pklEmployeeRegId = staff.fklEmployeeRegId
    LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
    LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
    WHERE staff.bReleased = 0;`,

    resignedEmploye: `SELECT personal.pklEmployeeRegId AS registrationId,staff.vsEmpName AS empId, personal.vsFirstName AS firstName, personal.vsMiddleName AS middleName, personal.vslastName AS lastName,
    personal.vsPhoneNumber AS phone, personal.vsDOB AS DOB, dept.pklInternalDepartmentId AS departmentId, dept.vsInternalDepartmentName AS departmentName,
    emp.dtDateOfJoining AS joiningDate, rel.dtCreatedAt AS releaseDate
    FROM nw_staff_attendance_dtl staff
    LEFT JOIN nw_employee_personal_dtls personal ON personal.pklEmployeeRegId = staff.fklEmployeeRegId
    LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
    LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
    LEFT JOIN nw_staff_attendance_dtl_released AS rel ON rel.fklEmployeeRegId = staff.fklEmployeeRegId
    WHERE staff.bReleased = 1
    ORDER BY rel.dtCreatedAt;`,
    
    byidQuery:`
-- Define the start and end dates as variables
SET @startDate := ?;
SET @endDate := ?;
SET @candidateId := ?;

-- Create a temporary table for the date range
DROP TEMPORARY TABLE IF EXISTS DateRange;
CREATE TEMPORARY TABLE DateRange (
    attendanceDate DATE
);

-- Populate the date range table
INSERT INTO DateRange (attendanceDate)
SELECT DATE(@startDate) + INTERVAL seq DAY
FROM (SELECT @row := @row + 1 AS seq
      FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
            SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t1,
           (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
            SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t2,
           (SELECT @row := -1) t3
     ) seqs
WHERE DATE(@startDate) + INTERVAL seq DAY <= DATE(@endDate);

-- Perform the left join with the attendance data
SELECT 
    dr.attendanceDate,
    personal.pklEmployeeRegId AS registrationId, 
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
    nw_staff_attendance attendance ON DATE(attendance.vsTime) = dr.attendanceDate AND attendance.fklEmpCode = @candidateId
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
    personal.pklEmployeeRegId = @candidateId OR attendance.vsTime IS NULL  -- Ensure all dates are included
GROUP BY 
    dr.attendanceDate, personal.pklEmployeeRegId, staff.vsEmpName, geo.vsGeolocationName, desig.vsDesignationName
ORDER BY 
    dr.attendanceDate, registrationId;
`


}

module.exports = exports = query
