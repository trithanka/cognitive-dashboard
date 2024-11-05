const express = require('express');
const Router = express.Router();
const co = require('co');
const service = require('../../services/sAuthenticate/AuthenticateService');
const { authenticateTokenBypass, authenticateToken } = require('../../auth/auth');

Router.post('/login', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.login(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});
//Access window////////////////////////////r/////////////////////////
const authSwitch = 1
function authState(req, res, next){
    return authSwitch===0 
      ? authenticateTokenBypass
      : authenticateToken
  }
Router.post("/access/getAll",authState(),service.getAllUser)
Router.post("/access/update",authState(),service.updateUser)

//new login for hrms web
Router.post('/loginNew', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.loginNew(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

// Router.post('/login', async (req, res) => {
//     try {
//         const result = await service.login(req.body);
//         res.send(result);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: error.message });
//     }
// });


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

module.exports = Router
