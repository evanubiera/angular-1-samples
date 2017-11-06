'use strict';

angular.module('dcomApp')
    .service('CartAPI', function (RequestBuilder, SearchLocation, Group) {

        var CART_API_ENDPOINT = '/api/customer/cart';

        function convertToPostFormat(item){
            var itemInPostformat = {
                'item_id': item.id,
                'item_qty': item.quantity,
                'option_qty': item.options,
                'instructions': item.instructions
            };

            return itemInPostformat;
        }

        function addItem(item, cart){
            var address = SearchLocation.get();

            var params = {
                  'city'       : address.city,
                  'state'      : address.state,
                  'zip'        : address.zip,
                  'order_type' : cart.orderType,
                  'order_time' : cart.orderTime,
                  'latitude'   : address.latitude,
                  'longitude'  : address.longitude,
                  'item'       : convertToPostFormat(item)
                };

            if(Group.currentGroup()==='l'){
                params.laundry = true;
                if(angular.isDefined(address.location_id)){
                    params.location_id = address.location_id;
                }
            }

            return RequestBuilder.getRequestPromise({
                method: 'POST',
                url: CART_API_ENDPOINT + '/' + cart.merchant,
                authToken : true,
                data : params
            });
        }


        function removeItem(itemKey, cart){
            var address = SearchLocation.get(),
                params = {
                    'cart_index' : itemKey,
                    'order_type' : cart.orderType,
                    'order_time' : cart.orderTime,
                    'city'       : address.city,
                    'state'      : address.state,
                    'zip'        : address.zip,
                    'latitude'   : address.latitude,
                    'longitude'  : address.longitude
                };

            if(Group.currentGroup()==='l'){
                params.laundry = true;
                if(angular.isDefined(address.location_id)){
                    params.location_id = address.location_id;
                    
                }
            }

            return RequestBuilder.getRequestPromise({
                method: 'DELETE',
                url: CART_API_ENDPOINT + '/' + cart.merchant,
                authToken : true,
                params : params
            });
        }

        function editItem(item, cart){
            var address = SearchLocation.get(),
            params = {
                    'city'       : address.city,
                    'state'      : address.state,
                    'zip'        : address.zip,
                    'order_type' : cart.orderType,
                    'order_time' : cart.orderTime,
                    'item'       : convertToPostFormat(item),
                    'cart_index' : item.item_key,
                    'latitude'   : address.latitude,
                    'longitude'  : address.longitude
            };

            if(Group.currentGroup()==='l'){
                params.laundry = true;
                if(angular.isDefined(address.location_id)){
                    params.location_id = address.location_id;
                    
                }
            }

            return RequestBuilder.getRequestPromise({
                method: 'PUT',
                url: CART_API_ENDPOINT + '/' + cart.merchant,
                authToken : true,
                data : params
            });
        }


       
        function getCart(cart, pickupTime){
            var address = SearchLocation.get(),
                params = {
                    'order_type': cart.orderType,
                    'order_time': cart.orderTime,
                    'city'      : address.city,
                    'state'     : address.state,
                    'zip'       : address.zip,
                    'latitude'  : address.latitude,
                    'longitude' : address.longitude
                };

            if(Group.currentGroup()==='l'){
                params.laundry = true;
                if(angular.isDefined(address.location_id)){
                    params.location_id = address.location_id;
                    
                }

                if(angular.isDefined(pickupTime) && pickupTime !== null){
                    params.laundry_pickup_timestamp = pickupTime;
 			    }
            }


            return RequestBuilder.getRequestPromise({
                method: 'GET',
                url: CART_API_ENDPOINT + '/' + cart.merchant,
                authToken : true,
                disableErrorHandler: true,
                params : params
            });
        }

        function reorder(orderId){
            return RequestBuilder.getRequestPromise({
                method: 'POST',
                url: CART_API_ENDPOINT + '/reorder',
                authToken : true,
                disableErrorHandler: true,
                data: {
                    'order_id': orderId
                }
            });
        }

         function clearCart(cart){
            var address = SearchLocation.get(),
                params = {};

            if(Group.currentGroup()==='l'){
                params.laundry = true;
                if(angular.isDefined(address.location_id)){
                    params.location_id = address.location_id;
                    
                }
            }

            return RequestBuilder.getRequestPromise({
                method: 'DELETE',
                url: CART_API_ENDPOINT + '/' + cart.merchant,
                authToken : true,
                params: params
            });
        }


        return {
            "addItem"        : addItem,
            "removeItem"     : removeItem,
            "editItem"       : editItem,
            "getCart"        : getCart,
            "clearCart"      : clearCart,
            "reorder"        : reorder
        };

    });
