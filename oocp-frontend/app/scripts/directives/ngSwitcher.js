(function() {
    'use strict';
    angular.module('theaquaNg',['ng']).directive('ngSwitcher', function($rootScope, Users, Orders, $location, $window, $http, $routeParams, $modal) {
        return {
            restrict: 'AE',
            template: "<div class=\"switch\" ng-class=\"{\'switch-left\': !model, \'switch-right\': model}\" ng-click=\"toggle()\">\n  <div class=\"switch-button\">&nbsp;</div>\n</div>",
            scope : {
            	'ngModel' : '='
            },
            link: function(scope, element, attrs, ngModel) {	
                scope.toggle = function() {                
                    scope.ngModel = !(scope.ngModel);
                    //determine which widget we're dealing with
                };
                scope.$watch('ngModel', function() { 
                    scope.model = scope.ngModel; 
                });
            }
        };
    });
}).call(this);