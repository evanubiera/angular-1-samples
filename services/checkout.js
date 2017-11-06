'use strict';

angular.module('dcomApp')
	.service('Checkout', function Checkout($rootScope, $q, Carts, CheckoutAPI, $window) {
        $window.dataLayer = $window.dataLayer || [];
		var checkouts = {};


		function getCheckoutInfo(merchant){

			var activeCheckout           = checkouts[merchant];
			var checkoutInfo             = {};
			checkoutInfo.adjustments     = [];
			checkoutInfo.payments        = [];
			checkoutInfo.tip             = null;
			checkoutInfo.paymentDiscount = null;

			if(!hasActiveCheckout(merchant)){
				return checkoutInfo;
			}
			
			var availablePayments  = activeCheckout.availablePayments,
				selectedPayments   = activeCheckout.payments;

			var cartInfo = Carts.getInfo(merchant);
			checkoutInfo.checkoutTotal = cartInfo.total;
			angular.forEach(cartInfo.fees, function(fee){
				checkoutInfo.checkoutTotal += fee.value;
			});

			if(typeof selectedPayments.mainPayment === 'undefined'){
				return checkoutInfo;
			}

			if(typeof availablePayments === 'undefined'){
				return checkoutInfo;
			}

			checkoutInfo.payments = getPaymentTypes(merchant, selectedPayments);
			checkoutInfo.phone = activeCheckout.phone;
			checkoutInfo.addressUnit = activeCheckout.addressUnit;
			checkoutInfo.specialInstructions = activeCheckout.specialInstructions;
			
			if(isCashPayment(checkoutInfo.payments)){
				// If it's cash payment, total must be recalculated as:
				// Subtotal + taxes and then we must add fees (if they are).
				
				checkoutInfo.checkoutTotal = cartInfo.subtotal + cartInfo.tax;
				
				angular.forEach(cartInfo.fees, function(fee){
					checkoutInfo.checkoutTotal += fee.value;
				});

				return checkoutInfo;
			}

			checkoutInfo.adjustments = getAdjustments(selectedPayments, activeCheckout);
			checkoutInfo.tip = activeCheckout.tip;
			checkoutInfo.paymentDiscount = checkoutInfo.adjustments.reduce(function(discount, adjustment){
					return discount + adjustment.amount;
			}, 0);

			if(typeof cartInfo.total === 'undefined'){
				return checkoutInfo;
			}

			var parsedTip = parseFloat(checkoutInfo.tip);
				checkoutInfo.tip = isNaN(parsedTip) ? 0 : parsedTip;
				checkoutInfo.tipPercent = calculateTipPercent(checkoutInfo.tip, cartInfo.subtotal);

			var checkoutTotal = cartInfo.total - checkoutInfo.paymentDiscount + checkoutInfo.tip;
			checkoutInfo.checkoutTotal = checkoutTotal > 0 ? checkoutTotal : 0;

			return checkoutInfo;
		}

		function calculateTipPercent(tip, subtotal){
			var percent = 100 * tip / subtotal;
			percent = isNaN(percent) ? 0 : percent.toFixed(0);
			return percent;
		}

		function hasActiveCheckout(merchant){
			return typeof checkouts[merchant] !== 'undefined';
		}

		function getLastOrder(merchant) {
			var activeCheckout = checkouts[merchant];

			if(!hasActiveCheckout(merchant)){
				return null;
			}

			return checkouts[merchant].lastOrderPlaced;
		}

		function setTip(merchant, amount){
			if(!hasActiveCheckout(merchant)){
				return;
			}

			checkouts[merchant].tip = amount;
			broadcastChange();
		}

		function setAddressUnit(merchant, addressUnit){
			if(!hasActiveCheckout(merchant)){
				return;
			}
			checkouts[merchant].addressUnit = addressUnit;
			broadcastChange();
		}

		function setSpecialInstructions(merchant, instructions){
			if(!hasActiveCheckout(merchant)){
				return;
			}
			checkouts[merchant].specialInstructions = instructions;
			broadcastChange();
		}

		function setPhone(merchant, phone){
			if(!hasActiveCheckout(merchant)){
				return;
			}
			checkouts[merchant].phone = phone;
			broadcastChange();
		}


		function getPaymentMethods(merchant){
			if(!hasActiveCheckout(merchant)){
				return $q.reject();
			}

			return CheckoutAPI.getPaymentInfo(merchant)
			.then(function(availablePayments){
				checkouts[merchant].availablePayments = availablePayments;
				return availablePayments;
			});
		}

		function broadcastChange(){
			$rootScope.$broadcast('CheckoutChange');
		}

		function isCashPayment(payments){
			return payments.filter(function(payment){
				return payment.type === 'cash';
			}).length > 0;
		}

		function getPaymentTypes(merchant, selectedPayments){
			var payments = [];

			if(selectedPayments.mainPayment.type === 'cash'){
				payments.push({type : 'cash'});
				return payments;
			} else {
				var usedCard = getCreditCardWithId(merchant, selectedPayments.mainPayment.id);
				if(usedCard === null){
					payments.push({type : 'credit_card'});
				} else {
					payments.push({type : 'credit_card', id : usedCard.id});
				}
			}

			if (selectedPayments.promo) {
				payments.push({
					'type': 'promo',
					'id': selectedPayments.promo
				});
			}

			angular.forEach(selectedPayments.creditBalances, function(value, key) {
				if (value) {
					payments.push({
						'type': 'credit_balance',
						'id': key
					});
				}
			});

			angular.forEach(selectedPayments.giftCodes, function(value, key) {
				if (value) {
					payments.push({
						'type': 'gift_code',
						'id': key
					});
				}
			});

			return payments;
		}

		function getAdjustments(selectedPayments, checkoutData){
			var adjustments = [];
			var availablePayments = checkoutData.availablePayments;

			var giftCardAdjustments = getGiftCardAdjustments(selectedPayments.giftCodes, checkoutData.availablePayments.gift_code);
			if(giftCardAdjustments !== null){
				adjustments.push(giftCardAdjustments);
			}

			var creditBalanceAdjustments = getCreditBalanceAdjustments(selectedPayments.creditBalances, availablePayments.credit_balance);
			if(creditBalanceAdjustments !== null){
				adjustments.push(creditBalanceAdjustments);
			}

			var promoAdjustments = getPromoAdjustments(selectedPayments.promo, checkoutData);
			if(promoAdjustments !== null){
				adjustments.push(promoAdjustments);
			}

			return adjustments;
		}

		function getGiftCardAdjustments(selectedGiftCards, availableGiftCards){
			var giftCardAmount = 0;
			angular.forEach(selectedGiftCards, function(value, key) {
				if (value) {
					for (var i=0; i<availableGiftCards.length; i++) {
						if (key === availableGiftCards[i].id) {
							giftCardAmount += availableGiftCards[i].value;
							break;
						}
					}
				}
			});
			if (giftCardAmount > 0) {
				return {'name': 'Gift codes:', 'amount': giftCardAmount};
			}
			return null;
		}

		function getCreditBalanceAdjustments(selectedCreditBalances, availableCreditBalances){

			var creditBalanceAmount = 0;
			angular.forEach(selectedCreditBalances, function(value, key) {
				if (value) {
					for (var i=0; i<availableCreditBalances.length; i++) {
						if (key === availableCreditBalances[i].id) {
							creditBalanceAmount += availableCreditBalances[i].value;
							break;
						}
					}
				}
			});
			if (creditBalanceAmount > 0) {
				return {'name': 'Account credits', 'amount': creditBalanceAmount};
			}
			return null;
		}

		function getPromoAdjustments(selectedPromo, checkoutData){
			var availablePromos = checkoutData.availablePayments.promo;

			if(typeof availablePromos === 'undefined'){
				return null;
			}


			var promo = availablePromos.filter(function(availablePromo){
				return selectedPromo === availablePromo.id;
			});
			promo = promo[0];

			if(!selectedPromo){
				return null;
			}

			if (promo.reward === 'dollar_off') {
				return {'name': promo.name, 'amount': promo.value};
			} else if (promo.reward === 'percent_off') {
				return {'name': promo.name, 'amount': (promo.value / 100) * Carts.getInfo(checkoutData.merchant).subtotal};
			} else {
				return {'name' : promo.name, 'amount' : 0};
			}

		}

		function getMainPaymentType(merchant) {
			return checkouts[merchant].payments.mainPayment.type;
		}

		function getCreditCardWithId(merchant, creditCardId){
			var availablePayments = checkouts[merchant].availablePayments;

			for (var i=0; i<availablePayments.credit_card.length; i++) {
				if (creditCardId === availablePayments.credit_card[i].id) {
					return availablePayments.credit_card[i];
				}
			}

			return null;
		}

		function setPaymentMethods(merchant, payments) {
			if(!hasActiveCheckout(merchant)){
				return;
			}

			var activeCheckout = checkouts[merchant];
			activeCheckout.payments = payments;
			broadcastChange();
		}

		function initializeCheckout(merchant){
			checkouts[merchant] = checkouts[merchant] ||
			{
				merchant        : merchant,
				lastOrderPlaced : null
			};
		}

		function sendOrderInfo(order){

			var totalFees = order.cartInfo.fees.reduce(function(previousFee, currentFee){
				return previousFee + currentFee;
			}, 0);

			var totalMinusTaxesAndFees = order.cartInfo.total - order.cartInfo.tax - totalFees;
			if (totalMinusTaxesAndFees < 0) {
				totalMinusTaxesAndFees = 0;
			}

			var trackCartItems = [];
			angular.forEach(order.cartItems, function(item){
				trackCartItems.push({
					'sku': item.id,
					'name': item.name,
					'price': item.price,
					'quantity': item.quantity
				});
			});
			trackCartItems.push({
				'sku': 'DISCOUNT',
				'name': 'Discount',
				'price': -order.cartInfo.discount,
				'quantity': 1
			});
			trackCartItems.push({
				'sku': 'TIP',
				'name': 'Tip',
				'price': order.tip,
				'quantity': 1
			});
			angular.forEach(order.checkoutInfo.adjustments, function(adjustment){
				trackCartItems.push({
					'sku': adjustment.name,
					'name': adjustment.name,
					'price': -adjustment.amount,
					'quantity': 1
				});
			});

			$window.dataLayer.push({
				'transactionId': order.orderId,
				'transactionAffiliation': order.merchant_id,
				'transactionTotal': totalMinusTaxesAndFees,
				'transactionTax': order.cartInfo.tax,
				'transactionShipping': totalFees,
				'transactionProducts': trackCartItems,
				'event': 'transactionComplete'
			});
			window.optimizely = window.optimizely || [];
			window.optimizely.push(['trackEvent', 'orderPlaced', {'revenue': order.cartInfo.total * 100}]);

		}

		function checkout(merchant, orderDetails){
			if(!hasActiveCheckout(merchant)){
				return $q.reject();
			}

			var activeCheckout = checkouts[merchant];
			var cartInfo = Carts.getInfo(merchant);

			orderDetails.merchant_id  = merchant;
			orderDetails.checkoutInfo = getCheckoutInfo(merchant);
			orderDetails.cartInfo     = Carts.getInfo(merchant);
			orderDetails.cartItems    = Carts.getItems(merchant);
			orderDetails.payments     = getCheckoutInfo(merchant).payments;

			if(orderDetails.tip !== null){
				orderDetails.tip = activeCheckout.tip;
			}
			return CheckoutAPI.checkout(merchant, orderDetails)
			.then(function(data){
				var lastOrderPlaced = orderDetails;
				lastOrderPlaced.order_id = data.order_id;
				lastOrderPlaced.delivery_points = data.delivery_points;
				activeCheckout.lastOrderPlaced = lastOrderPlaced;

				return lastOrderPlaced;
			}).then(function(order){
				sendOrderInfo(order);
				return order;
			});
		}

		return {
			'checkout' : checkout,
			'getCheckoutInfo' : getCheckoutInfo,
			'getLastOrder': getLastOrder,
			'getPaymentMethods': getPaymentMethods,
			'initializeCheckout' : initializeCheckout,
			'setPaymentMethods': setPaymentMethods,
			'setTip' : setTip,
			'setSpecialInstructions' : setSpecialInstructions,
			'setAddressUnit' : setAddressUnit,
			'setPhone' : setPhone
		};
	})

.service('CheckoutProvider', function(Checkout){

	function CheckoutInterface(merchant){

		this.setAddressUnit = function(address){
			return Checkout.setAddressUnit(merchant, address);
		};

		this.setSpecialInstructions = function(instructions){
			return Checkout.setSpecialInstructions(merchant, instructions);
		};

		this.setTip = function(tip){
			return Checkout.setTip(merchant, tip);
		};

		this.setPhone = function(phone){
			return Checkout.setPhone(merchant, phone);
		};

		this.getPaymentMethods = function(){
			return Checkout.getPaymentMethods(merchant);
		};

		this.setPaymentMethods = function(payments){
			return Checkout.setPaymentMethods(merchant, payments);
		};

		this.getCheckoutInfo = function(){
			return Checkout.getCheckoutInfo(merchant);
		};

		this.checkout = function(orderDetails){
			return Checkout.checkout(merchant, orderDetails);
		};

		this.getLastOrder = function(){
			return Checkout.getLastOrder(merchant);
		};

	}

	function get(merchant){
		Checkout.initializeCheckout(merchant);
		return new CheckoutInterface(merchant);
	}

	return {
		"get" : get
	};

});
