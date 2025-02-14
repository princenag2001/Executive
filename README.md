ChatApp

Overview

ChatApp is a real-time chat application that allows users to communicate instantly with seamless user authentication and message synchronization.

Features

🔐 User Authentication (JWT-based login & signup)

📩 Real-time Messaging (via WebSockets)

📜 Chat History (Persistent storage with MongoDB)

🛠 Scalable Backend (Built with Node.js & Express)


🌍 Multi-user Support

Tech Stack

Frontend: React.js / Next.js

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT (JSON Web Tokens)

Real-time Communication: WebSockets (Socket.io)

Installation

Prerequisites

Ensure you have the following installed:

Node.js (>= 16.x)

MongoDB

Git

Setup


Install dependencies:

npm install

Set up environment variables in .env:

PORT=3000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-secret-key

Start the server:

npm start

Usage

Sign up or log in.

Start a conversation with other users.
Messages appear instantly in real-time.

Feel free to contribute! Fork the repo, create a feature branch, and submit a pull request.
