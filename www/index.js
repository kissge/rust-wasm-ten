import { enumerate, Operation, FormulaShape } from 'wasm-ten';

/** @type {HTMLInputElement} */
const input = document.getElementById('input');
/** @type {HTMLTextAreaElement} */
const textarea = document.getElementById('textarea');

const REPEAT = 50;

input.addEventListener('keyup', () => {
  if (!input.value.match(/^\d{4}$/)) {
    return;
  }

  const problem = input.value.split('').map((x) => Number.parseInt(x));
  const start = performance.now();

  /** @type {[number, number, number, number, Operation, Operation, Operation, FormulaShape][]} */
  let results;
  for (let i = 0; i < REPEAT; ++i) {
    results = enumerate(...problem);
  }

  const time = ((performance.now() - start) / REPEAT).toFixed(3);

  let formulae = results.map(([a, b, c, d, op1, op2, op3, shape]) =>
    shape === FormulaShape.A
      ? term(paren(term(paren(term(a, b, op1)), c, op2)), d, op3)
      : term(paren(term(a, b, op1)), paren(term(c, d, op2)), op3)
  );
  formulae = formulae.filter((x, i) => formulae.indexOf(x) === i);

  textarea.value =
    `${problem.join(', ')}: Found ${formulae.length} solutions in ${time} ms (Average of ${REPEAT} repeats).\n\n` +
    formulae.map((formula) => formula + ' = ' + eval(formula)).join('\n');
});
input.dispatchEvent(new KeyboardEvent('keyup'));

/**
 * @param {number} x
 * @param {number} y
 * @param {Operation} op
 */
function term(x, y, op) {
  switch (op) {
    case Operation.Add:
      return `${x} + ${y}`;
    case Operation.Sub:
      return `${x} - ${y}`;
    case Operation.SubInversed:
      return `${y} - ${x}`;
    case Operation.Mul:
      return `${x} * ${y}`;
    case Operation.Div:
      return `${x} / ${y}`;
    case Operation.DivInversed:
      return `${y} / ${x}`;
  }
}

function paren(t) {
  return '(' + t + ')';
}
