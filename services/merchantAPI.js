'use strict';

angular.module('dcomApp')
    .service('MerchantAPI', function ($q, $routeParams, SearchLocation, RequestBuilder, Group) {

        var MERCHANT_API_ENDPOINT = '/api/merchant';

        function getItem(merchant, itemId){
            //Required params for Laundry API requests
            var params = {};

            if(Group.currentGroup() === 'l'){
                var address =  SearchLocation.get();
                if(angular.isDefined(address.location_id)){
                    params.location_id = address.location_id;
                }
                params.laundry = true;
            
            }

            return RequestBuilder.getRequestPromise({
                method: 'GET',
                url: MERCHANT_API_ENDPOINT + '/' + merchant + '/menu/' + itemId,
                authToken : true,
                params: params
            });
        }

        function getMerchantId(){
            var deferred     = $q.defer(),
                merchantId   = $routeParams.merchantId,
                urlStub      = $routeParams.urlStub;
            
            if(typeof merchantId === 'undefined' && typeof urlStub === 'undefined'){
                deferred.reject();
            }

            if(typeof merchantId !== 'undefined'){
                deferred.resolve(merchantId);
            } else {
                var address = SearchLocation.get();

                getMerchantInfo($routeParams.urlStub, address.query)
                .then(function(data){
                    deferred.resolve(data.merchant.id);
                }, function(){
                    deferred.reject();
                });
            }

            return deferred.promise;
        }

        function getOrderingInfo(merchant){
            var address = SearchLocation.get();

            return getMerchantInfo(merchant, address.query)
            .then(function(data){
                var merchant = data.merchant;

                if(!merchant.ordering) {
                    return $q.reject();
                }
                return merchant.ordering;
            });
        }

        function getMenu(merchant){
            
            //Required params for Laundry API requests
            var params = {};

            if(Group.currentGroup() === 'l'){
                var address =  SearchLocation.get();
                if(angular.isDefined(address.location_id)){
                    params.location_id = address.location_id;
                }
                params.laundry = true;
            }

            return RequestBuilder.getRequestPromise({
                method: 'GET',
                url: MERCHANT_API_ENDPOINT + '/' + merchant + '/menu',
                params: params
            });
        }
        
        function getMerchantInfo(merchant, address){
            var search_address = SearchLocation.get();
            
            address = address || search_address.query;
                        
            var params = {
                address : address
            };

            //Required params for Laundry API requests
            if(Group.currentGroup() === 'l'){
                if(angular.isDefined(search_address.location_id) && search_address.location_id!==null){
                    params.location_id = search_address.location_id;
                }
                params.laundry = true;
            }

            return RequestBuilder.getRequestPromise({
                cache  : true,
                method : 'GET',
                url: MERCHANT_API_ENDPOINT + '/' + merchant,
                params : params
            });
        }

        return {
            "getItem"            : getItem,
            "getMenu"            : getMenu,
            "getMerchantInfo"    : getMerchantInfo,
            "getMerchantId"      : getMerchantId,
            "getOrderingInfo"    : getOrderingInfo
        };

    });
