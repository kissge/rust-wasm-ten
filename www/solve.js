import { Operation, FormulaShape } from 'wasm-ten';

export function enumerate(a, b, c, d) {
  const operations = combinations([
    Operation.Add,
    Operation.Sub,
    Operation.SubInversed,
    Operation.Mul,
    Operation.Div,
    Operation.DivInversed,
  ]);

  return permutations([a, b, c, d]).flatMap(([p, q, r, s]) =>
    operations.flatMap(([op1, op2, op3]) =>
      [FormulaShape.A, FormulaShape.B].flatMap((shape) => {
        if (calculate(p, q, r, s, op1, op2, op3, shape).equals(10)) {
          return [[p, q, r, s, op1, op2, op3, shape]];
        } else {
          return [];
        }
      })
    )
  );
}

/**
 * @param {number} p
 * @param {number} q
 * @param {number} r
 * @param {number} s
 * @param {Operation} op1
 * @param {Operation} op2
 * @param {Operation} op3
 * @param {FormulaShape} shape
 */
function calculate(p, q, r, s, op1, op2, op3, shape) {
  const [P, Q, R, S] = [p, q, r, s].map((x) => new Rational(x, 1));

  if (shape === FormulaShape.A) {
    const t1 = calculateTerm(P, Q, op1);
    const t2 = calculateTerm(t1, R, op2);
    return calculateTerm(t2, S, op3);
  } else {
    const t1 = calculateTerm(P, Q, op1);
    const t2 = calculateTerm(R, S, op2);
    return calculateTerm(t1, t2, op3);
  }
}

/**
 * @param {Rational} a
 * @param {Rational} b
 * @param {Operation} op
 * @returns
 */
function calculateTerm(a, b, op) {
  switch (op) {
    case Operation.Add:
      return a.denominator === b.denominator
        ? new Rational(a.numerator + b.numerator, a.denominator)
        : new Rational(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
    case Operation.Sub:
      return a.denominator === b.denominator
        ? new Rational(a.numerator - b.numerator, a.denominator)
        : new Rational(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
    case Operation.SubInversed:
      return a.denominator === b.denominator
        ? new Rational(b.numerator - a.numerator, a.denominator)
        : new Rational(b.numerator * a.denominator - a.numerator * b.denominator, a.denominator * b.denominator);
    case Operation.Mul:
      return new Rational(a.numerator * b.numerator, a.denominator * b.denominator);
    case Operation.Div:
      return new Rational(a.numerator * b.denominator, a.denominator * b.numerator);
    case Operation.DivInversed:
      return new Rational(b.numerator * a.denominator, b.denominator * a.numerator);
  }
}

class Rational {
  /**
   * @param {number} numerator
   * @param {number} denominator
   */
  constructor(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
  }

  /**
   * @param {number} x
   */
  equals(x) {
    return this.numerator / this.denominator === x;
  }
}

/**
 * @param {Array} items
 * @returns {Array<Array>}
 */
function permutations(items) {
  if (items.length <= 1) {
    return [items];
  }

  const result = [];
  for (let i = 0; i < items.length; i++) {
    const copy = [...items];
    const item = copy.splice(i, 1)[0];
    const subPermutations = permutations(copy);
    for (const subPermutation of subPermutations) {
      result.push([item, ...subPermutation]);
    }
  }

  return result;
}

/**
 * @param {Array} items
 * @returns {Array<Array>}
 */
function combinations(items) {
  const result = [];
  for (const a of items) {
    for (const b of items) {
      for (const c of items) {
        result.push([a, b, c]);
      }
    }
  }

  return result;
}
