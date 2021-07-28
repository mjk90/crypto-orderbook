import { useEffect, useRef, useState } from 'react';
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";

function useThrottle<T>(value: T, interval = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, interval)

      return () => clearTimeout(timerId)
    }
  }, [value, interval])

  return throttledValue;
}

// const useWebsocket = (url: string, id: string) => {
//   const client = new W3CWebSocket(url);
//   const [data, setData] = useState();

//   useEffect(() => {
//     client.onopen = () => {
//       console.log('WebSocket Client Connected', url, id);
//       client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
//     };
//     client.onmessage = (message: IMessageEvent) => {
//       setData(message);
//     };
//     return () => client.close();
//   }, []);

//   return { data };
// };

export interface Order {
  price: number;
  size: number;
}

export interface OrderFeed {
  bids: Order[];
  asks: Order[];
}

const url = "wss://www.cryptofacilities.com/ws/v1";
const updateInterval = 3000;
const client = new W3CWebSocket(url);

const lowestMultiple = (num: number, multiple: number): number => Math.floor(num / multiple) * multiple;

const groupData = (data: any[], grouping: number): Order[] => {
  let groupedOrders: Map<number, Order> = new Map<number, Order>();

  for (const [price, size] of data) {
    let roundedPrice = lowestMultiple(price, grouping);
    let existingOrder = groupedOrders.get(roundedPrice) || <Order>{ price: roundedPrice, size: 0 };
    groupedOrders.set(roundedPrice, { ...existingOrder, size: existingOrder.size + size })
  }

  console.log({groupedOrders});
  
  return Array.from(groupedOrders.values());
};

const useOrderFeed = (id: string, grouping: number = 1): OrderFeed => {
  const [rawData, setRawData] = useState<OrderFeed>({ bids: [], asks: [] });
  const [data, setData] = useState<OrderFeed>({ bids: [], asks: [] });
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    setData({ 
      bids: groupData(rawData.bids, grouping),
      asks: groupData(rawData.asks, grouping)
    });
  }, [grouping, rawData]);

  useEffect(() => {
    console.log({client});    
    if(client.readyState === WebSocket.OPEN) {
      console.log("is open");
      client.send(JSON.stringify({ "event": "unsubscribe", "feed": "book_ui_1", "product_ids": id === "PI_XBTUSD" ? ["PI_ETHUSD"] : ["PI_XBTUSD"]}));
      client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
    }
    client.onopen = () => {
      console.log('WebSocket Client Connected', url, id);
      client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": [id]}));
    };
    client.onmessage = (message: IMessageEvent) => {
      // Initial snapshot
      if(message.data.toString().includes("book_ui_1_snapshot")) {
        const initialData = JSON.parse(message.data.toString());
        setRawData({ bids: initialData.bids, asks: initialData.asks });
      } else {
        // if (Date.now() >= lastUpdated.current + updateInterval) {
        //   lastUpdated.current = Date.now();

        //   const delta = JSON.parse(message.data.toString());
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
