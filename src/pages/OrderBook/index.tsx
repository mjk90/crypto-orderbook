import React, { ChangeEvent, FC, useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { io, Socket } from 'socket.io-client'; // https://cryptofacilities.com/ws/v1
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { OrderBookPageProps } from "./types";
import { setOptions } from './reducer';
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { Buy } from "./components/Buy";
import { Sell } from "./components/Sell";

import "./style.scss"

const client = new W3CWebSocket('wss://www.cryptofacilities.com/ws/v1');

export const OrderBookPage: FC<OrderBookPageProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const [streaming, setStreaming] = useState(false)
  const [orderData, setOrderData] = useState({ bids: [], asks: [] });

  // function bindEventListeners(socket: Socket) {
  //   if (socket) {
  //     // socket.on('data', (data) => console.log({data}));
  //     // socket.on('connect', () => setConnected(true));
  //     // socket.on('disconnect', disconnectHandler);
  //     // socket.on('connect_failed', errorHandler);
  //     // socket.on('connect_error', errorHandler);
  //     // socket.on('error', (error: Error) => errorHandler(error, true));
  //   }
  // }

  // const socketMemorised: Socket = useMemo(() => {
  //   const socket = io("wss://www.cryptofacilities.com", {
  //     // transports : ['websocket'],
  //     path: "/ws/v1",
  //     // reconnectionDelay: WS_RECONNECTION_DELAY_SECOND * 1000,
  //     // reconnectionDelayMax: WS_RECONNECTION_DELAY_MAX_SECOND * 1000,
  //     // randomizationFactor: WS_RANDOMIZATION_FACTOR,
  //     // autoConnect: WS_AUTO_CONNECT,
  //   }).connect();

  //   // socket.emit("subscribe", { feed: "book_ui_1", product_ids: [feed]});
  //   socket.send({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"]})

  //   bindEventListeners(socket);
  //   return socket;
  // }, []);

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      client.send(JSON.stringify({ "event": "subscribe", "feed": "book_ui_1", "product_ids": ["PI_XBTUSD"]}));
    };
    client.onmessage = (message: IMessageEvent) => {      
      // Initial snapshot
      if(message.data.toString().includes("book_ui_1_snapshot")) {
        const data = JSON.parse(message.data.toString());        
        setOrderData({ bids: data.bids, asks: data.asks });
      } else {
        console.log("delta", message.data);
      }
    };

    // client.onmessage = .throttle((response) => {
    //   const stream = JSON.parse(response.data)
    //   updateState([...stream])
    // }, 5000, { leading: true })

    return () => client.close();
  }, []);

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
