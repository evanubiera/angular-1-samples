'use strict';

angular.module('dcomApp')
.directive('dcomOrderList', function() {  
    return {
        link: function(scope, element, attrs) {      
        	element.bind('click', function($event) { 
        		var orderType = jQuery(this).attr('data-order-type');
        		jQuery(".active").addClass("tab").removeClass("active");
        		jQuery(this).addClass("active").removeClass("tab");
        		scope.toggleOrderType(orderType); 
        	});
        
        	scope.toggleOrderType = function (orderType) {
        		scope.currentOrderType = orderType;
        		        		
        		if((scope.currentOrderType=="scheduled" && scope.scheduledOrders.length==0) ||
        		(scope.currentOrderType=="asap" && scope.asapOrders.length==0) ||
        		(scope.currentOrderType=="archive" && scope.archivedOrders.length==0)) {
					scope.orderTypeExists = false;		        		
        		} else {
	        		scope.orderTypeExists = true;
        		}
        		scope.$apply();
        	}	        	        
	    }
	};
});