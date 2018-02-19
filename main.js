function ProxyInheritance(...mixins) {
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
	
	BaseClass.prototype = ScopeChain({}, ...mixins.map(function(mixin) {
		return mixin.prototype;
	}));
	
	var delegators = new Set();
		
	[BaseClass].concat(mixins).forEach(function(value) {
		if(value.delegators) {
			value.delegators.forEach(function(delegator) {
				delegators.add(delegator);
			});
		}
		
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
							BaseClass.prototype.isPrototypeOf(instance)
							//(instance instanceof BaseClass)
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
