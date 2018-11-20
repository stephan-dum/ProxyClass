var ProxyClass = require("../dist/index.js");

describe("ProxyClass", function() {

  class A {
    constructor() {
      this.aProp = true
      this.shared = "sharedA";
    }
    get isA() {
      return true;
    }
    get deepA() {
      return this.shared;
    }
    deepAFn() {
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
        this.shared = "sharedE";
        this.eProp = true;
    }
    get isE() { return true; }
  };

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
  var f = new F("fubar");

  it("should be instance of Object", function() {
    expect(e instanceof Object).toBeTruthy();
  });

  it("proxy prototype", function() {
    expect(e instanceof A).toBeTruthy();
    expect(e.isA).toBeTruthy();

    expect(e instanceof B).toBeTruthy();
    expect(e.isB).toBeTruthy();
  });

  it("deep proxy prototype", function() {
    expect(e instanceof C).toBeTruthy();
    expect(e.isC).toBeTruthy();
    expect(e instanceof D).toBeTruthy();
    expect(e.isD).toBeTruthy();
    expect(e instanceof E).toBeTruthy();
    expect(e.isE).toBeTruthy();
  });

  it("constructor properties", function() {
    expect(e.aProp).toBeTruthy();
    expect(e.eProp).toBeTruthy();
    expect(e.shared).toEqual("sharedE");
  });

  it("inline class", function() {
    expect(f instanceof F).toBeTruthy();
    expect(f.isF).toBeTruthy();
    expect(f.fProp).toBeTruthy();
    expect(f.someArg).toEqual("fubar");
  });

  it("isoliation", function() {
    expect(e.shared).toEqual("sharedE");

    expect(e.deepA).toEqual("sharedA");
    expect(e.deepAFn()).toEqual("sharedA");
  });

  it("native array", function() {
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
    });

    ae.push("last");
    input.push("last");

    expect(ae instanceof ArrayEmitter).toBeTruthy();
    expect(ae instanceof Array).toBeTruthy();
    expect(ae instanceof EventEmitter).toBeTruthy();

    ae.forEach((element, i) => {
      expect(input[i]).toEqual(element);
    });
  })
});
