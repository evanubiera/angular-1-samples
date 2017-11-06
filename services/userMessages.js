'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('UserMessages', function($q, $modal) {

		var userMessages = {
			maxOutstandingErrors : 1,
			outstandingErrors    : 0
		};

		var defaultMessage = {
			message : [{user_msg : ''}],
			title : 'Error',
			ok : 'Ok'
		};

		var templates  = {
			errorMessage : '<div class="modal-header"><button type="button" class="close" ng-click="$dismiss(' + "'close'" +')" aria-hidden="true">&times;</button><h3>{{title}}</h3></div><div class="modal-body"><p ng-repeat="msg in message">{{msg.user_msg}}</p></div><div class="modal-footer"><a ng-click="$close(' + "'footer close'" +')" class="button primary">{{ok}}</a></div>'
		};

		function printError(errors){
			// avoid printing 15457492432423 error messages if everything goes wrong
			if(userMessages.outstandingErrors >= userMessages.maxOutstandingErrors) {
				return;
			} else {
				userMessages.outstandingErrors += 1;
			}

			var modalInstance = printAPIMessage(errors);

			modalInstance
			.then(function(){
				userMessages.outstandingErrors -= 1;
			}, function(){
				userMessages.outstandingErrors -= 1;
			});
		}

		function printAPIMessage(message){
			var defaults     = angular.copy(defaultMessage),
				modalMessage = angular.extend(defaults, { message : message });
			return openNoticeModal(modalMessage);
		}

		function printMessage(opts){
			var message = opts.message;
			if (!(opts.message instanceof Array)){
				opts.message = [opts.message];
			}
			opts.message = opts.message.map(function(message){
				return {user_msg : message};
			});
			var defaults     = angular.copy(defaultMessage),
				modalMessage = angular.extend(defaults, opts);
			return openNoticeModal(modalMessage);
		}

		function openNoticeModal(message){
			var modalInstance = $modal.open({
				template: templates.errorMessage,
				controller: ['$scope',function($scope) {
					$scope.message = message.message;
					$scope.ok      = message.ok;
					$scope.title   = message.title;
				}]
			});

			return modalInstance.result;
		}

		function askConfirmation(params){
			params = params || {};

			var deferred = $q.defer();

			var settings = params;

			var templateHtml = "<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"$dismiss()\" aria-hidden=\"true\">&times;</button><h3>{{settings.title}}</h3></div>" +
				"<div class=\"modal-body\"><p ng-bind-html='settings.message'></p></div>" +
				"<div class=\"modal-footer\"><div>" +
				"<a ng-if=\"settings.cancel\" ng-click=\"$dismiss()\" class=\"button secondary\">{{settings.cancel}}</a>" +
				"<a ng-click=\"$close()\" class=\"button primary\">{{settings.ok}}</a></div></div>";

			var modalInstance = $modal.open({
				template    : templateHtml,
				windowClass : params.windowClass || 'confirmation-modal',
				controller  : ['$scope', 'settings', function($scope, settings){ $scope.settings = settings; }],
				backdrop    : 'static',
				resolve     : {
					settings : function(){ return params; }
				}
			});

			modalInstance.result
				.then(function(result){
					deferred.resolve(result);
				},function(){
					deferred.reject();
				});

			return deferred.promise;
		}

		return {
			'printError'   : printError,
			'printMessage' : printMessage,
			'printAPIMessage' : printAPIMessage,
			'askConfirmation' : askConfirmation
		};

	});
