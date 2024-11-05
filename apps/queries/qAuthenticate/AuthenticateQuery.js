const query = {
    loginValid: `SELECT COUNT(*) AS count FROM nw_loms_hrms_login WHERE vsLoginName = ? AND vsPassword = ?`,
    loginValidNew: `SELECT COUNT(*) AS count FROM nw_loms_login WHERE vsLoginName = ? AND vsPassword = ? and bEnabled=1`,
    loginDetails: `SELECT pklHrmsLoginId AS id, vsLoginName AS name FROM nw_loms_hrms_login WHERE vsLoginName = ?`,
    loginDetailsNew: `SELECT pklLoginId AS id, vsLoginName AS name,bAccess FROM nw_loms_login WHERE vsLoginName = ? and bEnabled=1`,
    getAllUser:`
     SELECT 
        role.pklRoleId AS roleId, loms.pklLoginId AS loginId, loms.vsLoginName AS loginName, access.bAccessHrms AS Access ,
        DATE_FORMAT(access.dtUpdatedAtHrms, "%d %M,%Y") as updatedDate
        , access.updatedByHrms as updatedBy
        FROM nw_loms_login loms
        INNER JOIN nw_loms_login_role lrole ON loms.pklLoginId = lrole.fklLoginId
        INNER JOIN nw_mams_role role ON lrole.fklRoleId = role.pklRoleId
        left join nw_loms_login_access_permission access ON loms.pklLoginId = access.fklLoginId
        WHERE  loms.bEnabled = 1 AND lrole.bEnabled = 1 AND role.pklRoleId NOT IN (1, 2, 3, 4, 6, 57)
        `,
     updateUser:`update nw_loms_login_access_permission set bAccessHrms=? , dtUpdatedAtHrms= CURDATE() ,updatedByHrms=? where fklLoginId=?`,
     insertUser:`insert into nw_loms_login_access_permission (bAccessHrms, dtUpdatedAtHrms,updatedByHrms,fklLoginId) values (?,CURDATE(),?,?)`,
     checkUser:`select * from nw_loms_login_access_permission where fklLoginId =?`,
    updateUserNull:`update nw_loms_login_access_permission set bAccessHrms = ? ,dtUpdatedAtHrms= CURDATE() ,updatedByHrms=? where fklLoginId=?`,
    insertUserNull:`insert into nw_loms_login_access_permission (bAccessHrms, dtUpdatedAtHrms,updatedByHrms,fklLoginId) values (?,CURDATE(),?,?)`,
    getAdminbyUsername: `SELECT access.bAccessHrms as bAccess, login.* FROM nw_loms_login login 
    LEFT JOIN nw_loms_login_access_permission access on login.pklLoginId = access.fklLoginId WHERE vsLoginName = ? and bEnabled=1`,
    checkSystemUser:`select login.vsLoginName from nw_loms_login as login 
        inner join nw_loms_login_role role on role.fklLoginId = login.pklLoginId 
        inner join nw_mams_role mams on mams.pklRoleId = role.fklRoleId 
        where login.vsLoginName = ? and mams.pklRoleId=64`,
}   

module.exports = exports = query
