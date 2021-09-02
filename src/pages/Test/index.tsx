import React, { FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, TestState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { randomName, setName } from './reducer';
import { TestPageProps } from "./types";

export const TestPage: FC<TestPageProps> = props => {
  const dispatch = useDispatch();
  const { data: { message, name }, error, loading }: TestState = useSelector((state: RootState) => state.test);

  return (
    <React.Fragment>
      {
        loading ? <LoadingSpinner /> :
        error ? <div>Error: {error}</div> :
        <div data-testid="TestPage">
          <div>{message} {name}</div>
          <button onClick={() => dispatch(setName("Matt"))}>Reset</button>
          <button onClick={() => dispatch(randomName())}>Random</button>
        </div>
      }
    </React.Fragment>
  );
};
