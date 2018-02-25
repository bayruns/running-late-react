import React, { Component } from 'react';
import AppRouter from './Routing/AppRouter.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

export default class App extends Component {

    render() {
        return (
            <div>
                <ToastContainer />
                <BrowserRouter>
                    <AppRouter />
                </BrowserRouter>
            </div>
        );
    }
}

