'use strict';

angular.module('dcomApp')
    //searching for and filtering merchants
    .service('RequestBuilder', function($http, $q, $rootScope, UserMessages, DcomConfig, UserAuthToken, GuestAuthToken) {

        var errorMessage = {
            defaultMsg : [ {user_msg : 'Oops. There was an error with your request.'} ],
            noConnection : [ {user_msg : 'Oops. We lost you! Please check your internet connection and try again.'} ]
        };

        var httpErrorMessages = {
            500 : errorMessage.defaultMsg,
            502 : errorMessage.noConnection,
            504 : errorMessage.noConnection,
            0   : errorMessage.noConnection
        };

        function isDefined(variable){
            return typeof variable !== "undefined";
        }

        function getRequestPromise(request){
            var deferred = $q.defer();

            if(request.apiKey !== false){
                addAPIkey(request);
            }

            if(request.authToken) {
                addAuthToken(request);
            }

            $http(request)
            .success(function(data) {
                deferred.resolve(data);
            }).error(function(data, status) {
                
                var message = isDefined(data.message) ? data.message : errorMessage.defaultMsg;

                if(request.disableErrorHandler){
                    data.message = message;
                    deferred.reject(data);
                    return;
                }

                deferred.reject(message);

                if (status in httpErrorMessages) {
                    UserMessages.printError( httpErrorMessages[status] );
                }

                // 404 + empty string payload = no connection
                if(status === 404 && data === ""){
                    UserMessages.printError( errorMessage.noConnection );
                }

            });

            return deferred.promise;
        }

        function addAPIkey(request){
            var keyInParams = ['GET', 'DELETE'];
            var keyInData   = ['POST', 'PUT'];

            if(keyInParams.indexOf(request.method) !== -1) {
                request.params = request.params || {};
                request.params.client_id = DcomConfig.apiKey;
            } else if(keyInData.indexOf(request.method) !== -1) {
                request.data = request.data || {};
                request.data.client_id = DcomConfig.apiKey;
            } else {
                angular.noop();
            }

        }

        function addAuthToken(request){
            request.headers = request.headers || {};

            if(UserAuthToken.isSet()){
                request.headers.Authorization = UserAuthToken.get();
            } else if(GuestAuthToken.isSet()) {
                request.headers['Guest-Token'] = GuestAuthToken.get();
            } else {
                angular.noop();
            }
            
        }

        return {
            'getRequestPromise' : getRequestPromise
        };

    });
