import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000; 
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let io;
app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
  });

  // httpServer.on("request", (req, res) => {
  //   return handler(req, res);
  // });

  global.io = io;
  // console.log("ll" ,global.io);
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});