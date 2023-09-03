(() => {
  Another={
    log: (arg) => {
      console.log(arg);
    },
    add: (a, b) => {
      return a + b
    }
  },
  main=(() => {
    let x = 1;
    let y = 2;
    let helloWorld = "hello world";
    main=(() => {
      Another.log(helloWorld);
      let added = Another.add(x, y);
      Another.log(added);
    })();
  })();
})();