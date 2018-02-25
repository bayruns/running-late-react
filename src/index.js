import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CookiesProvider } from 'react-cookie';

ReactDOM.render( <CookiesProvider>
    <App />
  </CookiesProvider>, document.getElementById('root'));
registerServiceWorker();
