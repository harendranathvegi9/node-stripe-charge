const express = require('express');
const router = express.Router();

const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');

router.get('/login', authHelpers.loginRedirect, (req, res, next) => {
  res.render('login', {
    user: req.user,
    messages: req.flash('messages')
  });
});

router.get('/register', authHelpers.loginRedirect, (req, res, next) => {
  res.render('register', {
    user: req.user,
    messages: req.flash('messages')
  });
});

router.post('/register', (req, res, next)  => {
  return authHelpers.createUser(req, res)
  .then((user) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { return next(err); }
      if (user) {
        req.logIn(user, (err) => {
          if (err) { return next(err); }
          req.flash('messages', {
            status: 'success',
            value: 'Welcome!'
          });
          return res.redirect('/');
        });
      }
    })(req, res, next);
  })
  .catch((err) => { return next(err); });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('messages', {
        status: 'danger',
        value: 'Invalid username and/or password.'
      });
      return res.redirect('/auth/login');
    }
    if (user) {
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        req.flash('messages', {
          status: 'success',
          value: 'Welcome!'
        });
        return res.redirect('/');
      });
    }
  })(req, res, next);
});

router.get('/logout', authHelpers.loginRequired, (req, res, next) => {
  req.logout();
  req.flash('messages', {
    status: 'success',
    value: 'Successfully logged out.'
  });
  res.redirect('/');
});

function handleResponse(res, code, statusMsg) {
  return res.status(code).json({status: statusMsg});
}

module.exports = router;
