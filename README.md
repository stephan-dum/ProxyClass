# ProxyInheritance
	
A seemless way for organizing multi inheritance.
	
> Caution this function uses ES6 [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)
	
## Dependancies
- [ScopeChain](https://github.com/stephan-dum/scopeChain)
	
## Key Features
- Reflects all changes to the prototypes even after mixin took place
- Use `instanceof` on multi classes
	
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

class C extends ProxyInheritance(A, B) {
    get isC() { return true; }
}

class D {
    get isD() { return true; }
}

class E extends ProxyInheritance(C, D) {
    constructor() {
        super();

        this.dProp = true;
    }
    get isE() { return true; }
};

//You can also inline your class

var F = ProxyInheritance(class {
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
e.dProp;

var f = new F("fubar");

//same as e plus 
f instanceof F;
f.isF;
f.fProp;
f.someArg == "fubar";

```
