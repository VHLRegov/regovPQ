function evalRPN(tokens) {
    const stack = [];
    for (const token of tokens) {
      if (token === '+') {
        const operand2 = stack.pop();
        const operand1 = stack.pop();
        stack.push(operand1 + operand2);
      } else if (token === '-') {
        const operand2 = stack.pop();
        const operand1 = stack.pop();
        stack.push(operand1 - operand2);
      } else if (token === '*') {
        const operand2 = stack.pop();
        const operand1 = stack.pop();
        stack.push(operand1 * operand2);
      } else if (token === '/') {
        const operand2 = stack.pop();
        const operand1 = stack.pop();
        stack.push(parseInt(operand1 / operand2));
      } else {
        stack.push(parseInt(token));
      }
    }
    return stack.pop();
  }

const tokens1 = ["4","2","+","5","*"];
const result1 = evalRPN(tokens1);
console.log(result1); // Output: 30

const tokens2 = ["4","13","5","/","+"];
const result2 = evalRPN(tokens2);
console.log(result2); // Output: 6