const express = require('express');
const Router = express.Router();
const co = require('co');

const service = require('../../services/sEmployeeManagement/EmployeeManagementService');
const { checkRole } = require('../../auth/auth');

Router.post('/get', checkRole([0,1]),(req, res) => {
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
//report
Router.post('/getReport',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.getReport(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/getReleased',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.getReleased(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/device/get', checkRole([1]),(req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.deviceGet(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

//for current date device data
Router.post('/device/getall',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.deviceGetAll(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/device/update',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.deviceUpdate(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/attendance/get',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.attendanceGet(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leave/get',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveGet(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leave/addMaster', checkRole([1]),(req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveAddMaster(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leave/add',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveAdd(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});


Router.post('/release/releaseEmployee',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.releaseEmployee(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/location/history',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.locationHistory(req.body);
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
            console.log(req.user)
            result = await service.add(req.body, req.user);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/master', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.master(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/getById', checkRole([0,1]),(req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.getById(req.body);
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
            result = await service.updateDetails(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});


Router.post('/monthly/attendance',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.monthlyAttendanceList(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});




// Router.post('/delete', (req, res) => {
//     var result = [];
//     co(async function () {
//         try {
//             result = await service.delete(req.body);
//             res.send(result);
//         } catch (error) {
//             console.log(error);
//             result.message = error.message;
//             res.send(error);
//         }
//     });
// });

module.exports = Router
