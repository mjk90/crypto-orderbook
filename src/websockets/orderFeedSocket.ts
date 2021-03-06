import { OrderFeed, OrderUpdate } from "types/order";
import { IMessageEvent } from "websocket";

const getEmptyFeed = (): OrderFeed => {
  const emptyMap: Map<number, number> = new Map<number, number>();
  return {
    id: "",
    bids: emptyMap,
    asks: emptyMap,
    connected: false
  }
};

const getEmptyDelta = (): OrderUpdate => {
  return {
    bids: [], 
    asks: []
  }
};

export class OrderFeedSocket {
  private url: string = "wss://www.cryptofacilities.com/ws/v1";
  private wsReconnectMs: number = 5000;
  private emitInterval: number = 1000;
  private feedSize: number = 25;
  private data: OrderFeed;
  private delta: OrderUpdate;
  private error: string = "";
  private onEmit: (data: OrderFeed) => void;
  public client!: WebSocket;

  constructor(url: string = "", onEmit: (data: OrderFeed) => void) {
    if(url) {
      this.url = url;
    }
    this.onEmit = onEmit;
    this.data = getEmptyFeed();
    this.delta = getEmptyDelta();
    setInterval(() => this.emitData(), this.emitInterval);
  }

  connectToFeed(id: string) {
    if(this.client && this.client.readyState === WebSocket.OPEN) {
      this.changeFeed(id);
    } else {
      this.setupInitialConnection(id);
    }
  }

  setupInitialConnection(id: string) {
    try {
      console.log("Attempting to set up websocket connection...");
      this.client = new WebSocket(this.url);
      this.client.onopen = () => this.client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
      this.client.onmessage = (message: IMessageEvent) => this.onWsMessage(message, id);
    } catch(err) {
      console.log("Error setting up websocket connection:", err);
      this.disconnectFromFeed();
      setTimeout(() => this.setupInitialConnection(id), this.wsReconnectMs);
    }
  }

  onWsMessage (message: IMessageEvent, id: string) {
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
            bids: this.updateOrders(bids, new Map<number, number>(), true),
            connected: true
          };
          break;
        default:
          console.log(event ? `Recieved event: ${event}` : `Message not recognized: ${message}`);
          break;
      }
    } catch(err) {
      console.log("Error processing websocket message:", err);
      this.disconnectFromFeed();
      setTimeout(() => this.setupInitialConnection(id), this.wsReconnectMs);
    }
  }

  changeFeed(id: string) {
    this.client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": [this.data.id] }));
    this.client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id] }));
    this.data = getEmptyFeed();
    this.delta = getEmptyDelta();
  }

  disconnectFromFeed() {
    this.client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": [this.data.id] }));
    this.client.onmessage = null;
    this.client.onopen = null;
    this.client.close();
  }

  setError(message: string) {
    this.error = message;
  }

  updateOrders(data: Array<number[]>, existingData: Map<number, number>, reverse: boolean = false): Map<number, number> {
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
  }

  emitData() {
    // On each 'emitData', update 'data' using the accumulated 'deltas', then empty the 'delta' object, and finally, post to the UI    
    this.data = {
      ...this.data,
      asks: this.delta.asks.length ? this.updateOrders(this.delta.asks, this.data.asks) : this.data.asks,
      bids: this.delta.bids.length ? this.updateOrders(this.delta.bids, this.data.bids, true) : this.data.bids,
      connected: this.client && this.client.readyState === WebSocket.OPEN
    };
    this.delta = getEmptyDelta();
    this.onEmit(this.data);
  }
}
