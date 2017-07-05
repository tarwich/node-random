/**
 * Simple function to parse a date into a number so that we can do date math
 *
 * Date should be in the format YYYY-MM-DD
 *
 * If you have some oddities with hours, you might need to specify the
 * timezone. By default it's GMT, so just change something like 2016-01-01 to
 * 2016-01-01 CST
 *
 * @param  {String} date The date to parse
 *
 * @return {Number}      The unix timestamp for the date so that we can do
 *                       date math
 */
function parseDate(date) {
  if (date instanceof Date) return date.getTime();
  return Date.parse(date);
}

/**
 * If the input is a function, then call it. Otherwise, just return it
 *
 * @param  {*} input If this is a function, then call it and return the
 *                   result. Otherwise, just return this value.
 * @return {*}       The result of calling input
 */
function unwrap(input) {
  // Call until there's nothing left to call
  while (input && input.call) {
    if (input.CONSTANT) return input();
    input = input();
  }

  return input;
}

/**
 * Class to generate random data
 */
class Random {
  /**
   * Generates an array with the specified length
   *
   * @param {number} length How big should the array be
   * @param {array} items Items with which to fill the array. If the items are
   * callable, then they will be called and the result will be stored in the
   * array.
   *
   * @returns {array} The generated array
   */
  static array(length, items) {
    return () => {
      const result = [];

      for (let i = 0; i < length; ++i)
        result.push(unwrap(items && items[i] || items || i));

      return result;
    };
  }

  /**
   * Returns a random country from the list
   *
   * In order to change the list of countries, you can set
   *
   * ```
   * js Random.country.data = ['New', 'List', 'of Countries']
   * ```
   *
   * @returns {string} A random country
   */
  static country() {
    return Random.item(Random.country.data);
  }

  /**
   * Makes a function that will not unwrap its children
   *
   * @param {any} input The constant value to return
   *
   * @return {any} A function that will return input
   */
  static constant(input) {
    const result = () => input;
    result.CONSTANT = true;
    return result;
  }

  /**
   * Returns a random date between the two ranges
   *
   * @param {date | string} min The lowest date (inclusive) that may be returned
   * @param {date | string} max The highest date (inclusive) that may be
   * returned
   *
   * @return {Date} A random Date instance that falls between the two dates
   */
  static date(min, max) {
    return function() {
      return new Date(Random.number(
        parseDate(min),
        parseDate(max)
      )());
    };
  }

  /**
   * Returns a random first name
   *
   * You can set Random.firstName.data to customize the result
   *
   * @returns {string} A random first name
   */
  static firstName() {
    return Random.item(Random.firstName.data);
  }

  /**
   * Returns a random number between the two values
   *
   * @param {number} min The lowest allowed number (inclusive)
   * @param {number} max The highest allowed number (inclusive)
   * @param {number} [precision=2] Precision in resulting number
   *
   * @returns {number} A number between min and max
   */
  static float(min, max, precision = 2) {
    return function() {
      // Create the base number
      let result = ((Math.random() * (max - min)) + min);
      // Strip the digits we don't want
      return Math.floor(result * Math.pow(10, precision)) /
        Math.pow(10, precision);
    };
  }

  /**
   * Returns any random item from the array
   *
   * @param {array} data An array to use for random items
   *
   * @returns {any} A random item from the array or arguments
   */
  static item() {
    // Ensure input is an array
    let input = [].concat.apply([], arguments);

    return function() {
      return input[Random.number(0, input.length - 1)()];
    };
  }

  /**
   * Join input array on ''
   *
   * If any of the items in the input array are callable, then they will be
   * called and the result will be used as the value.
   *
   * @param {array} The array of items to join
   *
   * @returns {string} The items joined on an empty string ''
   */
  static join() {
    let input = [].concat.apply([], arguments);

    return function() {
      return input.map(function(o) {
        return unwrap(o);
      })
      .join('');
    };
  }

  /**
   * Returns a random last name
   *
   * You can set Random.lastName.data to customize the result
   *
   * @returns {string} A random last name
   */
  static lastName() {
    return Random.item(Random.lastName.data);
  }

  /**
   * Generate a random series that looks like a mountain range
   *
   * @param {number} [MAX_HEIGHT=50] The maximum height of the range
   * @param {number} [STEP_CHANGE=10] The amount of allowed change between steps
   *
   * @returns {Function} A function that can be called to generate each point in
   * the data series
   */
  static mountains(MAX_HEIGHT = 50, STEP_CHANGE = 10) {
    // Parameters - change to your liking
    let STEP_MAX = 5;
    STEP_CHANGE = unwrap(STEP_CHANGE);
    MAX_HEIGHT = unwrap(MAX_HEIGHT);

    // Starting conditions
    let currentHeight = Math.random() * MAX_HEIGHT;
    let slope = (Math.random() * STEP_MAX) * 2 - STEP_MAX;

    // Creating the landscape
    return () => {
      // Change height and slope
      currentHeight += slope;
      slope += (Math.random() * STEP_CHANGE) * 2 - STEP_CHANGE;

      // Clip height and slope to maximum
      if (slope > STEP_MAX) slope = STEP_MAX;
      if (slope < -STEP_MAX) slope = -STEP_MAX;

      if (currentHeight > MAX_HEIGHT) {
        currentHeight = MAX_HEIGHT;
        slope *= -1;
      }
      if (currentHeight < 0) {
        currentHeight = 0;
        slope *= -1;
      }

      return currentHeight;
    };
  }

