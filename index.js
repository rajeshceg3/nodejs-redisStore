const express = require('express');
const session = require('express-session');
const redis = require('redis');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const RedisStore = require('connect-redis')(session);
require('dotenv').config();
const secretKey = process.env.SECRET || 'secret-key';

const app = express();

// Set view engine
app.set('view engine', 'ejs');

// Create Redis client
const redisClient = redis.createClient();

// Link express-session with redis store
app.use(session({
  store: new RedisStore({client: redisClient}),
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // for HTTPS
    maxAge: 1000 * 60 * 60 * 1 // 1 hour - input taken in ms
  }
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Define local auth strategy
const localStrategy = new LocalStrategy((username, password, done)=>{
    // In prod, this will be a db call to verify credentials
  if( username === 'foo' && password === 'bar'){
    return done(null, { id: 1, username: 'foo'});
  }else{
    return done(null, false)
  }
})
passport.use(localStrategy);

passport.serializeUser((user, done)=>{
  done(null, user.id);
})

passport.deserializeUser((id, done)=>{
  // Do a db call to look up the user object using id
  // Here, we are hard coding it and call done method with 
  // entire user object
  const user = {
    id: 1,
    username : foo
  }
  done(null, user);
})


app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

app.get('/', (req, res) => {
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    res.send(`Welcome, ${req.user.username}`);
  } else {
    res.redirect('/login');
  }
});
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
