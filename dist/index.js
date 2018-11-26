(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@aboutweb/proxyscope')) :
	typeof define === 'function' && define.amd ? define(['@aboutweb/proxyscope'], factory) :
	(global.proxyClass = factory(global.proxyScope));
}(this, (function (proxyscope) { 'use strict';

	const isBound = /^bound .*$/i;

	const traps = {
		get(target, property, receiver) {
			let
				stack = target.stack,
				proto = Object.getPrototypeOf(target.proto),
				desc = (
					Object.getOwnPropertyDescriptor(proto || {}, property)
					|| Object.getOwnPropertyDescriptor(proto.prototype || {}, property)
				)
			;

			if(desc) {
				let {
					value,
					set,
					get
				} = desc;

				let result = value || set || get;

				if(typeof result == "function") {
					return result.bind(receiver);
				}
			}

			for(let i = 0, length = stack.length; i < length; i++) {
				let level = stack[i];
				let value = level[property];

				if(value) {
					if(typeof value == "function" && !isBound.test(value.name)) {
						return value.bind(level);
					}

					return value;
				}
			}

			return target.proto[property];
		},
		getPrototypeOf(target) {
			return Object.getPrototypeOf(target.proto);
		}
	};

	function ProxyClass(...mixins) {
		function BaseClass(...args) {
			return proxyscope.read({
				proto : this,
				stack : [
					{},
					...mixins.map((mixin) => new mixin(...args)),
				]
			}, traps);
		}

		BaseClass.prototype = proxyscope.read(
			mixins.map((mixin) => mixin.prototype)
		);

		return BaseClass;
	}

	ProxyClass.hasInstance = function(...mixins) {
		let BaseClass = ProxyClass(...mixins);
	 	let delegators = new Set([BaseClass]);

		mixins.forEach(function(value) {
			if(value.delegators) {
				value.delegators.forEach(function(delegator) {
					delegators.add(delegator);
				});
			}

			delegators.add(value.prototype.constructor);
		});

		delegators.forEach(function(delegator) {
			var oldInstanceOf = delegator[Symbol.hasInstance];

			Object.defineProperty(
				delegator,
				Symbol.hasInstance, {
					configurable : true,
					value : function(instance) {
						if(this == delegator) {
							return (
								BaseClass.prototype.isPrototypeOf(instance)
								|| oldInstanceOf.call(delegator, instance)
							);
						} else {
							return oldInstanceOf.call(this, instance);
						}
					}
				}
			);
		});

		BaseClass.delegators = delegators;

		return BaseClass;
	};

	return ProxyClass;

})));
//# sourceMappingURL=index.js.map
