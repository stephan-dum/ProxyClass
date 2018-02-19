function ProxyInheritance(...mixins) {
	function base(...args) {
		mixins.forEach(function(mixin) {
			var source = Reflect.construct(mixin, args, base);
			
			Reflect.ownKeys(source).forEach(function(property) {
				Object.defineProperty(
					this,
					property,
					Object.getOwnPropertyDescriptor(source, property)
				);
			}, this);
		}, this);
	}
	
	base.prototype = ScopeChain({}, ...mixins.map(function(mixin) {
		return mixin.prototype;
	}));
	
	const delegators = new Set();
		
	[base].concat(mixins).forEach(function(value) {
		for(var proto = value.prototype; proto ;proto = Object.getPrototypeOf(proto)) {
			delegators.add(proto.constructor);
		}
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
							base.prototype.isPrototypeOf(instance)
							|| oldInstanceOf.call(delegator, instance)
						);
					} else {
						return oldInstanceOf.call(this, instance);
					}
				}
			}
		);
	});
	
	return base;
}
