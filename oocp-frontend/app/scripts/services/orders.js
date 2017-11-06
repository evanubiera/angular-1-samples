'use strict';

angular.module('dcomApp')
	.service('Orders', function ($http, $rootScope, $window, $location, Users, $q, dcomConfig) {
		
	var errorMsg = "";
	
	//accepts the merchant ID that comes with a specific order
	function getMerchant(merchantId) {
		var deffered = $q.defer();
		$http({
		    method: 'GET',
		    url: '/api/merchant/' + merchantId,
		    headers: {
		    	'Authorization': Users.getUserAuthToken()
		    },
		    params: { 
		    	'client_id': dcomConfig.apiKey
		    }
		}).success(function(data, status, headers, config) {
		    if (data) {
				deffered.resolve(data);
			} else {
				deffered.reject();	
			}
		}).error(function(data, status, headers, config) {
		    console.log(data);
		});
		return deffered.promise;
	}
	
	function getOrderDetails(orderId) {
		var deffered = $q.defer();
		
		$http({
		    method: 'GET',
		    url: '/api/merchant/orders/' + orderId,
		    headers: {
		    	'Authorization': Users.getUserAuthToken()
		    },
		    params: { 
		    	'client_id': dcomConfig.apiKey
		    }
		}).success(function(data, status, headers, config) {
		    if (data) {
				deffered.resolve(data);
			} else {
				deffered.reject();	
			}
		}).error(function(data, status, headers, config) {
		    console.log(data);
		});
		return deffered.promise;
	}
 	
	function confirmOrder(orderId) {
		var deffered = $q.defer();
  		if (orderId) {
  		    $http({
		        method: 'PUT',
		        url: '/api/merchant/orders/confirm',
		        headers: {
		    		'Authorization': Users.getUserAuthToken()
		    	},
		        params: { 
		        	'order_id': orderId,
		        	'client_id': dcomConfig.apiKey
		        }
		    }).success(function(data, status, headers, config) {
		        if (data) {
					deffered.resolve(data);
				} else {
					deffered.reject();	
				}
		    }).error(function(data, status, headers, config) {
		    	if (data) {
					deffered.reject(data.message);	
				} 
		    });
		}
		return deffered.promise;
	}
	
	//this returns a promise
	function getCancellationReasons() {
		var deffered = $q.defer();
		$http({
		    method: 'GET',
		    url: '/api/merchant/orders/reasons',
		    headers: {
		    	'Authorization': Users.getUserAuthToken()
		    },
		    params: {
		    	'client_id': dcomConfig.apiKey
		    }
		}).success(function(data, status, headers, config) {
		    if (data) {
		    	deffered.resolve(data);
		    } else {
		    	deffered.reject();	
		    }
		}).error(function(data, status, headers, config) {
		    console.log(data);
		});
  		return deffered.promise;
	}
	
	function cancelOrder(orderId, name, reasonId, comments) {	
		var deffered = $q.defer();
  		$http({
		     method: 'PUT',
		     url: '/api/merchant/orders/cancel',
		     headers: {
		     	'Authorization': Users.getUserAuthToken()
		     },
		     params: { 
		     	'order_id': orderId,
		     	'client_id': dcomConfig.apiKey,
		     	"reason_id" : parseInt(reasonId),
    			"name"	: name, //optional
    			"comments" : comments
		     }
		 }).success(function(data, status, headers, config) {
		     if (data) {
		     	deffered.resolve(data);
		     } else {
		     	deffered.reject();	
		     }
		 }).error(function(data, status, headers, config) {
		     if(data.messages) {
		     	errorMsg = data.messages;
		     	console.log(data);
		     }
		 });
		 return deffered.promise;
	}
  	
  	function getLinkedMerchantIds(linkedMerchants) {  	
  		var linkedMerchantIds = [];   		
  		if(linkedMerchants) {
  			angular.forEach(linkedMerchants, function(value, key) {
  				linkedMerchantIds.push(linkedMerchants[key].id);	
  			});
  		}  		
  		return linkedMerchantIds.join(",");
  	}
  	
  	function getArchivedOrders(startDate, endDate, linkedMerchants) {
		var deffered = $q.defer();
		
		if ( typeof linkedMerchants=="object" ) {
			var merchantIdStr = getLinkedMerchantIds(linkedMerchants);
		} else {
			var merchantIdStr = linkedMerchants;
		}
				
  			//get archieved orders
  			$http({
			    method: 'GET',
			    url: '/api/merchant/orders/history',
			    headers: {
			    	'Authorization': Users.getUserAuthToken()
			    },
			    params: { 
			    	'start': '0',
			    	'limit': '20',
			    	'start_date': startDate,
			    	'end_date': endDate,
			    	'merchants': merchantIdStr,
			    	'client_id': dcomConfig.apiKey
			    }
			}).success(function(data, status, headers, config) {
				if (data) {
					deffered.resolve(data);
				} else {
					deffered.reject();	
				}
			}).error(function(data, status, headers, config) {
			});
		return deffered.promise;
	}	
		
	function getPendingOrders(startDate, endDate, linkedMerchants) {
		var deffered = $q.defer();
	
		if ( typeof linkedMerchants=="object" ) {
			var merchantIdStr = getLinkedMerchantIds(linkedMerchants);
		} else {
			var merchantIdStr = linkedMerchants;
		}	    		
			$http({
	    	    method: 'GET',
	    	    url: '/api/merchant/orders/pending',
	    	    headers: {
	    	    	'Authorization': Users.getUserAuthToken()
	    	    },
	    	    params: { 
	    	    	'start': '0',
	    	    	'limit': '20',
	    	    	'start_date': startDate,
	    	    	'end_date': endDate,
	    	    	'merchants': merchantIdStr,
	    	    	'client_id': dcomConfig.apiKey
	    	    }
	    	}).success(function(data, status, headers, config) {
	    	    if (data) {
					deffered.resolve(data);
				} else {
					deffered.reject();	
				}
	    	}).error(function(data, status, headers, config) {
	    	});
	    return deffered.promise;
  	}
  	
	return {
		'getOrderDetails': getOrderDetails,
		'getCancellationReasons': getCancellationReasons,
		'getMerchant': getMerchant,
		'getPendingOrders': getPendingOrders,
		'getArchivedOrders': getArchivedOrders,
		'getLinkedMerchantIds': getLinkedMerchantIds,
		'confirmOrder': confirmOrder,
		'cancelOrder': cancelOrder
	};
	
});