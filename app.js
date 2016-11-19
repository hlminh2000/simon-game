var appRout = require('./server/router.js');

var port = process.env.PORT || 3000;

appRout.router.listen('port', function () {
  console.log('Example app listening on port ' + port)
});
