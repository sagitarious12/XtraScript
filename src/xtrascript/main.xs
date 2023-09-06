takes "./helpers/helper.xs" as Helper;
takes "./another.xs" as Another;

Int x = 1;
Int y = 2;
String hello = "hello";
String world = "world";

Void main => () {
  String concatenated = Helper.Concat(hello, world);
  Helper.log(concatenated);
  Int added = Helper.add(x, y);
  Helper.log(added);
  Another.doNothingElse();
};