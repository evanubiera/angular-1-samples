'use strict';

angular.module('dcomApp')
    .factory('UserAuthToken', function (KeyValueStorage) {

        var AUTH_TOKEN_KEY = 'userAuthToken';
        return new KeyValueStorage(AUTH_TOKEN_KEY);

    })
    .factory('GuestAuthToken', function (KeyValueStorage) {

        var GUEST_AUTH_TOKEN_KEY = 'guestAuthToken';
        return new KeyValueStorage(GUEST_AUTH_TOKEN_KEY);

    });