var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const https = require('https');
const fs = require('fs');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var hireAppDeveloper = require('./routes/hire_app_routes');  // routes for hire developer module


var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/costcalculator.redbytes.in/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/costcalculator.redbytes.in/cert.pem'),
  };
  
  var app = express();
  
  var current_port = process.env.LOCAL_PORT

var port_no = process.env.PORT;
var server = https.createServer(options,app).listen(port_no, function(){
 console.log("Express server listening on port  ---> " + port_no);
});
// https.createServer(options, function (req, res) {
//   res.writeHead(200);
//   res.end("Welcome to Node.js HTTPS Server");
//   console.log("Welcome to Node.js HTTPS Server " + process.env.PORT);
//   }).listen(process.env.PORT)


// add config file
require('dotenv').config();
// view engine setup
app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'template_icons')));




const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};
app.use(cors());
//app.use(cors(corsOpts));

//Allow CORS
app.all('/*', function (req, res, next) {
  // const allowedOrigins = ['http://localhost:3000', 'http://localhost'];
  // const origin = req.headers.origin;
  // if (allowedOrigins.includes(origin)) {
  //      res.setHeader('Access-Control-Allow-Origin', origin);
  // }
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type,Accept,X-Access-Token,X-Key,X-CSRF-Token');
  // res.header('Access-Control-Allow-Credentials', false);
  
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
  if (req.method == 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hire-developer', hireAppDeveloper);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app,current_port};
