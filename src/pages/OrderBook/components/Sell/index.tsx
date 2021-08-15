import React, { FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { SellProps } from './types';
import { Order } from "hooks";
import { groupData, percentage, highestTotal } from "helpers";

import "./style.scss";

export const Sell: FC<SellProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const { asksList = [] } = props;
  
  const groupedBids: Array<Order> = [...groupData(asksList, grouping).values()];  
  const highest: number = highestTotal(groupedBids);
  
  return (
    <div className="OrderBook__Sell">
      <div className="OrderBook__Row">
        <div>Price</div>
        <div>Size</div>
        <div>Total</div>
      </div>
      {groupedBids.length === 0 ? <LoadingSpinner /> :
       groupedBids.map((bid: Order, index: number) => {
        const { price, size, total = 0 } = bid;
        const depth: number = percentage(total, highest);
        return (
          <div className="OrderBook__Row" style={{ background: `linear-gradient(to right, #3d1e28 ${depth}%, transparent ${depth}%)` }} key={index}>
            <div>{price}</div>
            <div>{size}</div>
            <div>{total}</div>
          </div>
        )
      })}
    </div>
  );
};
