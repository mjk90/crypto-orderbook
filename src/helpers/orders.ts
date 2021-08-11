import { Order } from "../hooks";

const percentage = (value: number, total: number): number => Math.round((value / total) * 100);

const lowestMultiple = (num: number, multiple: number): number => Math.floor(num / multiple) * multiple;

const highestTotal = (values: Array<[number, number]>): number => values.reduce((accumulator: number, current: [number, number]): number => accumulator + current[1], 0);

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

export {
  percentage,
  lowestMultiple,
  highestTotal,
  groupData
}
