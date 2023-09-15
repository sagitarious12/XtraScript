const value = 9;
if (value < 10) {
    Promise.resolve().then(() => require('./another')).then((Another) => {
        console.log(Another.test);
    });
}
else {
    Promise.resolve().then(() => require('./somethingElse')).then((something) => {
        console.log(something.test2);
    });
}
