'use strict';

angular.module('dcomApp')
	.service('Storage', function(Cookies){

		function set(key, value, expiration){
			expiration = (expiration === undefined) ? null : expiration;
			var opts = {'expires': expiration};
			Cookies.setCookie(key, value, opts);
		}

		function unset(key){
			Cookies.deleteCookie(key);
		}

		function get(key){
			return Cookies.getCookie(key);
		}

		function has(key){
			return (get(key) !== undefined);
		}

		return {
			'unset' : unset,
			'set'   : set,
			'get'   : get,
			'has'   : has
		};

})

	.factory('KeyValueStorage', function(Storage) {

		return function(key, defaultValue){

			this.get = function(){
				var retrievedValue = Storage.get(key);
				return (typeof retrievedValue === 'undefined') ? defaultValue : retrievedValue;
			};

			this.set = function(value, expiration){
				Storage.set(key, value, expiration);
			};

			this.isSet = function(){
				return Storage.has(key);
			};

			this.unset = function(){
				Storage.unset(key);
			};

		};

	});