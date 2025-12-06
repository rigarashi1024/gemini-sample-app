// Test file for GitHub MCP demo
const testFunction = () => {
  console.log('Hello, this is a test file!');
  return 'Test successful';
};

// Additional test function for demonstration
const testWithParameter = (name) => {
  console.log(`Hello, ${name}! This is a parameterized test.`);
  return `Test successful for ${name}`;
};

// Test case: Addition function
const testAddition = (a, b) => {
  const result = a + b;
  console.log(`${a} + ${b} = ${result}`);
  return result;
};

// Test case: Array operations
const testArrayOperations = (arr) => {
  const doubled = arr.map(x => x * 2);
  const sum = arr.reduce((acc, val) => acc + val, 0);
  console.log(`Original: [${arr}], Doubled: [${doubled}], Sum: ${sum}`);
  return { doubled, sum };
};

// Test case: Object manipulation
const testObjectManipulation = (obj) => {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  console.log(`Keys: [${keys}], Values: [${values}]`);
  return { keys, values, count: keys.length };
};

// Test case: String operations
const testStringOperations = (str) => {
  const uppercase = str.toUpperCase();
  const lowercase = str.toLowerCase();
  const reversed = str.split('').reverse().join('');
  const length = str.length;
  console.log(`Original: "${str}", Upper: "${uppercase}", Lower: "${lowercase}", Reversed: "${reversed}", Length: ${length}`);
  return { uppercase, lowercase, reversed, length };
};

// Test case: Async operation simulation
const testAsyncOperation = async (delay = 1000) => {
  console.log(`Starting async operation with ${delay}ms delay...`);
  await new Promise(resolve => setTimeout(resolve, delay));
  console.log('Async operation completed!');
  return `Completed after ${delay}ms`;
};

// Test case: Error handling
const testErrorHandling = (shouldThrow = false) => {
  try {
    if (shouldThrow) {
      throw new Error('Intentional error for testing');
    }
    console.log('No error thrown');
    return { success: true, error: null };
  } catch (error) {
    console.log(`Error caught: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Test case: Math operations
const testMathOperations = (x, y) => {
  const operations = {
    add: x + y,
    subtract: x - y,
    multiply: x * y,
    divide: y !== 0 ? x / y : 'Cannot divide by zero',
    power: Math.pow(x, y),
    modulo: x % y
  };
  console.log(`Math operations for ${x} and ${y}:`, operations);
  return operations;
};

// Test case: Array filtering and sorting
const testArrayFiltering = (arr) => {
  const evenNumbers = arr.filter(x => x % 2 === 0);
  const oddNumbers = arr.filter(x => x % 2 !== 0);
  const sorted = [...arr].sort((a, b) => a - b);
  const reversed = [...arr].sort((a, b) => b - a);
  console.log(`Even: [${evenNumbers}], Odd: [${oddNumbers}], Sorted: [${sorted}], Reversed: [${reversed}]`);
  return { evenNumbers, oddNumbers, sorted, reversed };
};

// Test case: Date and time operations
const testDateOperations = () => {
  const now = new Date();
  const formatted = now.toISOString();
  const timestamp = now.getTime();
  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString();
  console.log(`Current date: ${dateString}, Time: ${timeString}, ISO: ${formatted}, Timestamp: ${timestamp}`);
  return { formatted, timestamp, dateString, timeString };
};

// Test case: JSON operations
const testJSONOperations = (obj) => {
  const jsonString = JSON.stringify(obj, null, 2);
  const parsed = JSON.parse(jsonString);
  const isEqual = JSON.stringify(obj) === JSON.stringify(parsed);
  console.log(`JSON String:\n${jsonString}`);
  console.log(`Parse successful: ${isEqual}`);
  return { jsonString, parsed, isEqual };
};

// Test case: Regular expressions
const testRegexOperations = (text, pattern) => {
  const regex = new RegExp(pattern, 'gi');
  const matches = text.match(regex);
  const hasMatch = regex.test(text);
  const replaced = text.replace(regex, '***');
  console.log(`Text: "${text}", Pattern: "${pattern}", Matches: [${matches}], Replaced: "${replaced}"`);
  return { matches, hasMatch, replaced };
};

// Test case: Promise handling
const testPromiseOperations = async () => {
  const promise1 = Promise.resolve('Promise 1 resolved');
  const promise2 = new Promise(resolve => setTimeout(() => resolve('Promise 2 resolved'), 100));
  const promise3 = Promise.resolve('Promise 3 resolved');

  const results = await Promise.all([promise1, promise2, promise3]);
  console.log('All promises resolved:', results);
  return results;
};

// Test case: Type checking
const testTypeChecking = (value) => {
  const type = typeof value;
  const isArray = Array.isArray(value);
  const isNull = value === null;
  const isUndefined = value === undefined;
  const constructor = value?.constructor?.name || 'N/A';
  console.log(`Value: ${value}, Type: ${type}, IsArray: ${isArray}, Constructor: ${constructor}`);
  return { type, isArray, isNull, isUndefined, constructor };
};

// Main test runner
const runAllTests = async () => {
  console.log('=== Running All Tests ===\n');

  testFunction();
  testWithParameter('Alice');
  testAddition(5, 3);
  testArrayOperations([1, 2, 3, 4, 5]);
  testObjectManipulation({ name: 'John', age: 30, city: 'Tokyo' });
  testStringOperations('Hello World');
  testErrorHandling(false);
  testErrorHandling(true);
  await testAsyncOperation(500);
  testMathOperations(10, 3);
  testArrayFiltering([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  testDateOperations();
  testJSONOperations({ id: 1, name: 'Test', active: true });
  testRegexOperations('Hello World 123', '\\d+');
  await testPromiseOperations();
  testTypeChecking([1, 2, 3]);
  testTypeChecking({ key: 'value' });

  console.log('\n=== All Tests Completed ===');
};

// Export all test functions
module.exports = {
  testFunction,
  testWithParameter,
  testAddition,
  testArrayOperations,
  testObjectManipulation,
  testStringOperations,
  testAsyncOperation,
  testErrorHandling,
  testMathOperations,
  testArrayFiltering,
  testDateOperations,
  testJSONOperations,
  testRegexOperations,
  testPromiseOperations,
  testTypeChecking,
  runAllTests
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
