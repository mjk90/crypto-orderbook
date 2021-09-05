# Crypto Orderbook

Created by Matthew Kelly, using React, Redux, web workers & Websockets.

## About

This is a react app, using redux toolkit for state management, websockets for streaming order data and web workers for doing operations outside of the UI thread. The app will stream the latest order feed data and group it by the user's choice of grouping. You can toggle the feed bwtween BTC and ETH using the `toggle feed` button and you can trigger an error in the websocket handling by clicking `kill feed`. Clicking `kill feed` again will remove the error and the websocket will attempt to reconnect.

## To run
Clone the repo, navigate to the root directory, and do `yarn install` or `npm install`, then `yarn start` or `npm run start`.

## To test
Enter `yarn test` or `npm run test`.