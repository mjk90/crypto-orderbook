import { useEffect, useRef, useState } from 'react';
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";

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

const url: string = "wss://www.cryptofacilities.com/ws/v1";
const updateInterval: number = 1000;
const feedSize: number = 25;
const client: W3CWebSocket = new W3CWebSocket(url);

const updateOrders = (
  data: Array<number[]>,
  existingData: Map<number, number>,
  grouping: number,
  reverse: boolean = false
): Map<number, number> => {
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

const useOrderFeed = (id: string, grouping: number = 1): OrderFeed => {
  const [data, setData] = useState<OrderFeed>(getEmptyFeed());
  const delta = useRef<OrderUpdate>(getEmptyDelta());

  useEffect(() => {
    if(client.readyState === WebSocket.OPEN) {
      // If connection is already open, then toggle the feed      
      client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": [data.id]}));
      client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
    } else {
      // If connection is not open, then wait for the 'open' event to trigger and subscribe to the inital feed
      client.onopen = () => client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
      
      client.onmessage = (message: IMessageEvent) => {
        const { feed = "", product_id = "", bids = [], asks = [] } = JSON.parse(message.data.toString());
        // Initial snapshot
        if (feed === "book_ui_1_snapshot") {      
          setData({ 
            id: product_id, 
            asks: updateOrders(asks, new Map<number, number>(), grouping), 
            bids: updateOrders(bids, new Map<number, number>(), grouping, true) 
          });
        } else {
          delta.current.asks.push(...asks);
          delta.current.bids.push(...bids);
        }
      };
    }

    // return () => { client.close() };
  }, [id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // When the data object has been updated and contains an 'id' (meaning we have the initial snapshot), 
    // start an interval to periodically update it with the delta values
    if(data.id) {
      timer = setInterval(() => {
        let { asks, bids } = data;
  
        if(delta.current.asks.length) {
          asks = updateOrders(delta.current.asks, asks, grouping);
        }
        if(delta.current.bids.length) {
          bids = updateOrders(delta.current.bids, bids, grouping, true);
        }
  
        setData({ ...data, asks, bids });
        delta.current = getEmptyDelta();
      }, updateInterval);
    }

    return () => clearInterval(timer);
  }, [data.id])

  return data;
};

export {
  useOrderFeed
}
