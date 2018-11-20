var ProxyClass = require("../dist/index.js");

describe("ProxyClass", function() {

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
  });

  it("inline class", function() {
    var f = new F("fubar");

    expect(f instanceof F).toBeTruthy();
    expect(f.isF).toBeTruthy();
    expect(f.fProp).toBeTruthy();
    expect(f.someArg).toEqual("fubar");
  });
});
