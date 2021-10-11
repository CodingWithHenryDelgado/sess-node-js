var session = require('client-sessions');

app.use(session({
    cookieName: 'session',
    secret: 'keepyourmouthshut!',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

app.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      res.render('login.jade', { error: 'Invalid email or password.' });
    } else {
      if (req.body.password === user.password) {
        // sets a cookie with the user's info
        req.session.user = user;
        res.redirect('/dashboard');
      } else {
        res.render('login.jade', { error: 'Invalid email or password.' });
      }
    }
  });
});

app.get('/dashboard', requireLogin, function(req, res) {
  res.render('dashboard.jade');
});

app.get('/dashboard', function(req, res) {
  if (req.session && req.session.user) { // Check if session exists
    // lookup the user in the DB by pulling their email from the session
    User.findOne({ email: req.session.user.email }, function (err, user) {
      if (!user) {
        // if the user isn't found in the DB, reset the session info and
        // redirect the user to the login page
        req.session.reset();
        res.redirect('/login');
      } else {
        // expose the user to the template
        res.locals.user = user;
 
        // render the dashboard page
        res.render('dashboard.jade');
      }
    });
  } else {
    res.redirect('/login');
  }
});

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

app.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
  });