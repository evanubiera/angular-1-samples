'use strict';

angular.module('dcomApp').factory('$exceptionHandler', function ($log) {
	return function (exception, cause) {
		//trackjs
		if (typeof trackJs !== 'undefined') {
			trackJs.track(exception);
		}
		//qbaka
		if (typeof qbaka !== 'undefined') {
			qbaka.report(exception);
		}
		//Angular's default error handling behavior. Send to logger.
		$log.error.apply($log, arguments);
	};
});