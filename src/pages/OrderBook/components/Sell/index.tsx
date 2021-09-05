import React, { FC } from "react";
import { useSelector } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { SellProps } from './types';
import { groupData, percentage, highestTotal } from "helpers";
import { Order } from "types/order";

import "./style.scss";

export const Sell: FC<SellProps> = props => {
  const { data: { grouping } }: OrderBookState = useSelector((state: RootState) => state.orderBook);
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
      {groupedBids.length === 0 ? <LoadingSpinner testid="GroupedBids__Loading" /> :
        groupedBids.map((bid: Order, index: number) => {
        const { price, size, total = 0 } = bid;
        const depth: number = percentage(total, highest);
        return (
          <div className="OrderBook__Row" style={{ background: `linear-gradient(to right, #3d1e28 ${depth}%, transparent ${depth}%)` }} key={index} data-testid="OrderBook__Row">
            <div data-testid="OrderBook__Row__Price" className="OrderBook__Row__Price__Sell">{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div data-testid="OrderBook__Row__Size">{size.toLocaleString()}</div>
            <div data-testid="OrderBook__Row__Total">{total.toLocaleString()}</div>
          </div>
        )
      })}
    </div>
  );
};
