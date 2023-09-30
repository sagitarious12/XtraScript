Array<Int> values = [1, 2, 3];

values.map(=> (Int value) {
    printc(value);
});

for(Int i = 0; i < values.length; i++) {}

while(values.length < 10) {
    values.push(values.length - 1);
}

Date d = Date();

// some form of async await
// some form of promises