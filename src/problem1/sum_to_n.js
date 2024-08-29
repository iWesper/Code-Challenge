// Using a simple "for" loop
var sum_to_n_a = function (n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};
// Using the math formula
// https://www.cuemath.com/sum-of-natural-numbers-formula/
var sum_to_n_b = function (n) {
    return (n * (n + 1)) / 2;
};
// Using recursion
var sum_to_n_c = function (n) {
    if (n <= 0)
        return 0;
    return n + sum_to_n_c(n - 1);
};
console.log(sum_to_n_a(5)); // 15
console.log(sum_to_n_b(5)); // 15
console.log(sum_to_n_c(5)); // 15
console.log(sum_to_n_a(10)); // 55
console.log(sum_to_n_b(10)); // 55
console.log(sum_to_n_c(10)); // 55
