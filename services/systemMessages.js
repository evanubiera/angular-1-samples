'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('SystemMessages', function($timeout) {

		var systemMessages = {
			maxOutstandingErrors : 1,
			outstandingErrors    : 0,
			timeouts             : []
		};

		function clear(){
			angular.forEach(systemMessages.timeouts, function(timeout){
				$timeout.clear(timeout);
			});

			systemMessages.timeouts = [];
			systemMessages.outstandingErrors = 0;

			angular.element('.system-message').remove();
		}

		function printMessage(message, messageType, duration){
			var stripHtml = '<div class="system-message ' + messageType + '">' +
							'<span>' + message + '</span> <div>';

			var $strip = 
				jQuery(stripHtml)
				.prependTo('.site-wrapper')
				.hide().slideDown();

			jQuery('body').scrollTop(0);

			if(typeof duration !== 'number') {
				return;
			}

			var timeoutArray = systemMessages.timeouts;
			
			var timeout = $timeout(function(){
				$strip.slideUp('slow', function(){ 
					$strip.remove(); 
					systemMessages.outstandingErrors -= 1;
				});

				var timeoutIndex = timeoutArray.indexOf(timeout);
				if(timeoutIndex !== -1){
					timeoutArray.splice(timeoutIndex, 1);
				}

			}, duration);

			systemMessages.timeouts.push(timeout);
		}


		function printError(error){
			if(systemMessages.outstandingErrors >= systemMessages.maxOutstandingErrors) {
				return;
			} else {
				systemMessages.outstandingErrors += 1;
			}

			printMessage(error, 'error');
		}

		return {
			'printError' : printError,
			'clear'      : clear
		};

	});