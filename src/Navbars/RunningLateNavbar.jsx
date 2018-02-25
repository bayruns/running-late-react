import React from 'react';
import SiteNavbar from './SiteNavbar.jsx';
import { NavItem } from 'reactstrap';
import { Link } from 'react-router-dom'
import Binder from '../util/binder.js';

import { PAGES } from '../Routing/constants.js'

export default class RunningLateNavbar extends React.Component {

    constructor(props){
        super(props);

        //creater a new binder and bind all of the methods in this class
        var binder = new Binder();
        binder.bindAll(this, RunningLateNavbar);
    }

    getNavLinks(){
        var links = [];
        var nextLink = <div></div>
        var nextPage = {};
        var nextReactKey = 0;
        for (var key in PAGES) {
            if(PAGES[key].IS_NAV){
                nextPage = PAGES[key];
                nextLink = 
                <NavItem key={nextReactKey}>
                    <Link className="nav-link" to={nextPage.URL}>{nextPage.DISPLAY_NAME}</Link>
                </NavItem>;
                nextReactKey++;
                links.push(nextLink);
            }    
        }
        return links;
    }

    render() {
        return (
            <SiteNavbar brandImage={""} brandText="Running Late" brandLink="/">
                {this.getNavLinks()}
            </SiteNavbar >
        );
    }
}