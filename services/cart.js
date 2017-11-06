'use strict';

angular.module('dcomApp')
	.service('Carts', function Cart($rootScope, $q, CartAPI, Cookies, UserMessages) {

		var carts = {};
		var transactionInProgress = false;
		var cfg = {
			defaultOrderType : 'delivery',
			orderTypes       : ['delivery', 'pickup']
		};
		var messages = {
			cartNotReady : {
				message : {
					user_msg : "Please try again.",
					dev_msg  : "The cart is not ready."
				}
			}
		};

		function add(item, merchant){
			var deferred = $q.defer();

			if(!canEditCart(merchant)){
				return $q.reject(messages.cartNotReady);
			}

			lockCart();

			var currentCart = carts[merchant];

			CartAPI.addItem(item, {
				merchant : merchant,
				orderType : currentCart.orderType,
				orderTime : currentCart.orderTime
			})
			.then(function(data){

				updateCart(data, currentCart);

				unlockCart();
				broadcastChange();
				deferred.resolve();

			}, function(message){
				unlockCart();
				UserMessages.printAPIMessage(message);
				deferred.reject(message);
			});

			return deferred.promise;
		}

		function edit(item, merchant){
			var deferred = $q.defer();

			if(!canEditCart(merchant)){
				return $q.reject(messages.cartNotReady);
			}

			var currentCart = carts[merchant];

			lockCart();

			CartAPI.editItem(item, {
				merchant : merchant,
				orderType : currentCart.orderType,
				orderTime : currentCart.orderTime
			}).then(function(data){

				updateCart(data, currentCart);

				unlockCart();
				broadcastChange();
				deferred.resolve();

			}, function(message){
				unlockCart();
				UserMessages.printAPIMessage(message);
				deferred.reject(message);
			});

			return deferred.promise;
		}

		function remove(itemKey, merchant){
			var deferred = $q.defer();

			if(!canEditCart(merchant)){
				return $q.reject(messages.cartNotReady);
			}

			lockCart();

			var currentCart = carts[merchant];

			CartAPI.removeItem(itemKey, {
				merchant : merchant,
				orderType : currentCart.orderType,
				orderTime : currentCart.orderTime
			}).then(function(data){

				updateCart(data, currentCart);

				unlockCart();
				broadcastChange();
				deferred.resolve();

			}, function(message){
				unlockCart();
				UserMessages.printAPIMessage(message);
				deferred.reject(message);
			});

			return deferred.promise;
		}

		function getInfo(merchant){
			if(!hasActiveCart(merchant)){
				return;
			}

			var currentCart = carts[merchant];

			var info = {
				subtotal   : currentCart.subtotal,
				total      : currentCart.total,
				tax        : currentCart.tax,
				item_count : currentCart.item_count,
				order_time : currentCart.order_time,
				fees       : currentCart.fees,
				discount   : currentCart.discount,
				delivery_points   : currentCart.delivery_points
			};

			if(angular.isDefined(currentCart.laundry_pickup_time)){
				info.laundry_pickup_time = currentCart.laundry_pickup_time;
			}

			if(angular.isDefined(currentCart.laundry_pickup_options)){
				info.laundry_pickup_options = currentCart.laundry_pickup_options;
			}

			if(angular.isDefined(currentCart.laundry_delivery_time)){
				info.laundry_delivery_time = currentCart.laundry_delivery_time;
			}

			if(angular.isDefined(currentCart.laundry_delivery_options)){
				info.laundry_delivery_options = currentCart.laundry_delivery_options;
			}

			return info;

		}

		function getAvailableOrderTimes(merchant){
			if(!hasActiveCart(merchant)){
				return;
			}

			var currentCart = carts[merchant];

			return currentCart.orderable_times;
		}

		function getLaundryPickupTimes(merchant){
			if(!hasActiveCart(merchant)){
				return;
			}

			var currentCart = carts[merchant];
			return currentCart.laundry_pickup_times;
		}

		function setLaundryPickupTime(merchant, time){
			if(!hasActiveCart(merchant)){
				return;
			}
			carts[merchant].laundry_pickup_time = time;
		}

		function setLaundryDeliveryTime(merchant, time){
			if(!hasActiveCart(merchant)){
				return;
			}
			carts[merchant].laundry_delivery_time = time;
		}

		function setLaundryDeliveryOptions(merchant, options){
			if(!hasActiveCart(merchant)){
				return;
			}
			carts[merchant].laundry_delivery_options = options;
		}

		function setLaundryPickupOptions(merchant, options){
			if(!hasActiveCart(merchant)){
				return;
			}
			carts[merchant].laundry_pickup_options = options;
		}

		function getItems(merchant){
			if(!hasActiveCart(merchant)){
				return;
			}

			return carts[merchant].cart;
		}

		function reload(merchant){
			var deferred = $q.defer();

			lockCart();

			var currentCart = carts[merchant];

			CartAPI.getCart({
				merchant  : merchant,
				orderType : getOrderType(merchant),
				orderTime : getOrderTime(merchant)
			})
			.then(function(data){

				updateCart(data, currentCart);

				unlockCart();
				broadcastChange();
				deferred.resolve(data);

			}, function(data){

				updateCart(data, currentCart);

				unlockCart();
				broadcastChange();

				deferred.reject(data);

			});

			return deferred.promise;
		}

		function lockCart(){
			transactionInProgress = true;
		}

		function unlockCart(){
			transactionInProgress = false;
		}

		function isInUse(){
			return transactionInProgress;
		}

		function canEditCart(merchant){
			if(transactionInProgress || !hasActiveCart(merchant)){
				return false;
			}

			return true;
		}

		function updateCart(updatedData, cart){
			cart.cart            = updatedData.cart;
			cart.item_count      = updatedData.item_count;
			cart.subtotal        = updatedData.subtotal;
			cart.tax             = updatedData.tax;
			cart.total           = updatedData.total;
			cart.fees            = updatedData.fees;
			cart.orderable_times = updatedData.orderable_times;
			cart.discount        = updatedData.discount;
			cart.delivery_points = updatedData.delivery_points;
			if(angular.isDefined(updatedData.laundry_pickup_times)){
				cart.laundry_pickup_times = updatedData.laundry_pickup_times;
			}
		}

		function broadcastChange(){
			$rootScope.$broadcast('cartChange');
		}

		function initializeCart(merchant){

			if(hasActiveCart(merchant)){
				return;
			}

			carts[merchant] =
			{
				merchant  : merchant,
				orderType : getOrderType(merchant),
				orderTime : getOrderTime(merchant)
			};
		}

		function hasActiveCart(merchant){
			return (typeof carts[merchant] !== 'undefined');
		}

		function setOrderType(orderType, merchant){
			var deferred = $q.defer();

			if(!hasActiveCart(merchant)){
				return;
			}

			var currentCart = carts[merchant];

			if(cfg.orderTypes.indexOf(orderType) !== -1){
				currentCart.orderType = orderType;

				var expiration = Cookies.setExpInHours(3);
				Cookies.setCookie(merchant + '_orderType', orderType, { expires: expiration });

				broadcastChange();
				
				deferred.resolve();
				return deferred.promise;
			}

		}

		function getOrderType(merchant){
			if(!hasActiveCart(merchant)){
				return;
			}

			if (Cookies.getCookie('globalOrderType') && !Cookies.getCookie(merchant + '_orderType')) {
				return Cookies.getCookie('globalOrderType');
			}
			else if (Cookies.getCookie(merchant + '_orderType')) {
				return Cookies.getCookie(merchant + '_orderType');
			} else {
				return 'delivery';
			}
		}

		function setOrderTime(orderTime, merchant){
			var deferred = $q.defer();

			if(!hasActiveCart(merchant)){
				return;
			}

			var currentCart = carts[merchant];
			if (orderTime === "ASAP") {
				currentCart.orderTime = orderTime;
			} else {
				currentCart.orderTime = Date.create(orderTime).format(Date.ISO8601_DATETIME);
			}

			var expiration = Cookies.setExpInHours(3);
			Cookies.setCookie(merchant + '_orderTime', orderTime, { expires: expiration });

			broadcastChange();

			deferred.resolve();
			return deferred.promise;
		}

		function getOrderTime(merchant){
			if(!hasActiveCart(merchant)){
				return;
			}

			if (Cookies.getCookie('globalOrderTime') && !Cookies.getCookie(merchant + '_orderTime')) {
				return Cookies.getCookie('globalOrderTime');
			}
			else if (Cookies.getCookie(merchant + '_orderTime')) {
				return Cookies.getCookie(merchant + '_orderTime');
			} else {
				return 'ASAP';
			}
		}

		return {
			'add'                    : add,
			'edit'                   : edit,
			'remove'                 : remove,
			'reload'                 : reload,
			'getInfo'                : getInfo,
			'isInUse'                : isInUse,
			'getItems'               : getItems,
			'setOrderType'           : setOrderType,
			'getOrderType'           : getOrderType,
			'setOrderTime'           : setOrderTime,
			'getOrderTime'           : getOrderTime,
			'getAvailableOrderTimes' : getAvailableOrderTimes,
			'getLaundryPickupTimes' : getLaundryPickupTimes,
			'setLaundryDeliveryTime' : setLaundryDeliveryTime,
			'setLaundryPickupTime' : setLaundryPickupTime,
			'setLaundryPickupOptions' : setLaundryPickupOptions,
			'setLaundryDeliveryOptions' : setLaundryDeliveryOptions,
			'initializeCart'         : initializeCart
		};
	})

