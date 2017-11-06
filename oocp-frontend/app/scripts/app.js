'use strict';

var resolve = {};

resolve.redirectAuthorizedToDispatcher = {	
   	users : ['Users', function(Users) {
         return Users.redirectIfNotLoggedIn();
    }]
};

angular.module('dcomApp', ['ngSanitize', 'ui.bootstrap','theaquaNg','timer'])
	.config(function ($locationProvider, $routeProvider) {
		$locationProvider.hashPrefix('!');
		$routeProvider
			.when('/', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.when('/ooc', {
				templateUrl: 'views/onlineOrderConfirmation.html',
				controller: 'OnlineOrderConfirmationCtrl',
				resolve: resolve.redirectAuthorizedToDispatcher
			})
			.when('/ooc/:orderId', {
				templateUrl: 'views/onlineOrderConfirmation.html',
				controller: 'OnlineOrderConfirmationCtrl',
				resolve: resolve.redirectAuthorizedToDispatcher
			})
			.when('/oocl', {
				templateUrl: 'views/onlineOrderConfList.html',
				controller: 'OnlineOrderConfListCtrl',
				resolve: resolve.redirectAuthorizedToDispatcher
			})
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	})
	.run(function($location, $rootScope, $timeout, $window) {
		//enable :active CSS state in iOS safari
		document.addEventListener('touchstart', function() {},false);
	});