import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import { TestPage } from "pages/Test"
import { OrderBookPage } from 'pages/OrderBook';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <Switch>
            <Route exact path="/" component={OrderBookPage} />
            <Route path="/test" component={TestPage} />
          </Switch>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
