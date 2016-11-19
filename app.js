var appRout = require('./server/router.js');

appRout.router.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
