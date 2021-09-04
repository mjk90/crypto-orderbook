import { OrderBookData } from "state/types";
import { OrderFeed } from "types/order";

const useOrderFeed = (feed: OrderBookData["feed"], onFeedChange: (feed: OrderBookData["feed"]) => void, forceError: string = ""): OrderFeed => {
  return { 
    id: "test_id", 
    asks: new Map<number, number>(), 
    bids: new Map<number, number>(), 
    connected: false 
  }
};

export {
  useOrderFeed
}