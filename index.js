"use strict";

// npm modules
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const hbs = require("hbs");

// standard lib
const path = require("path");

// application requires
const config = require("./config");
const routes = require('./routes/index');

const app = express();

// Use morgan for logging
app.use(logger('dev'));
// Parse form data from POST bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Public directory hosts static content
app.use(express.static(path.join(__dirname, 'public')));
// Set handlebars as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Handlebars helpers
hbs.registerHelper('cycle', function(value, block) {
  var values = value.split(' ');
  return values[block.data.index % (values.length + 1)];
});

// Routes
app.use("/", routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("SMS Messages App listening on localhost:3000");
});
