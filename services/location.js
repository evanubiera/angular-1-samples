'use strict';

angular.module('dcomApp')
    .factory('SearchLocation', function ($rootScope, KeyValueStorage, Storage, Cookies) {

    	var LOCATION_KEY    = 'SearchLocation';
    	var defaultLocation = {};
        var locationService = new KeyValueStorage(LOCATION_KEY, defaultLocation);

    	// migrates the old cookie format to the new one
    	function migrateToNewCookies(){
    		var addressObj = {
				'query'     : Cookies.getCookie('searchAddress'),
				'latitude'  : Cookies.getCookie('searchLatitude').toString(),
				'longitude' : Cookies.getCookie('searchLongitude').toString(),
				'street'    : Cookies.getCookie('searchStreet'),
				'city'      : Cookies.getCookie('searchCity'),
				'state'     : Cookies.getCookie('searchState'),
				'zip'       : Cookies.getCookie('searchZip').toString()
			};
			locationService.set(addressObj, 365);

			// nuke all old cookies
			Cookies.deleteCookie('searchAddress');
			Cookies.deleteCookie('searchLatitude');
			Cookies.deleteCookie('searchLongitude');
			Cookies.deleteCookie('searchStreet');
			Cookies.deleteCookie('searchCity');
			Cookies.deleteCookie('searchState');
			Cookies.deleteCookie('searchZip');
    	}

    	// checks if old cookies are set
    	if(typeof Cookies.getCookie('searchCity') !== 'undefined'){
    		migrateToNewCookies();
    	}

        locationService.set = function(value, expiration){
            Storage.set(LOCATION_KEY, value, expiration);
            $rootScope.$broadcast('locationChange');
        };

        locationService.unset = function(){
            Storage.unset(LOCATION_KEY);
            $rootScope.$broadcast('locationChange');
        };

        return locationService;

    });
