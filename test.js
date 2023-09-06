(() => {
  "use strict";
  const Another={
    log:(arg) => {
      console.log(arg);
    },
    add:(a, b) => {
      return a + b;
    }
  };
  let x = 1;
  let y = 2;
  let helloWorld = "hello world";
  (() => {
    Another.log(helloWorld);
    let added = Another.add(x, y);
    Another.log(added);
  })();
})();