import { OrderFeed, OrderFeedMessage } from "types/order";

export default class WebsocketWorker {
  onmessage: (event: MessageEvent<OrderFeedMessage>) => void;

  constructor() {
    // should be overwritten by the code using the worker
    this.onmessage = () => { };
  }

  // mock expects data: { } instead of e: { data: { } }
  postMessage(message: MessageEvent<OrderFeed>) {
    // actual worker implementation wraps argument into { data: arg },
    // so the mock needs to fake it 
    this.onmessage = (event: MessageEvent<OrderFeedMessage>) => {};
  }
}
