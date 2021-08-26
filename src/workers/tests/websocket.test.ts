import WS from "jest-websocket-mock";
import { OrderFeed } from "types/order";
import { OrderFeedSocket } from '../orderFeedSocket'

let server: WS;
let socket: OrderFeedSocket;

beforeEach(async () => {
  server = new WS("ws://localhost:1234");
  // server.on("message", (socket) => {
  //   if(socket.)
  // });

  socket = new OrderFeedSocket("ws://localhost:1234", (data: OrderFeed) => {});
  socket.connectToFeed("PI_XBTUSD");
  await server.connected;
});

afterEach(() => {
  WS.clean();
});

// test("the server keeps track of received messages, and yields them as they come in", async () => {
//   const server = new WS("ws://localhost:1234");
//   const client = new WebSocket("ws://localhost:1234");

//   await server.connected;
//   client.send("hello");
//   await expect(server).toReceiveMessage("hello");
//   expect(server).toHaveReceivedMessages(["hello"]);
// });

describe("Socket connects successfully", () => {
  test("Socket sends initial connection message", async () => {
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"]}));
    expect(socket.client.readyState).toBe(WebSocket.OPEN);
  });
});
