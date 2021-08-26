import { configureStore, Store } from '@reduxjs/toolkit';
import testReducer from 'pages/Test/reducer';
import orderBookReducer from 'pages/OrderBook/reducer';

const store: Store = configureStore({
  reducer: {
    test: testReducer,
    orderBook: orderBookReducer
  }
});

export default store;
