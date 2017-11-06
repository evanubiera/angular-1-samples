'use strict';

angular.module('dcomApp')
  .controller('OnlineOrderConfirmationCtrl', function($http, $location, $modal, $rootScope, $routeParams, $scope, Users, Orders, $q) {  
  	
  	$scope.orderId = "";
  	$scope.userConfirmationMsg = "";
  	$scope.order = {};
  	$scope.merchant = {};
  	$scope.isProcessingConfirm = false;
  	$scope.isProcessingConfirmPrint = false;
  	$scope.isConfirmed = false;
  	$scope.loadingOrder = true;
  	
  	if ($routeParams.orderId) {
  		$scope.orderId = $routeParams.orderId; 
  	}
  	
  	$scope.showOlarkHelp = function() {
  		olark('api.box.show');
  		olark('api.box.expand');  	
  	}
  	
  	$scope.loadMap = function(lat, long) {
  		var coordinates = new google.maps.LatLng(lat, long);  		
        var mapOptions = {
            center: coordinates,
            zoom: 17
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);        
        var marker = new google.maps.Marker({
  		    position: coordinates,
  		    map: map
  		});
   	}
    	
  	//wrapper for confirming orders
  	$scope.confirmOrder = function(orderId, print) {  
  		if(print) {
  			$scope.isProcessingConfirmPrint = true;
  		} else {
  			$scope.isProcessingConfirm = true;
  		}
  		var orderConfirmPromise = Orders.confirmOrder(orderId);
  		orderConfirmPromise.then(function(data){
  			if(data) {
  				if(print) {
  					$scope.isProcessingConfirmPrint = false;
  				} else {
  					$scope.isProcessingConfirm = false;
  				}
  				
  				//recently confirmed orders
  				$scope.isConfirmed = true;
  				$modal.open({
  					templateUrl: 'views/modals/orderConfirmed.html',
  					controller: function($scope) {
  						$scope.orderId = orderId;
  						if(data.message[0].user_msg) {
  							$scope.userConfirmationMsg = data.message[0].user_msg;
  						}
  						if(print) {
  							window.print();
  						}
  					}
  				});
  		    }
  		});
  	}    

  	$scope.cancelOrder = function(orderId) {	
  		$modal.open({
		    templateUrl: '/views/modals/cancelOrder.html',
		    controller: function($scope) {
		    	//message confirming the order is cancelled
		    	$scope.userCancellationMsg = "";
		    	//is the order cancelled?
		    	$scope.isCancelled = false;
		    	//errorMessages encountered during cancellation
		    	$scope.errorMsg = "";
		    	//order's ID
		    	$scope.orderId = orderId;
		    	//2 way binding of cancellation fields
		    	$scope.cancellation = {};
		    	//for populating dropdown in modal
		    	$scope.reasons = [];
		    	//flag to toggle spinner when using processing directive
  				$scope.isProcessingCancellation = false; 
		    	
		    	$scope.getOrderCancellationReasons = function() {
  		    		var reasonsPromise = Orders.getCancellationReasons();
  		    		reasonsPromise.then(function(data){
  		    			if(data) {
  		    				$scope.reasons = data;
  		    			}
  		    		});
  		    	}
		    	//used to cancel orders		        
		        $scope.cancelOrder = function () {
		        	if($scope.cancellation.reason && $scope.cancellation.comments) {
		        		$scope.isProcessingCancellation = true;
		        		var orderCancPromise = Orders.cancelOrder($scope.orderId, $scope.cancellation.name, $scope.cancellation.reason, $scope.cancellation.comments);
		        		orderCancPromise.then(function(data){
		        			if(data.message[0]) {
		        				$scope.isProcessingCancellation = false;
		        				$scope.isCancelled = true;
		        				$scope.userCancellationMsg = data.message[0].user_msg;
		        			} else {
		        				$scope.isCancelled = false;
		        			}
		        		});
		        	} else {
		        		$scope.errorMsg = "Please fill in required fields (marked with an asterisk)";
		        	}
		        }
		        $scope.getOrderCancellationReasons();
		    }
  		});	
  	}
  	
  	$scope.flattenItemOption = function(item) {
	    var queue = [item];
	    var i = 0;
	    var flattenedOptions = [];
		var pushToQueue = function(child){ queue.push(child); };
	    while(queue.length) {	    
	    	var current = queue.pop();
	    	current.options = current.options || [];
			current.options.forEach(pushToQueue);
			if (current.options ) {    		    	
	    		if(current.options.length >0 ) {
	    			flattenedOptions.unshift({'name': current.name});

                } else {
	    			flattenedOptions.unshift({'value': current.name});
	    		}
	    	}
	    	i++;	    
	    }
	    return flattenedOptions;
	};
	
	$scope.buildItems = function (items) {
		angular.forEach(items, function(item){
		    item.optionList = $scope.flattenItemOption(item);
		    item.optionList.reverse();
		    item.optionList.splice(0,1);
		});
	};
  	
  	//getting order details by ID
  	$scope.getOrderDetails = function(orderId) {
  		$scope.loadingOrder = true;
  		var orderDetailsPromise = Orders.getOrderDetails(orderId);
  		orderDetailsPromise.then( function(data) {
  		    if(data.order) {
	  			$scope.loadingOrder = false;  	
	  			$scope.buildItems(data.order.cart);
	  			$scope.order = data.order;		  			  			
  		    	$scope.getMerchant($scope.order.merchant_id);
  		    	if($scope.order.longitude && $scope.order.latitude) {
  		    		google.maps.event.addDomListener(window, 'load', $scope.loadMap(data.order.latitude, data.order.longitude));
  		    	}
  		    }		
  		});
	}
	//getting merchants by ID
	$scope.getMerchant = function(merchantId) {
		if(merchantId) {
			var merchantInfoPromise = Orders.getMerchant(merchantId);
			merchantInfoPromise.then(function(data){
				if(data.merchant) {
					$scope.merchant = data.merchant;
				} 	
			});
		}	
	}
	
	if($routeParams.orderId) {	
		$scope.getOrderDetails($routeParams.orderId);
	}

  	$rootScope.page = {
		bodyClasses: 'order-details',
		title: ''
	};
});