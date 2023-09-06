takes "./helpers/helper.xs" as Something;

Void doNothingElse => () {
    String value = Something.Concat("Hello", "World");
    Something.log(value);
};