const express = require('express');
const Router = express.Router();
const co = require('co');
const { Parser } = require('json2csv');
const service = require('../../services/sLeaveApproval/LeaveApprovalService');
const multer=require("multer");
const path = require('path');
const { authorizeRole, checkRole } = require('../../auth/auth');
// Set storage path for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../../file'));
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });

// Initialize multer with storage configuration and file size limit
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

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

Router.post('/approveLeave',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.approveLeave(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

//temp approval api////////////////////////////////////////////////////////////////////////////
Router.post('/tempApprove',checkRole([1]), async(req, res) => {
    try {
        const result = await service.tempApprove(req.body);
        res.send(result);
    } catch (error) {
        console.log(error);
        result.message = error.message;
        res.send(error);
    }
});
//submit 
Router.post('/submitApprove',checkRole([1]),upload.single('file'), async(req, res) => {
    try {
        const postParam = {
            ...req.body,
            filename: req.file ? req.file.filename : null // Add filename to postParam
          };
        const result = await service.submitApprove(postParam);
        res.send(result);
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            result.message="File size should not exceed 5MB"
          } else {
            console.log(error);
            result.message = error.message;
            res.send(error);
          }
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////
Router.post('/pendingLeaveExport',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.pendingLeaveExport(req.body);
            const json2csv = new Parser({fields: ['Name', 'Designation', 'Employee Code', 'Applied Date', 'Leave Duration', 'Leave Reason', 'Leave Date', 'Last Leave', 'Type', 'Comments From HR (If Any)', 'Comments', 'Approval (Yes/No)', 'Signature']
        });
            const csv = json2csv.parse(result.data);
            res.header('Content-Type', 'text/csv');
            res.attachment('attachment.csv');
            res.send(csv);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leave/detail', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveDetail(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leavedetails/parental', (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.parentalLeaveDetails(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

//authorizeRole(1590 && 1573) ,

// Router.post('/leaveList/pending',checkRole([1]), (req, res) => {
Router.post('/leaveList/pending', (req, res) => {
    var result = [];
    // console.log("req.user-----------------",req.user);
    
    co(async function () {
        try {
            result = await service.leaveListPending(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});
Router.post('/leaveList',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveList(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/pdfData',checkRole([1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.pdfData(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leaveList/approved',checkRole([0,1]), (req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveListApproved(req.body);
            res.send(result);
        } catch (error) {
            console.log(error);
            result.message = error.message;
            res.send(error);
        }
    });
});

Router.post('/leaveList/rejected', checkRole([0,1]),(req, res) => {
    var result = [];
    co(async function () {
        try {
            result = await service.leaveListRejected(req.body);
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

Router.post('/delete',checkRole([1]), (req, res) => {
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
