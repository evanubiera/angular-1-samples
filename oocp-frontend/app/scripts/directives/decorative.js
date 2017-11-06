angular.module('dcomApp')
	.directive('dcomProcessing', function() {
		// Marks up button for processing style
		// Usage: <a dcom-processing="{{booleanIsProcessing}}">Button text</a>
		return {
			restrict: 'A',
			template: '<span ng-transclude class="contents"></span><span class="spinner"></span>',
			transclude: true,
			link: function(scope, element, attrs) {
				attrs.$observe('dcomProcessing', function(newValue) {				
					if (newValue === 'true') { //string because it's an interpolated value
						element.addClass('processing');
					} else {
						element.removeClass('processing');
					}
				});
			}
		};
	});