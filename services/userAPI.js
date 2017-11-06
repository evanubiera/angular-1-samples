'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('UserAPI', function(RequestBuilder, DcomConfig) {

		var USER_API_ENDPOINT = '/api/customer';

		function authenticate(username, password){
			return RequestBuilder.getRequestPromise({
				method         : 'POST',
				url            : USER_API_ENDPOINT + '/auth',
				authToken	   : true,
				data           : {
	 				'username'      : username,
	 				'password'      : password,
	 				'grant_type'    : 'password',
	 				'client_secret' : DcomConfig.clientSecret,
	 				'scope'	        : 'payment,global'
				}
			});
		}

		function authenticateGuest(){
			return RequestBuilder.getRequestPromise({
				method         : 'GET',
				url            : USER_API_ENDPOINT + '/auth/guest'
			});
		}

		function createUser(userinfo) {
			return RequestBuilder.getRequestPromise({
				method         : 'POST',
				url            : USER_API_ENDPOINT + '/account',
				authToken      : true,
				data           : angular.extend(userinfo, {
					'grant_type'    : 'password',
					'client_secret' : DcomConfig.clientSecret,
					'scope'	        : 'payment,global'
				})
			});
		}

		function applyPromoDeal(deal){
			return RequestBuilder.getRequestPromise({
				method         : 'POST',
				url            : USER_API_ENDPOINT + '/promo/deal',
				data           : { 'deal_id' : deal },
				authToken      : true
			});
		}

		function getUserInfo(){
			return RequestBuilder.getRequestPromise({
				method         : 'GET',
				url            : USER_API_ENDPOINT + '/account',
				authToken      : true
			});
		}

		function resetPassword(email){
			return RequestBuilder.getRequestPromise({
				method         : 'DELETE',
				url            : USER_API_ENDPOINT + '/password/' + email
			});
		}

		function updateProfile(profile){
			return RequestBuilder.getRequestPromise({
				method          : 'PUT',
				url             : USER_API_ENDPOINT + '/account',
				authToken       : true,
				data 		    : {
					'first_name'    : profile.firstName,
					'last_name'     : profile.lastName,
					'email'         : profile.email,
					'password'      : profile.confirmPassword,
		 			'client_secret' : DcomConfig.clientSecret,
				}
			});
		}

		function getCreditCards(){
			return RequestBuilder.getRequestPromise({
				method         : 'GET',
				url            : USER_API_ENDPOINT + '/cc',
				authToken      : true
			});
		}

		function addCreditCard(details){
			return RequestBuilder.getRequestPromise({
				method        : 'POST',
				url           : USER_API_ENDPOINT + '/cc',
				authToken     : true,
				data 		  : {
				'cc_number'   : details.ccNumber,
				'exp_month'   : details.expMonth,
				'exp_year'    : details.expYear,
				'cvv'         : details.cvv,
				'billing_zip' : details.billingZip
				}
			});
		}

		function removeCreditCard(cardId){
			return RequestBuilder.getRequestPromise({
				method        : 'DELETE',
				url           : USER_API_ENDPOINT + '/cc/' + cardId,
				authToken     : true
			});
		}

		return {
			'authenticate'      : authenticate,
			'authenticateGuest' : authenticateGuest,
			'getUserInfo'		: getUserInfo,
			'createUser'        : createUser,
			'applyPromoDeal'    : applyPromoDeal,
			'resetPassword'		: resetPassword,
			'getCreditCards'	: getCreditCards,
			'addCreditCard'		: addCreditCard,
			'removeCreditCard'	: removeCreditCard,
			'updateProfile'     : updateProfile
		};

	});
