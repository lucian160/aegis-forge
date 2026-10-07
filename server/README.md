# AEGIS Forge API

This phase introduces the backend foundation only. The frontend remains on its static demo-data architecture.

## Local setup

1. Copy `.env.example` to `.env`.
2. Update `MONGODB_URI` with the local MongoDB connection string.
3. Replace the development JWT secrets with long random values.
4. Install dependencies with `npm install`.
5. Start the API with `npm run server`.

## Authentication endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/profile`

Login issues a short-lived access token and an HTTP-only refresh cookie. Passwords are hashed with scrypt and refresh tokens are stored as SHA-256 hashes.

## Health endpoint

`GET /api/v1/health`

The endpoint reports service status, API version, and MongoDB connection state. It does not expose credentials or database details.

## Notes

- User persistence is introduced in this phase, but the frontend remains on its static demo data.
- No Redis, Docker, microservices, or load balancing is included.
- The server supports graceful shutdown and production environment validation.
