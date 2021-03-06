import React, { ChangeEvent, FC, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState, OrderBookData } from "state/types"
import { getSpread } from "helpers";
import { LoadingSpinner } from "components/LoadingSpinner";
import { OrderBookPageProps } from "./types";
import { setOptions } from './reducer';
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { DropdownOption } from "components/Dropdown/types";
import { Buy } from "./components/Buy";
import { Sell } from "./components/Sell";
import { OrderFeed } from "types/order";
import { useOrderFeed } from "customhooks";

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
    { value: 0.25, text: "Group 0.25" },
  ]]
]);

export const OrderBookPage: FC<OrderBookPageProps> = props => {
  const dispatch = useDispatch();
  const [forceError, setForceError] = useState<string>("");
  const setDefaultGrouping = useCallback(
    (feed: OrderBookData["feed"]) => dispatch(setOptions({ grouping: Number((groupingOptions.get(feed) || [])[0]?.value), feed })), 
    [dispatch]
  );

  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const orderData: OrderFeed = useOrderFeed(feed, setDefaultGrouping, forceError);  
  
  const asksList: Array<[number, number]> = [...orderData.asks.entries()];
  const bidsList: Array<[number, number]> = [...orderData.bids.entries()];

  const spreadText: string = `Spread: ${getSpread(asksList, bidsList)}`;

  return (
    <div data-testid="OrderBook" className={`OrderBook ${orderData.connected ? "" : "connecting"}`}>
      {
        loading ? <LoadingSpinner testid="OrderBook__Loading" /> :
          error ? <div data-testid="OrderBook__Error">Error: {error}</div> :
            <React.Fragment>
              <div className="OrderBook__Header">
                <h3>Order Book ({feed}) {orderData.connected ? "" : <span className="ellipsis" data-testid="OrderBook_Reconnecting">Reconnecting</span>}</h3>
                <div className="OrderBook__Spread OrderBook__Spread__Upper">
                  {spreadText}
                </div>
                <Dropdown value={grouping} disabled={!orderData.connected}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => dispatch(setOptions({ grouping: parseFloat(e.target.value), feed }))}
                  options={groupingOptions.get(feed) || []} />
              </div>
              <div className="OrderBook__Body">
                <Buy bidsList={bidsList} />
                <div className="OrderBook__Spread OrderBook__Spread__Lower">
                  {spreadText}
                </div>
                <Sell asksList={asksList} />
              </div>
              <div className="OrderBook__Footer">
                <Button disabled={!orderData.connected} onClick={() => dispatch(setOptions({ grouping, feed: feed === "PI_ETHUSD" ? "PI_XBTUSD" : "PI_ETHUSD" }))}>
                  Toggle Feed
                </Button>
                <Button color="red" onClick={() => setForceError(forceError ? "" : "Triggered error from Kill Feed button")}>Kill Feed</Button>
              </div>
            </React.Fragment>
      }
    </div>
  );
};
