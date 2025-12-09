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
// Note: Division and modulo by zero return NaN for type consistency
const testMathOperations = (x, y) => {
  const operations = {
    add: x + y,
    subtract: x - y,
    multiply: x * y,
    divide: y !== 0 ? x / y : NaN,
    power: Math.pow(x, y),
    modulo: y !== 0 ? x % y : NaN
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

// Test case: Generators
const testGenerators = () => {
  function* basicGenerator() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
  }

  const gen = basicGenerator();
  const results = [];

  for (let value of gen) {
    results.push(value);
  }

  console.log(`Generator results: [${results}]`);

  function* fibonacci(limit) {
    let [prev, curr] = [0, 1];
    for (let i = 0; i < limit; i++) {
      yield curr;
      [prev, curr] = [curr, prev + curr];
    }
  }

  const fibResults = [...fibonacci(7)];
  console.log(`Fibonacci sequence: [${fibResults}]`);

  return { results, fibResults };
};

// Test case: Iterators
const testIterators = () => {
  const customIterable = {
    data: [10, 20, 30, 40, 50],
    [Symbol.iterator]() {
      let index = 0;
      const data = this.data;

      return {
        next() {
          if (index < data.length) {
            return { value: data[index++], done: false };
          }
          return { done: true };
        }
      };
    }
  };

  const results = [...customIterable];
  console.log(`Custom iterable results: [${results}]`);

  return { results };
};

// Test case: Proxy
const testProxy = () => {
  const target = {
    name: 'Alice',
    age: 30
  };

  const handler = {
    get(obj, prop) {
      console.log(`Getting property: ${prop}`);
      return prop in obj ? obj[prop] : `Property ${prop} not found`;
    },
    set(obj, prop, value) {
      console.log(`Setting property: ${prop} = ${value}`);
      if (prop === 'age' && typeof value !== 'number') {
        throw new TypeError('Age must be a number');
      }
      obj[prop] = value;
      return true;
    }
  };

  const proxy = new Proxy(target, handler);
  const name = proxy.name;
  const missing = proxy.missing;
  proxy.city = 'Tokyo';

  console.log(`Proxy name: ${name}, missing: ${missing}, city: ${proxy.city}`);

  return { name, missing, city: proxy.city };
};

// Test case: Reflect API
const testReflect = () => {
  const obj = { x: 1, y: 2 };

  const hasX = Reflect.has(obj, 'x');
  const keys = Reflect.ownKeys(obj);
  Reflect.set(obj, 'z', 3);
  const value = Reflect.get(obj, 'z');
  const deleted = Reflect.deleteProperty(obj, 'y');

  console.log(`Has x: ${hasX}, Keys: [${keys}], Value of z: ${value}, Deleted y: ${deleted}`);
  console.log(`Remaining properties:`, obj);

  return { hasX, keys, value, deleted, remaining: { ...obj } };
};

// Test case: Object methods and property descriptors
const testObjectMethods = () => {
  const obj = { a: 1, b: 2, c: 3 };

  const frozen = Object.freeze({ ...obj });
  const sealed = Object.seal({ ...obj });

  const descriptor = Object.getOwnPropertyDescriptor(obj, 'a');
  const entries = Object.entries(obj);
  const fromEntries = Object.fromEntries([['x', 10], ['y', 20]]);

  console.log(`Frozen:`, frozen);
  console.log(`Sealed:`, sealed);
  console.log(`Descriptor of 'a':`, descriptor);
  console.log(`Entries:`, entries);
  console.log(`From entries:`, fromEntries);

  return {
    isFrozen: Object.isFrozen(frozen),
    isSealed: Object.isSealed(sealed),
    descriptor,
    entries,
    fromEntries
  };
};

// Test case: Async/Await patterns
const testAsyncAwaitPatterns = async () => {
  const fetchData = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { id, data: `Data for ${id}` };
  };

  const result1 = await fetchData(1);
  const result2 = await fetchData(2);

  const [result3, result4] = await Promise.all([
    fetchData(3),
    fetchData(4)
  ]);

  console.log('Sequential results:', result1, result2);
  console.log('Parallel results:', result3, result4);

  return { sequential: [result1, result2], parallel: [result3, result4] };
};

// Test case: WeakSet operations
const testWeakSet = () => {
  const weakSet = new WeakSet();
  const obj1 = { id: 1 };
  const obj2 = { id: 2 };

  weakSet.add(obj1);
  weakSet.add(obj2);

  const hasObj1 = weakSet.has(obj1);
  weakSet.delete(obj2);
  const hasObj2 = weakSet.has(obj2);

  console.log(`WeakSet has obj1: ${hasObj1}, has obj2 after delete: ${hasObj2}`);

  return { hasObj1, hasObj2AfterDelete: hasObj2 };
};

// Test case: BigInt operations
const testBigInt = () => {
  const big1 = BigInt(Number.MAX_SAFE_INTEGER);
  const big2 = 9007199254740991n;
  const big3 = big1 + big2;

  const operations = {
    value1: big1.toString(),
    value2: big2.toString(),
    sum: big3.toString(),
    product: (big1 * 2n).toString(),
    power: (big2 ** 2n).toString()
  };

  console.log('BigInt operations:', operations);

  return operations;
};

