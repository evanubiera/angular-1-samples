'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('Vertical', function Vertical($q, $rootScope, $routeParams) {
		
		var verticals = [
			{
				'name': 'Restaurant',
				'key': 'R',
				'param': '',
				'plural': 'restaurants',
				'show_search': true,
				'show_home': true,
			},
			{
				'name': 'Wine & Liquor',
				'key': 'W',
				'param': 'wine-liquor',
				'plural': 'wine and liquor stores',
				'show_search': true,
				'show_home': true,
			},
			{
				'name': 'Bakery',
				'key': 'B',
				'param': 'bakery',
				'plural': 'bakeries',
				'show_search': true,
				'show_home': false,
			},
			{
				'name': 'Butcher',
				'key': 'T',
				'param': 'butcher',
				'plural': 'butchers',
				'show_search': true,
				'show_home': false,
			},
			{
				'name': 'Health & Beauty',
				'key': 'H',
				'param': 'health-beauty',
				'plural': 'health and beauty stores',
				'show_search': true,
				'show_home': false,
			},
			{
				'name': 'Grocery',
				'key': 'I',
				'param': 'grocery',
				'plural': 'grocerie stores',
				'show_search': false,
				'show_home': false,
			},
			{
				'name': 'Pet Store',
				'key': 'P',
				'param': 'pet-store',
				'plural': 'pet stores',
				'show_search': false,
				'show_home': false,
			},
			{
				'name': 'Caterer',
				'key': 'C',
				'param': 'caterer',
				'plural': 'caterers',
				'show_search': false,
				'show_home': false,
			},
			{
				'name': 'Florist',
				'key': 'F',
				'param': 'florist',
				'plural': 'florists',
				'show_search': false,
				'show_home': false,
			},
			{
				'name': 'Gift Basket Maker',
				'key': 'G',
				'param': 'gift-basket-maker',
				'plural': 'gift basket maker stores',
				'show_search': false,
				'show_home': false,
			},
			{
				'name': 'Tobacco Shop',
				'key': 'Z',
				'param': 'tobacco-shop',
				'plural': 'tobacco shops',
				'show_search': false,
				'show_home': false,
			},
			{
				'name': 'Office Supply',
				'key': 'O',
				'param': 'office-supply',
				'plural': 'office supply stores',
				'show_search': false,
				'show_home': false,
			}
		];	

		var current = null;

		function getIndexFromAnyKey(key_val, key_name){
			
			var i=0,
				index = null;

			angular.forEach(verticals, function(value, key) {
				//does the key match? if it does, return the initial of the key for use in AJAX calls
				if (value[key_name].toLowerCase() === key_val.toLowerCase()) {
					index = i;
				} 
				i++;
			});
			return index;
		}

		function getIndexFromUrl(){
			
			if(typeof $routeParams.vertical === 'undefined'){
				return null;
			}

			var index = getIndexFromAnyKey($routeParams.vertical, 'param');
			if(index !== null){
				return index;
			}
			return -1;
		}

		function getIndexFromKey(val){
			return getIndexFromAnyKey(val, 'key');
		}

		

		function getPluralName(index){
			
			if(typeof verticals[index] === 'undefined'){
				return 'stores';
			}

			return verticals[index].plural;
		}
		
		
		
		function getHomeEnabled(){
			var enabled = [];
			angular.forEach(verticals, function(value, key) {
				//does the key match? if it does, return the initial of the key for use in AJAX calls
				if (value.show_home) {
					enabled.push(value);
				} 
			});
			return enabled;
		}

		function getSearchEnabled(){
			var enabled = [];
			angular.forEach(verticals, function(value, key) {
				if (value.show_search) {
					enabled.push(value);
				} 
			});
			return enabled;
		}

		function getPath(vertical_key){
			var param = null;
			angular.forEach(verticals, function(value, key) {				
				if (value.key.toLowerCase() === vertical_key.toLowerCase()) {
					param = value.param;
				} 
			});
			return param;
		}

		function currentVertical(key){
			if(typeof key !== 'undefined'){
				current = key;
			}else{
				return current;
			}
		}

		function getCurrentVerticalPath(){
			return getPath(current);
		}

		return {
			'getHomeEnabled': getHomeEnabled,
			'getSearchEnabled': getSearchEnabled,
			'getPluralName': getPluralName,
			'getIndexFromAnyKey': getIndexFromAnyKey,
			'getIndexFromUrl': getIndexFromUrl,
			'getIndexFromKey': getIndexFromKey,
			'getPath': getPath,
			'currentVertical': currentVertical,
			'getCurrentVerticalPath': getCurrentVerticalPath
		};
	});