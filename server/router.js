var express = require('express');

var router = express();

router.use('/', express.static('view'));

exports.router = router;
