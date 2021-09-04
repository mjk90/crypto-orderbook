import { OrderFeed, OrderFeedMessage } from "types/order";
import { OrderFeedSocket } from "websockets/orderFeedSocket";

const socket: OrderFeedSocket = new OrderFeedSocket(
  "wss://www.cryptofacilities.com/ws/v1", 
  (data: OrderFeed) => postMessage(data)
);

onmessage = (event: MessageEvent<OrderFeedMessage>) => {
  const { action, id = "PI_XBTUSD", forceError = "" } = event.data;

  switch (action) {
    case "CONNECT_FEED":
      socket.connectToFeed(id);
      break;
    case "KILL_FEED":
      socket.disconnectFromFeed();
      break;
    case "FORCE_ERROR":
      socket.setError(forceError);
      break;  
    default:
      console.log("Action not recognized:", action);
      break;
  }
};

export default {};
