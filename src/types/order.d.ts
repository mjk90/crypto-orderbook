export interface OrderFeedMessage {
  action: "CONNECT_FEED" | "KILL_FEED" | "FORCE_ERROR";
  id?: string;
  forceError?: string;
}

export interface OrderFeed {
  id: string;
  bids: Map<number, number>;
  asks: Map<number, number>;
  connected: boolean;
}

export interface OrderUpdate {
  bids: Array<number[]>;
  asks: Array<number[]>;
}

export interface Order {
  price: number;
  size: number;
  total?: number;
}
