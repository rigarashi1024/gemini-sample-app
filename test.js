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

// Export both functions
module.exports = {
  testFunction,
  testWithParameter
};