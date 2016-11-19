var appRout = require('./server/router.js');

appRout.router.listen('$PORT', function () {
  console.log('Example app listening on port 3000!')
});
