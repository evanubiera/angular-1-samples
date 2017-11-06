'use strict';

angular.module('dcomApp')
    .service('Urls', function(){

    function getMerchantUrl(merchant){
        var city = merchant.summary.url.geo_tag,
            typeStub = merchant.summary.url.merchant_type,
            merchantStub = merchant.summary.url.short_tag;
        return '/cities' + '/' + city + '/categories/' + typeStub + '/' + merchantStub;
    }

    function getCheckoutUrl(merchant){
        var typeStub = merchant.summary.url.merchant_type;
        return '/checkout/' + typeStub + '/' + merchant.id;
    }

    return {
        'getMerchantUrl' : getMerchantUrl,
        'getCheckoutUrl' : getCheckoutUrl
    };

});
