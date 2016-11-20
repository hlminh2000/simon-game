var fs = require('fs');
var bodyParser = require('body-parser');

var router = require('./router.js');
var api = router.router;

api.use(bodyParser.urlencoded({ extended:false }));
api.use(bodyParser.json());

api.post('/gameSession', (req, res) => {
	var sessionData = req.body;
	var ALL_SESSIONS_FILE = 'models/ALL_SESSIONS.json';
	var a_sessions = JSON.parse(fs.readFileSync(ALL_SESSIONS_FILE, 'utf8'));
	a_sessions.push(sessionData);
	fs.writeFileSync(ALL_SESSIONS_FILE, JSON.stringify(a_sessions, null, ' '));
	console.log(a_sessions);
	res.end();
});

api.get('/latestState', (req, res) => {
	var ALL_SESSIONS_FILE = 'models/ALL_SESSIONS.json';
	var latestSession = JSON.parse(fs.readFileSync(ALL_SESSIONS_FILE, 'utf8'))
		.sort((sA, sB) => {
			return sB.timestamp - sA.timestamp;
		})[0].data;
	var latestState = latestSession.gameStates[latestSession.gameStates.length-1];
	console.log(JSON.stringify(latestState));
	res.end(JSON.stringify(latestState));
});

exports.api = api;
