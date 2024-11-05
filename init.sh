mkdir -p apps/routes/r$1/
touch apps/routes/r$1/$1Route.js
echo "const express = require('express');
const Router = express.Router();
const co = require('co');
const service = require('../../services/s$1/$1Service');

Router.post('/get', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.get(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/add', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.add(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/update', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.update(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/delete', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.delete(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

module.exports = Router" > apps/routes/r$1/$1Route.js

mkdir -p apps/services/s$1/
touch apps/services/s$1/$1Service.js

echo "const co = require('co');
const connection = require('../../../JOS/DALMYSQLConnection');
const query = require('../../queries/q$1/$1Query');

exports.get = co.wrap(async function (postParam) {
    let queryResultObj = {};
    let resultObj = {};
    let mysqlDB;
    try {
      try {
        mysqlDB = await connection.getDB();
      } catch (error) {
        console.log(error);
        throw new Error('Internal Server Error $1-10');
      }

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error $1-40');
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
        throw new Error('Internal Server Error $1-10');
      }

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error $1-40');
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
        throw new Error('Internal Server Error $1-10');
      }

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error $1-40');
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
        throw new Error('Internal Server Error $1-10');
      }

      return resultObj;
    } catch (error) {
      console.log(error);
      throw new Error('Internal Server Error $1-40');
    } finally {
      mysqlDB.release()
    }
  });
  
  " > apps/services/s$1/$1Service.js


mkdir -p apps/queries/q$1/
touch apps/queries/q$1/$1Query.js

echo "const query = {

}

module.exports = exports = query" > apps/queries/q$1/$1Query.js








