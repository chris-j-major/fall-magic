var express = require('express');
var morgan = require('morgan');
var app = express();

const ONE_DAY = 86400000;

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

if (app.get('env') == 'production') {
  app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 } }));
  staticMaxAge = ONE_DAY;
}else{
  app.use( nocache );
  app.use( morgan('dev') );
  staticMaxAge = 0;
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.use("/public",express.static('public',{ maxAge: staticMaxAge }));
app.use("/common",express.static('common',{ maxAge: staticMaxAge }));

app.use("/dynamic", nocache , require("./private") );

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function () {
  console.log('"fall-magic" listening on "'+app.get('port')+'"');
});
