# setDate Backend

A Node.js backend server for the setDate project.

## Features

- Express.js server with security middleware
- CORS enabled for frontend communication
- Request logging with Morgan
- Security headers with Helmet
- Environment variable configuration
- Health check endpoint
- Error handling middleware

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your configuration values.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (requires nodemon to be installed)

## API Endpoints

- `GET /` - Welcome message and server status
- `GET /health` - Health check endpoint

## Environment Variables

Copy `env.example` to `.env` and configure the following variables:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (create from env.example)
├── .gitignore        # Git ignore rules
├── env.example       # Example environment file
└── README.md         # This file
```

## Development

To start development with auto-restart:

1. Install nodemon globally:
   ```bash
   npm install -g nodemon
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Production

To start the production server:

```bash
npm start
```

The server will be available at `http://localhost:5000` (or the port specified in your `.env` file). 