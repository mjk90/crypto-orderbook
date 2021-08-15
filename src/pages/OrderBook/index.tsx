import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState, OrderBookData } from "state/types"
import { getSpread } from "helpers";
import { LoadingSpinner } from "components/LoadingSpinner";
import { useOrderFeed, OrderFeed } from "hooks/useOrderFeed";
import { OrderBookPageProps } from "./types";
import { setOptions } from './reducer';
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { DropdownOption } from "components/Dropdown/types";
import { Buy } from "./components/Buy";
import { Sell } from "./components/Sell";
import WebsocketWorker from "worker-loader!workers/websocket.worker"; // eslint-disable-line import/no-webpack-loader-syntax

import "./style.scss";

const groupingOptions: Map<string, DropdownOption[]> = new Map<string, DropdownOption[]> ([
  ["PI_XBTUSD", [
    { value: 0.5, text: "Group 0.50" },
    { value: 1, text: "Group 1.00" },
    { value: 2.5, text: "Group 2.50" },
  ]],
  ["PI_ETHUSD", [
    { value: 0.05, text: "Group 0.05" },
    { value: 0.1, text: "Group 0.1" },
    { value: 0.025, text: "Group 0.25" },
  ]]
]);

export const OrderBookPage: FC<OrderBookPageProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const [orderData, setOrderData] = useState<OrderFeed>({ id: "", asks: new Map<number, number>(), bids: new Map<number, number>()});
  const asksList: Array<[number, number]> = [...orderData.asks.entries()];
  const bidsList: Array<[number, number]> = [...orderData.bids.entries()];

  const worker = useRef<WebsocketWorker>();

  const setDefaultGrouping = (feed: OrderBookData["feed"]) => dispatch(setOptions({ grouping: Number((groupingOptions.get(feed) || [])[0]?.value), feed }));
  const handleUnload = (e: Event) => {
    worker.current?.postMessage({ action: "KILL_FEED" });
    worker.current?.terminate();
  };

  useEffect(() => {
    worker.current = new WebsocketWorker();
    worker.current.onmessage = (message: MessageEvent<OrderFeed>) => message.data.id && setOrderData(message.data);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    setDefaultGrouping(feed);
    worker.current?.postMessage({ action: "CONNECT_FEED", id: feed });
  }, [feed]);

  return (
    <div className="OrderBook">
      {
        loading ? <LoadingSpinner /> :
          error ? <div>Error: {error}</div> :
            <React.Fragment>
              <div className="OrderBook__Header">
                <h3>Order Book ({feed})</h3>
                <div className="OrderBook__Spread">
                  Spread: {getSpread(asksList, bidsList)}
              </div>
                <Dropdown value={grouping}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => dispatch(setOptions({ grouping: parseFloat(e.target.value), feed }))}
                  options={groupingOptions.get(feed) || []} />
              </div>
              <div className="OrderBook__Body">
                <Buy bidsList={bidsList} />
                <Sell asksList={asksList} />
              </div>
              <div className="OrderBook__Footer">
                <Button onClick={() => dispatch(setOptions({ grouping, feed: feed === "PI_ETHUSD" ? "PI_XBTUSD" : "PI_ETHUSD" }))}>
                  Toggle Feed
                </Button>
                <Button color="red" onClick={() => worker.current?.postMessage({ action: "KILL_FEED" })}>Kill Feed</Button>
              </div>
            </React.Fragment>
      }
    </div>
  );
};