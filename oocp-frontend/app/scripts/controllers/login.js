'use strict';

angular.module('dcomApp')
	.controller('LoginCtrl', function (Users, $http, $location, $modal, $rootScope, $scope) {
		function redirectToNext() {
			if ($location.search().next) {
				$location.url($location.search().next);
			} else {
				$location.path('/oocl');
			}
		}

		$scope.submitLogin = function() {
			//autofilled forms don't trigger ngModel update so grabbing values manually
			$scope.loginProcessing = true;
			Users.authenticateUser(angular.element('#email').val(), angular.element('#password').val());
		};

		$rootScope.page = {
			bodyClasses: 'page-login',
			title: 'Log in to delivery.com'
		};
		$scope.header = {
			backUrl: '/#!/',
			text: 'Log in'
		};
		$scope.login = {};
		$scope.loginProcessing = false;

		if (Users.getUserAuthToken()) {
			Users.updateUserInfo();
			redirectToNext();
		}

		$scope.$on('authSuccess', function(event, args) {
			redirectToNext();
		});
		$scope.$on('authFailure', function(event, args) {
			$scope.login.messages = args.messages;
			$scope.loginProcessing = false;
		});
	});
