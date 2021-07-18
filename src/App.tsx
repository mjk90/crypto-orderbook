import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import 'styles/App.scss';

import { TestPage } from "pages/Test"
import { OrderBookPage } from 'pages/OrderBook';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App__Header">
          <h1>Crypto Order Book</h1>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/test">Test Page</a></li>
          </ul>
        </header>
        <section className="App__Body">
          <Switch>
            <Route exact path="/" component={OrderBookPage} />
            <Route path="/test" component={TestPage} />
          </Switch>
        </section>
        <footer className="App__Footer">
          &copy; Matt Kelly 2021
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
