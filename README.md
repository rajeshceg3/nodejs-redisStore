# Simple Node.js Authentication Service with Redis

This project is a simple Node.js Express application demonstrating user authentication with username/password, session management using Redis, and Passport.js. It's intended as a basic example and a starting point for building more complex authentication systems.

## Features

*   User login with username and password.
*   Session management via `express-session` with Redis as the session store (`connect-redis`).
*   Authentication handled by `passport` and `passport-local`.
*   Password hashing using `bcrypt`.
*   Protected route (`/`) accessible only after successful login.
*   Basic environment variable usage for configuration (`dotenv`).

## Project Purpose and Usage

This application serves as an educational tool to understand the fundamentals of:
*   Setting up a Node.js Express server.
*   Implementing local authentication (username/password).
*   Storing sessions in Redis.
*   Securing passwords with hashing.
*   Protecting routes based on authentication status.

You can use this project to:
*   Learn how these different components work together.
*   As a boilerplate for your own projects requiring similar authentication logic.
*   Experiment with adding new features like logout, user registration, or different Passport strategies.

## Project Structure

```
.
├── .github/workflows/main.yml  # CI/CD configuration (to be added)
├── .gitignore                  # Files and directories to ignore for Git
├── README.md                   # This file
├── PRODUCT_REQUIREMENTS.md     # Product Requirements Document
├── index.js                    # Main application file (server setup, routes, auth logic)
├── package-lock.json           # Exact versions of dependencies
├── package.json                # Project metadata and dependencies
├── views/                      # EJS templates
│   └── login.ejs               # Login page template
└── node_modules/               # Installed npm packages (ignored by Git)
```

## Setup and Running the Project

Follow these steps to get the application running locally:

### 1. Prerequisites

*   **Node.js:** (v14 or later recommended) - Download from [nodejs.org](https://nodejs.org/)
*   **npm:** (Usually comes with Node.js)
*   **Redis:** An active Redis server instance. You can install it locally or use a cloud-based Redis service.
    *   Installation guides: [Redis Quick Start](https://redis.io/docs/getting-started/)
    *   Ensure your Redis server is running before starting the application.

### 2. Clone the Repository

```bash
git clone <repository_url> # Replace <repository_url> with the actual URL
cd <repository_directory>
```

### 3. Install Dependencies

Navigate to the project directory in your terminal and run:

```bash
npm install
```

This will install all the necessary packages listed in `package.json`.

### 4. Configure Environment Variables

This application requires a few environment variables. Create a `.env` file in the root of your project:

```
touch .env
```

Add the following content to your `.env` file:

```env
# A strong, unique secret for session encryption
SECRET=your_super_secret_key_here

# Optional: Port for the Redis server (defaults to 6379 if not set)
# REDIS_PORT=6379

# Optional: Host for the Redis server (defaults to 'localhost' if not set)
# REDIS_HOST=localhost
```

**Important:**
*   Replace `your_super_secret_key_here` with a long, random, and unique string. This is critical for security.
*   The application will fail to start if `SECRET` is not defined.
*   If your Redis server is running on a different host or port, uncomment and set `REDIS_HOST` and `REDIS_PORT` accordingly.

### 5. Run the Application

Once the dependencies are installed and the `.env` file is configured, you can start the server:

```bash
npm start
```

You should see a message in your console:

```
Server listening on port 3000
```
If you see errors related to Redis, ensure your Redis server is running and accessible. If you see an error about the `SECRET` variable, double-check your `.env` file.

### 6. Access the Application

Open your web browser and navigate to:

*   **Login Page:** `http://localhost:3000/login`
    *   You can log in with the following hardcoded credentials:
        *   Username: `foo`, Password: `bar`
        *   Username: `john`, Password: `doe`
*   **Protected Page:** `http://localhost:3000/`
    *   If you are not logged in, you will be redirected to `/login`.
    *   After a successful login, you will see a welcome message: `Welcome, [username]`.

**Note on HTTPS and Cookies:** The session cookie is configured with `secure: true`, meaning it should only be sent over HTTPS. If you are running this locally over HTTP, this might prevent the session from working correctly in some browsers or configurations. For local development, you might temporarily set `secure: false` in the cookie configuration in `index.js` if you encounter issues, but **always use `secure: true` in production over HTTPS.**

## How It Works

1.  **Express Server (`index.js`):** Sets up the web server, middleware, and routes.
2.  **View Engine (`ejs`):** Used to render the simple HTML form for login (`views/login.ejs`).
3.  **Session Middleware (`express-session` & `connect-redis`):**
    *   Manages user sessions.
    *   Stores session data in Redis, so sessions persist even if the Node application restarts.
    *   Uses a secret key (from `process.env.SECRET`) to sign session ID cookies.
4.  **Authentication (`passport` & `passport-local`):**
    *   `passport` is a middleware for authentication.
    *   `passport-local` strategy handles username and password authentication.
    *   When a user submits the login form (`POST /login`):
        *   The `LocalStrategy` verifies the credentials against the hardcoded `users` array (after comparing the hashed password).
        *   If valid, Passport establishes a session and stores the user's ID in it (`serializeUser`).
        *   On subsequent requests, Passport retrieves the user's details from the session using the ID (`deserializeUser`).
5.  **Password Hashing (`bcrypt`):**
    *   User passwords in the `users` array are stored as hashes generated by `bcrypt`.
    *   When a user attempts to log in, the provided password is hashed and then compared to the stored hash. This prevents storing plaintext passwords.
6.  **Protected Route:**
    *   The `/` route checks `req.isAuthenticated()`, a method provided by Passport.
    *   If true, it displays a welcome message.
    *   If false, it redirects the user to `/login`.
7.  **Environment Variables (`dotenv`):**
    *   Loads environment variables from a `.env` file (e.g., `SECRET`, `REDIS_PORT`) into `process.env`.

## Bug Fixes Implemented

*   **Mandatory Session Secret:** The application now requires the `SECRET` environment variable to be set, enhancing security.
*   **Redis Connection Error Handling:** Basic error handling for the Redis client has been added.
*   **Password Hashing:** Plaintext passwords have been replaced with `bcrypt` hashes for secure storage and comparison.

## Future Enhancements (from PRD)

*   Implementation of logout functionality.
*   Adding user registration.
*   Integration with a proper database for user storage.
*   More robust error handling and logging.
*   Adding unit and integration tests.
*   Implementing CSRF and XSS protections.
