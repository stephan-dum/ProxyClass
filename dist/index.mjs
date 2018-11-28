import { read } from '@aboutweb/proxyscope';

function ProxyClass(...mixins) {
	function BaseClass(...args) {
		let isolated = {};
		let stack = mixins.map((mixin) => new mixin(...args));
		let proto = Object.getPrototypeOf(this);

		let proxy = read(stack, {
			get(target, property, receiver) {
				let host = this.findHost(property);
				let desc;

				if(host) {
					desc = (
						Object.getOwnPropertyDescriptor(host, property)
						|| Object.getOwnPropertyDescriptor(Object.getPrototypeOf(host), property)
					);
				} else {
					host = receiver;

					desc = (
						Object.getOwnPropertyDescriptor(proto, property)
						|| Object.getOwnPropertyDescriptor(Object.getPrototypeOf(proto), property)
					);
				}

				if(desc) {
					let { value, get } = desc;

					if(value) {
						if(typeof value == "function") {
							return value.bind(host);
						}

						return value;
					}

					if(get) {
						return get.call(host);
					}
				}
			},
			set(target, property, value) {
				return Reflect.set(isolated, property, value);
			},
			getPrototypeOf(target) {
				return proto;
			}
		});

		stack.unshift(isolated);

		return proxy;
	}

	BaseClass.prototype = read(
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
						/*return (
							mixins.some((mixin) => mixin.prototype.isPrototypeOf(instance))
							|| oldInstanceOf.call(delegator, instance)
						);*/

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

/*
function() {
	function BaseClass(...args) {
		//let instance = {};
		let stack = mixins.map((mixin) => new mixin(...args));

		let superProperty = (property) => {
			for(let i = 0, length = stack.length; i < length; i++) {
				let level = stack[i];

				if(property in level) {
					let value = level[property];

					if(typeof value == "function" && !isBound.test(value.name)) {
						return value.bind(level);
					}

					return value;
				}
			}
		}

		let proto = Object.getPrototypeOf(this);

		Object.setPrototypeOf(this, proxyRead(
			proto,
			{
				get(target, property) {
					console.log("super get", property)
					return superProperty(property);
				},
				getPrototypeOf() {
					return proto;
				}
			}
		));



		let proxy = proxyRead(stack, {
			get(target, property, receiver) {




				let desc = Reflect.getOwnPropertyDescriptor(proto, property);

				if(!desc) {
					let sub = Reflect.getPrototypeOf(proto);

					if(sub) {
						desc = Reflect.getOwnPropertyDescriptor(sub, property);
					}
				}


				if(desc) {
					let { value, get } = desc;

					if(value && typeof value == "function") {
						return value.bind(receiver);
					}

					if(get && typeof get) {
						return get.call(receiver);
					}
				}

				return superProperty(property);
			},
			set(target, property, value) {
				return Reflect.set(instance, property, value);
			},
			getPrototypeOf(target) {
				return proto;
			}
		});

		//stack.unshift(instance);

		return proxy;
	}

	BaseClass.prototype = proxyRead(
		mixins.map((mixin) => Object.create(mixin.prototype)),
		{
			get(target, property) {
				console.log("super get", property)
				//return superProperty(property);
			},
			getPrototypeOf() {
				console.log("getproto")

			}
		}

	);

	return BaseClass;


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
}
*/

export default ProxyClass;
//# sourceMappingURL=index.mjs.map
