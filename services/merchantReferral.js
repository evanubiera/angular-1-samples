'use strict';

angular.module('dcomApp')
	.service('MerchantReferral', function(RequestBuilder, $location, Cookies) {

		var encrypted_param = null,
			order_tracking = null;


		function loadParam(){
			if (angular.isDefined($location.search().cq)){
				encrypted_param = $location.search().cq;
				decrypt(encrypted_param).then(function(data){
					if(angular.isDefined(data.decrypted.tracking_rid)){
						order_tracking = data.decrypted.tracking_rid;
						Cookies.setCookie('order_tracking', order_tracking, { 'expires' : 365 });
					}
				});
			}else{
				//No param but cookie maybe?
				if(angular.isDefined(Cookies.getCookie('order_tracking'))){
					order_tracking = Cookies.getCookie('order_tracking');
				}
			}
			
		}

		function decrypt(param){
			return RequestBuilder.getRequestPromise({
				method   : 'GET',
				url		 : '/api/decrypt',
				params	 : {'order_tracking' : param }	
			});
		}

		function param(){
			return order_tracking;
		}

		
		return {
			'loadParam' : loadParam,
			'decrypt' : decrypt,
			'param'  : param
		};

	});