import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'node:http';
import {setupWebSocket} from './sockets/index';

const app = express();
const server = createServer(app);

const PORT = 3000;

// Middleware setup
app.use(express.json());
app.use(cors());

// Connect to the database
/*
mongoose.connect('mongodb://localhost/picturesbay').then(() => {
  console.log('Connected to the database');
});
*/

// Initialize WebSocket functionality
setupWebSocket(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});