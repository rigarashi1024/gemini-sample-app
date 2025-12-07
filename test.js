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
  const replaced = text.replace(new RegExp(pattern, 'gi'), '***');
  console.log(`Text: "${text}", Pattern: "${pattern}", Matches: [${matches}], Replaced: "${replaced}"`);
  return { matches, hasMatch: matches !== null, replaced };
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

// Test case: Set operations
const testSetOperations = () => {
  const set1 = new Set([1, 2, 3, 4, 5]);
  const set2 = new Set([4, 5, 6, 7, 8]);

  const union = new Set([...set1, ...set2]);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const difference = new Set([...set1].filter(x => !set2.has(x)));

  console.log(`Set1: [${[...set1]}], Set2: [${[...set2]}]`);
  console.log(`Union: [${[...union]}], Intersection: [${[...intersection]}], Difference: [${[...difference]}]`);
  return { union: [...union], intersection: [...intersection], difference: [...difference] };
};

// Test case: Map operations
const testMapOperations = () => {
  const map = new Map();
  map.set('name', 'Alice');
  map.set('age', 25);
  map.set('city', 'Tokyo');

  const keys = [...map.keys()];
  const values = [...map.values()];
  const entries = [...map.entries()];
  const hasName = map.has('name');
  const size = map.size;

  console.log(`Map keys: [${keys}], values: [${values}], size: ${size}, has 'name': ${hasName}`);
  return { keys, values, entries, hasName, size };
};

// Test case: Advanced array methods
const testAdvancedArrayMethods = (arr) => {
  const hasEven = arr.some(x => x % 2 === 0);
  const allPositive = arr.every(x => x > 0);
  const firstEven = arr.find(x => x % 2 === 0);
  const firstEvenIndex = arr.findIndex(x => x % 2 === 0);
  const includesFive = arr.includes(5);
  const flattened = [arr, [10, 11]].flat();

  console.log(`Has even: ${hasEven}, All positive: ${allPositive}, First even: ${firstEven}, Index: ${firstEvenIndex}`);
  console.log(`Includes 5: ${includesFive}, Flattened: [${flattened}]`);
  return { hasEven, allPositive, firstEven, firstEvenIndex, includesFive, flattened };
};

// Test case: Class and inheritance
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
  }
}

class Developer extends Person {
  constructor(name, age, language) {
    super(name, age);
    this.language = language;
  }

  code() {
    return `${this.name} is coding in ${this.language}`;
  }
}

const testClassOperations = () => {
  const person = new Person('Alice', 30);
  const developer = new Developer('Bob', 25, 'JavaScript');

  console.log(person.greet());
  console.log(developer.greet());
  console.log(developer.code());

  return {
    personGreeting: person.greet(),
    developerGreeting: developer.greet(),
    developerCoding: developer.code()
  };
};

// Test case: Destructuring and spread
const testDestructuringAndSpread = () => {
  const arr = [1, 2, 3, 4, 5];
  const [first, second, ...rest] = arr;
  const newArr = [...arr, 6, 7, 8];

  const obj = { name: 'Alice', age: 30, city: 'Tokyo' };
  const { name, ...others } = obj;
  const newObj = { ...obj, country: 'Japan' };

  console.log(`First: ${first}, Second: ${second}, Rest: [${rest}]`);
  console.log(`Name: ${name}, Others:`, others);
  console.log(`New array: [${newArr}]`);
  console.log(`New object:`, newObj);

  return { first, second, rest, name, others, newArr, newObj };
};

// Test case: Closures and scope
const testClosures = () => {
  const createCounter = () => {
    let count = 0;
    return {
      increment: () => ++count,
      decrement: () => --count,
      getCount: () => count
    };
  };

  const counter = createCounter();
  counter.increment();
  counter.increment();
  const value1 = counter.getCount();
  counter.decrement();
  const value2 = counter.getCount();

  console.log(`Counter after 2 increments: ${value1}, after 1 decrement: ${value2}`);
  return { value1, value2 };
};

// Test case: Currying
const testCurrying = () => {
  const multiply = (a) => (b) => (c) => a * b * c;
  const add = (a) => (b) => a + b;

  const result1 = multiply(2)(3)(4);
  const multiplyBy2 = multiply(2);
  const result2 = multiplyBy2(5)(6);
  const add10 = add(10);
  const result3 = add10(5);

  console.log(`multiply(2)(3)(4): ${result1}, multiplyBy2(5)(6): ${result2}, add10(5): ${result3}`);
  return { result1, result2, result3 };
};

// Test case: Higher-order functions
const testHigherOrderFunctions = () => {
  const numbers = [1, 2, 3, 4, 5];

  const withTiming = (fn, label) => {
    return (...args) => {
      const start = Date.now();
      const result = fn(...args);
      const elapsed = Date.now() - start;
      console.log(`${label} took ${elapsed}ms`);
      return result;
    };
  };

  const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
  const timedSum = withTiming(sum, 'Sum operation');
  const result = timedSum(numbers);

  console.log(`Sum result: ${result}`);
  return { result };
};

// Test case: Template literals and tagged templates
const testTemplateStrings = () => {
  const name = 'Alice';
  const age = 30;
  const greeting = `Hello, my name is ${name} and I am ${age} years old.`;

  const multiline = `
    This is a multiline
    string using template
    literals in JavaScript.
  `.trim();

  const highlight = (strings, ...values) => {
    return strings.reduce((acc, str, i) => {
      return acc + str + (values[i] ? `**${values[i]}**` : '');
    }, '');
  };

  const tagged = highlight`Name: ${name}, Age: ${age}`;

  console.log(`Greeting: ${greeting}`);
  console.log(`Multiline: ${multiline}`);
  console.log(`Tagged: ${tagged}`);

  return { greeting, multiline, tagged };
};

// Test case: Symbol and WeakMap
const testSymbolAndWeakMap = () => {
  const id = Symbol('id');
  const user = { name: 'Alice', [id]: 12345 };

  const weakMap = new WeakMap();
  const key = { name: 'key' };
  weakMap.set(key, 'value');
  const hasKey = weakMap.has(key);
  const value = weakMap.get(key);

  console.log(`User object keys:`, Object.keys(user));
  console.log(`Symbol value: ${user[id]}`);
  console.log(`WeakMap has key: ${hasKey}, value: ${value}`);

  return { symbolValue: user[id], hasKey, value };
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
  testSetOperations();
  testMapOperations();
  testAdvancedArrayMethods([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  testClassOperations();
  testDestructuringAndSpread();
  testClosures();
  testCurrying();
  testHigherOrderFunctions();
  testTemplateStrings();
  testSymbolAndWeakMap();

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
  testSetOperations,
  testMapOperations,
  testAdvancedArrayMethods,
  testClassOperations,
  testDestructuringAndSpread,
  testClosures,
  testCurrying,
  testHigherOrderFunctions,
  testTemplateStrings,
  testSymbolAndWeakMap,
  Person,
  Developer,
  runAllTests
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
