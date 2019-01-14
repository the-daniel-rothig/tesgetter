var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var request = require('superagent');
const superagentCheerio = require('superagent-cheerio');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

require('dotenv').config()

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

if (process.env.NODE_ENV === 'production') {
  setInterval(function() {
      request.get(process.env.HOME_URL);
  }, 300000);
  
  const interval = parseInt(process.env.INTERVAL_IN_SECONDS) * 1000;

  setInterval(async function() {
    var res = await request.get(process.env.TARGET_URL)
      .use(superagentCheerio);
      
    const jobCount = parseInt(res.$(".t-job-count").text());
    console.log("job count", jobCount);
    try {
      res = await request.get(process.env.SPREADSHEET_URL).query({job_count: jobCount});
    } catch (err) {
      console.log(err);
    }
  
        
  }, interval);
}

module.exports = app;
