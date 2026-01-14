# GigFlow - Mini Freelance Marketplace

A full-stack freelance marketplace platform where users can post jobs (Gigs) and bid on them as freelancers.

## Live Demo

- **Frontend:** https://gig-flow-gusp.vercel.app/
- **Backend API:** https://gig-flow-2i2m.onrender.com/

## Features

### Authentication
- Secure user registration and login
- JWT-based authentication with HttpOnly cookies
- Persistent sessions across browser refreshes

### Gig Management
- Browse all open gigs on the home feed
- Search gigs by title
- Post new gigs with title, description, and budget
- View detailed gig information

### Bidding System
- Submit bids on open gigs with proposal message and price
- View all your submitted bids in "My Bids" section
- Gig owners can review all received bids
- One-click hiring with automatic status updates

### Hiring Logic
- When a freelancer is hired:
  - Gig status changes from "open" to "assigned"
  - Selected bid status becomes "hired"
  - All other bids are automatically marked as "rejected"

## Bonus Features Implemented

### 1. Transactional Integrity (Race Condition Prevention)
The hiring logic uses **MongoDB Transactions** to ensure atomic updates. If two users try to hire different freelancers simultaneously, only one will succeed - preventing data inconsistencies.

```typescript
const session = await mongoose.startSession();
session.startTransaction();
// All updates happen within the transaction
await session.commitTransaction();
```

### 2. Real-time Notifications (Socket.io)
When a client hires a freelancer, the freelancer receives an **instant notification** without refreshing the page. Implemented using Socket.io for WebSocket communication.

## Tech Stack

### Frontend
- React.js (Vite)
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Router DOM
- Socket.io Client
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- Socket.io

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/gigs` | Fetch all open gigs (supports `?search=` query) |
| POST | `/api/gigs` | Create a new gig |
| GET | `/api/gigs/:id` | Get gig by ID |
| POST | `/api/bids` | Submit a bid |
| GET | `/api/bids/:gigId` | Get all bids for a gig (owner only) |
| GET | `/api/bids/my-bids` | Get user's submitted bids |
| PATCH | `/api/bids/:bidId/hire` | Hire a freelancer |

## Database Schema

### User
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)

### Gig
- `title`: String
- `description`: String
- `budget`: Number
- `ownerId`: Reference to User
- `status`: "open" | "assigned"

### Bid
- `gigId`: Reference to Gig
- `freelancerId`: Reference to User
- `message`: String
- `price`: Number
- `status`: "pending" | "hired" | "rejected"

## Local Development

### Prerequisites
- Node.js (v20+)
- MongoDB

### Setup

1. Clone the repository
```bash
git clone https://github.com/AniruddhUdayan/gig-flow.git
cd gig-flow
```

2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_secret_key
PORT=5000
```

Run the server:
```bash
npm run dev
```

3. Setup Frontend
```bash
cd client
npm install
```

Create `.env` file:
```
VITE_API_URL=http://localhost:5000
```

Run the client:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Project Structure

```
gig-flow/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux slices
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API service
│   │   └── types/          # TypeScript types
│   └── ...
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── config/         # Database config
│   │   └── utils/          # JWT utilities
│   └── ...
└── README.md
```

## Author

Aniruddh Udayan
