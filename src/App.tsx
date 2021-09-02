import React from 'react';
import { BrowserRouter, Link, Redirect, Route, Switch } from 'react-router-dom';
import 'styles/App.scss';

import { TestPage } from "pages/Test"
import { OrderBookPage } from 'pages/OrderBook';
import { Provider } from 'react-redux';
import store from 'state/store';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <header className="App__Header">
            <h1>Crypto Order Book</h1>
            <ul>
              <li>
                <Link to={"/"} data-testid="Nav__Home">Home</Link>
              </li>
              <li>
                <Link to={"/test"} data-testid="Nav__Test">Test Page</Link>
              </li>
            </ul>
          </header>
          <section className="App__Body">
            <Switch>
              <Route exact path="/" component={OrderBookPage} />
              <Route exact path="/test" component={TestPage} />
              <Redirect to="/" />
            </Switch>
          </section>
          <footer className="App__Footer">
            &copy; Matt Kelly 2021
          </footer>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
