export interface GenericState<Type> {
  data: Type;
  loading: boolean,
  error: string | null
}

export interface TestData {
  message: string,
  name: string
}

export interface OrderBookData {
  grouping: number,
  feed: "PI_XBTUSD" | "PI_ETHUSD"
}

export type TestState = GenericState<TestData>;
export type OderBookState = GenericState<OrderBookData>;

export interface RootState {
  test: TestState,
  orderBook: OrderBookState
}