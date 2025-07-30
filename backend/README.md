# PingNearby Backend

A Node.js backend server for the PingNearby project.

## Features

- Upgraded HTTP server to Websocket Server
- CORS enabled for frontend communication

## Prerequisites

- Node.js
- npm

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

4. Update the `.env` file with your configuration values.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (requires nodemon to be installed)


## Environment Variables

- `PORT` - Server port (default: 5000)

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
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
