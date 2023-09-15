var ClassCreation = (function () {
    function ClassCreation(value) {
        this.log = function () {
            console.log("hello");
        };
        console.log(value);
    }
    return ClassCreation;
}());
var some = new ClassCreation("hey");
some.doSomething();
some.log();
