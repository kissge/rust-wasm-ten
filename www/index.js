import { enumerate as enumerateWasm, Operation, FormulaShape } from 'wasm-ten';
import { memory } from 'wasm-ten/wasm_ten_bg.wasm';
import { enumerate as enumerateJs } from './solve';

const WASM_MEMORY_BUFFER_SIZE = 500 * 8;

/** @type {HTMLInputElement} */
const input = document.getElementById('input');
/** @type {HTMLTextAreaElement[]} */
const textareas = document.getElementsByTagName('textarea');

const REPEAT = 50;

input.addEventListener('keyup', () => {
  if (!input.value.match(/^\d{4}$/)) {
    return;
  }

  const problem = input.value.split('').map((x) => Number.parseInt(x));

  /** @type {[number, number, number, number, Operation, Operation, Operation, FormulaShape][]} */
  let results;

  [
    { name: 'Wasm (Rust)', textarea: textareas[0], enumerate: enumerateWasm },
    { name: 'Plain JS', textarea: textareas[1], enumerate: enumerateJs },
  ].forEach(({ name, textarea, enumerate }) => {
    const start = performance.now();
    for (let i = 0; i < REPEAT; ++i) {
      results = enumerate(...problem);
    }

    if (enumerate === enumerateWasm) {
      const wasmMemory = new Uint32Array(memory.buffer).subarray(
        results / 4, // why /4 ? I don't know.
        results / 4 + WASM_MEMORY_BUFFER_SIZE + 1
      );
      results = Array.from({ length: wasmMemory[0] }, (_, i) => wasmMemory.subarray(i * 8 + 1, i * 8 + 9));
    }

    const time = ((performance.now() - start) / REPEAT).toFixed(3);

    let formulae = results.map(([a, b, c, d, op1, op2, op3, shape]) =>
      shape === FormulaShape.A
        ? term(paren(term(paren(term(a, b, op1)), c, op2)), d, op3)
        : term(paren(term(a, b, op1)), paren(term(c, d, op2)), op3)
    );
    formulae = formulae.filter((x, i) => formulae.indexOf(x) === i);

    textarea.value =
      `${name} [${problem.join(', ')}]\nFound ${
        formulae.length
      } solutions in ${time} ms (Average of ${REPEAT} repeats).\n\n` +
      formulae
        .map((formula) => formula + ' = ' + eval(formula))
        .sort()
        .join('\n');
  });
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
