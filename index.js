import { write as ProxyScope } from "@aboutweb/proxyscope";

export default function ProxyClass(...mixins) {
	function BaseClass(...args) {
		mixins.forEach(function(mixin) {
			var source = Reflect.construct(mixin, args, BaseClass);

			Reflect.ownKeys(source).forEach(function(property) {
				Object.defineProperty(
					this,
					property,
					Object.getOwnPropertyDescriptor(source, property)
				);
			}, this);
		}, this);
	}

	BaseClass.prototype = ProxyScope([
		{},
		...mixins.map((mixin) => mixin.prototype)
	]);

	return BaseClass;
}

ProxyClass.hasInstance = function(...mixins) {
	var BaseClass = ProxyClass(...mixins);

	var delegators = new Set();

	[BaseClass].concat(mixins).forEach(function(value) {
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
