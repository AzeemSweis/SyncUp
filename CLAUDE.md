# SyncUp Project Notes

## Project Structure
- `/syncup-backend/` - Node.js/Express API server
- `/syncup-frontend/` - React frontend application
- Root directory contains setup scripts and documentation

## Database Commands
- Migration: Run SQL scripts in `/add-username-migration.sql`
- Connection: Uses AWS RDS PostgreSQL with SSL

## Development Commands
- Backend: `cd syncup-backend && npm run dev` (development) or `npm run build && npm start` (production)
- Frontend: `cd syncup-frontend && npm start`
- Testing: Manual API testing with curl or frontend testing at http://localhost:3000

## Current Status
- ✅ Username system fully implemented
- ✅ Authentication (signup/login with email or username)
- ✅ Friends system with search by username/name
- ⏳ Next: Availability management, wish-lists, and plans

## Key Endpoints
- POST /api/auth/signup - Create account with username
- POST /api/auth/login - Login with email or username
- GET /api/users/search?q=query - Search users by name/username
- POST /api/friends/request - Send friend request