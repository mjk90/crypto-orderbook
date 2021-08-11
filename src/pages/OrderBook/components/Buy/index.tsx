import React, { ChangeEvent, FC, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { BuyProps } from './types';
import { Order } from "hooks";
import { highestTotal, percentage, groupData } from "helpers";

import "./style.scss"

export const Buy: FC<BuyProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const { bids = [] } = props;
  const bidsList: Array<[number, number]> = [...bids.entries()];
  
  let total: number = 0;
  const highest: number = highestTotal(bidsList);
  const groupedBids: Map<number, Order> = groupData(bidsList, grouping);

  return (
    <div className="OrderBook__Buy">
      <div className="OrderBook__Row">
        <div>Total</div>
        <div>Size</div>
        <div>Price</div>
      </div>
      {[...groupedBids.entries()].map((bid: [number, Order], index: number) => {
        const [price, order] = bid;
        total += order.size;
        const depth: number = percentage(total, highest);
        return (
          <div className="OrderBook__Row" style={{ background: `linear-gradient(to left, #113534 ${depth}%, transparent ${depth}%)` }} key={index}>
            <div>{total}</div>
            <div>{order.size}</div>
            <div>{price}</div>
          </div>
        )
      })}
    </div>
  );
};
