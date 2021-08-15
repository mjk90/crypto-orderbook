import { Order } from "types/order";

const percentage = (value: number, total: number): number => Number(((value / total) * 100).toFixed(2));

const lowestMultiple = (num: number, multiple: number): number => Number((Math.floor(num / multiple) * multiple).toFixed(2));

const highestTotal = (bids: Array<Order>): number => bids.length ? (bids[bids.length - 1].total || 0) : 0;

const groupData = (data: Array<number[]>, grouping: number): Map<number, Order> => {
  let groupedOrders: Map<number, Order> = new Map<number, Order>();
  let runningTotal: number = 0;
  
  for (const [price, size] of data) {
    runningTotal += size;
    let roundedPrice: number = lowestMultiple(price, grouping);
    let existingOrder = groupedOrders.get(roundedPrice) || <Order>{ price: roundedPrice, size: 0, total: runningTotal };

    groupedOrders.set(roundedPrice, { 
      ...existingOrder, 
      size: existingOrder.size + size, 
      total: runningTotal
    });
  }

  return groupedOrders;
};

const getSpread = (asksList: Array<[number, number]>, bidsList: Array<[number, number]>) => {
  if(!asksList.length || !bidsList.length) {
    return "-- (--%)";
  }

  // Difference between lowest ask & highest bid
  const lowestAsk: number = asksList[0][0];
  const highestBid: number = bidsList[0][0];
  const diff: number = lowestAsk - highestBid;
  const percent: number = percentage(diff, lowestAsk);
  return `${diff.toFixed(2)} (${percent.toFixed(2)}%)`;
};

export {
  percentage,
  lowestMultiple,
  highestTotal,
  groupData,
  getSpread
}
