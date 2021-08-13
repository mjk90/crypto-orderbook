import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
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

import "./style.scss"


const groupingOptions: Map<string, DropdownOption[]> = new Map<string, DropdownOption[]> ([
  ["PI_XBTUSD", [
    { value: 0.5, text: "Group 0.50" },
    { value: 1, text: "Group 1.00" },
    { value: 2.5, text: "Group 2.50" },
  ]],
  ["PI_ETHUSD", [
    { value: 0.05, text: "Group 0.05" },
    { value: 0.1, text: "Group 0.1" },
    { value: 0.025, text: "Group 0.025" },
  ]]
]);

export const OrderBookPage: FC<OrderBookPageProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  // const orderData: OrderFeed = useOrderFeed(feed, grouping);
  // console.log({orderData});
  const [orderData, setOrderData] = useState<OrderFeed>({ id: "", asks: new Map<number, number>(), bids: new Map<number, number>()});
  const worker = useRef<WebsocketWorker>();

  useEffect(() => {
    worker.current = new WebsocketWorker();
    console.log(worker.current);
    
    worker.current.port.start();
    worker.current.port.postMessage({ action: "update_feed", id: feed });
    worker.current.port.onmessage = (message: MessageEvent<OrderFeed>) => {
      if(message.data.id) {
        setOrderData(message.data);
      }
    };

    return () => {
      worker.current?.port.postMessage({ action: "exit_worker" });
      worker.current?.port.close()
    };
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
                  Spread: 17.0 (0.05%)
              </div>
                <Dropdown value={grouping}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => dispatch(setOptions({ grouping: parseFloat(e.target.value), feed }))}
                  options={groupingOptions.get(feed) || []} />
              </div>
              <div className="OrderBook__Body">
                <Buy bids={orderData.bids} />
                <Sell asks={orderData.asks} />
              </div>
              <div className="OrderBook__Footer">
                <Button onClick={() => dispatch(setOptions({ grouping, feed: feed === "PI_ETHUSD" ? "PI_XBTUSD" : "PI_ETHUSD" }))}>
                  Toggle Feed
                </Button>
                <Button color="red" onClick={() => alert("click")}>Kill Feed</Button>
              </div>
            </React.Fragment>
      }
    </div>
  );
};
