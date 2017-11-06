'use strict';

angular.module('dcomApp')
	.service('User', function User($rootScope, $window, $location, $q, UserAPI, OrderAPI, UserAuthToken, GuestAuthToken, Cookies, KeyValueStorage) {
		var processingAuthentication = false;
		var processingUserCreation = false;
		var REMEMBER_ME_KEY = 'RememberMe';
		var defaultRememberMeValue = false;
		var rememberMe = new KeyValueStorage(REMEMBER_ME_KEY, defaultRememberMeValue);
        $window.dataLayer = $window.dataLayer || [];

		function getOrders(type, limit) {
			var orderInfo = [];
			var orderName = "";

			//get favorited or recent orders
			OrderAPI.getOrders(type, limit, {"laundry":true})
			.then( function(data) {
				//loop through all 3 items and return entire order details for each
				if(data.orders.length > 0) {
					//for the logged in homepage
					angular.forEach(data.orders, function(value, key) {
					   	var orderId = "";
					    if(value.order_id) {
					    	orderId = value.order_id;
					    } else {
					    	//accounting for weird possible legacy characters
					    	orderName = value.order_name;
					    	orderId = value.orders_id.replace(/[A-Za-z$-]/g, "");
					    }

					    var is_laundry = value.is_laundry_order;
					    
					    orderInfo.push(getOrderDetails(orderId, orderName,is_laundry));
					
					});
					$rootScope.currentOrderType = type;
				}
			});

			return orderInfo;
		}

		function getRecentMerchantOrders(id, limit) {
			var orderInfo = [];
			var orderName = "";
			//get favorited or recent orders
			OrderAPI.getRecentMerchantOrders(id, limit)
			.then( function(data) {
				//loop through all 3 items and return entire order details for each
				if(data.orders.length > 0) {
					//for the logged in homepage
					angular.forEach(data.orders, function(value, key) {
					   	var orderId = "";
					    if(value.order_id) {
					    	orderId = value.order_id;
					    } else {
					    	//accounting for weird possible legacy characters
					    	orderName = value.order_name;
					    	orderId = value.orders_id.replace(/[A-Za-z$-]/g, "");
					    }
					    orderInfo.push(getOrderDetails(orderId, orderName));
					});
					$rootScope.currentOrderType = "recent";
				}
			});
			return orderInfo;
		}

		//get details specific to this order for the homepage
		function getOrderDetails(id, orderName, is_laundry) {
			var maxPricedItem = 0;
			var orderDetails = {};

			OrderAPI.getRecentOrder(id,is_laundry)
			.then(function(data) {
				if(orderName) {
					orderDetails.orderName = orderName;
				}
				orderDetails.order = data.order;
				orderDetails.itemCount = data.order.cart.length;
				orderDetails.maxPricedItem = getMaxPricedItem(data.order.cart);
			});
			return orderDetails;
		}

		//get the most expensive item in the order for display purposes
		//in the orders tabs
		function getMaxPricedItem(cart) {
			//object with name, id and price of most expensive item in the cart
			var maxPricedItem = {};
			//holder for the most expensive item in the cart at the moment
			var currentPrice = 0;

			angular.forEach(cart, function(value, key) {
				if(value.price > currentPrice) {
					maxPricedItem = { "price": value.price.toFixed(2), "name":value.name, "id":value.id };
				}
				currentPrice = value.price;
			});
			return maxPricedItem;
		}

		function getUserAuthToken() {
			return UserAuthToken.get();
		}

		function getGuestAuthToken() {
			return GuestAuthToken.get();
		}

		function initializeSession(){
			var deferred = $q.defer();
			if(getUserAuthToken()){
				deferred.resolve();
			} else if(getGuestAuthToken()){
				deferred.resolve();
			} else {
				return createGuestSession();
			}
			return deferred.promise;
		}

		//makes api call and updates userData on root scope
		function updateUserInfo() {
			UserAPI.getUserInfo()
			.then(function (data) {

				$rootScope.userData = data.user;
				//update expiration on cookie
				if(rememberMe.get()===true) {
					//have an expiration date
					UserAuthToken.set(UserAuthToken.get(), 90);
					rememberMe.set(true, 90);
				} else {
					//don't have one
					UserAuthToken.set(UserAuthToken.get());
					rememberMe.set(false);
				}
			}, function (messages) {
				logout();
			});
		}

		function authenticateUser(userName, password, _rememberMe) {
			var requestObj;
			if (processingAuthentication) {
				return;
			}
			processingAuthentication = true;

			UserAPI.authenticate(userName, password)
			.then(function(data) {
				if(_rememberMe===false) {
					UserAuthToken.set(data.access_token);
					rememberMe.set(_rememberMe);
					Cookies.setCookie("userIdForGA", data.user.customer_id);
				} else {
					UserAuthToken.set(data.access_token, 90);
					rememberMe.set(_rememberMe, 90);
					Cookies.setCookie("userIdForGA", data.user.customer_id, { 'expires' : 90 });
				}
				GuestAuthToken.unset();
				$rootScope.userData = data.user;
				$rootScope.$broadcast('authSuccess', data.user);
				processingAuthentication = false;

				 $window.dataLayer.push({'event': 'userAuthenticated'});
				window.optimizely = window.optimizely || [];
				window.optimizely.push(['trackEvent', 'userAuthenticated']);
				
				applyExistingPromo();

			}, function(messages) {
				$rootScope.$broadcast('authFailure', {'messages': messages});
				processingAuthentication = false;
			});
		}

		function createGuestSession() {
			return UserAPI.authenticateGuest()
			.then(function(data) {
				GuestAuthToken.set(data['Guest-Token'], 30);
				$rootScope.$broadcast('guestCreateSuccess', data.guest_token);
			}, function(messages) {
				$rootScope.$broadcast('guestCreateFailure', {'messages': messages});
			});
		}

		function logout() {
			UserAuthToken.unset();
			rememberMe.unset();
			Cookies.deleteCookie("userIdForGA");
			$rootScope.userData = null;
			 $window.dataLayer.push({
    			'event'				: 'UserAction',
    			'eventCategory'		: 'User',
    			'eventAction'   	: 'Logout'
    		});
			$window.location.reload();
			$rootScope.$broadcast('logout');
		}

		function applyExistingPromo(){
			var dealId = Cookies.getCookie('deal_id');
			if (dealId) {
				UserAPI.applyPromoDeal(dealId)
				.then(function(data) {
					Cookies.deleteCookie('deal_id');
				});
			}
		}

		function createUser(firstName, lastName, email, password) {

			var userinfo = {
				'first_name' : firstName,
				'last_name'  : lastName,
				'email'      : email,
				'password'   : password
			};
			if (Cookies.getCookie('uhauid')) {
				userinfo.uhauid = Cookies.getCookie('uhauid');
			}
			//api only allows uhauid OR share_code
			else if (Cookies.getCookie('tafshareid')) {
				userinfo.share_code = Cookies.getCookie('tafshareid');
			}

			return UserAPI.createUser(userinfo)
			.then(function(data) {
				GuestAuthToken.unset();
				UserAuthToken.set(data.access_token, 90);
				$rootScope.userData = {
					'email'      : email,
					'first_name' : firstName,
					'last_name'  : lastName
				};

				$window.dataLayer.push({'event': 'userSignup'});
				window.optimizely = window.optimizely || [];
				window.optimizely.push(['trackEvent', 'userSignup']);

				if (Cookies.getCookie('deal_id')) {
					applyExistingPromo();
				}
			});
		}

		if (UserAuthToken.isSet()) {
			updateUserInfo();
			//apply promo
			applyExistingPromo();
		}

		return {
			'getUserAuthToken': getUserAuthToken,
			'getGuestAuthToken': getGuestAuthToken,
			'authenticateUser': authenticateUser,
			'createGuestSession': createGuestSession,
			'updateUserInfo': updateUserInfo,
			'initializeSession' : initializeSession,
			'logout': logout,
			'createUser': createUser,
			'getOrders' : getOrders,
			'getRecentMerchantOrders' : getRecentMerchantOrders,
			'getOrderDetails' : getOrderDetails
		};
	});
