export interface OrderFeedMessage {
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

export interface Order {
  price: number;
  size: number;
  total?: number;
}