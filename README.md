# ProxyClass

A seemless way to organize multi inheritance.

> Caution this function uses ES6 [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance). Use [Ring.js](http://ringjs.neoname.eu/) or similar libaries, if you want an ES5 approach.



You should always prefer other patterns like decorators or annotions if you can, because javascript does not support this for good reasons:

  * must have the same arguments signiture
  * hard to isolate instances
  * overhead

## ProxyClass(`...mixins`)
Uses a ProxyScope as `prototype` to reflects all changes to `prototype` of all `mixin`.

## ProxyClass.hasInstance(`...mixins`)
Allows the use of `instanceof` by overwriting all `Subclass[Symbols.hasInstance]`.
**Caution**: this will make instanceof more expensive.

## Examples

```javascript
const EventEmitter = require('events');
const listen = ["on", "once"];

class ArrayEmitter extends ProxyClass.hasInstance(Array, EventEmitter) {
	constructor(options) {
		let { data } = options;

		super(...data);

		listen.forEach((property) => {
			let type = options[property];

			if(type) {
				for(let event in type) {
					let listeners = type[event];

					if(!Array.isArray(listeners)) {
						listeners = [listeners];
					}

					listeners.forEach((listener) => {
						this[property](event, listener)
					});

				}
			}
		});

		this.emit("push", data);
	}
	push(...args) {
		super.push(...args);
		this.emit("push", args);
	}
}

let input = ["fubar", "haha"];

let ae = new ArrayEmitter({
	data : input,
	on : {
		push(...args) {
			console.log("every push", args);
		}
	},
	once : {
		push(...args) {
			console.log("inital push", args);
		}
	}
});

ae.push("last");

//will be true
na instanceof ArrayEmitter;
na instanceof Array;
na instanceof EventEmitter;


```




```javascript
class A {
    constructor() {
        this.aProp = true;
				this.shared = "sharedA";
    }
    get isA() {
        return true;
    }
		get sharedA() {
			return this.shared;
		}
		sharedAFn() {
			return this.shared;
		}
}

class B { get isB() { return true; } }

class C extends ProxyClass.hasInstance(A, B) {
    get isC() { return true; }
}

class D {
    get isD() { return true; }
}

class E extends ProxyClass.hasInstance(C, D) {
    constructor() {
        super();

        this.eProp = true;
    }
    get isE() { return true; }
};

//You can also inline your class

var F = ProxyClass.hasInstance(class {
    constructor(someArg) {
        this.someArg = someArg;
        this.fProp = true;
    }
    get isF() {
        return true;
    }
}, E);


var e = new E();

//all of this will return true
e instanceof Object;
e instanceof A;
e instanceof B;
e instanceof C;
e instanceof D;
e instanceof E;

e.isA;
e.isB;
e.isC;
e.isD;
e.isE;
e.aProp;
e.eProp;

var f = new F("fubar");

//same as e plus
f instanceof F;
f.isF;
f.fProp;
f.someArg == "fubar";

```
## Isolation

All class member function will get called with their own isolated context.

```javascript

	expect(e.shared).toEqual("sharedE");
	expect(e.sharedA).toEqual("sharedA");
	expect(e.sharedAFn()).toEqual("sharedA");

```

## Dependancies
- [ProxyScope](https://github.com/stephan-dum/proxyscope)


## Licence

ISC
