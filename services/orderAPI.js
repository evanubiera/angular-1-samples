'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('OrderAPI', function(RequestBuilder) {

		var ORDER_API_ENDPOINT = '/api/customer/orders';
		var ORDER_FEEDBACK_API_ENDPOINT = '/api/customer/feedback';


		function getRecentOrders(limit){
			return getOrders("recent", limit, {"laundry":true});
		}

		function getRecentMerchantOrders(id,limit){
			return getOrders("recent", limit, {'merchant_id':id });
		}

		function getRecentOrder(id, is_laundry){
			return getOrder("recent", id, is_laundry);
		}

		function getFavoriteOrder(id){
			return getOrder("favorite", id);
		}

		function setFavorite(id, name){
			return RequestBuilder.getRequestPromise({
				method: 'POST',
			    authToken : true,
			    url: ORDER_API_ENDPOINT + '/favorite/' + id,
			    params: {
			    	'order_name': name
			    }
			});
		}

		function unsetFavorite(id){
			return RequestBuilder.getRequestPromise({
				method: 'DELETE',
			    authToken : true,
			    url: ORDER_API_ENDPOINT + '/favorite/' + id
			});
		}
		
		function rateOrder(id, rating){
			return RequestBuilder.getRequestPromise({
				method: 'POST',
			    authToken : true,
			    url: ORDER_FEEDBACK_API_ENDPOINT + '/' + id,
			    data: {
			    	feedback: {
			    		'quality_rating': rating,
						'price_rating': rating,
						'speed_rating': rating,
						'accuracy_rating': rating,
						'overall_rating': rating,
						'anonymous': true
					}
			    }
			});
		}

		function getOrder(type, id, is_laundry) {
			
			var url = ORDER_API_ENDPOINT + '/' + type + '/' + id;

			if(typeof is_laundry !== 'undefined' && is_laundry){
				url +="?laundry=true";
			}

			return RequestBuilder.getRequestPromise({
				method: 'GET',
				url: url,
				authToken : true
			});
		}

		function getOrders(type, limit, other) {
			
			var params = { 'start' : 0, 'limit' : limit };
			
			if(typeof other !== 'undefined'){
				angular.extend(params,other);
			}

			return RequestBuilder.getRequestPromise({
				method         : 'GET',
				url            : ORDER_API_ENDPOINT + '/' + type,
				authToken      : true,
				params 		   : params
			});
		}

		return {
			'getOrders'			: getOrders,
			'getRecentOrders'	: getRecentOrders,
			'getRecentMerchantOrders'	: getRecentMerchantOrders,
			'getRecentOrder'	: getRecentOrder,
			'getFavoriteOrder'	: getFavoriteOrder,
			'unsetFavorite'		: unsetFavorite,
			'setFavorite'		: setFavorite,
			'rateOrder'			: rateOrder
		};

	});