import WS from "jest-websocket-mock";
import { OrderFeed } from "types/order";
import { OrderFeedSocket } from '../orderFeedSocket'

let server: WS;
let socket: OrderFeedSocket;
let emittedData: OrderFeed;

beforeEach(async () => {
  jest.useFakeTimers();
  server = new WS("ws://localhost:1234"); 
  socket = new OrderFeedSocket("ws://localhost:1234", (data: OrderFeed) => { emittedData = data; });
  socket.connectToFeed("PI_XBTUSD");
  jest.advanceTimersByTime(1000);
  await server.connected;
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

    jest.advanceTimersByTime(1000);
    socket.connectToFeed("PI_ETHUSD"); 
    jest.advanceTimersByTime(1000);
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    jest.advanceTimersByTime(1000);
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_ETHUSD"] }));
  });

  test("Socket disconnects", async () => {
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);
    server.send(JSON.stringify({ feed: "book_ui_1_snapshot", product_id: "PI_XBTUSD" }));

    jest.advanceTimersByTime(1000);
    socket.disconnectFromFeed(); 
    jest.advanceTimersByTime(1000);
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    await expect(socket.client.readyState).toEqual(WebSocket.CLOSED);
  });

});

describe("Handle incoming messages", () => {
  const initial = { 
    feed: 'book_ui_1_snapshot', 
    product_id: 'PI_XBTUSD', 
    bids: [ [100,2], [101,4], [101.5,2], [103,5], [103.5,1] ], 
    asks: [ [100,2], [101,4], [101.5,2], [103,5], [103.5,1] ] 
  };

  test("Handles initial snapshot", async () => {
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);

    socket.onWsMessage({ data: JSON.stringify(initial) }, "PI_XBTUSD");
    jest.advanceTimersByTime(1000);
    
    expect(emittedData.connected).toBe(true);
    expect(emittedData.id).toEqual(initial.product_id);
    expect(emittedData.bids).toEqual(new Map([ [100,2], [101,4], [101.5,2], [103,5], [103.5,1] ]));
    expect(emittedData.asks).toEqual(new Map([ [100,2], [101,4], [101.5,2], [103,5], [103.5,1] ]));
  });

  test("Handles updates to snapshot", async () => {
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);

    socket.onWsMessage({ data: JSON.stringify(initial) }, "PI_XBTUSD");
    jest.advanceTimersByTime(1000);    
    
    const delta = { feed: "book_ui_1", bids: [ [101,0], [101.5,5] ],  asks: [ [103,8], [103.5,0], [104,2] ] };    
    socket.onWsMessage({ data: JSON.stringify(delta) }, "PI_XBTUSD");
    jest.advanceTimersByTime(2000);

    expect(emittedData.connected).toBe(true);
    expect(emittedData.bids).toEqual(new Map([ [100,2], [101.5,5], [103,5], [103.5,1] ]));
    expect(emittedData.asks).toEqual(new Map([ [100,2], [101,4], [101.5,2], [103,8], [104,2] ])); 
  });

  test("Handles unrecognized feed", async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);
    
    socket.onWsMessage({ data: JSON.stringify({ feed: "test", event: "test_event"}) }, "PI_XBTUSD");
    expect(consoleSpy).toHaveBeenCalledWith(`Recieved event: test_event`);
  });

  test("Handles error", async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    expect(socket.client.readyState).toEqual(WebSocket.OPEN);
    
    socket.onWsMessage({ data: JSON.stringify(initial) }, "PI_XBTUSD");
    jest.advanceTimersByTime(1000);

    socket.setError("test_error");
    socket.onWsMessage({ data: JSON.stringify({ feed: "test", event: "test_event"}) }, "PI_XBTUSD");
    expect(consoleSpy).toHaveBeenCalledWith("Error processing websocket message:", new Error("test_error"));
    jest.advanceTimersByTime(1000);
    await expect(server).toReceiveMessage(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"] }));
    await expect(socket.client.readyState).toEqual(WebSocket.CLOSED);
  });
  
});