'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('MarketingAPI', function(RequestBuilder) {

		var MARKETING_API_ENDPOINT = '/api/marketing';

		function getDealsAndUhau(){
			return RequestBuilder.getRequestPromise({
				method         : 'GET',
				url            : MARKETING_API_ENDPOINT + '/deals',
				authToken	   : true
			});
		}

		function postNewUhau(name,deal_id){
			return RequestBuilder.getRequestPromise({
				method         : 'POST',
				url            : MARKETING_API_ENDPOINT + '/acq_method',
				authToken	   : true,
				data           : {
					'uhau_name'      : name,
					'uhau_deal_id'      : deal_id
				}
			});
		}



		return {
			'getDealsAndUhau'      : getDealsAndUhau,
			'postNewUhau'      : postNewUhau
		};

	});