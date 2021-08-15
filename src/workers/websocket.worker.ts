import { OrderFeed, OrderUpdate, OrderFeedMessage } from "types/order";
import { IMessageEvent } from "websocket";

const getEmptyFeed = (): OrderFeed => {
  const emptyMap: Map<number, number> = new Map<number, number>();
  return {
    id: "",
    bids: emptyMap,
    asks: emptyMap
  }
};

const getEmptyDelta = (): OrderUpdate => {
  return {
    bids: [], 
    asks: []
  }
}

class OrderFeedSocket {
  private url: string = "wss://www.cryptofacilities.com/ws/v1";
  private updateInterval: number = 1000;
  private feedSize: number = 25;
  private client: WebSocket;
  private data: OrderFeed;
  private delta: OrderUpdate;
  private error: string = "";

  constructor() {
    this.data = getEmptyFeed();
    this.delta = getEmptyDelta();
    this.client = new WebSocket(this.url);
    setInterval(() => this.emitData(), this.updateInterval);
  }

  connectToFeed(id: string) {
    if(this.client.readyState === WebSocket.OPEN) {
      this.changeFeed(id);
    } else {
      this.setupInitialConnection(id);
    }
  };

  private setupInitialConnection(id: string) {
    this.client.onopen = () => this.client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
    this.client.onmessage = (message: IMessageEvent) => {
      try {
        const { event = "", feed = "", product_id = "", bids = [], asks = [] } = JSON.parse(message.data.toString());
        
        if(this.error) {
          throw new Error(this.error);
        }
        
        switch (feed) {
          case "book_ui_1":
            // Delta (updates to snapshot)
            if(this.data.id !== "") {
              this.delta.asks.push(...asks);
              this.delta.bids.push(...bids);
            }
            break;
          case "book_ui_1_snapshot":
            // Initial snapshot
            this.data = {
              id: product_id,
              asks: this.updateOrders(asks, new Map<number, number>()), 
              bids: this.updateOrders(bids, new Map<number, number>(), true) 
            };
            break;
          default:
            console.log(event ? 
              `Recieved event: ${message.data}` : 
              `Message not recognized: ${message}`
            );            
            break;
        }
      } catch(err) {
        console.log("Error processing websocket message:", err);  
      }
    };
  }

  private changeFeed(id: string) {
    this.client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": [this.data.id] }));
    this.client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id] }));
    this.data = getEmptyFeed();
    this.delta = getEmptyDelta();
  }

  disconnectFromFeed() {
    this.client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": [this.data.id] }));
    this.client.close();
  }

  throwError(message: string) {
    this.error = message;
  }

  private updateOrders(data: Array<number[]>, existingData: Map<number, number>, reverse: boolean = false): Map<number, number> {
    for (const [price, size] of data) {
      if (size === 0) {
        existingData.delete(price);
      } else {
        existingData.set(price, size);
      }
    }
  
    // convert to an array of entries, sort them by price, limit the array length to {feedSize} and convert back to a Map
    return new Map<number, number>([...existingData.entries()]
      .sort((a: [number, number], b: [number, number]) => { return reverse ? b[0] - a[0] : a[0] - b[0] })
      .slice(0, this.feedSize)
    );
  };

  private emitData() {
    // On each 'emitData', update 'data' using the accumulated 'deltas', then empty the 'delta' object, and finally, post to the UI
    this.data = {
      ...this.data,
      asks: this.delta.asks.length ? this.updateOrders(this.delta.asks, this.data.asks) : this.data.asks,
      bids: this.delta.bids.length ? this.updateOrders(this.delta.bids, this.data.bids, true) : this.data.bids
    };
    this.delta = getEmptyDelta();
    postMessage(this.data);
  };
}

const socket: OrderFeedSocket = new OrderFeedSocket();

onmessage = (event: MessageEvent<OrderFeedMessage>) => {
  const { action, id = "PI_XBTUSD", forceError = "" } = event.data;

  switch (action) {
    case "CONNECT_FEED":
      socket.connectToFeed(id);
      break;
    case "KILL_FEED":
      socket.disconnectFromFeed();
      break;
    case "FORCE_ERROR":
      socket.throwError(forceError);
      break;  
    default:
      console.log("Action not recognized:", action);
      break;
  }
};

export default {};
