const express = require('express');
const Router = express.Router();
const co = require('co');
const service = require('../../services/sDashboard/DashboardService');
const { authenticateToken, checkRole } = require('../../auth/auth')

Router.post('/get',checkRole([0,1]), (req, res) => {
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

Router.post('/get/employeeGroup',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.getEmployeeGroup(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/get/attendanceChart',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.attendanceChart(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/get/attendanceRateDepartmentWise',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.attendanceRateDepartmentWise(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/get/absenteeism',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.absenteeism(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});


Router.post('/add',checkRole([1]), (req, res) => {
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

Router.post('/update',checkRole([1]), (req, res) => {
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

Router.post('/delete', checkRole([1]),(req, res) => {
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

Router.post('/employerdata',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.employerData(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leave/activities',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveActivities(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leave/activities/id',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveActivitiesId(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});



module.exports = Router
