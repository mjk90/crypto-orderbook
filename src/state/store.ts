import { configureStore, Store } from '@reduxjs/toolkit';
import testSlice from 'pages/Test/reducer';
// import orderBookSlice from 'pages/OrderBook/slice';

const store: Store = configureStore({
  reducer: {
    test: testSlice,
    // orderBook: orderBookReducer
  },
});
 
export default store;