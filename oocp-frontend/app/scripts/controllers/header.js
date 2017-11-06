'use strict';

angular.module('dcomApp')
	.controller('HeaderCtrl', function(Users, $location, $rootScope, $scope, $routeParams, Orders) { 			
	$scope.loginWithRedirect = function () {
	    var currentUrl = $location.url();
	    $location.path('/login');
	    $location.search({'next': currentUrl});
	}
	
	$scope.logout = function () {
	    Users.logout();
	}
});