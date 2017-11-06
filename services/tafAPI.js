'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('TafAPI', function(RequestBuilder) {

		var TAF_API_ENDPOINT = '/api/taf';

		function verifyEmail(email){
			return RequestBuilder.getRequestPromise({
				method      : 'GET',
				url         : TAF_API_ENDPOINT + '/verify',
				authToken 	: true,
				params      : {
				'email'     : email
				}
			});
		}

		function getBounty(){
			return RequestBuilder.getRequestPromise({
				method : 'GET',
				url    : TAF_API_ENDPOINT + '/bounty'
			});
		}

		function addFriends(emails){
			return RequestBuilder.getRequestPromise({
				method   : 'POST',
				url		 : TAF_API_ENDPOINT + '/email',
				authToken : true,
				data	 : {
				'emails' : emails
				}
			});
		}

		function getReport(){
			return RequestBuilder.getRequestPromise({
				method    : 'GET',
				url		  : TAF_API_ENDPOINT + '/report',
				authToken : true
			});
		}

		function share(){
			return RequestBuilder.getRequestPromise({
				method       : 'GET',
				url		     : TAF_API_ENDPOINT + '/share',
				authToken    : true
			});
		}


		return {
			'verifyEmail' : verifyEmail,
			'getBounty'	  : getBounty,
			'addFriends'  : addFriends,
			'getReport'	  : getReport,
			'share'		  : share
		};

	});