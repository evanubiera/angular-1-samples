'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('SearchAPI', function(RequestBuilder, Cookies) {

		var SEARCH_API_ENDPOINT = '/api/merchant/search';

		function searchByAddress(address){
			var order_type = typeof Cookies.getCookie('globalOrderType') !== 'undefined' ? Cookies.getCookie('globalOrderType') : 'delivery';
			var order_time = typeof Cookies.getCookie('globalOrderTime') !== 'undefined' ? Cookies.getCookie('globalOrderTime') : 'ASAP';

			return RequestBuilder.getRequestPromise({
				method         : 'GET',
				url            : SEARCH_API_ENDPOINT + '/' + order_type,
				params         : {
	 				'address'                : address,
	 				'order_type'             : order_type,
	 				'order_time'             : order_time,
	 				'enable_recommendations' : true
				}
			});
		}

		function searchByTags(type, tags){

			var params = angular.extend({}, tags);

			return RequestBuilder.getRequestPromise({
				method         : 'GET',
				url            : 'api/merchant/' + type,
				params         : params
			});
		}

		return {
			'searchByAddress' : searchByAddress,
			'searchByTags'	  : searchByTags
		};

	});