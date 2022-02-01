mod utils;

use itertools::Itertools;
use num_rational::Rational32;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[repr(i32)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Operation {
    Add,
    Sub,
    SubInversed,
    Mul,
    Div,
    DivInversed,
}

#[wasm_bindgen]
#[repr(i32)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum FormulaShape {
    A, // ((a _ b) _ c) _ d
    B, // (a _ b) _ (c _ d)
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

const WASM_MEMORY_BUFFER_SIZE: usize = 500 * 8;
static mut WASM_MEMORY_BUFFER: [i32; WASM_MEMORY_BUFFER_SIZE] = [0; WASM_MEMORY_BUFFER_SIZE];

#[wasm_bindgen]
pub fn enumerate(a: i32, b: i32, c: i32, d: i32) -> *const i32 {
    // utils::set_panic_hook();

    let operations = vec![
        Operation::Add,
        Operation::Sub,
        Operation::SubInversed,
        Operation::Mul,
        Operation::Div,
        Operation::DivInversed,
    ];

    let mut count: usize = 0;

    [a, b, c, d]
        .iter()
        .permutations(4)
        .unique()
        .for_each(|args| {
            operations
                .iter()
                .cycle()
                .take(3 * operations.len())
                .combinations_with_replacement(3)
                .unique()
                .for_each(|ops| {
                    [FormulaShape::A, FormulaShape::B].iter().for_each(|shape| {
                        if calculate(&args, &ops, &shape) == Ok(10.0) {
                            set_answer(&count, &args, &ops, shape);
                            count += 1;
                        }
                    });
                });
        });

    unsafe {
        WASM_MEMORY_BUFFER[0] = count as i32;
        return WASM_MEMORY_BUFFER.as_ptr();
    }
}

pub fn calculate_term(
    a: Option<Rational32>,
    b: Option<Rational32>,
    op: Operation,
) -> Option<Rational32> {
    if let (Some(a), Some(b)) = (a, b) {
        match op {
            Operation::Add => Some(a + b),
            Operation::Sub => Some(a - b),
            Operation::SubInversed => Some(b - a),
            Operation::Mul => Some(a * b),
            Operation::Div => {
                if b == Rational32::from_integer(0) {
                    None
                } else {
                    Some(a / b)
                }
            }
            Operation::DivInversed => {
                if a == Rational32::from_integer(0) {
                    None
                } else {
                    Some(b / a)
                }
            }
        }
    } else {
        None
    }
}

pub fn calculate(args: &Vec<&i32>, ops: &Vec<&Operation>, shape: &FormulaShape) -> Result<f32, ()> {
    let args: Vec<Option<Rational32>> = args
        .iter()
        .map(|x| Some(Rational32::from_integer(**x)))
        .collect();

    let answer = match shape {
        FormulaShape::A => {
            let t = calculate_term(args[0], args[1], *ops[0]);
            let t = calculate_term(t, args[2], *ops[1]);
            calculate_term(t, args[3], *ops[2])
        }
        FormulaShape::B => {
            let t1 = calculate_term(args[0], args[1], *ops[0]);
            let t2 = calculate_term(args[2], args[3], *ops[1]);
            calculate_term(t1, t2, *ops[2])
        }
    };

    if let Some(answer) = answer {
        Ok((*answer.numer() as f32) / (*answer.denom() as f32))
    } else {
        Err(())
    }
}

pub fn set_answer(count: &usize, args: &Vec<&i32>, ops: &Vec<&Operation>, shape: &FormulaShape) {
    unsafe {
        WASM_MEMORY_BUFFER[count * 8 + 1] = *args[0];
        WASM_MEMORY_BUFFER[count * 8 + 2] = *args[1];
        WASM_MEMORY_BUFFER[count * 8 + 3] = *args[2];
        WASM_MEMORY_BUFFER[count * 8 + 4] = *args[3];
        WASM_MEMORY_BUFFER[count * 8 + 5] = *ops[0] as i32;
        WASM_MEMORY_BUFFER[count * 8 + 6] = *ops[1] as i32;
        WASM_MEMORY_BUFFER[count * 8 + 7] = *ops[2] as i32;
        WASM_MEMORY_BUFFER[count * 8 + 8] = *shape as i32;
    }
}
