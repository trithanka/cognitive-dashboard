const query = {
    employeeList: `SELECT fklEmpCode AS id, pdtl.vsFirstName AS firstName, IFNULL(pdtl.vsMiddleName, "") AS middleName, pdtl.vsLastName AS lastName,
        lallot.iCasualLeave AS casualLeave, lallot.iSickLeave AS sickLeave
        FROM nw_employee_personal_dtls pdtl 
        INNER JOIN nw_staff_attendance_dtl adtl ON pdtl.pklEmployeeRegID = adtl.fklEmployeeRegId
        INNER JOIN nw_staff_attendance_leaves_allotted lallot ON lallot.fklEmpCode = adtl.pklEmpCode
        INNER JOIN nw_mams_year year ON year.pklYearId = lallot.fklYearId 
        WHERE year.vsYear = YEAR(CURDATE()) AND bReleased = 0`,
    
    addMasterLocation: `INSERT INTO nw_mams_geolocation (vsLat1, vsLong1, vsLat2, vsLong2, vsLat3, vsLong3, vsLat4, vsLong4, vsGeolocationName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    locationList: `SELECT 
    COALESCE(empCounts.totalEmp, 0) AS totalEmp,
    geo.pklLocationId AS id,
    geo.vsLat1 AS lat1,
    geo.vsLong1 AS long1,
    geo.vsLat2 AS lat2,
    geo.vsLong2 AS long2,
    geo.vsLat3 AS lat3,
    geo.vsLong3 AS long3,
    geo.vsLat4 AS lat4,
    geo.vsLong4 AS long4,
    geo.vsGeolocationName AS name,
    geo.vsName AS shortName
FROM 
    nw_mams_geolocation geo
LEFT JOIN (
    SELECT 
        fklLocationId,
        COUNT(fklEmpCode) AS totalEmp
    FROM 
        nw_staff_attendance_geolocation_log
    GROUP BY 
        fklLocationId
) AS empCounts ON geo.pklLocationId = empCounts.fklLocationId;
`,

    associateEmployeeWithLocation: `UPDATE nw_staff_attendance_dtl SET fklLocationId = ? WHERE pklEmpCode = ?`,

    associateEmployeeWithLocationLog: `UPDATE nw_staff_attendance_geolocation_log SET fklLocationId = ? WHERE fklEmpCode = ?`,

    updateEmployeeCurrentWorkingLocation : `UPDATE nw_employee_employment_dtls SET fklLocationId = ? WHERE pklEmployeeRegId = ?`,
    
    
    getEmployeesByLocation: `SELECT adtl.vsEmpName AS employeeCode, CONCAT(pdtl.vsFirstName, " ", IFNULL(pdtl.vsMiddleName, ""), " ", pdtl.vsLastName) AS name FROM nw_staff_attendance_dtl adtl 
                    LEFT JOIN nw_mams_geolocation geo ON geo.pklLocationId = adtl.fklLocationId
                    LEFT JOIN nw_employee_personal_dtls pdtl ON pdtl.pklEmployeeRegId = adtl.fklEmployeeRegId
                    WHERE geo.pklLocationId = ?`
}

module.exports = exports = query
