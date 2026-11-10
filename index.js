const express = require('express');
const session = require('express-session');
const redis = require('redis');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const RedisStore = require('connect-redis')(session);
const bcrypt = require('bcrypt');
require('dotenv').config();

// Secret Key validation
const secretKey = process.env.SECRET;
if (!secretKey) {
  console.error('FATAL ERROR: SECRET environment variable is not set.');
  process.exit(1);
}

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const saltRounds = 10; // For bcrypt

// Hardcoded user db - IN A REAL APP, LOAD FROM DB AND HASH PASSWORDS ON SIGNUP
const users = [
  { id: 1, username: 'foo', passwordHash: bcrypt.hashSync('bar', saltRounds) },
  { id: 2, username: 'john', passwordHash: bcrypt.hashSync('doe', saltRounds) },
];

const app = express();

// Set view engine
app.set('view engine', 'ejs');

// Parse login form posts; passport-local reads req.body
app.use(express.urlencoded({ extended: false }));

// Create Redis client
const redisClient = redis.createClient({
  // host: 'localhost', // Default host
  // port: REDIS_PORT,  // Default port
  url: `redis://localhost:${REDIS_PORT}`, // More explicit connection string
  legacyMode: true, // Required for connect-redis v6 with redis v4
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
  // Optional: Add logic to exit or attempt reconnection based on error type or app needs
});

// Attempt to connect to Redis
redisClient.connect().catch(err => {
  console.error('Failed to connect to Redis:', err);
  // Depending on the app's needs, you might want to exit here if Redis is critical
  // process.exit(1);
});

// Link express-session with redis store
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // plain local HTTP; flip to true only behind real HTTPS
      maxAge: 1000 * 60 * 60 * 1, // 1 hour - input taken in ms
    },
  })
);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Define local auth strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  const user = users.find(u => u.username === username);
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }

  try {
    // Compare submitted password with stored hash
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    // Return user object (without passwordHash)
    const { passwordHash, ...userWithoutPasswordHash } = user;
    return done(null, userWithoutPasswordHash);
  } catch (err) {
    return done(err);
  }
}));

// Return the single parameter from user object
// which we want to store in req.session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  if (user) {
    // Ensure passwordHash is not included
    const { passwordHash, ...userWithoutPasswordHash } = user;
    done(null, userWithoutPasswordHash);
  } else {
    // It's good practice to handle the case where the user is not found
    done(new Error('User not found in deserializeUser'));
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);

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
