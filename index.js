var express = require('express');
var morgan = require('morgan');
var app = express();

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use( nocache );
app.use( morgan('dev') );

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.use("/public",express.static('public'));
app.use("/common",express.static('common'));

app.use("/dynamic", require("./private") );

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
