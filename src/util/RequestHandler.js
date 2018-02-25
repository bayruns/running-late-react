import {
    toast
} from 'react-toastify';

import Cookies from 'js-cookie';
export default class RequestHandler {

    constructor(){
        this.rootURL = "https://8timfrceq7.execute-api.us-east-1.amazonaws.com/api/";
    }
    
    makeRequest(endpoint, method, variables, successMsg, errorMsg, callback) {
        require('isomorphic-fetch');
        require('es6-promise').polyfill();

        var url = this.rootURL + endpoint;
        const token = Cookies.get('token'); 
        variables.token = token;

        var data = {
            method: method,
            mode: 'CORS',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };
        //if there are variables and it's not a GET method, pass the variables in
        if(variables && method.toUpperCase() !== "GET"){
            data.body = JSON.stringify(variables)
        }
        
        fetch(url, data)
        .then(function (response) {
            if (response.status >= 400) {
                throw new Error(errorMsg 
                            + "\n Bad response " + response.status + " from server." 
                            + "\n URL:" + url);
            }
            return response.json();
        }).then(function (responseData) {
            callback(responseData);
            toast.success(successMsg);
        }).catch(function (error) {
            toast.error(error.message);
        });
    }

    //Methods for each type of request for readability and clarity
    get = function (endpoint, successMsg, errorMsg, callback) {
        this.makeRequest(endpoint, "GET", {}, successMsg, errorMsg, callback);
    }

    post = function (endpoint, variables, successMsg, errorMsg, callback) {
        this.makeRequest(endpoint, "POST", variables, successMsg, errorMsg, callback);
    }

    patch = function (endpoint, variables, successMsg, errorMsg, callback) {
        this.makeRequest(endpoint, "PATCH", variables, successMsg, errorMsg, callback);
    }

    put = function (endpoint, variables, successMsg, errorMsg, callback) {
        this.makeRequest(endpoint, "PUT", variables, successMsg, errorMsg, callback);
    }

    delete = function (endpoint, variables, successMsg, errorMsg, callback) {
        this.makeRequest(endpoint, "DELETE", variables, successMsg, errorMsg, callback);
    }

    delete = function (endpoint, successMsg, errorMsg, callback) {
        this.makeRequest(endpoint, "DELETE", {}, successMsg, errorMsg, callback);
    }
}