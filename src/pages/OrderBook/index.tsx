import React, { ChangeEvent, FC, useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { useOrderFeed, OrderFeed } from "hooks/useOrderFeed";
import { OrderBookPageProps } from "./types";
import { setOptions } from './reducer';
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { Buy } from "./components/Buy";
import { Sell } from "./components/Sell";

import "./style.scss"

export const OrderBookPage: FC<OrderBookPageProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const orderData: OrderFeed = useOrderFeed("PI_XBTUSD");
  console.log({orderData});

  return (
    <React.Fragment>
      {
        loading ? <LoadingSpinner /> :
        error ? <div>Error: {error}</div> :
        <div className="OrderBook">
          <div className="OrderBook__Header">
            <h3>Order Book</h3>
            <div className="OrderBook__Spread">
              Spread: 17.0 (0.05%)
            </div>
            <Dropdown value={grouping} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => dispatch(setOptions({ grouping: parseFloat(e.target.value), feed }))}
              options={[
                { value: 0.5, text: "Group 0.50" },
                { value: 1, text: "Group 1.00" },
                { value: 1.5, text: "Group 1.50" },
              ]} />
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
        </div>
      }
    </React.Fragment>
  );
};
