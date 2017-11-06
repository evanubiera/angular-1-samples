'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('MerchantSearch', function MerchantSearch($q, $rootScope, $location, SearchAPI, SearchLocation) {
		var activeCuisineFilters = [],
			merchantsBySeoTag = [],
		    activeFilterText = '',
		    activeSort = 'rating',
		    activeVertical = 0, //Restaurant
		    cachedSearchResults = {
		        'query': '',
		        'data': {},
		        'timeRetrieved': Date.create(0)
		    },
		    seoSearch = false;

		function search(addressQuery, orderTime) {
			var searchDeferred = $q.defer();
			
			if ((typeof orderTime === 'undefined') && (addressQuery === cachedSearchResults.query && Date.create() < (10).minutesAfter(cachedSearchResults.timeRetrieved))) {
				// if query is the same as before and search results were last retrieved less than 10 minutes ago
				// resolve using the cached results
				searchDeferred.resolve(cachedSearchResults.data);
			} else {
				// if the query has changed or cache is more than 10 minutes old resolve using the result of api call
				SearchAPI.searchByAddress(addressQuery)
				.then(function(data) {
					// if update is due to changed query, reset filters
					if (addressQuery !== cachedSearchResults.query) {
						resetFilters();
					}
					// if search response contains results update search query and save address info to cookies
					if (data.merchants) {					
						if (typeof data.search_address.zip === 'undefined') {
							//standardize name of field
							data.search_address.zip = data.search_address.zip_code;
						}
						cookies(data.search_address);
						// update cached results
						cachedSearchResults = {
							'query': data.search_address.street + ', ' + data.search_address.zip_code,
							'data': data,
							'timeRetrieved': Date.create()
						};
						$rootScope.search = $rootScope.search || {};
						$rootScope.search.query = cachedSearchResults.query;
					}
					// resolve the promise with results
					searchDeferred.resolve(data);				

				},function(messages) {
					// temporary re-encapsulation to avoid views to break
					// for now
					searchDeferred.reject({message : messages});
				});
			}
			seoSearch = false;			
			return searchDeferred.promise;
		}
		
		//may return a key value, or a value of false
		function isVertical(str) {
			var match = false;
			//list of currently supported verticals to compare URL vars against
			var verticals = [
			{
				'name': 'restaurant',
				'key': 'R'
			},
			{
				'name': 'bakery',
				'key': 'B'
			},
			{
				'name': 'butcher',
				'key': 'T'
			},
			{
				'name': 'health-beauty',
				'key': 'H'
			},
			{
				'name': 'wine-liquor',
				'key': 'W'
			}];
			
			angular.forEach(verticals, function(value, key) {
				//does the key match? if it does, return the initial of the key for use in AJAX calls
				if (value.name === str) {
					match = value.key;
				} 
			});
			return match;
		}
		/* 
		used for SEO pages. can be by cuisine or by city
		parses out possible SEO tags from the URL based on structures set by marketing here:
		The following URL structures are supported:
			/(city)/(cuisine)/neighborhood/(neighborhood)
			/(city)/(cuisine)
			/(city)/neighborhood/(neighborhood)
			/(city)/(vertical)
		*/
		function searchBySeoTag(seoTags) {			
			return SearchAPI.searchByTags('city', seoTags);
		}
		
		function showSeoSearch() {
			return seoSearch;
		}
		
		function cuisineFilters(cuisinesArray) {
			if (typeof cuisinesArray !== 'undefined') {
				activeCuisineFilters = cuisinesArray;
			}
			return activeCuisineFilters;
		}
		function filterText(text) {
			if (typeof text === 'undefined') {
				return activeFilterText;
			} else {
				activeFilterText = text;
			}
		}
		function cookies(addressObj) {
			if (typeof addressObj === 'undefined') {
				return SearchLocation.get();
			} else {
				var location  = {
					'query'     : addressObj.street + ', ' + addressObj.zip,
					'latitude'  : addressObj.latitude.toString(),
					'longitude' : addressObj.longitude.toString(),
					'street'    : addressObj.street,
					'city'      : addressObj.city,
					'state'     : addressObj.state,
					'zip'       : addressObj.zip
				};

				SearchLocation.set(location, 365);

			}
		}
		function resetFilters() {
			activeCuisineFilters = [];
		    activeFilterText = '';
		    activeSort = 'rating';
		    activeVertical = 0; //Restaurant
		}
		function sortBy(sortField) {
			if (typeof sortField === 'undefined') {
				return activeSort;
			} else {
				activeSort = sortField;
			}
		}
		function vertical(verticalIndex) {
			if (typeof verticalIndex === 'undefined') {
				return activeVertical;
			} else {
				activeVertical = verticalIndex;
			}
		}

		return {
			// takes search query and returns promise either resolving with cached results or
			// performing search, resolving or rejecting, and caching results
			'search': search,
			// performing search, resolving or rejecting, and caching results
			'showSeoSearch': showSeoSearch,
			//check if a vertical is supported. used in SEO tag detection in the URL
			'isVertical': isVertical,
			//pass in an SEO page tag and get related results
			'searchBySeoTag': searchBySeoTag,
			// gets/sets array of active cuisine names
			'cuisineFilters': cuisineFilters,
			// gets/sets search filter text
			'filterText': filterText,
			// resets filters and sort to default
			'resetFilters': resetFilters,
			// gets/sets sort field name
			'sortBy': sortBy,
			// gets/sets active vertical index
			'vertical': vertical
		};
	});