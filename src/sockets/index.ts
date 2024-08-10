import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid';

import { startBid, takeBids, endBid, addUser, getLastBid } from '../helper/roationHandler';
import { bidInterface } from '../types/bidInterface';
import { get } from 'http';

export function setupWebSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log('WebSocket server created'); // Log when the server is created

  let globalBidInfo: any;
  const clients: { [uuid: string]: string } = {}; // Store client UUIDs and socket IDs
  let sessionOver: boolean; 

  const durationSession = 50000; // 2 minutes in milliseconds
  const durationNewSession = 60000; // 1 minute in milliseconds

  function startNewSessionTimer() {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const timeLeft = durationNewSession - elapsedTime;
  
      // Broadcast the time left until the new session starts
      const timeLeftInSeconds = Math.floor(timeLeft / 1000);
      io.emit("timeUntilNewSession", timeLeftInSeconds);
  
      // Stop the timer when the new session starts
      if (elapsedTime >= durationNewSession) {
        clearInterval(timer);
        startNewBidding();
      }
    }, 1000);
  }

  const startNewBidding = () => {
    console.log("Starting a new bidding session...");
    sessionOver = false;
  
    const privateBidInfo = startBid();
    globalBidInfo = privateBidInfo;
    console.log("Bid started with info:", privateBidInfo);
    io.emit("bidInfo", privateBidInfo);
  
    // Timer to broadcast current time every second for two minutes
    const startTime = Date.now();
    const timer = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const timeLeft = durationSession - elapsedTime;
  
      // Broadcast the current time to all connected clients
      const timeLeftInSeconds = Math.floor(timeLeft / 1000);
      io.emit("currentTime", timeLeftInSeconds);
  
      // Stop the timer and call endBid after two minutes (120000 milliseconds)
      if (elapsedTime >= durationSession) {
        sessionOver = true;
        console.log("50 seconds elapsed, ending bid...");
        clearInterval(timer);
        const result = endBid();
        console.log("Bid ended with result:", result);
        
        io.to(clients[result.lastBidder]).emit("youWon", { lastBid: result.lastBid, bidMessage: "You won the bid!" });
        // Emit "endBid" message to all clients except the winning client
        Object.keys(clients).forEach(clientId => {
          if (clientId !== result.lastBidder) {
            io.to(clients[clientId]).emit("endBid", { lastBid: result.lastBid, bidMessage: "You didn´t win :(" });
          }
        });

        // Start a new bidding session after one minute (60000 milliseconds)
        console.log("Starting a new bidding session in 60 seconds...");
        startNewSessionTimer();
      }
    }, 1000);
  };

  startNewBidding();

  io.on('connection', (socket: Socket) => {
    const userId = uuidv4(); // Generate a random user ID
    addUser(userId); // Add the user ID to the
    clients[userId] = socket.id;

    console.log(`A user connected: ${userId}`); // Log when a user connects

    if(sessionOver){
      socket.emit("endBid", { lastBid: "", bidMessage: "A new session will start very soon!" })
    }

    socket.emit("bidInfo", globalBidInfo);

    const queryLastBid = getLastBid();
    socket.emit("lastBid", queryLastBid);

    // Listen for bids
    socket.on("bid", (bid: bidInterface) => {

      const result = takeBids(bid.money, userId);

      if(!result){
        socket.emit("bidError", "Your bid is not valid");
        console.log(`Bid not valid: ${bid.money} from ${userId}`);
        return
      }

      io.emit("lastBid", result);
    })

    socket.on('disconnect', () => {
      console.log(`A user disconnected: ${userId}`); // Log when a user disconnects
      delete clients[userId]; // Remove the socket ID on disconnect
    });
  });
}