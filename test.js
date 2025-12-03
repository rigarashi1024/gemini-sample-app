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
  runAllTests
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}