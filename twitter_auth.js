var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new TwitterStrategy({
    passReqToCallback: true,
    consumerKey: '9u0OVbPnw4DBAz3dbbuBGnzax',
    consumerSecret: '2VCgaAQmUPa9jAiYEtVMtaj8WRBM5bPpsn77bfFnpz7GLM4Ukj',
    callbackURL: "http://mclement.us/auth/twitter/callback"
  },
  function(req, token, tokenSecret, profile, done) {
    console.log("username "+profile.username+" displayname "+profile.displayName);
    console.log(profile);
    console.log("session");
    console.log(req.session);
    req.session.identifier = profile.username;
    req.session.displayName = profile.displayName;
    process.nextTick(function () {
      profile.identifier = profile.username;
      return done(null, profile);
    });
  }
));
var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/static'));
// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/info',
                                     failureRedirect: '/login' }));
app.get('/login', function(req, res){
  if(req.isAuthenticated()){
    res.redirect('/info');
  } else{
    res.render('login', { user: req.user });
  }
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});
app.get('/info', function(req, res){
  if(req.isAuthenticated()){
    console.log("/info route");
    console.log(req.session);
    res.render('info', { user: req.session });
  } else {
    res.redirect('/login');
  }
});
app.listen(80);
