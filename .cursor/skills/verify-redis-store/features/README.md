# Feature map: nodejs-redisStore

Purpose (from source interview): minimal Express + passport-local demo where
sessions live in Redis; demo users foo/bar and john/doe are bcrypt-hashed in source. SECRET env is required or the app refuses to boot.
Logging in shows "Welcome, <username>"; everything else redirects to /login.

## Exercised by verify.cjs (real cookie jar, isolated in-memory Redis)

| Flow | What is proven |
|---|---|
| Route protection | GET / unauthenticated redirects to /login |
| Login page | GET /login renders 200 |
| Login failure | POST /login wrong password redirects to /login (regression: redis v4 promise API vs old callback style - the strategy previously threw) |
| Login success | POST /login foo/bar redirects to / and the session persists: GET / shows "Welcome, foo" |
| Session store | the session survives across requests through Redis (cookie jar proof) |

## Known boundaries (honest scope)

- Verification uses redis-memory-server: a real local redis-server binary,
  fully disposable. The app seeds its demo users on boot.
- Bcrypt-hashed demo users, but still a learning demo, not an auth template.
- Regression fixed here: form posts were not body-parsed, so no login could
  ever authenticate; session cookie secure:true silently broke local HTTP.
- REDIS_PORT env selects the Redis port; the app hardcodes HTTP port 3000.
