'use strict';

angular.module('dcomApp')
  .controller('OnlineOrderConfListCtrl', function($http, $location, $modal, $rootScope, $routeParams, $scope, Users, Orders, $q) {   
  	
  	//the end date defaults to today
  	$scope.startDate = "2013-01-01";
   	
   	$scope.linkedMerchants = {};  	  	  	  	
	$scope.selectedMerchant = 0;
  	$scope.adminSettings = [];
	$scope.orderRetrievedByTimer = false;	
	$scope.processingOrders = false;
	$scope.processingAdminSettings = false;
	$scope.currentOrderType = '';
	$scope.orderTypeExists = true;
	$scope.availableOrderTypes = [];
  	
  	//set the value of the dropdown if it has been set via a cookie
  	if(jQuery.cookie('selectedMerchant')!=="" && $scope.selectedMerchant===0) {
		$scope.selectedMerchant = jQuery.cookie('selectedMerchant');
  	}
	
	$scope.viewOrder = function(orderId) {
		$location.path("/ooc/" + orderId);
	}
	
	$scope.getSoundAlert = function() {
		document.getElementById("alert-audio").play();
  	}
  	  			
	//get orders when dropdown value changes
	$scope.$watch('selectedMerchant', function(newValue, oldValue) {	
		if(typeof newValue!=="undefined") {		
			$scope.orderRetrievedByTimer=false;
			jQuery.cookie("selectedMerchant", newValue);	
			//don't get data if 'view all' is selected
			if(parseInt(newValue)!==0) {
		    	$scope.getMerchant(newValue);
		    } else {
		    	$scope.currentMerchant = null;
		    }
		    $scope.getOrders($scope.currentOrderType);
		}
	});
	
	$scope.$watch('currentOrderType', function() {
		$scope.getOrders();	
	});
	
	$scope.getMerchant = function(id) {
		var getMerchantPromise = Orders.getMerchant(id);
		getMerchantPromise.then(function(data){
			if(data){
				$scope.currentMerchant = data;
			}
		});
	}
	
	$scope.groupPendingOrdersByType = function(orders) {				
		$scope.scheduledOrders = [];
		$scope.asapOrders = []; 
							
  		angular.forEach(orders, function(value, key) {  		
			if (value.type=="pickup") {
				$scope.scheduledOrders.push(orders[key]);
			} 
			if (value.asap===true && value.type!=="pickup"){
				$scope.asapOrders.push(orders[key]);
			}		
		});		
  	}
  	
  	//getting orders on initial page load
  	$scope.getOrders = function() {   	 
  		//single OR multiple merchants
  		var merchant = {}; 		  	 	
  		//a temporary var to hold all pending orders
  		var pendingOrders = [];
  		  		  		
  		if(parseInt($scope.selectedMerchant)==0) {
  			//get all merchants
  			merchant = $scope.linkedMerchants;
  		} else {
  			//get a single merchant
  			merchant = $scope.selectedMerchant;
  		}  		  		
  		//vars for promises returned by the orders service
  		var archOrderPromise = Orders.getArchivedOrders($scope.startDate, $scope.endDate, merchant);
		//set up promises
		var pendingOrderPromise = Orders.getPendingOrders($scope.startDate, $scope.endDate, merchant);
		
		archOrderPromise.then(function(data) {
		    if(data){
		    	$scope.archivedOrders = data.orders;
		    	$scope.processing = false;
		    }
		});	
		
		pendingOrderPromise.then(function(data) {
		    if(data) {
		    	pendingOrders = data.orders;
		    	if(pendingOrders) {
		    		$scope.groupPendingOrdersByType(pendingOrders);
		    	}	
		    }
		});
  	}
	
	$scope.getLinkedMerchants = function() {
		var userInfoPromise = Users.getAdminInfo();
		userInfoPromise.then( function(data) {
			$scope.linkedMerchants = Users.getLinkedMerchants();
			//setting values for the merchant dropdown		
  			$scope.merchantList = []; 
			$scope.merchantList.push({"id":"0","name":"View all"});
			angular.forEach($scope.linkedMerchants, function(value, key) {
				value.displayName = value.name + " - " + value.street;
				$scope.merchantList.push(value);
			});
		});			
	}
	
	if(Users.getUserAuthToken()) {
		$scope.getLinkedMerchants();
		//ghetto push notifications: a basic set interval to retrieve orders
		if($scope.selectedMerchant!==0) {
			window.setInterval(function() { 
			    //get the latest orders every 10 seconds
			    $scope.getOrders('all');
			    //if($scope.order) {
				$scope.orderRetrievedByTimer = true;
			    //}
			    //this boolean makes sure the sound is not played everytime the page loads
			    //it will do that because asapOrders is always empty when the page loads, since the groupPendingOrders function resets that array
			}, '10000');
		} 
	}
	
	 //new orders...yo!
	$scope.$watch('asapOrders.length', function(newValue, oldValue) {
	    if((newValue > oldValue && newValue > 1) && $scope.orderRetrievedByTimer===true) {
	        $scope.getSoundAlert();
	    } 
	});
				  	  	  	
  	$rootScope.page = {
		bodyClasses: 'order-details',
		title: 'Online Order Confirmation List'
	};
});