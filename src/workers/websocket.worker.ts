import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";

interface WebsocketMessage {
  action: "update_feed" | "exit_worker";
  id?: string;
}

export interface Order {
  price: number;
  size: number;
  total?: number;
}

export interface OrderFeed {
  id: string;
  bids: Map<number, number>;
  asks: Map<number, number>;
}

export interface OrderUpdate {
  bids: Array<number[]>;
  asks: Array<number[]>;
}

const getEmptyFeed = (): OrderFeed => {
  return {
    id: "",
    bids: new Map<number, number>(),
    asks: new Map<number, number>()
  }
};

const getEmptyDelta = (): OrderUpdate => {
  return {
    bids: [], 
    asks: []
  }
}

const updateOrders = (data: Array<number[]>, existingData: Map<number, number>, reverse: boolean = false): Map<number, number> => {
  for (const [price, size] of data) {
    if (size === 0) {
      // remove from book
      existingData.delete(price);
    } else {
      // update book
      existingData.set(price, size);
    }
  }

  // convert to an array of entries, sort them by price, limit the array length to {feedSize} and convert back to a Map
  return new Map<number, number>([...existingData.entries()]
    .sort((a: [number, number], b: [number, number]) => { return reverse ? b[0] - a[0] : a[0] - b[0] })
    .slice(0, feedSize)
  );
};

const url: string = "wss://www.cryptofacilities.com/ws/v1";
const updateInterval: number = 1000;
const feedSize: number = 25;
const client: W3CWebSocket = new W3CWebSocket(url);

let data: OrderFeed = getEmptyFeed();
let delta: OrderUpdate = getEmptyDelta();

/* eslint-disable-next-line no-restricted-globals */
const ctx: SharedWorkerGlobalScope = self as any;

const connectedPorts: Array<MessagePort> = [];

console.log({ctx})

// TODO: shared worker: https://stackoverflow.com/questions/61865890/run-websocket-in-web-worker-or-service-worker-javascript
ctx.onconnect = (event: MessageEvent) => {
  console.log("onconnect");
  
  const port = event.ports[0];
  connectedPorts.push(port);

  // Respond to message from parent thread
  port.onmessage = (event: MessageEvent<WebsocketMessage>) => {
    const { action, id } = event.data;
    console.log("message", id, client.readyState, action);

    if(action === "exit_worker") {      
      const index = connectedPorts.indexOf(port);
      connectedPorts.splice(index, 1);
    } else if (action === "update_feed") {
      if(client.readyState === WebSocket.OPEN) {
        // If connection is already open, then toggle the feed
        client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": [data.id]}));
        client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
      } else {
        client.onopen = () => client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
  
        client.onmessage = (message: IMessageEvent) => {
          const { feed = "", product_id = "", bids = [], asks = [] } = JSON.parse(message.data.toString());
          console.log("msg");
          
          // Initial snapshot
          if (feed === "book_ui_1_snapshot") {
            data = {
              id: product_id,
              asks: updateOrders(asks, new Map<number, number>()), 
              bids: updateOrders(bids, new Map<number, number>(), true) 
            };
          } else {
            delta.asks.push(...asks);
            delta.bids.push(...bids);
          }
        };
      }
    }
  };
};

let timer: NodeJS.Timeout = setInterval(() => {
  let { asks, bids } = data;

  if(delta.asks.length) asks = updateOrders(delta.asks, asks);
  if(delta.bids.length) bids = updateOrders(delta.bids, bids, true);

  data = { ...data, asks, bids };
  delta = getEmptyDelta();  

  connectedPorts.forEach((port: MessagePort) => port.postMessage(data));
}, updateInterval);

export default ctx;
