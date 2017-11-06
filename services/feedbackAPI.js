'use strict';

angular.module('dcomApp')
	.service('FeedbackAPI', function(RequestBuilder, Group) {

		var USER_API_ENDPOINT = '/api/cs/contact';

		function getMerchantReviews(merchant) {
			
			var url = '/api/merchant/' + merchant + '/reviews';
    		if(Group.currentGroup()==='l'){
    			url+="?laundry=true";
    		}

    		return RequestBuilder.getRequestPromise({
				method    : 'GET',
				url       : url,
				authToken : true
			});
		}

		function sendcontactForm(userinfo) {
			return RequestBuilder.getRequestPromise({
				method    : 'POST',
				url       : USER_API_ENDPOINT,
				authToken : true,
				data      : userinfo
			});
		}

		return {
			'getMerchantReviews' : getMerchantReviews,
			'sendcontactForm'    : sendcontactForm
		};

	});