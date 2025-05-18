# Spid Backend (PostgreSQL)

This is the backend service for the Spid application, now using PostgreSQL as the database.

## Setup

1. Make sure you have PostgreSQL installed and running on your machine
2. Create a new database called `spid`
3. Update the `.env` file with your PostgreSQL connection string:
   ```
   POSTGRES_URI=postgres://username:password@localhost:5432/spid
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Initialize the database:
   ```
   npm run init-db
   ```
6. Start the server:
   ```
   npm start
   ```
   
## Development

For development with auto-reload:
```
npm run dev
```

## Environment Variables

- `POSTGRES_URI`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 5000)
- `ADMIN_API_KEY`: API key for admin access

## API Endpoints

### Authentication
- `POST /api/auth/request-otp`: Request an OTP code
- `POST /api/auth/verify-otp`: Verify an OTP code

### Profile
- `POST /api/profile`: Update user profile

### Admin
- `POST /api/admin/login`: Admin login
- `GET /api/admin/users`: Get all users
- `GET /api/admin/users/:phone`: Get user by phone number
