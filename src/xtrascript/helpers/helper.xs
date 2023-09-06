takes "./helpers/secondary.xs" as Secondary;

String Concat => (String a, String b) {
  return a + " " + b;
};

Void log => (Any arg) {
  printc(arg);
};

Int add => (Int a, Int b) {
  return a + b;
};