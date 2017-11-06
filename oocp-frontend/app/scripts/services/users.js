'use strict';

angular.module('dcomApp')
	.service('Users', function ($http, $rootScope, $window, $location, $q, dcomConfig) {
		var userAuthToken = jQuery.cookie('userAuthToken');
		var processingAuthentication = false;
		var processingUserCreation = false;
		
		var adminSettings = {};
		var soundAlerts = {};
		var linkedMerchants = {};
				
		//default values for admin settings
		var emailAlert = true;
		var onlineConfirm = false;
		
		function getAdminInfo() {	
			var deffered = $q.defer();
			
			$http({
			    method: 'GET',
			    url: '/api/merchant/admin',
			    headers: {
			    	'Authorization': userAuthToken
			    },
			    params: { 
			    	'client_id': dcomConfig.apiKey
			    }
			}).success(function(data, status, headers, config) {
				if(data) {		
			    	if(data.settings) {
			    		adminSettings = data.settings;
					}
					if (data.alerts) {
						soundAlerts = data.alerts;
					}
					if (data.merchants) {
						linkedMerchants = data.merchants;
					}
					deffered.resolve(data);
				} else {
					deffered.reject();
				}
			}).error(function(data, status, headers, config) {
			    console.log(data);
			});
			return deffered.promise;
		}
				
		function getAdminConfirmationSettings() {
			var deffered = $q.defer();
  			$http({
			    method: 'GET',
			    url: '/api/merchant/admin/confirming',
			    headers: {
			    	'Authorization': userAuthToken
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
		
		//accepts email and online as boolean values	
		function setAdminConfirmationSettings (online, email, merchantId) {						//params to be passed to PUT
			var confirming = {};
			var url = "";	
		
			confirming.online = online;
			confirming.email = email;
					
			//account for bulk confirming vs single merchant confirming
			if(parseInt(merchantId)==0) {
				url = "/api/merchant/admin/confirming/bulk"; 
			} else {
				url = "/api/merchant/admin/confirming";
				confirming.merchant_id = merchantId; 
			}
		
			var deffered = $q.defer();
  			$http({
			    method: 'PUT',
			    url: url,
			    headers: {
			    	'Authorization': userAuthToken
			    },
			    data: { 
			    	"confirming" : [confirming],
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
				
		//get user auth token			
		function getUserAuthToken() {
			return userAuthToken;
		}
		
		function getLinkedMerchants() {
			return linkedMerchants;
		}
						
		//makes api call and updates userData on root scope
		function updateUserInfo() {
			$http({
				method: 'GET',
				url: '/api/customer/account',
				headers: {
					'Authorization': userAuthToken
				},
				params: {
					'client_id': dcomConfig.apiKey,
			    	'client_secret': dcomConfig.clientSecret,
					'grant_type' : 'password',
					'scope' : 'payment,global'
				}
			}).success(function (data, status, headers, config) {	
				$rootScope.userData = data.user;
				//update expiration on cookie
				jQuery.cookie('userAuthToken', userAuthToken, {'expires': 90});
			}).error( function (data, status, headers, config) {
				logout();
			});
		}
		function authenticateUser(userName, password) {
			var requestObj;
			if (processingAuthentication) {
				return;
			}
			processingAuthentication = true;
			requestObj = {
				method: 'POST',
				url: '/api/customer/auth',
				data: {
					'username': userName,
					'password': password,
					'client_id': dcomConfig.apiKey,
			    	'client_secret': dcomConfig.clientSecret,
					'grant_type' : 'password',
					'scope' : 'payment,global'
				}
			};
						
			$http(requestObj)
			.success(function(data, status, headers, config) {		
				var hasAccess = false;
				var i = 0;
													
				for (i=0; i < data.user.roles.length; i++) {
					if(data.user.roles[i]=="MERCHANT_ADMIN") {
						hasAccess = true;
						break;
					} 
				};
				
				if (hasAccess==true) {
					userAuthToken = data.access_token;
					jQuery.cookie('userAuthToken', userAuthToken, {'expires': 90});
					$rootScope.userData = data.user;				
					$rootScope.$broadcast('authSuccess', data.user);
					processingAuthentication = false;
				} else {
					var message = {};
					message[0] = {};
					message[0].user_msg = 'This user is not a merchant';					
					$rootScope.$broadcast('authFailure', {'messages': message });
					processingAuthentication = false;
				}				
			}).error(function(data, status, headers, config) {
				$rootScope.$broadcast('authFailure', {'messages': data.message});
				processingAuthentication = false;
			});
		}
		function redirectIfNotLoggedIn() {
			if(!getUserAuthToken()) {
    			olark('api.box.hide');
				$location.path("/login");
			} 
		}
		
		function logout() {
			userAuthToken = null;
			jQuery.removeCookie('userAuthToken');
			$rootScope.userData = null;
			$window.location.reload();
			olark('api.box.hide');
			$rootScope.$broadcast('logout');
		}
		function createUser(firstName, lastName, email, password) {
			var requestObj;
			if (processingUserCreation) {
				return;
			}
			processingUserCreation = true;
			requestObj = {
				method: 'POST',
				url: '/api/customer/account',
				data: {
					'first_name': firstName,
					'last_name': lastName,
					'email': email,
					'password': password,
					'client_id': dcomConfig.apiKey,
					'grant_type' : 'password',
					'scope' : 'payment,global'
				}
			};
			if (jQuery.cookie('uhauid')) {
				requestObj.data.uhauid = jQuery.cookie('uhauid');
			}

			$http(requestObj)
			.success(function(data, status, headers, config) {
				userAuthToken = data.token;
				jQuery.removeCookie('userAuthToken');
				$rootScope.userData = {
					'email': email,
					'first_name': firstName,
					'last_name': lastName
				};
				$rootScope.$broadcast('userCreateSuccess');
				processingUserCreation = false;
			}).error(function(data, status, headers, config) {
				$rootScope.$broadcast('userCreateFailure', {'messages': data.message});
				processingUserCreation = false;
			});
		}

		if (userAuthToken) {
			updateUserInfo();
		}

		return {
			'redirectIfNotLoggedIn': redirectIfNotLoggedIn,
			'getUserAuthToken': getUserAuthToken,
			'authenticateUser': authenticateUser,
			'updateUserInfo': updateUserInfo,
			'getAdminInfo': getAdminInfo,
			'getLinkedMerchants': getLinkedMerchants,
			'logout': logout,
			'createUser': createUser,
			'setAdminConfirmationSettings': setAdminConfirmationSettings,
			'getAdminConfirmationSettings': getAdminConfirmationSettings
		};
	});