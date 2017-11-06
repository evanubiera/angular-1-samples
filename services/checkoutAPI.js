'use strict';

angular.module('dcomApp')
	.service('CheckoutAPI', function ($q, RequestBuilder, CartProvider, Group, SearchLocation, MerchantReferral) {
	
	   var CART_API_ENDPOINT = '/api/customer/cart';

        function getPaymentInfo(merchant){
            var cart = CartProvider.get(merchant),
                params = {
                    'order_type': cart.getOrderType(),
                    'order_time': cart.getOrderTime()
                };

            if (Group.currentGroup()==='l'){
                var address = SearchLocation.get();
                params.laundry = true;
                params.location_id = address.location_id;
            }
            
            return RequestBuilder.getRequestPromise({
                method: 'GET',
                url: CART_API_ENDPOINT +'/' + merchant + '/checkout',
                authToken : true,
                params: params
            }).then(function(data){
                if(typeof data.payment_methods === 'undefined'){
                    return $q.reject();
                }
                var paymentMethods = data.payment_methods;
                paymentMethods.gift_code = paymentMethods.gift_code || {};
                paymentMethods.credit_balance = paymentMethods.credit_balance || {};
                return paymentMethods;
            });
        }

        function checkout(merchant, order){

            var cart = CartProvider.get(merchant),
                params = {
                    'tip': order.tip,
                    'order_type': order.order_type,
                    'order_time': order.order_time,
                    'location_id': order.location_id,
                    'payments': order.checkoutInfo.payments,
                    'merchant_id': merchant,
                    'instructions': order.instructions
                };

            if(angular.isDefined(order.phone_number) && order.phone_number!==""){
                params.phone_number = order.phone_number;
            }

            if (Group.currentGroup()==='l'){
                var address = SearchLocation.get(),
                    cartInfo = cart.getInfo();
                
                params.laundry = true;
                params.location_id = address.location_id;
                params.laundry_pickup_time = cartInfo.laundry_pickup_time;
                params.laundry_delivery_time = cartInfo.laundry_delivery_time;
            }

		 if(MerchantReferral.param()!==null){
                params.order_tracking = MerchantReferral.param();
            }


            return RequestBuilder.getRequestPromise({
                method: 'POST',
                url: CART_API_ENDPOINT +'/' + merchant + '/checkout',
                authToken : true,
                data: params
            });
        }

        return {
            "getPaymentInfo" : getPaymentInfo,
            "checkout"       : checkout
        };

    });