.service('CartProvider', function(Carts){

	function CartInterface(merchant){

		this.add = function(item){
			return Carts.add(item, merchant);
		};

		this.remove = function(itemKey){
			return Carts.remove(itemKey, merchant);
		};

		this.edit = function(item){
			return Carts.edit(item, merchant);
		};

		this.getInfo = function(){
			return Carts.getInfo(merchant);
		};

		this.getItems = function(){
			return Carts.getItems(merchant);
		};

		this.reload = function(){
			return Carts.reload(merchant);
		};

		this.setOrderType = function(orderType){
			return Carts.setOrderType(orderType, merchant);
		};

		this.getOrderType = function(){
			return Carts.getOrderType(merchant);
		};

		this.getAvailableOrderTimes = function(){
			return Carts.getAvailableOrderTimes(merchant);
		};

		this.setOrderTime = function(orderTime){
			return Carts.setOrderTime(orderTime, merchant);
		};

		this.getOrderTime = function(){
			return Carts.getOrderTime(merchant);
		};

		this.isInUse = function(){
			return Carts.isInUse();
		};

		this.getLaundryPickupTimes = function(){
			return Carts.getLaundryPickupTimes(merchant);
		};

		this.setLaundryPickupTime = function(time){
			return Carts.setLaundryPickupTime(merchant,time);
		};

		this.setLaundryDeliveryTime = function(time){
			return Carts.setLaundryDeliveryTime(merchant,time);
		};

		this.setLaundryDeliveryOptions = function(options){
			return Carts.setLaundryDeliveryOptions(merchant,options);
		};

		this.setLaundryPickupOptions = function(options){
			return Carts.setLaundryPickupOptions(merchant,options);
		};

	}

	function get(merchant){
		Carts.initializeCart(merchant);
		return new CartInterface(merchant);
	}

	return {
		"get" : get
	};

});