// Test case: Optional chaining and nullish coalescing
const testModernOperators = () => {
  const user = {
    name: 'Alice',
    address: {
      city: 'Tokyo'
    }
  };

  const city = user?.address?.city;
  const country = user?.address?.country ?? 'Unknown';
  const zipCode = user?.address?.zipCode ?? 'N/A';
  const missing = user?.contact?.email ?? 'No email';

  console.log(`City: ${city}, Country: ${country}, ZipCode: ${zipCode}, Email: ${missing}`);

  return { city, country, zipCode, email: missing };
};

// Test case: Edge cases for array operations
const testArrayEdgeCases = () => {
  // Empty array
  const emptyResult = testArrayFiltering([]);

  // Single element
  const singleResult = testArrayFiltering([1]);

  // All even numbers
  const allEvenResult = testArrayFiltering([2, 4, 6, 8]);

  // All odd numbers
  const allOddResult = testArrayFiltering([1, 3, 5, 7]);

  // Negative numbers
  const negativeResult = testArrayFiltering([-5, -4, -3, -2, -1, 0, 1, 2]);

  console.log('Empty array test:', emptyResult);
  console.log('Single element test:', singleResult);
  console.log('All even test:', allEvenResult);
  console.log('All odd test:', allOddResult);
  console.log('Negative numbers test:', negativeResult);

  return { emptyResult, singleResult, allEvenResult, allOddResult, negativeResult };
};

// Test case: Edge cases for math operations
const testMathEdgeCases = () => {
  const results = {
    divideByZero: testMathOperations(10, 0),
    moduloByZero: testMathOperations(7, 0),
    negativeNumbers: testMathOperations(-10, -3),
    largeNumbers: testMathOperations(1e15, 1e10),
    floatingPoint: testMathOperations(0.1, 0.2),
    zeroDivideZero: testMathOperations(0, 0)
  };

  console.log('Math edge cases:', results);

  return results;
};

// Test case: Input validation helper
const validateInput = (value, type, options = {}) => {
  const { min, max, allowNull = false, allowUndefined = false } = options;

  if (value === null && allowNull) return { valid: true, value };
  if (value === undefined && allowUndefined) return { valid: true, value };

  if (value === null || value === undefined) {
    return { valid: false, error: `Value cannot be ${value}` };
  }

  switch (type) {
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: 'Value must be a valid number' };
      }
      if (min !== undefined && value < min) {
        return { valid: false, error: `Value must be >= ${min}` };
      }
      if (max !== undefined && value > max) {
        return { valid: false, error: `Value must be <= ${max}` };
      }
      return { valid: true, value };

    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      if (min !== undefined && value.length < min) {
        return { valid: false, error: `String length must be >= ${min}` };
      }
      if (max !== undefined && value.length > max) {
        return { valid: false, error: `String length must be <= ${max}` };
      }
      return { valid: true, value };

    case 'array':
      if (!Array.isArray(value)) {
        return { valid: false, error: 'Value must be an array' };
      }
      if (min !== undefined && value.length < min) {
        return { valid: false, error: `Array length must be >= ${min}` };
      }
      if (max !== undefined && value.length > max) {
        return { valid: false, error: `Array length must be <= ${max}` };
      }
      return { valid: true, value };

    default:
      return { valid: false, error: `Unknown type: ${type}` };
  }
};

// Test case: Input validation tests
const testInputValidation = () => {
  const tests = {
    validNumber: validateInput(42, 'number'),
    invalidNumber: validateInput('42', 'number'),
    numberOutOfRange: validateInput(150, 'number', { min: 0, max: 100 }),
    validString: validateInput('Hello', 'string', { min: 1, max: 10 }),
    invalidString: validateInput(123, 'string'),
    stringTooShort: validateInput('Hi', 'string', { min: 5 }),
    validArray: validateInput([1, 2, 3], 'array', { min: 1 }),
    invalidArray: validateInput('not an array', 'array'),
    emptyArrayAllowed: validateInput([], 'array', { min: 0 }),
    nullNotAllowed: validateInput(null, 'number'),
    nullAllowed: validateInput(null, 'number', { allowNull: true }),
    nanTest: validateInput(NaN, 'number')
  };

  console.log('Input validation tests:', tests);

  return tests;
};

// Main test runner
const runAllTests = async () => {
  console.log('=== Running All Tests ===\n');

  testErrorHandling(false);
  testErrorHandling(true);
  testMathOperations(10, 3);
  testArrayFiltering([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
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
  testGenerators();
  testIterators();
  testProxy();
  testReflect();
  testObjectMethods();
  await testAsyncAwaitPatterns();
  testWeakSet();
  testBigInt();
  testModernOperators();

  console.log('\n=== Running Edge Case Tests ===\n');
  testArrayEdgeCases();
  testMathEdgeCases();
  testInputValidation();

  console.log('\n=== All Tests Completed ===');
};

// Export all test functions
module.exports = {
  testErrorHandling,
  testMathOperations,
  testArrayFiltering,
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
  testGenerators,
  testIterators,
  testProxy,
  testReflect,
  testObjectMethods,
  testAsyncAwaitPatterns,
  testWeakSet,
  testBigInt,
  testModernOperators,
  testArrayEdgeCases,
  testMathEdgeCases,
  validateInput,
  testInputValidation,
  Person,
  Developer,
  runAllTests
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
