# ProxyClass

A seemless way to organize multi inheritance.

> Caution this function uses ES6 [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance). Use [Ring.js](http://ringjs.neoname.eu/) or similar libaries, if you want an ES5 approach.

## Dependancies
- [ProxyScope](https://github.com/stephan-dum/proxyscope)

## ProxyClass(`...mixins`)
Uses a ProxyScope as `prototype` to reflects all changes to `prototype` of all `mixin`.

## ProxyClass.hasInstance(`...mixins`)
Allows the use of `instanceof` by overwriting all `Subclass[Symbols.hasInstance]`.
**Caution**: this will make instanceof more expensive.

## Examples

```javascript
class A {
    constructor() {
        this.aProp = true
    }
    get isA() {
        return true;
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

## Licence

ISC
