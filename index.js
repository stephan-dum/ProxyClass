import {
	read as proxyRead
} from "@aboutweb/proxyscope";

const isBound = /^bound .*$/i;

export default function ProxyClass(...mixins) {
	function BaseClass(...args) {
		let instance = {};
		let stack = mixins.map((mixin) => new mixin(...args));
		let proto = Object.getPrototypeOf(this);

		let proxy = proxyRead(stack, {
			get(target, property, receiver) {
				let desc = (
					Object.getOwnPropertyDescriptor(proto, property)
					|| Object.getOwnPropertyDescriptor(proto.prototype || {}, property)
				);

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

				return target[property];
			},
			set(target, property, value) {
				return Reflect.set(instance, property, value);
			},
			getPrototypeOf(target) {
				return proto;
			}
		});

		stack.unshift(instance);

		return proxy;
	}

	BaseClass.prototype = proxyRead(
		mixins.map((mixin) => Object.create(mixin.prototype))
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
}
