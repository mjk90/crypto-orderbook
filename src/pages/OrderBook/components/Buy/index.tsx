import React, { FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { BuyProps } from './types';
import { Order } from "hooks";
import { percentage, groupData, highestTotal } from "helpers";

import "./style.scss"

export const Buy: FC<BuyProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const { bidsList = [] } = props;
  
  const groupedBids: Array<Order> = [...groupData(bidsList, grouping).values()];
  const highest: number = highestTotal(groupedBids);
  
  return (
    <div className="OrderBook__Buy">
      <div className="OrderBook__Row">
        <div>Total</div>
        <div>Size</div>
        <div>Price</div>
      </div>
      {groupedBids.length === 0 ? <LoadingSpinner /> :
      groupedBids.map((bid: Order, index: number) => {
        const { price, size, total = 0 } = bid;
        const depth: number = percentage(total, highest);
        return (
          <div className="OrderBook__Row" style={{ background: `linear-gradient(to left, #113534 ${depth}%, transparent ${depth}%)` }} key={index}>
            <div>{total}</div>
            <div>{size}</div>
            <div>{price}</div>
          </div>
        )
      })}
    </div>
  );
};
