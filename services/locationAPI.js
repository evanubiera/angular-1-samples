'use strict';

angular.module('dcomApp')
	//searching for and filtering merchants
	.service('LocationAPI', function(RequestBuilder, Group) {

		var LOCATION_API_ENDPOINT = '/api/customer/location';

		function get(){
			var url = LOCATION_API_ENDPOINT;
			
			if(Group.currentGroup()==='l'){
				url+="?laundry=true";
			}
			
			return RequestBuilder.getRequestPromise({
				method: 'GET',
				url: url,
				authToken : true,
			});
		}

		function create(location){
			
			var params = {
					'street'        : location.street,
					'city'          : location.city,
					'state'         : location.state,
					'zip_code'      : location.zipCode,
					'unit_number'   : location.unit,
					'company'       : location.company,
					'cross_streets' : location.crossStreet,
					'phone'         : location.phone
			};

			if(Group.currentGroup()==='l'){
				params.laundry = true;
			}

			return RequestBuilder.getRequestPromise({
				method: 'POST',
				url: LOCATION_API_ENDPOINT,
				authToken : true,
				data: params
			});
		}

		function edit(location){		
			var params = {
					'street'        : location.street,
					'city'          : location.city,
					'state'         : location.state,
					'zip_code'      : location.zipCode,
					'unit_number'   : location.unit,
					'company'       : location.company,
					'cross_streets' : location.crossStreet,
					'phone'         : location.phone
				};

			if(Group.currentGroup()==='l'){
				params.laundry = true;
			}

			return RequestBuilder.getRequestPromise({
				method: 'PUT',
				url: LOCATION_API_ENDPOINT + '/' + location.id,
				authToken : true,
				data: params
			});
		}

		function remove(locationId){
			return RequestBuilder.getRequestPromise({
				method: 'DELETE',
				url: LOCATION_API_ENDPOINT + '/' + locationId,
				authToken : true
			});
		}


		return {
			'get'    : get,
			'create' : create,
			'edit'   : edit,
			'remove' : remove
		};

	});