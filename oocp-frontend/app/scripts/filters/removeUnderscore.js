'use strict';

angular.module('dcomApp')
  .filter('removeUnderscore', function(){
      return function(text) {
          if(text) {
              return text.replace("_", " ");
          }
      };
});