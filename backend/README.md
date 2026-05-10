# Traveloop Backend

Express + MySQL API for the Traveloop hackathon app.

## Setup

Install dependencies:

```bash
npm.cmd install
```

Create `.env` from the example:

```bash
copy .env.example .env
```

Required environment variables:

```env
PORT=5000
LOG_LEVEL=info

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=traveloop
DB_PORT=3306

JWT_SECRET=traveloop_local_demo_secret_change_before_production
JWT_EXPIRES_IN=7d
```

`JWT_SECRET` must be at least 16 characters.

## Database

Reset the database and load schema + demo data:

```bash
npm.cmd run db:reset
```

Reseed existing tables without manually running SQL files:

```bash
npm.cmd run db:reseed
```

Use `db:reset` when the schema changes. Use `db:reseed` when demo data gets messy during testing.

Demo users:

```text
parshuram@traveloop.test / password123
sahil@traveloop.test / password123
```

## Run

Start the backend:

```bash
npm.cmd run dev
```

Base URL:

```text
http://localhost:5000
```

Most routes are under:

```text
http://localhost:5000/api
```

If `http://localhost:5000` returns `Route not found`, the server is still running correctly. Use an API route such as:

```text
http://localhost:5000/api/cities
```

## Response Shape

Success:

```json
{
  "success": true,
  "message": "Message here",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Message here",
  "errors": []
}
```

Validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid",
      "value": "bad"
    }
  ]
}
```

## Quick API Checks

Public city list:

```text
GET /api/cities
```

Login:

```text
POST /api/auth/login
```

```json
{
  "email": "parshuram@traveloop.test",
  "password": "password123"
}
```

Protected trip list:

```text
GET /api/trips
Authorization: Bearer <token>
```

## Debugging Tips

Every response includes an `X-Request-Id` header.

Backend logs include:

```text
method
path
statusCode
durationMs
requestId
```

Increase logging during integration:

```env
LOG_LEVEL=debug
```

Common issues:

- `Authentication token is required`: frontend did not send `Authorization: Bearer <token>`.
- `Invalid or expired authentication token`: login again and replace the token.
- `Validation failed`: inspect `errors[].field` and `errors[].message`.
- `Malformed JSON request body`: request body is not valid JSON.
- `Route not found`: check the route starts with `/api`.
- Duplicate seed errors: run `npm.cmd run db:reset` instead of manually applying `seed.sql` twice.

## Integration Notes

Frontend should read:

- `success` to decide success/failure.
- `message` for toast/status text.
- `data` for successful payloads.
- `errors` for form field validation.

Do not rely on raw MySQL column names unless the API response exposes them.
