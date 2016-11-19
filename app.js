var app = require('./server/api.js');

var port = process.env.PORT || 8080;

app.api.listen(port, function () {
  console.log('Example app listening on port ' + port)
});
