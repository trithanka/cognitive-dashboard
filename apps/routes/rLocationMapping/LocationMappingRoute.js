const express = require('express');
const Router = express.Router();
const co = require('co');
const service = require('../../services/sLocationMapping/LocationMappingService');
const { checkRole } = require('../../auth/auth');

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

Router.post('/location/associate',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.associate(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/location/add',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.locationAdd(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/location/get',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.locationGet(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/location/getEmployees',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.getEmployees(req.body);
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

module.exports = Router
