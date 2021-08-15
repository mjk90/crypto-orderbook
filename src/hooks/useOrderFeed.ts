import { useEffect, useRef, useState } from 'react';
import { OrderBookData } from 'state/types';
import { OrderFeed } from 'types/order';
import WebsocketWorker from "worker-loader!workers/websocket.worker"; // eslint-disable-line import/no-webpack-loader-syntax

const useOrderFeed = (feed: OrderBookData["feed"], onFeedChange: (feed: OrderBookData["feed"]) => void): OrderFeed => {
  const [data, setData] = useState<OrderFeed>({ id: "", asks: new Map<number, number>(), bids: new Map<number, number>() });
  const worker = useRef<WebsocketWorker>();

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
  }, [feed]);

  return data;
};

export {
  useOrderFeed
}