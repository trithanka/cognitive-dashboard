const co = require('co');
const connection = require('../../../JOS/DALMYSQLConnection');
const query = require('../../queries/qLocationMapping/LocationMappingQuery');

exports.get = co.wrap(async function (postParam) {
    let queryResultObj = {};
    let resultObj = {};
    let mysqlDB;
    try {
      try {
        mysqlDB = await connection.getDB();
      } catch (error) {
        console.log(error);
        throw new Error('Internal Server Error LocationMapping-10');
      }

      try{

        try {
          queryResultObj.employeeList = await connection.query(mysqlDB, query.employeeList, [])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }
        if(queryResultObj.employeeList !== null && queryResultObj.employeeList !== undefined && queryResultObj.employeeList.length > 0) {
          resultObj.employeeList = queryResultObj.employeeList
        }

        resultObj.message = "success"
      }catch (error){
        resultObj = {}
        resultObj.message = error.message
        resultObj.status = "error"
      }
      

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LocationMapping-40');
    } finally {
      mysqlDB.release()
    }
  });
  
exports.locationAdd = co.wrap(async function (postParam) {
    let queryResultObj = {};
    let resultObj = {};
    let mysqlDB;
    try {
      try {
        mysqlDB = await connection.getDB();
      } catch (error) {
        console.log(error);
        throw new Error('Internal Server Error LocationMapping-10');
      }

      try{

        try {
          console.log(postParam)
          queryResultObj.addMasterLocation = await connection.query(mysqlDB, query.addMasterLocation, [postParam.lat1, postParam.long1, postParam.lat2, postParam.long2, postParam.lat3, postParam.long3, postParam.lat4, postParam.long4, postParam.name])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }
        if(queryResultObj.addMasterLocation.insertId !== null && queryResultObj.addMasterLocation.insertId !== undefined) {
          resultObj.status = "success"
        }
      }catch (error){
        resultObj = {}
        resultObj.message = error.message
        resultObj.status = "error"
      }

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LocationMapping-40');
    } finally {
      mysqlDB.release()
    }
  });

  exports.locationGet = co.wrap(async function (postParam) {
 
    let queryResultObj = {};
    let resultObj = {};
    let mysqlDB;
    try {
      try {
        mysqlDB = await connection.getDB();
      } catch (error) {
        console.log(error);
        throw new Error('Internal Server Error LocationMapping-10');
      }

      try{

        let locationListQuery = query.locationList
        let locationListParam = []
        if(postParam.id){
          locationListQuery += ` AND pklLocationId = ?`
          locationListParam.push(postParam.id)
        }
  
        try {
          queryResultObj.locationList = await connection.query(mysqlDB, locationListQuery, locationListParam)
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }
        if(queryResultObj.locationList !== null && queryResultObj.locationList !== undefined && queryResultObj.locationList.length > 0) {
          resultObj.length = queryResultObj.locationList.length
        } else {
          resultObj.locationList = 0
        }
        if(postParam.page){
          locationListQuery += ` LIMIT 10 OFFSET ?`
          locationListParam.push((postParam.page - 1)*10)
        }

        try {
          queryResultObj.locationList = await connection.query(mysqlDB, locationListQuery, locationListParam)
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }
       
        if(queryResultObj.locationList !== null && queryResultObj.locationList !== undefined && queryResultObj.locationList.length > 0) {
          resultObj.locationList = queryResultObj.locationList
        } else {
          resultObj.locationList = []
        }
//console.log(queryResultObj.locationList)
        resultObj.message = "success"
      }catch (error){
        resultObj = {}
        resultObj.message = error.message
        resultObj.status = "error"
      }
      
      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LocationMapping-40');
    } finally {
      mysqlDB.release()
    }
  });

exports.associate = co.wrap(async function (postParam) {
    let queryResultObj = {};
    let resultObj = {};
    let mysqlDB;
    console.log(postParam)
    try {
      try {
        mysqlDB = await connection.getDB();
      } catch (error) {
        console.log(error);
        throw new Error('Internal Server Error LocationMapping-10');
      }

      try{

        try {
          queryResultObj.associateEmployeeWithLocation = await connection.query(mysqlDB, query.associateEmployeeWithLocation, [postParam.locationId, postParam.id])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }
        try{
          queryResultObj.associateEmployeeWithLocationLog = await connection.query(mysqlDB, query.associateEmployeeWithLocationLog, [postParam.locationId, postParam.id])
        } catch(error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }
        try{
          queryResultObj.updateEmployeeCurrentWorkingLocation = await connection.query(mysqlDB, query.updateEmployeeCurrentWorkingLocation, [postParam.locationId, postParam.id])
        } catch(error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }

        resultObj.status = "success"
      }catch (error){
        resultObj = {}
        resultObj.message = error.message
        resultObj.status = "error"
      }

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LocationMapping-40');
    } finally {
      mysqlDB.release()
    }
  });

exports.getEmployees = co.wrap(async function (postParam) {
    let queryResultObj = {};
    let resultObj = {};
    let mysqlDB;
    try {
      try {
        mysqlDB = await connection.getDB();
      } catch (error) {
        console.log(error);
        throw new Error('Internal Server Error LocationMapping-10');
      }

      try{

        try {
          queryResultObj.getEmployeesByLocation = await connection.query(mysqlDB, query.getEmployeesByLocation, [postParam.id])
        } catch (error) {
          console.error(error)
          throw new Error('Internal Server Error LocationMapping-20');
        }
        if(queryResultObj.getEmployeesByLocation !== null && queryResultObj.getEmployeesByLocation !== undefined && queryResultObj.getEmployeesByLocation.length > 0) {
          resultObj.getEmployeesByLocation = queryResultObj.getEmployeesByLocation
        } else {
          resultObj.getEmployeesByLocation = []
        }

        resultObj.message = "success"
      }catch (error){
        resultObj = {}
        resultObj.message = error.message
        resultObj.status = "error"
      }

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error LocationMapping-40');
    } finally {
      mysqlDB.release()
    }
  });
  
  
