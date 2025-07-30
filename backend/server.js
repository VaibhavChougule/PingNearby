import http from 'http'
import { WebSocketServer } from 'ws';

const server = http.createServer();

const wss = new WebSocketServer({ server });

let clients = [];
let clientLocation = []

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  const clientID = Date.now().toString();
  const clientData = { id: clientID, ip: clientIP, ws };
  ws.send(JSON.stringify({clientID , type:'clientID'}))

  // Store client details
  clients.push(clientData);
  console.log(`Client connected: ${clientID} (${clientIP})`);
  console.log('Clients:', clients.map(c => c.id));

 
 ws.on('message', (message) => {
  const parsed = JSON.parse(message.toString());
  console.log("type:", parsed.type);

  if (parsed.type === 'location') {
    clientLocation.push({
      clientID: clientID,
      latitude: parsed.latitude,
      longitude: parsed.longitude
    });

    console.log(`Received from ${clientID}:`, parsed);
    console.log('All client locations:', clientLocation);

    // Broadcast updated location list to all clients
    clients.forEach(client => {
      // console.log("client info:" , client)
      if (client.ws.readyState === ws.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'all_locations',
          locations: clientLocation
        }));
      }
    });
  }
  else if(parsed.type === 'user_msg'){
    console.log("parsed:" , parsed)
    let self;
    try{
      const neighbour = clients.find(u => u.id == parsed.to);
      self = clients.find(u => u.id == parsed.from);

      neighbour.ws.send(JSON.stringify({type:'incoming_msg' , msg:parsed.msg, from:parsed.from}))
    }
    catch(error){
      console.log("User is Offline")
      self.ws.send(JSON.stringify({type:'offline_error' , msg:'User Offline', from:parsed.from}))
    }
    // console.log("neighbour:",neighbour)
  }
});


  

  // Remove on disconnect
 ws.on('close', () => {
  clients = clients.filter(c => c.id !== clientID);
  clientLocation = clientLocation.filter(c => c.clientID !== clientID);
  clients.forEach(client => {
      // console.log("client info:" , client)
      if (client.ws.readyState === ws.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'all_locations',
          locations: clientLocation
        }));
      }
    });
  console.log(`Client disconnected: ${clientID}`);
});

});

const PORT = process.env.PORT || 6500;
const HOST = '0.0.0.0';
server.listen(PORT, HOST ,() => {
  console.log("server is listening on 6500");
})
