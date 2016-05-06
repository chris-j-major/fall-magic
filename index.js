var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.use("/public",express.static('public'));
app.use("/common",express.static('common'));

app.use("/dynamic", require("./private") );

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
