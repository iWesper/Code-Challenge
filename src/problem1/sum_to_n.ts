// Using a simple "for" loop
const sum_to_n_a = (n: number): number => {
  let sum: number = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Using the math formula
// https://www.cuemath.com/sum-of-natural-numbers-formula/
const sum_to_n_b = (n: number): number => {
  return (n * (n + 1)) / 2;
};

// Using recursion
const sum_to_n_c = (n: number): number => {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};

console.log(sum_to_n_a(5)); // 15
console.log(sum_to_n_b(5)); // 15
console.log(sum_to_n_c(5)); // 15

console.log(sum_to_n_a(10)); // 55
console.log(sum_to_n_b(10)); // 55
console.log(sum_to_n_c(10)); // 55