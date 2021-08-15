import { IMessageEvent } from "websocket";

interface OrderFeedMessage {
  action: "CONNECT_FEED" | "KILL_FEED";
  id?: string;
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
      const { feed = "", product_id = "", bids = [], asks = [] } = JSON.parse(message.data.toString());
      console.log("msg");
      
      // Initial snapshot
      if (feed === "book_ui_1_snapshot") {
        console.log("snapshot", asks);
        this.data = {
          id: product_id,
          asks: this.updateOrders(asks, new Map<number, number>()), 
          bids: this.updateOrders(bids, new Map<number, number>(), true) 
        };
      } else {        
        if(this.data.id !== "") {
          this.delta.asks.push(...asks);
          this.delta.bids.push(...bids);
        }
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
  const { action, id = "PI_XBTUSD" } = event.data;
  console.log("message", id);

  if(action === "CONNECT_FEED") {
    socket.connectToFeed(id);
  } else if (action === "KILL_FEED") {
    socket.disconnectFromFeed();
  } else {
    console.log("Action not recognized:", action);    
  }
};

export default {};
