import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.min.css';
import { Switch, Route } from 'react-router-dom'
import Binder from '../util/binder.js';

import { PAGES } from './constants.js';
/**
 * AppRouter defines and handles all of the routes for this app.
 * It also handles 404s when a URL is requested but not found.
 * @module AppRouter
 */

/** AppRouter defines and handles all of the routes for this app.
 *  It also handles 404s when a URL is requested but not found.  */
export default class AppRouter extends React.Component {

    constructor(props){
        super(props);

        //creater a new binder and bind all of the methods in this class
        var binder = new Binder();
        binder.bindAll(this, AppRouter);
    }

    getRoutes(){
        var routes = [];
        var nextRoute = <div></div>
        var nextPage = {};
        var nextReactKey = 0;
        for (var key in PAGES) {
            if(PAGES[key]){
                nextPage = PAGES[key];
                nextRoute = <Route key={nextReactKey} exact={nextPage.IS_EXACT} path={nextPage.URL} component={nextPage.COMPONENT} />
                nextReactKey++;
                routes.push(nextRoute);
            }    
        }
        return routes;
    }

    render() {
        return (
            <Switch>
                {this.getRoutes()}
            </Switch>
        );
    }
}