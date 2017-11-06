'use strict';

angular.module('dcomApp')
    .service('Cookies', function(){

        function convertIfJSON(data){
            var object;
            try {
                object = JSON.parse(data);
            } catch (e) {
                return data;
            }
            return object;
        }

        function setExpInHours(hours){
            var date = (hours).hoursAfter(Date.create());
            return date;
        }

        function getCookie(name){
            return convertIfJSON(jQuery.cookie(name));
        }

        function setCookie(name, value, expiration){
            if(typeof value === 'object'){
                value = JSON.stringify(value);
            }
            return jQuery.cookie(name, value, expiration);
        }

        function deleteCookie(name){
            return jQuery.removeCookie(name);
        }

    return {
        'setExpInHours' : setExpInHours,
        'getCookie'     : getCookie,
        'setCookie'     : setCookie,
        'deleteCookie'  : deleteCookie
    };

});