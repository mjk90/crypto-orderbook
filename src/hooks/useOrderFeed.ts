import { useEffect, useRef, useState } from 'react';
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import { number } from 'prop-types';

export interface Order {
  price: number;
  size: number;
}

export interface OrderFeed {
  id: string;
  bids: Map<number, Order>;
  asks: Map<number, Order>;
}

export interface RawOrderFeed {
  id: string;
  bids: Order[];
  asks: Order[];
}

const initialFeed: OrderFeed = {
  id: "",
  bids: new Map<number, Order>(),
  asks: new Map<number, Order>()
}

const url = "wss://www.cryptofacilities.com/ws/v1";
const updateInterval = 3000;
const client = new W3CWebSocket(url);

const lowestMultiple = (num: number, multiple: number): number => Math.floor(num / multiple) * multiple;

const groupData = (data: Order[], grouping: number): Map<number, Order> => {
  let groupedOrders: Map<number, Order> = new Map<number, Order>();

  console.log("raw", data);
  
  for (const { price, size } of data) {
    console.log({price}, {size});
    
    let roundedPrice = lowestMultiple(price, grouping);
    let existingOrder = groupedOrders.get(roundedPrice) || <Order>{ price: roundedPrice, size: 0 };
    groupedOrders.set(roundedPrice, { ...existingOrder, size: existingOrder.size + size })
  }
  
  return groupedOrders;
};

// const updateData = (data: Map<number, Order>, newData: Order[], grouping: number): Map<number, Order> => {
//   for (const { price, size } of newData) { 
//     let roundedPrice = lowestMultiple(price, grouping);
//     let existingOrder = data.get(roundedPrice);
//     if(size === 0) {

//     }
//   }
// }

const useOrderFeed = (id: string, grouping: number = 1): OrderFeed => {
  const [rawData, setRawData] = useState<RawOrderFeed>({ id: "", bids: [], asks: [] });
  const [data, setData] = useState<OrderFeed>(initialFeed);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    if(data.id) {
      
    } else {
      setData({
        id: rawData.id,
        bids: groupData(rawData.bids, grouping),
        asks: groupData(rawData.asks, grouping)
      });
    }
  }, [grouping, rawData]);

  useEffect(() => {
    if(client.readyState === WebSocket.OPEN) {
      // If connection is already open, then toggle the feed
      client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": [data.id]}));
      client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
    } else {
      // If connection is not open, then wait for the 'open' event to trigger and subscribe to the inital feed
      client.onopen = () => {
        console.log('WebSocket Client Connected', url, id);
        client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
      };
    }

    client.onmessage = (message: IMessageEvent) => {
      const msg: string = message.data.toString();
      // Initial snapshot
      if(msg.includes("book_ui_1_snapshot")) {
        const initialData = JSON.parse(msg);
        setRawData({ bids: initialData.bids, asks: initialData.asks, id: initialData.product_id });
      } else {
        // [price, size][]
        // bids: [ [39824.5, 53553], [39825, 26] ]
        const delta = JSON.parse(msg);
        // console.log({delta});
        
        // if (Date.now() >= lastUpdated.current + updateInterval) {
        //   lastUpdated.current = Date.now();

        //   const delta = JSON.parse(msg);
        //   const { bids = [], asks = [] } = delta;
          
        //   let prevData = data;
        //   if(bids.length) {
        //     prevData.bids.splice(0, bids.length);
        //     prevData.bids.push(...bids);
        //   }
        //   if(asks.length) {
        //     prevData.asks.splice(0, asks.length);
        //     prevData.asks.push(...bids);
        //   }

        //   setData({...prevData});

        // }
      }
    };
    // return () => client.close();
  }, [id]);

  return data;
};

export {
  useOrderFeed
}
