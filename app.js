/**
 * Seats
 * @author Batuhan Icoz
 * @author Demircan Celebi
 */

var express = require('express'),
	http = require('http'),
	path = require('path'),
	flash = require('connect-flash'),
	mongoose = require('mongoose'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	user = null,
	admins = [{
		id: 1,
		username: 'ok',
		password: 'bumk1974'
	}, {
		id: 2,
		username: 'ok2',
		password: 'bumk1974'
	}];

app.use(express.cookieParser(process.env.SECRET || 'thisissosecretevenidontknowit'));

mongoose.connect('mongodb://localhost/gkm2');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error:'));

var Sale = mongoose.model('sale', mongoose.Schema({
	category: String,
	seat: String,
	sold: {
		type: Boolean,
		default: false
	},
	seller: {
		type: String,
		default: 'ok'
	},
	created_at: {
		type: Date,
		default: Date.now
	}
}));

function findById(id, fn) {
	var idx = id - 1;
	if (admins[idx]) {
		fn(null, admins[idx]);
	} else {
		fn(new Error('Admin #' + id + ' does not exist '));
	}
}

function findByUsername(username, fn) {
	for (var i = 0, len = admins.length; i < len; i++) {
		var admin = admins[i];
		if (admin.username === username) {
			return fn(null, admin);
		}
	}
	return fn(null, null);
}
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		process.nextTick(function() {
			findByUsername(username, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Unknown user ' + username
					});
				}
				if (user.password != password) {
					return done(null, false, {
						message: 'Invalid password'
					});
				}
				return done(null, user);
			})
		});
	}
));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

app.use(express.session({
	secret: process.env.SECRET || 'thisissosecretevenidontknowit'
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}
app.use(app.router);


app.get('/', function(req, res) {
	user = req.user;
	res.render('index', {
		user: req.user,
		message: req.flash('error')
	});
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/admin', ensureAuthenticated, function(req, res) { // This is for stats
	res.render('admin', {
		user: req.user
	});
});

app.get('/login', function(req, res) {
	res.redirect('/');
});

app.get('/sales',
	function(req, res) {
		Sale.find({}, function(err, sales) {
			if (err) console.log(err);
			res.send({
				sales: sales
			});
		});
	});

app.post('/login',
	passport.authenticate('local', {
		failureRedirect: '/',
		failureFlash: true
	}),
	function(req, res) {
		res.redirect('/');
	});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

server.listen(app.get('port'), function() {
	console.log('We are up @ port ' + app.get('port'));
});

function clearReservations() {
	console.log('Cleaning reservations...');
	Sale.findOneAndRemove({
		sold: false
	}, function(err, docs) {
		console.log(err);
		console.log(docs);
	});
}

clearReservations();
setInterval(clearReservations, 60000);
io.set('transports', ['xhr-polling']);
io.sockets.on('connection', function(socket) {
	Sale.find({}, function(err, sales) {
		stats = {};
		stats.total = sales.length;
		stats.bumk = 0;
		stats.normal = 0;
		stats.student = 0;
		for (var i = 0, len = sales.length; i < len; i++) {
			if (sales[i].category === 'normal' && sales[i].sold) stats.normal = stats.normal + 1;
			if (sales[i].category === 'bumk' && sales[i].sold) stats.bumk = stats.bumk + 1;
			if (sales[i].category === 'student' && sales[i].sold) stats.student = stats.student + 1;
		}

		socket.emit('initialdata', {
			sales: sales,
			stats: stats
		});
	});

	socket.on('disconnect', function() {
		if (user) {}
		//clear reservations
	});

	socket.on('updateseat', function(saledata) {
		if (user) {

			var query = Sale.findOneAndRemove({
				"seat": saledata.seat,
				sold: false
			});
			query.exec();

			var _sale = new Sale(saledata);
			_sale.save();

			socket.broadcast.emit('updateseat', saledata);
		}
	});

	socket.on('deleteseat', function(seat) {
		if (user || seat) {
			var query = Sale.findOneAndRemove({
				"seat": seat.seat
			});
			query.exec();
			socket.broadcast.emit('deleteseat', seat);
		}
	});

});