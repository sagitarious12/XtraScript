takes "./another.xs" as Another;

Int x = 1;
Int y = 2;
String helloWorld = "hello world";

Void main => () {
  Another.log(helloWorld);
  Int added = Another.add(x, y);
  Another.log(added);
};