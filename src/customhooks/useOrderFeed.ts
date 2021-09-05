import { useEffect, useRef, useState } from 'react';
import { OrderBookData } from 'state/types';
import { OrderFeed } from 'types/order';
import WebsocketWorker from "worker-loader!workers/websocket.worker"; // eslint-disable-line import/no-webpack-loader-syntax

const useOrderFeed = (feed: OrderBookData["feed"], onFeedChange: (feed: OrderBookData["feed"]) => void, forceError: string = ""): OrderFeed => {
  const worker = useRef<WebsocketWorker>();
  const [data, setData] = useState<OrderFeed>({ 
    id: "", 
    asks: new Map<number, number>(), 
    bids: new Map<number, number>(), 
    connected: false 
  });

  const handleUnload = (e: Event) => {
    worker.current?.postMessage({ action: "KILL_FEED" });
    worker.current?.terminate();
  };

  useEffect(() => {
    worker.current = new WebsocketWorker();
    worker.current.onmessage = (message: MessageEvent<OrderFeed>) => message.data.id && setData(message.data);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    onFeedChange(feed);
    worker.current?.postMessage({ action: "CONNECT_FEED", id: feed });
  }, [feed, onFeedChange]);

  useEffect(() => worker.current?.postMessage({ action: "FORCE_ERROR", forceError }), [forceError])

  return data;
};

export {
  useOrderFeed
}
