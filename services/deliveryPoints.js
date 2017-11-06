'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('DeliveryPoints', function(RequestBuilder, DcomConfig) {

		var POINTS_API_ENDPOINT = '/api/marketing',
			orderInfo = null,
			selectedPrize = null;

		function setOrderInfo(info){
			orderInfo = info;
		}

		function getOrderInfo(){
			return orderInfo;
		}
		
		function setSelectedPrize(prize){
			selectedPrize = prize;
		}

		function getSelectedPrize(){
			return selectedPrize;
		}

		function getPrizes(){
			return RequestBuilder.getRequestPromise({
				method        : 'GET',
				url           : POINTS_API_ENDPOINT + '/prizes',
				authToken     : true
			}); 
		}

		function redeemPrize(params){
			return RequestBuilder.getRequestPromise({
				method        : 'POST',
				data  		  : params,
				url           : POINTS_API_ENDPOINT + '/redeem/'+params.prize_id,
				authToken     : true
			}); 
		}

		function isDonation (prize){
			if(angular.isDefined(prize) && prize.charity_id){
				return true;
			}
			return false;
		}

		function isDeliveryDollars(prize){
			if(angular.isDefined(prize) && prize.name.search('delivery.com Gift Card')!==-1){
				return true;
			}
			return false;
		}

		function isItem(prize){
			if(!isDeliveryDollars(prize) && !isDonation(prize)){
				return true;
			}
			return false;
		}

		return {
			'getPrizes'      : getPrizes,
			'redeemPrize'    : redeemPrize,
			'setOrderInfo':setOrderInfo,
			'getOrderInfo':getOrderInfo,
			'setSelectedPrize':setSelectedPrize,
			'getSelectedPrize':getSelectedPrize,
			'isDonation':isDonation,
			'isDeliveryDollars':isDeliveryDollars,
			'isItem':isItem
		};

		

	});