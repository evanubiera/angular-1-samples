'use strict';

angular.module('dcomApp')
    .service('Schedule', function ($rootScope, $q, CartProvider, Cookies, RequestBuilder, Group) {

    	var HOURS_API_ENDPOINT = '/api/customer/cart';

    	function getSchedule(merchant) {
    		
    		var url = '/api/merchant/' + merchant + '/hours?iso=true';
    		
    		if(Group.currentGroup()==='l'){
    			url+="&laundry=true";
    		}
    		
    		return RequestBuilder.getRequestPromise({
                method: 'GET',
                url: url,
                authToken : true
            });
    	}

    	function getOrderTime(page, merchant) {

    		var time;

    		if (page === 'menu') {
				var cart = CartProvider.get(merchant);
				time = cart.getOrderTime();
			}
			else if (page === 'search') {
				time = Cookies.getCookie('globalOrderTime');
			}

			if (typeof time !== 'undefined' && time) {
				return time;
			}
			return false;

    	}

    	function setOrderTime(page, time, merchant) {

    		var deferred = $q.defer();

			if (page === 'menu') {
				var cart = CartProvider.get(merchant);
				cart.setOrderTime(time)
				.then(function () {

					cart.reload()
					.then(function (data){

						broadcastChange('cartChange');
						deferred.resolve(data);

					});

				});

			}
			else if (page === 'search') {

				var expiration = Cookies.setExpInHours(3);
				Cookies.setCookie('globalOrderTime', time, { expires: expiration });

				deferred.resolve();

			}

			return deferred.promise;
			
    	}

    	function getOrderType(page, merchant) {

    		var type;

    		if (page === 'menu') {
				var cart = CartProvider.get(merchant);
				type = cart.getOrderType();
			}
			else if (page === 'search') {
				type = Cookies.getCookie('globalOrderType');
			}
			return type;

    	}

    	function setOrderType(page, type, merchant) {

    		var deferred = $q.defer();

    		//set global order type
			var expiration = Cookies.setExpInHours(3);
			Cookies.setCookie('globalOrderType', type, { expires: expiration });
			deferred.resolve();

			if (page === 'menu') {

				var cart = CartProvider.get(merchant);
				cart.setOrderType(type)
				.then(function (){

					cart.reload()
					.then(function (){

						broadcastChange('cartChange');
						deferred.resolve();

					});

				});

			}
			
			return deferred.promise;

    	}

    	function getOrderableTimes(page, merchant) {

    		var times = '';
			if (page === 'menu') {

				var cart = CartProvider.get(merchant);
				times = cart.getAvailableOrderTimes();

			}
			else if (page === 'search') {

				var searchTimes    = [];
				var firstAvailable = Date.create();

				//nearest quarter hour
				var nearestQrt = (firstAvailable.getMinutes() / 15);
				var nextQrt    = (Math.floor(nearestQrt) * 15) % 60;

				firstAvailable = firstAvailable.getHours() + ':' + ('0' + nextQrt).slice(-2);
				firstAvailable = Date.create(firstAvailable);

				//add an extra hour padding
				var hourPadding = 1;
				if (nextQrt === 0) {
					hourPadding = 2;
				}
				firstAvailable = (hourPadding).hoursAfter(firstAvailable);

				var showNumberOfDays = 6;
				var thisDay = firstAvailable;
				var thisTime = firstAvailable;

				//searchTimes.push(firstAvailable);
				for (var i = 0; i < showNumberOfDays; i++) {

					while ((thisTime).isBefore((1).daysAfter(thisDay))) {

						searchTimes.push(Date.create(thisTime).format(Date.ISO8601_DATETIME));
						thisTime = (15).minutesAfter(thisTime);

					}
					thisDay = (1).daysAfter(thisDay);

				}
				times = searchTimes;

			}

			return times;

		}

		function getOrderableTypes(page, merchantInfo) {

			if (page === 'menu') {

				var available = [];

				var offersPickupEver = (merchantInfo.ordering.availability.next_pickup_time !== null || 
						merchantInfo.ordering.availability.last_pickup_time !== null);

				var offersDeliveryEver = (merchantInfo.ordering.availability.next_delivery_time !== null || 
						merchantInfo.ordering.availability.last_delivery_time !== null);
				
				if (offersPickupEver) {
					available.unshift('pickup');
				}
				if (offersDeliveryEver) {
					available.unshift('delivery');
				}
				return available;

			}
			else if (page === 'search') {

				return ['delivery', 'pickup'];

			}

		}

		function broadcastChange(message) {
			$rootScope.$broadcast(message);
		}

    	return {
			'getSchedule'       : getSchedule,
			'getOrderTime'      : getOrderTime,
			'setOrderTime'      : setOrderTime,
			'getOrderType'      : getOrderType,
			'setOrderType'      : setOrderType,
			'getOrderableTimes' : getOrderableTimes,
			'getOrderableTypes' : getOrderableTypes
		};

    })

	.service('ScheduleProvider', function(Schedule){

		function ScheduleInterface(page) {

			this.getSchedule = function(merchant) {
				return Schedule.getSchedule(merchant);
			};

			this.getOrderTime = function(merchant) {
				return Schedule.getOrderTime(page, merchant);
			};

			this.setOrderTime = function(time, merchant) {
				return Schedule.setOrderTime(page, time, merchant);
			};

			this.getOrderType = function(merchant) {
				return Schedule.getOrderType(page, merchant);
			};

			this.setOrderType = function(type, merchant) {
				return Schedule.setOrderType(page, type, merchant);
			};

			this.getOrderableTimes = function(merchant) {
				return Schedule.getOrderableTimes(page, merchant);
			};

			this.getOrderableTypes = function(merchantInfo) {
				return Schedule.getOrderableTypes(page, merchantInfo);
			};

		}

		function set(page) {
			return new ScheduleInterface(page);
		}

		return {
			'set' : set
		};

    });