  /**
   * Returns a random number between min and max
   *
   * @param {number} min The minimum value allowed (inclusive)
   * @param {number} max The maximum value allowed (inclusive)
   *
   * @returns {number} The generated number
   */
  static number(min, max) {
    max += 1;

    return () => {
      return Math.floor((Math.random() * (max - min)) + min);
    };
  }

  /**
   * Generates a random object with the specified values
   *
   * If a value is callable, then the result of the function will be returned.
   *
   * Example: ```js Random.object({
   *   name: Random.firstName(),
   *   age:  Random.number(18, 60),
   * });
   * // {name: 'Paul', age: 23}
   * ```
   *
   * @param {any} input The map of key / value pairs. Each value may be either a
   * constant, or a function. If a function nis passed, then it will be called
   * and the result will be stored in the object.
   *
   * @returns {object} The created object
   */
  static object(input) {
    return () => {
      let result = {};

      for (let key in input) {
        if (input.hasOwnProperty(key))
          result[key] = unwrap(input[key]);
      }

      return result;
    };
  }

  /**
   * Returns the next item in the array each time it's called
   *
   * This is a bit of a misnomer being in Random, because it's not random.
   * Still, sometimes it helps to have the genreator return things in order.
   *
   * @param {array} data The array of things to return
   *
   * @return {Function} Function that returns the next item in the sequence
   */
  static sequence(data) {
    let i = 0;
    data = unwrap(data);

    return () => data[i++ % data.length];
  }

  /**
   * Transform the input data by passing it through callback
   *
   * This is useful for something like converting numbers to strings:
   *
   * ```
   * Random.transform(Random.number(1, 10), d => String(d));
   * ```
   *
   * @param {any} input Any valid input data
   * @param {any} callback A callback function that receives the unwrapped input
   * and returns the real value
   *
   * @returns {Function} A function that can be called to emit the value
   */
  static transform(input, callback) {
    return () => {
      return callback(unwrap(input));
    };
  }

  /**
   * Generate a wave of data points
   *
   * @static
   * @param {any} count         How many data points are needed
   * @param {any} size          The height of the waveform
   * @param {number} [repeat=1] How many times should the waveform repeat
   * @param {number} [shift=0]  Shift the waveform along the x-axis
   * @param {number} [noise=0]  Amount of random noise (y-axis variations)
   *
   * @returns {Function} Function that generates the data
   */
  static wave(count, size, repeat = 1, shift = 0, noise = 0) {
    // Resolve everything
    count = unwrap(count);
    size = unwrap(size);
    repeat = unwrap(repeat);
    shift = unwrap(shift);
    noise = unwrap(noise);

    let i = 0;
    let amplitude = size / 2;
    let frequency = (2 * Math.PI) / (count / repeat);
    let phase = shift + (Math.PI / 2);
    let vShift = amplitude;
    let noiseShift = Random.number(-noise / 2, noise / 2);

    return () =>
      (amplitude * Math.sin((frequency * i++) - phase)) + vShift + noiseShift();
  }
}

Random.country.data = ['Afghanistan', 'Bulgaria', 'Canada',
  'Dominican Republic', 'Egypt', 'France', 'Germany', 'Haiti', 'Israel',
  'Japan', 'Kuwait', 'Libya', 'Mexico', 'North Korea', 'Oman', 'Philippines',
  'Qatar', 'Russia', 'South Korea', 'Turkey', 'United States', 'Venezuela',
  'Yemen', 'Zimbabwe'
];

Random.firstName.data = [
  'Adam', 'Bill', 'Carlos', 'Daniel', 'Edward', 'Frank', 'Gary', 'Harley',
  'James', 'Luke', 'Mark', 'Nathan', 'Oscar', 'Patrick', 'Ricardo', 'Sam',
  'Thomas', 'Victor', 'Wayne', 'Xavier', 'Zack',
];

Random.lastName.data = [
  'Adams', 'Bailey', 'Dallas', 'Edwards', 'Ford', 'Gerald', 'Holmes',
  'Jones', 'Kuntz', 'Lyons', 'Miller', 'Nellis', 'Ortiz', 'Paul',
  'Quevedo', 'Smith', 'White',
];

module.exports = Random;

// Export these things too, but just tack them onto the existing exported class
Object.assign(module.exports, {
  parseDate,
  unwrap
});
