const query = {
    employeeList: `SELECT adtl.pklEmpCode AS id, pdtl.vsFirstName AS firstName, IFNULL(pdtl.vsMiddleName, "") AS middleName, pdtl.vsLastName AS lastName,
    pdtl.vsPhoneNumber As phoneNumber, pdtl.vsEmail AS emailId, dsgn.vsDesignationName AS designation, adtl.vsEmpName AS employeeId, 
    geo.pklLocationId AS locationId, geo.vsGeolocationName AS locationName,edtl.dtDateOfJoining AS joiningDate,
    CASE
        WHEN bReleased = 0 THEN 'Active' 
        WHEN bReleased = 1 THEN 'Inactive'
    END AS status
    FROM nw_employee_personal_dtls pdtl 
    LEFT JOIN nw_employee_employment_dtls edtl ON pdtl.pklEmployeeRegId = edtl.fklEmployeeRegId 
    LEFT JOIN nw_staff_attendance_dtl adtl ON pdtl.pklEmployeeRegID = adtl.fklEmployeeRegId
    LEFT JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
    LEFT JOIN nw_mams_year year ON year.pklYearId = lallot.fklYearId 
    LEFT JOIN nw_mams_designation dsgn ON dsgn.pklDesignationId = edtl.vsDesignation
    LEFT JOIN nw_mams_geolocation geo ON geo.pklLocationId = adtl.fklLocationId
    WHERE bReleased = 0 AND adtl.bActiveLocation = 1`,

    employeeListSingle: `SELECT fklEmpCode AS id, pdtl.vsFirstName AS firstName, IFNULL(pdtl.vsMiddleName, "") AS middleName, pdtl.vsLastName AS lastName,
    pdtl.vsPhoneNumber As phoneNumber, pdtl.vsEmail AS emailId, edtl.vsDesignation AS designation, adtl.vsEmpName AS employeeId, 
    lallot.iCasualLeave AS casualLeaves, lallot.iSickLeave AS medicalLeaves, lallot.iParentalLeave AS parentalLeave,
    CASE
        WHEN bReleased = 0 THEN 'Active' 
        WHEN bReleased = 1 THEN 'Inactive'
    END AS status
    FROM nw_employee_personal_dtls pdtl 
    LEFT JOIN nw_employee_employment_dtls edtl ON pdtl.pklEmployeeRegId = edtl.fklEmployeeRegId 
    INNER JOIN nw_staff_attendance_dtl adtl ON pdtl.pklEmployeeRegID = adtl.fklEmployeeRegId
    INNER JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
    INNER JOIN nw_mams_year year ON year.pklYearId = lallot.fklYearId 
    WHERE year.vsYear = YEAR(CURDATE()) AND bReleased = 0 AND adtl.pklEmpCode = ?`,

    employeeListReleased: `SELECT fklEmpCode AS id, pdtl.vsFirstName AS firstName, IFNULL(pdtl.vsMiddleName, "") AS middleName, pdtl.vsLastName AS lastName,
    pdtl.vsPhoneNumber As phoneNumber, pdtl.vsEmail AS emailId, edtl.vsDesignation AS designation, adtl.vsEmpName AS employeeId, 
    CASE
        WHEN bReleased = 0 THEN 'Active' 
        WHEN bReleased = 1 THEN 'Inactive'
    END AS status
    FROM nw_employee_personal_dtls pdtl eave
    FROM nw_employee_personal_dtls pdtl 
    INNER JOIN nw_staff_attendance_dtl adtl ON pdtl.pklEmployeeRegID = adtl.fklEmployeeRegId
    INNER JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
    INNER JOIN nw_mams_year year ON year.pklYearId = lallot.fklYearId 
    WHERE year.vsYear = YEAR(CURDATE()) AND bReleased = 1`,

    deviceList: `SELECT pklUUIDEntryId AS id, adtl.pklEmpCode AS empCode, uuid.vsUUID AS uuid, vsDeviceName AS deviceName, uuid.bEnabled AS status, 
    uuid.dtCreatedOn AS date 
    FROM nw_staff_attendance_UUID uuid 
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = uuid.fklEmpCode
    WHERE adtl.pklEmpCode = ? ORDER BY dtCreatedOn DESC;`,

    alldeviceList:`SELECT 
    uuid.pklUUIDEntryId AS id, 
    adtl.pklEmpCode AS empCode, 
    uuid.vsUUID AS uuid, 
    uuid.vsDeviceName AS deviceName, 
    uuid.bEnabled AS status, 
    uuid.dtCreatedOn AS date,
    adtl.vsEmpName AS empName,
    personal.vsFirstName AS name,
    dsgn.vsDesignationName AS designation
FROM 
    nw_staff_attendance_UUID uuid
LEFT JOIN 
    nw_staff_attendance_dtl adtl ON uuid.fklEmpCode = adtl.pklEmpCode
LEFT JOIN 
    nw_employee_personal_dtls personal ON adtl.fklEmployeeRegId = personal.pklEmployeeRegId
LEFT JOIN 
    nw_employee_employment_dtls emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN 
    nw_mams_designation dsgn ON emp.vsDesignation = dsgn.pklDesignationId
WHERE 
    uuid.bEnabled = FALSE
    AND DATE(uuid.dtCreatedOn) = CURDATE();
`,
    
    deviceDeactivate: `UPDATE nw_staff_attendance_UUID SET bEnabled = 0 WHERE fklEmpCode = ?`,

    deviceActivate: `UPDATE nw_staff_attendance_UUID SET bEnabled = 1 WHERE pklUUIDEntryId = ?`,

    //update query
    attendanceList : `SELECT 
    date, 
    time,
    SUBSTRING_INDEX(time, ',', 1) AS inTime,
    CASE 
        WHEN LOCATE(',', time) = 0 THEN ''
        ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(time, ',', 2), ',', -1)
    END AS outTime,
    SUBSTRING_INDEX(attendanceMarker, ',', 1) AS attendanceMarkerIn,
    CASE 
        WHEN LOCATE(',', attendanceMarker) = 0 THEN ''
        ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(attendanceMarker, ',', 2), ',', -1)
    END AS attendanceMarkerOut
FROM (
    SELECT 
        satt.vsDate AS date,
        GROUP_CONCAT(TIME_FORMAT(satt.vsTime, '%H:%i:%s') ORDER BY satt.vsTime SEPARATOR ',') AS time,
        GROUP_CONCAT(
            CASE
                WHEN bOutdoor = 1 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('10:00:00', '%H:%i:%s') THEN 'EARLY IN INDOOR'
                WHEN bOutdoor = 1 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('10:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('10:30:00', '%H:%i:%s') THEN 'ON TIME IN INDOOR'
                WHEN bOutdoor = 1 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('10:30:00', '%H:%i:%s') THEN 'LATE IN INDOOR'
                WHEN bOutdoor = 1 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('17:00:00', '%H:%i:%s') THEN 'EARLY OUT INDOOR'
                WHEN bOutdoor = 1 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('17:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('17:30:00', '%H:%i:%s') THEN 'ON TIME OUT INDOOR'
                WHEN bOutdoor = 1 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('17:30:00', '%H:%i:%s') THEN 'LATE OUT INDOOR'
                WHEN bOutdoor = 0 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('10:00:00', '%H:%i:%s') THEN 'EARLY IN OUTDOOR'
                WHEN bOutdoor = 0 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('10:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('10:30:00', '%H:%i:%s') THEN 'ON TIME IN OUTDOOR'
                WHEN bOutdoor = 0 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('10:30:00', '%H:%i:%s') THEN 'LATE IN OUTDOOR'
                WHEN bOutdoor = 0 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('17:00:00', '%H:%i:%s') THEN 'EARLY OUT OUTDOOR'
                WHEN bOutdoor = 0 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('17:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('17:30:00', '%H:%i:%s') THEN 'ON TIME OUT OUTDOOR'
                WHEN bOutdoor = 0 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('17:30:00', '%H:%i:%s') THEN 'LATE OUT OUTDOOR'
            END 
            ORDER BY satt.vsTime SEPARATOR ','
        ) AS attendanceMarker
    FROM nw_staff_attendance satt
    INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = satt.fklEmpCode
    WHERE adtl.pklEmpCode = ?
    GROUP BY satt.vsDate
) data WHERE 1=1`,

    // attendanceList: `SELECT date, time,
    // SUBSTRING_INDEX(SUBSTRING_INDEX(time, ',', 1), ',', -1) AS inTime,
    // SUBSTRING_INDEX(SUBSTRING_INDEX(time, ',', 2), ',', -1) AS outTime,
    // SUBSTRING_INDEX(SUBSTRING_INDEX(attendanceMarker, ',', 1), ',', -1) AS attendanceMarkerIn,
    // SUBSTRING_INDEX(SUBSTRING_INDEX(attendanceMarker, ',', 2), ',', -1) AS attendanceMarkerOut  
    // FROM (SELECT 
    //     satt.vsDate AS date,
    //     GROUP_CONCAT(TIME_FORMAT(satt.vsTime, '%H:%i:%s')) AS time,
    //     GROUP_CONCAT(CASE
    //         WHEN bOutdoor = 1 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('10:00:00', '%H:%i:%s') THEN 'EARLY IN INDOOR'
    //         WHEN bOutdoor = 1 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('10:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('10:30:00', '%H:%i:%s')  THEN 'ON TIME IN INDOOR'
    //         WHEN bOutdoor = 1 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('10:30:00', '%H:%i:%s')  THEN 'LATE IN INDOOR'  
    //         WHEN bOutdoor = 1 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('17:00:00', '%H:%i:%s') THEN 'EARLY OUT INDOOR'
    //         WHEN bOutdoor = 1 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('17:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('17:30:00', '%H:%i:%s')  THEN 'ON TIME OUT INDOOR'
    //         WHEN bOutdoor = 1 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('17:30:00', '%H:%i:%s')  THEN 'LATE OUT INDOOR'
    //         WHEN bOutdoor = 0 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('10:00:00', '%H:%i:%s') THEN 'EARLY IN OUTDOOR'
    //         WHEN bOutdoor = 0 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('10:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('10:30:00', '%H:%i:%s')  THEN 'ON TIME IN EARLY IN OUTDOOR'
    //         WHEN bOutdoor = 0 AND bInOut = 0 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('10:30:00', '%H:%i:%s')  THEN 'LATE IN EARLY IN OUTDOOR'  
    //         WHEN bOutdoor = 0 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') < TIME_FORMAT('17:00:00', '%H:%i:%s') THEN 'EARLY OUT EARLY IN OUTDOOR'
    //         WHEN bOutdoor = 0 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') >= TIME_FORMAT('17:00:00', '%H:%i:%s') AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') <= TIME_FORMAT('17:30:00', '%H:%i:%s')  THEN 'ON TIME OUT EARLY IN OUTDOOR'
    //         WHEN bOutdoor = 0 AND bInOut = 1 AND TIME_FORMAT(satt.vsTime, '%H:%i:%s') > TIME_FORMAT('17:30:00', '%H:%i:%s')  THEN 'LATE OUT EARLY IN OUTDOOR'
    //     END) AS attendanceMarker
    //     FROM nw_staff_attendance satt
    //     INNER JOIN nw_staff_attendance_dtl adtl ON adtl.pklEmpCode = satt.fklEmpCode
    //     WHERE adtl.pklEmpCode = ? GROUP BY satt.vsDate) data WHERE 1=1 `,

    leaveList: `SELECT
    DATE_FORMAT(dtLeaveDate, '%Y-%m-%d') AS leaveDate,
    vsReason AS reason,
    vsType AS leaveType,
    CASE 
        WHEN bPending = 1 THEN 'Pending'
        WHEN bApproval = 1 THEN 'Approved'
        WHEN bApproval = 0 THEN 'Rejected'
    END AS status
    FROM nw_staff_attendance_leave_applications lapply
    INNER JOIN nw_staff_attendance_dtl dtl ON dtl.pklEmpCode = lapply.fklEmpCode
    WHERE dtl.pklEmpCode = ?`,

    prentalLeaveList : `    SELECT  DATE_FORMAT(dtAppliedDate, '%Y-%m-%d') AS applyDate, 'PL' AS leaveType, DATE_FORMAT(dtStartDate, '%Y-%m-%d') AS startDate,
    DATE_FORMAT(dtEndDate, '%Y-%m-%d') AS endDate,
    CASE WHEN bPending = 1 THEN 'Pending'
         WHEN bApproved = 1 THEN 'Approved'
         WHEN bApproved = 0 THEN 'Rejected'
END AS status
FROM nw_staff_attendance_parental_leave pl
INNER JOIN nw_staff_attendance_dtl dtl ON dtl.pklEmpCode = pl.fklEmpCode
WHERE dtl.pklEmpCode = ?`,

    leaveAdd: `INSERT INTO nw_staff_attendance_leaves_allotted
    (
    fklEmpCode,
    iCasualLeave,
    iSickLeave,
    iParentalLeave,
    fklYearId)
    VALUES
    (?, ?, ?, ?, ?);
    `,

    releaseEmployee: `UPDATE nw_staff_attendance_dtl SET bReleased = 1 WHERE pklEmpCode = ?`,

    saveReleaseLog: `INSERT INTO nw_staff_attendance_dtl_released SELECT pklEmpCode, vsEmpName, fklEmployeeRegId, bReleased, ?, ? FROM nw_staff_attendance_dtl WHERE pklEmpCode = ?`,

    locationHistory: `SELECT geo.vsGeolocationName AS name, DATE_FORMAT(glog.dtDate, '%Y-%m-%d') AS date FROM nw_staff_attendance_geolocation_log glog
    LEFT JOIN nw_staff_attendance_dtl adtl ON glog.fklEmpCode = adtl.pklEmpCode
    LEFT JOIN nw_mams_geolocation geo ON geo.pklLocationId = glog.fklLocationId 
    WHERE adtl.pklEmpCode = ?`,

    locationActive: `SELECT geo.pklLocationId AS id,
    geo.vsLat1 AS lat1, geo.vsLong1 AS long1,
    geo.vsLat2 AS lat2, geo.vsLong2 AS long2,
    geo.vsLat3 AS lat3, geo.vsLong3 AS long3,
    geo.vsLat4 AS lat4, geo.vsLong4 AS long4,
    geo.vsGeolocationName AS name FROM nw_mams_geolocation geo
    LEFT JOIN nw_staff_attendance_dtl adtl ON geo.pklLocationId = adtl.fklLocationId
    WHERE adtl.pklEmpCode = ?`,

    yearList: `SELECT DISTINCT YEAR(vsDate) AS year FROM nw_staff_attendance WHERE fklEmpCode = ?`,

    district: `SELECT pklDistrictId AS districtId, vsDistrictName AS districtName FROM nw_mams_district WHERE fklStateId = 4 ORDER BY vsDistrictName ASC;`,
    gender: `SELECT pklGenderId AS genderId, vsGenderName as genderName FROM nw_mams_gender`,
    caste: `SELECT pklCasteId AS casteId, vsCasteName AS casteName FROM nw_mams_caste`,
    religion: `SELECT pklReligionId AS religionId, vsReligionName AS religionName FROM nw_mams_religion`,
    blood: `SELECT pklBloodId AS bloodId, vsBloodName AS bloodName FROM nw_mams_blood`,
    state: `SELECT pklStateId AS stateId, vsStateName AS stateName FROM nw_mams_state WHERE pklStateId = 4`,
    idType: `SELECT pklIdType AS value, vsIdTypeDisplayName AS label FROM nw_mams_id_type`,
    marital: `SELECT pklMaritalStatusId AS value, vsMaritalStatusName AS label FROM nw_mams_marital_status`,
    relationship: `SELECT pklRelationshipId AS relationshipId, vsRelationshipName AS relationshipName FROM nw_mams_relationship`,
    qualification: `SELECT pklQualificationId AS qualificationId, vsQualification AS qualificationName FROM nw_mams_qualification WHERE pklQualificationId NOT IN (1, 2, 3, 4, 5)`,
    designation: `SELECT pklDesignationId AS designationId, vsDesignationName AS designationName FROM nw_mams_designation`,
    department: `SELECT pklInternalDepartmentId AS internalDepartmentId, vsInternalDepartmentName AS internalDepartmentName FROM nw_mams_internal_department`,
    bank: `SELECT pkBankId AS bankId, vcBankName AS bankName FROM nw_mams_bank`,
    location : `SELECT pklLocationId AS locationId, vsGeolocationName AS locationName FROM nw_mams_geolocation;`,
    supervisor : `SELECT pklSupervisorId AS supervisorId, vsSupervisorName AS name  FROM nw_mams_supervisor; `,
    branch: `SELECT pklBranchId AS branchId, vsbranchName AS branchName FROM nw_mams_bank_branch WhERE fklBankId = ?`,
    ifsc: `SELECT vsIFSCCode AS ifsc FROM nw_mams_bank_branch WhERE pklBranchId = ?`,
    prefetch: ``,
    
    personal: `INSERT INTO nw_employee_personal_dtls (vsFirstName, vsMiddleName, vsLastName, vsFatherName, vsMotherName, vsPhoneNumber, vsAltPhoneNumber, vsGender, vsEmail, vsDOB, fklIdType, UUID, fklMaritalStatusId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    emergency: `INSERT INTO nw_employee_emergency_details (pklEmployeeRegId,vsEmergencyContactName, vsRelationship, vsEmergencyContactNumber, vsEmergencyHomeAddress, vsEmergencyOfficeAddress, fklEmployeeRegId) VALUES (?,?, ?, ?, ?, ?, ?)`,
    address: `INSERT INTO nw_employee_address_dtls (pklEmployeeRegId,vsAddressLine1, vsAddressLine2, vsCity, fklDistrict, vsPIN, fklEmployeeRegId) VALUES (?,?, ?, ?, ?, ?, ?)`,
    addressPermanent: `INSERT INTO nw_employee_address_dtls_permanent (pklEmployeeRegId,vsAddressLine1, vsAddressLine2, vsCity, fklDistrict, vsPIN, fklEmployeeRegId) VALUES (?,?, ?, ?, ?, ?, ?)`,

    //supervisor
    employment: `INSERT INTO nw_employee_employment_dtls (pklEmployeeRegId,vsDesignation, dtDateOfJoining, vsDepartment, fklSuperviosrId1, fklSuperviosrId2, fklQualification, fklEmployeeRegId, fklLocationId, vsCurrentDepartmentJoiningDate) 
                 VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    miscellaneous: `INSERT INTO nw_employee_miscellaneous_dtls (pklEmployeeRegId,fklBlood, fklReligion, fklCaste, fklBank, vsAccountNumber, vsIFSCCode, fklBranch, fklEmployeeRegId, vsPAN) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    appLogin: `INSERT INTO nw_staff_attendance_dtl (pklEmpCode,fklEmployeeRegId, fklLocationId, bReleased, bActiveLocation) VALUES(?,?, ?, 0, 1)`,
    loginCreation: `UPDATE nw_staff_attendance_dtl SET vsEmpName = ? WHERE pklEmpCode = ?`,
    loginDeletion: `DELETE FROM nw_loms_hrms_login WHERE pklHrmsLoginId = ? AND pklHrmsLoginId != 1`,

    leaveAlloted: `INSERT INTO nw_staff_attendance_leaves_allotted (fklEmpCode, iCasualLeave, iSickLeave, iParentalLeave, fklYearId)
                   SELECT ?, ?, ?, ?, ny.pklYearId 
                   FROM nw_mams_year ny
                   WHERE ny.vsYear = YEAR(CURDATE())
                   LIMIT 1`,

                   associateEmployeeWithLocationLog: `INSERT INTO nw_staff_attendance_geolocation_log (fklEmpCode, fklLocationId, dtDate, bActive) VALUES (?, ?, NOW(), 1)`,
    //adding new filed supervisor2 
    getEmployeById : `SELECT 
    personal.pklEmployeeRegId AS registrationId,  
    staff.vsEmpName AS EmployeId, 
    personal.vsFirstName AS firstName, 
    personal.vsMiddleName AS middleName, 
    personal.vslastName AS lastName,
    personal.vsFatherName AS fatherName, 
    personal.vsMotherName AS motherName,
    personal.vsPhoneNumber AS phone, 
    personal.vsEmail AS email, 
    personal.vsDOB, 
    personal.vsAltPhoneNumber AS alternetPhone, 
    gender.vsGenderName, 
    marital.vsMaritalStatusName,
    address.vsAddressLine1 AS presentAddress1, 
    address.vsAddressLine2 AS presentAddress2, 
    address.vsCity AS presentCity, 
    dist.vsDistrictName AS presentDistrict, 
    address.vsPIN AS presentPIN, 
    permanent.vsAddressLine1 AS permanentAddress1, 
    permanent.vsAddressLine2 AS permanentAddress2, 
    permanent.vsCity AS permanentCity, 
    district.vsDistrictName AS permanentDistrict, 
    permanent.vsPIN AS permanentPIN,
    emergency.vsEmergencyContactName AS emergencyContactName, 
    relation.vsRelationshipName AS relation, 
    emergency.vsEmergencyContactNumber AS emergencyContactNumber,
    emergency.vsEmergencyHomeAddress AS homeAddress, 
    emergency.vsEmergencyOfficeAddress AS officeAddress, 
    dept.vsInternalDepartmentName AS departmentName,
    designation.pklDesignationId AS designationId, 
    designation.vsDesignationName AS designation,
    blood.vsBloodName AS bloodGroup, 
    religion.vsReligionName AS religion, 
    caste.vsCasteName AS caste,
    bank.pkBankId AS bankId, 
    bank.vcBankName AS bank, 
    misc.vsAccountNumber AS accountNumber, 
    misc.vsIFSCCode AS IFSC, 
    misc.fklBranch AS branch, 
    misc.vsPAN AS PAN, 
    emp.dtDateOfJoining AS joiningDate, 
    supervisor1.vsSupervisorName AS supervisorName1, 
    supervisor2.vsSupervisorName AS supervisorName2, 
    qualification.vsQualification AS qualification,
    location.pklLocationId AS locationId, 
    location.vsGeolocationName AS current_working_location
FROM 
    nw_employee_personal_dtls personal
LEFT JOIN 
    nw_staff_attendance_dtl AS staff ON personal.pklEmployeeRegId = staff.fklEmployeeRegId
LEFT JOIN 
    nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
LEFT JOIN 
    nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
LEFT JOIN 
    nw_mams_designation AS designation ON emp.vsDesignation = designation.pklDesignationId
LEFT JOIN 
    nw_employee_address_dtls AS address ON personal.pklEmployeeRegId = address.fklEmployeeRegId 
LEFT JOIN 
    nw_employee_address_dtls_permanent AS permanent ON personal.pklEmployeeRegId = permanent.fklEmployeeRegId
LEFT JOIN 
    nw_employee_emergency_details AS emergency ON personal.pklEmployeeRegId = emergency.fklEmployeeRegId
LEFT JOIN 
    nw_employee_miscellaneous_dtls AS misc ON personal.pklEmployeeRegId = misc.fklEmployeeRegId
LEFT JOIN 
    nw_mams_gender AS gender ON personal.vsGender = gender.pklGenderId
LEFT JOIN 
    nw_mams_marital_status AS marital ON personal.fklMaritalStatusId = marital.pklMaritalStatusId
LEFT JOIN 
    nw_mams_district AS dist ON address.fklDistrict = dist.pklDistrictId
LEFT JOIN 
    nw_mams_district AS district ON permanent.fklDistrict = district.pklDistrictId
LEFT JOIN 
    nw_mams_relationship AS relation ON emergency.vsRelationship = relation.pklRelationshipId
LEFT JOIN 
    nw_mams_blood AS blood ON misc.fklBlood = blood.pklBloodId
LEFT JOIN 
    nw_mams_religion AS religion ON misc.fklReligion = religion.pklReligionId
LEFT JOIN 
    nw_mams_caste AS caste ON misc.fklCaste = caste.pklCasteId
LEFT JOIN 
    nw_mams_bank AS bank ON misc.fklBank = bank.pkBankId
LEFT JOIN 
    nw_mams_qualification AS qualification ON emp.fklQualification = qualification.pklQualificationId
LEFT JOIN 
    nw_mams_geolocation AS location ON emp.fklLocationId = location.pklLocationId
LEFT JOIN 
    nw_mams_supervisor AS supervisor1 ON emp.fklSuperviosrId1 = supervisor1.pklSupervisorId
LEFT JOIN 
    nw_mams_supervisor AS supervisor2 ON emp.fklSuperviosrId2 = supervisor2.pklSupervisorId
WHERE 
    personal.pklEmployeeRegId = ?;
`,

    // getEmployeById : `SELECT personal.pklEmployeeRegId AS registrationId,  staff.vsEmpName AS EmployeId, personal.vsFirstName AS firstName, personal.vsMiddleName AS middleName, personal.vslastName,
    // personal.vsFatherName AS fatherName, personal.vsMotherName AS motherName,personal.vsPhoneNumber AS phone, personal.vsEmail AS email, personal.vsDOB, 
    // personal.vsAltPhoneNumber AS alternetPhone, gender.vsGenderName, marital.vsMaritalStatusName,
    // address.vsAddressLine1 AS presentAddress1, address.vsAddressLine2 AS presentAddress2, address.vsCity AS presentCity, dist.vsDistrictName AS presentDistrict, address.vsPIN AS presentPIN, 
    // permanent.vsAddressLine1 AS permanentAddress1, permanent.vsAddressLine2 AS permanentAddress2, permanent.vsCity As permanentCity, district.vsDistrictName AS permanentDistrict, permanent.vsPIN AS permanentPIN,
    // emergency.vsEmergencyContactName AS emergencyContactName, relation.vsRelationshipName AS relation, emergency.vsEmergencyContactNumber AS emergencyContactNumber,
    // emergency.vsEmergencyHomeAddress AS homeAddress, emergency.vsEmergencyOfficeAddress AS officeAddress, 
    // dept.vsInternalDepartmentName AS departmentName,designation.pklDesignationId AS designationId, designation.vsDesignationName AS designation,
    // blood.vsBloodName AS bloodGroup, religion.vsReligionName AS religion, caste.vsCasteName AS caste,bank.pkBankId AS bankId, bank.vcBankName AS bank, misc.vsAccountNumber AS accountNumber, 
    // misc.vsIFSCCode AS IFSC, misc.fklBranch AS branch, misc.vsPAN AS PAN, emp.dtDateOfJoining AS joiningDate, emp.vsSupervisorsName1 AS supervisorName1,emp.vsSupervisorsName2 AS supervisorName2, qulification.vsQualification AS qualification,
    // location.pklLocationId AS locationId, location.vsGeolocationName AS currentWorkingLocation
    // FROM nw_employee_personal_dtls personal
    
    // LEFT JOIN nw_staff_attendance_dtl AS staff ON personal.pklEmployeeRegId = staff.fklEmployeeRegId
    // LEFT JOIN nw_employee_employment_dtls AS emp ON personal.pklEmployeeRegId = emp.fklEmployeeRegId
    // LEFT JOIN nw_mams_internal_department AS dept ON emp.vsDepartment = dept.pklInternalDepartmentId
    // LEFT JOIN nw_mams_designation AS designation ON emp.vsDesignation = designation.pklDesignationId
    // LEFT JOIN nw_employee_address_dtls AS address ON personal.pklEmployeeRegId = address.fklEmployeeRegId 
    // LEFT JOIN nw_employee_address_dtls_permanent AS permanent ON personal.pklEmployeeRegId = permanent.fklEmployeeRegId
    // LEFT JOIN nw_employee_emergency_details AS emergency ON  personal.pklEmployeeRegId = emergency.fklEmployeeRegId
    // LEFT JOIN nw_employee_miscellaneous_dtls AS misc ON  personal.pklEmployeeRegId = misc.fklEmployeeRegId
    // LEFT JOIN nw_mams_gender AS gender ON personal.vsGender = gender.pklGenderId
    // LEFT JOIN nw_mams_marital_status AS marital ON  personal.fklMaritalStatusId = marital.pklMaritalStatusId
    // LEFT JOIN nw_mams_district AS dist ON address.fklDistrict = dist.pklDistrictId
    // LEFT JOIN nw_mams_district AS district ON permanent.fklDistrict = district.pklDistrictId
    // LEFT JOIN nw_mams_relationship AS relation ON emergency.vsRelationship = relation.pklRelationshipId
    // LEFT JOIN nw_mams_blood AS blood ON misc.fklBlood = blood.pklBloodId
    // LEFT JOIN nw_mams_religion AS religion ON misc.fklReligion = religion.pklReligionId
    // LEFT JOIN nw_mams_caste AS caste ON misc.fklCaste = caste.pklCasteId
    // LEFT JOIN nw_mams_bank AS bank ON misc.fklBank = bank.pkBankId
    // LEFT JOIN nw_mams_qualification AS qulification ON emp.fklQualification = qulification.pklQualificationId
    // LEFT JOIN nw_mams_geolocation AS location ON emp.fklLocationId = location.pklLocationId
    // WHERE personal.pklEmployeeRegId = ?;`,
 
    year: `SELECT pklYearId AS id, vsYear AS year FROM nw_mams_year`,

    empMaster: `SELECT pklEmpCode AS id, vsEmpName AS name FROM nw_staff_attendance_dtl`,

    getEmploye : `SELECT personal.pklEmployeeRegId AS registrationId,  staff.vsEmpName AS EmployeId
    FROM nw_employee_personal_dtls personal
    LEFT JOIN nw_staff_attendance_dtl AS staff ON personal.pklEmployeeRegId = staff.fklEmployeeRegId
    WHERE personal.pklEmployeeRegId = ? AND staff.bReleased = 0`,

    updateBankDetails : `UPDATE nw_employee_miscellaneous_dtls
                         SET fklBank = ?, vsAccountNumber = ?, vsIFSCCode = ?, fklBranch = ?, dtUpdateOn = ? 
                         WHERE fklEmployeeRegId = ?`,

    updatePersonalDetails : `UPDATE nw_employee_personal_dtls 
                             SET vsPhoneNumber = ? , vsEmail = ?, dtUpdateOn = ?
                             WHERE pklEmployeeRegId = ?`,

    updateEmploymentDetails : `UPDATE nw_employee_employment_dtls
                               SET vsDesignation = ?, dtUpdateOn = ?
                               WHERE fklEmployeeRegId = ?`,

    monthlyAttendanceList : `SELECT subquery_alias.empCode, subquery_alias.name, subquery_alias.designation, subquery_alias.location, subquery_alias.date,
    SUBSTRING_INDEX(SUBSTRING_INDEX(subquery_alias.time, ',', 1), ',', -1) AS inTime,
    SUBSTRING_INDEX(SUBSTRING_INDEX(subquery_alias.time, ',', 2), ',', -1) AS outTime
FROM 
    (SELECT nsad.vsEmpName AS empCode, 
        CONCAT(
            COALESCE(nepd.vsFirstName, ''), 
            ' ', 
            COALESCE(nepd.vsMiddleName, ''), 
            ' ', 
            COALESCE(nepd.vslastName, '')
        ) AS name,
        nmd.vsDesignationName AS designation,
        geoloc.vsGeolocationName AS location,
        satt.vsDate AS date,
        GROUP_CONCAT(TIME_FORMAT(satt.vsTime, '%H:%i:%s')) AS time
    FROM 
        nw_staff_attendance_dtl nsad
        LEFT JOIN nw_employee_personal_dtls AS nepd ON nepd.pklEmployeeRegId = nsad.fklEmployeeRegId
        LEFT JOIN nw_employee_employment_dtls AS need ON need.fklEmployeeRegId = nsad.fklEmployeeRegId
        LEFT JOIN nw_mams_designation AS nmd ON nmd.pklDesignationId = need.vsDesignation
        LEFT JOIN nw_staff_attendance AS satt ON satt.fklEmpCode = nsad.pklEmpCode
        LEFT JOIN nw_staff_attendance_geolocation_log AS loc ON loc.fklEmpCode = nsad.pklEmpCode
        LEFT JOIN nw_mams_geolocation AS geoloc ON geoloc.pklLocationId = loc.fklLocationId
    WHERE nsad.bReleased = 0 
        AND YEAR(satt.vsDate) = YEAR(CURDATE()) 
        AND MONTH(satt.vsDate) = MONTH(CURDATE()) 
    GROUP BY nsad.vsEmpName, satt.vsDate) AS subquery_alias
`,


}

module.exports = exports = query
