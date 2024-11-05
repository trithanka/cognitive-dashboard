"use strict";
//requires
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const CreateError = require("http-errors");
var morgan = require("morgan");  //logger 
const PORT = 7061;

const { authenticateToken, authenticateTokenBypass } = require('./apps/auth/auth')

/************************************************************************* */
// Import Routes
const Dashboard = require('./apps/routes/rDashboard/DashboardRoute')
const EmployeeManagement = require('./apps/routes/rEmployeeManagement/EmployeeManagementRoute')
const LeaveApproval = require('./apps/routes/rLeaveApproval/LeaveApprovalRoute')
const LocationMapping = require('./apps/routes/rLocationMapping/LocationMappingRoute')
const Authenticate = require('./apps/routes/rAuthenticate/AuthenticateRoute')
/************************************************************************** */

// Create the express app
const app = express();
app.use(cors({
  origin: '*'
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(morgan("dev"));
/*************************************************************************** */
const authSwitch = 1 // bhery densar if 0; application dhup dhaap heppening; auth gayob application setep

function authState(req, res, next){
  return authSwitch===0 
    ? authenticateTokenBypass
    : authenticateToken
}

//Global Routes
app.use("/Dashboard", authState(), Dashboard);
app.use("/EmployeeManagement",EmployeeManagement)
app.use("/LeaveApproval", authState(), LeaveApproval)
app.use("/LocationMapping", authState(), LocationMapping)
app.use("/Authenticate", Authenticate)


// app.use(morgan((tokens, req, res) => {
//   return [
//       tokens.method(req, res),
//       tokens.url(req, res),
//       tokens.status(req, res),
//       tokens.res(req, res, 'content-length'), '-',
//       tokens['response-time'](req, res), 'ms'
//   ].join(' ')
// }))
/************************************************************************* */

// Error handlers
// Define a middleware function that will be executed for any incoming HTTP requests
app.use((res, req, next) => {
  return next(CreateError(404, "Route Not Found!"));
});

//error handling middleware function
app.use((error, req, res, next) => {
  return res.status(error.status || 500).json({
    status: false,
    message: error.message,
  });
});
/******************************************************************************** */

// Start server
app.listen(PORT, function (err) {
  if (err) {
    return console.error(err);
  }

  console.log("Started at http://localhost:" + PORT);
});
