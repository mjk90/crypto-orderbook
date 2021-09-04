import WS from "jest-websocket-mock";
import { OrderFeed } from "types/order";
import { OrderFeedSocket } from '../orderFeedSocket'

let server: WS;
let socket: OrderFeedSocket;

beforeEach(async () => {
  server = new WS("ws://localhost:1234");
  socket = new OrderFeedSocket("ws://localhost:1234", (data: OrderFeed) => {});
  socket.connectToFeed("PI_XBTUSD");
  await server.connected;
  // server.on("message", (socket) => {
  //   console.log("server got", socket);
  // });
});

afterEach(() => {
  WS.clean();
});

describe("Connect & disconnect from websocket", () => {

  test("Socket sets up initial connection", async () => {
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"]}));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);
  });

  test("Socket toggles feed", async () => {
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);
    server.send(JSON.stringify({ feed: "book_ui_1_snapshot", product_id: "PI_XBTUSD" }));

    socket.connectToFeed("PI_ETHUSD"); 
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_ETHUSD"] }));
  });

  test("Socket disconnects", async () => {
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);
    server.send(JSON.stringify({ feed: "book_ui_1_snapshot", product_id: "PI_XBTUSD" }));

    socket.disconnectFromFeed(); 
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    await expect(socket.client.readyState).toEqual(WebSocket.CLOSING);
  });

});

// describe("onWsMessage", () => {

//   test("Socket revieves snapshot message", async () => {
//     let temp = null;
//     socket = new OrderFeedSocket("ws://localhost:1234", (data: OrderFeed) => { 
//       console.log("socket emit", data);
//       temp = data;
//     });
//     socket.connectToFeed("PI_XBTUSD");
//     await server.connected;
//     await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
//     expect(socket.client.readyState).toEqual(WebSocket.OPEN);
    
//     console.log("test data", {temp});

//     expect(temp).toBe(true);
//   });

// });