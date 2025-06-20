# SyncUp - Social Planning App

## Project Structure
```
SyncUp/
├── syncup-backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   ├── tests/              # Backend tests
│   └── package.json
└── syncup-frontend/         # React TypeScript app
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── hooks/          # Custom hooks
    │   ├── utils/          # Utility functions
    │   └── types/          # TypeScript types
    └── package.json
```

## Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: PostgreSQL
- **Calendar**: FullCalendar.io
- **Authentication**: JWT

## Getting Started

### Backend
```bash
cd syncup-backend
cp .env.example .env  # Edit with your database credentials
npm install
npm run dev
```

### Frontend
```bash
cd syncup-frontend
npm install
npm start
```

## Features
- User authentication and profiles
- Friend management system
- Availability calendar
- Wish-list sharing
- Group plan creation and RSVP tracking