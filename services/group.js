'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('Group', function Group($q, $rootScope, $routeParams) {









		var groups = [
							{
								'name':'Food',
								'SEOname' : 'Restaurants',
								'key':'f',
								'categories':['Restaurant','Catering'],
								'param':'',
								'verticals': ['restaurant','caterer'],
								'show_search':true,
								'show_home':true,
								'show_futureOrdering':true,
								'order':1,
								'searchTemplate' : 'food-result.html',
								'filters':[
									'single',
									'cuisines',
									'categories',
									'rating',
									'minimums'
								]
							},
							{
								'name':'Booze',
								'SEOname' : 'Wine & Liquor stores',
								'key':'b',
								'categories':['Wine and Liquor','Beer','Tobacco'],
								'param':'booze',
								'verticals':['wine-and-liquor-store','tobacco-shop'],
								'show_search':true,
								'show_home':true,
								'show_futureOrdering':true,
								'order':2,
								'searchTemplate' : 'food-result.html',
								'filters':[
									'single',
									'categories',
									'rating',
									'minimums'
								]
							},
							{
								'name':'Groceries',
								'SEOname' : 'Grocery stores',
								'key':'g',
								'categories':['Grocery', 'Butcher Shop', 'Tobacco'],
								'param':'groceries',
								'verticals':['grocery-store','butcher-shop'],
								'show_search':true,
								'show_home':true,
								'show_futureOrdering':true,
								'order':3,
								'searchTemplate' : 'food-result.html',
								'filters':[
									'single',
									'categories',
									'rating',
									'minimums'
								]
							},
							{
								'name':'Laundry',
								'SEOname' : 'Laundry stores',
								'key':'l',
								'categories':['Wash & fold','Dry cleaning','Tailoring'],
								'param':'laundry',
								'verticals':['cleaner'],
								'show_search':true,
								'show_home':true,
								'show_futureOrdering':false,
								'order':4,
								'searchTemplate' : 'laundry-result.html',
								'sort':[
									{
										'key': 'pickup',
										'displayName': 'pickup time',
										'activeText': 'pickup',
										'sortField': 'pickup'
									}
								],
								'filters':[
									'single',
									'categories',
									'rating',
									'minimums'
								],

							},
							{
								'name':'Pet Supplies',
								'SEOname' : 'Pet supplies stores',
								'key':'p',
								'categories':['Pet Supplies'],
								'param':'pet-supplies',
								'verticals':['pet-store'],
								'show_search':false,
								'show_home':false,
								'show_futureOrdering':true,
								'order':5,
								'searchTemplate' : 'food-result.html',
								'filters':[]
							},
							{
								'name':'Household',
								'key':'h',
								'categories':['Home Essentials','Health and Beauty','Office Supply'],
								'param':'household',
								'verticals':['household','health-and-beauty-store','office-supply', 'florist'],
								'show_search':false,
								'show_home':false,
								'show_futureOrdering':true,
								'order':6,
								'searchTemplate' : 'food-result.html',
								'filters':[]
							}
							];


		var current = null;

		function getIndexFromAnyKey(key_val, key_name){

			var i=0,
			index = null;

			angular.forEach(groups, function(value, key) {
				//does the key match? if it does, return the initial of the key for use in AJAX calls
				if (value[key_name].toLowerCase() === key_val.toLowerCase()) {
					index = i;
				}
				i++;
			});
			return index;
		}

		function getGroupFromAnyKey(key_val, key_name){
			var group = null;
			angular.forEach(groups, function(value, key) {
				//does the key match? if it does, return the initial of the key for use in AJAX calls
				if (value[key_name].toLowerCase() === key_val.toLowerCase()) {
					group =  value;
				}
			});

			return group;
		}

		function getGroupFromUrl(){
			if(typeof $routeParams.group === 'undefined'){
				//Default category food (no param extra in the url)
				return getGroupFromAnyKey('', 'param');
			}
			return getGroupFromAnyKey($routeParams.group, 'param');
		}

		function getIndexFromUrl(){

			if(typeof $routeParams.group === 'undefined'){
				return null;
			}

			var index = getIndexFromAnyKey($routeParams.group, 'param');
			if(index !== null){
				return index;
			}
			return -1;
		}

		function getIndexFromKey(val){
			return getIndexFromAnyKey(val, 'key');
		}

		function getHomeEnabled(){
			var enabled = [];
			angular.forEach(groups, function(value, key) {
				//does the key match? if it does, return the initial of the key for use in AJAX calls
				if (value.show_home) {
					enabled.push(value);
				}
			});
			return enabled;
		}

		function getSearchEnabled(){
			var enabled = [];
			angular.forEach(groups, function(value, key) {
				if (value.show_search) {
					enabled.push(value);
				}
			});
			return enabled;
		}

		function getPath(group_key){
			var param = null;
			angular.forEach(groups, function(value, key) {
				if (value.key.toLowerCase() === group_key.toLowerCase()) {
					param = value.param;
				}
			});
			return param;
		}

		function currentGroup(key){
			if(typeof key !== 'undefined'){
				current = key;
			}else{
				if(current !== null){
					return current;
				}
			}
			return null;
		}

		function getCurrentGroupPath(){
			if(current === null ){
				return '';
			}
			return getPath(current);
		}

		function getFromCategory(category_name){
			var ret = [];
			for(var i=0; i < groups.length; i++){
				if (groups[i].categories.indexOf(category_name)!== -1) {
					ret.push(groups[i]);
				}
			}
			if(ret.length > 0){
				return ret;
			}
			return null;
		}

		function loadFromVerticalUrl(){
			if(typeof $routeParams.vertical === 'undefined'){
				return null;
			}

			var ret = [];
			for(var i=0; i < groups.length; i++){
				if (groups[i].verticals.indexOf($routeParams.vertical)!== -1) {
					current = groups[i].key;
					return current;
				}
			}

			return null;
		}

		function order(a,b) {
			if (a.order < b.order){
				return -1;
			}else if (a.order > b.order){
				return 1;
			}
			return 0;
		}

		function sortByOrder(groups){
			return groups.sort(order);
		}

		return {
			'getHomeEnabled': getHomeEnabled,
			'getSearchEnabled': getSearchEnabled,
			'getIndexFromAnyKey': getIndexFromAnyKey,
			'getIndexFromUrl': getIndexFromUrl,
			'getIndexFromKey': getIndexFromKey,
			'getPath': getPath,
			'currentGroup': currentGroup,
			'getGroupFromAnyKey': getGroupFromAnyKey,
			'getGroupFromUrl': getGroupFromUrl,
			'loadFromVerticalUrl': loadFromVerticalUrl,
			'getCurrentGroupPath': getCurrentGroupPath,
			'getFromCategory': getFromCategory,
			'sortByOrder': sortByOrder
		};
	});
