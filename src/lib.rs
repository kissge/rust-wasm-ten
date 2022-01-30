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
    B, // ((a _b) _ (c _ d))
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn enumerate(a: i32, b: i32, c: i32, d: i32) -> Vec<js_sys::Array> {
    let operations = vec![
        Operation::Add,
        Operation::Sub,
        Operation::SubInversed,
        Operation::Mul,
        Operation::Div,
        Operation::DivInversed,
    ];

    [a, b, c, d]
        .iter()
        .permutations(4)
        .unique()
        .flat_map(|args| {
            operations
                .iter()
                .cycle()
                .take(3 * operations.len())
                .combinations_with_replacement(3)
                .unique()
                .flat_map(|ops| {
                    [FormulaShape::A, FormulaShape::B]
                        .iter()
                        .filter_map(|shape| {
                            if calculate(&args, &ops, &shape) == Ok(10.0) {
                                Some(get_array(&args, &ops, &shape))
                            } else {
                                None
                            }
                        })
                })
        })
        .collect()
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
                    Some(a / b)
                } else {
                    None
                }
            }
            Operation::DivInversed => {
                if a == Rational32::from_integer(0) {
                    Some(b / a)
                } else {
                    None
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

pub fn get_array(args: &Vec<&i32>, ops: &Vec<&Operation>, shape: &FormulaShape) -> js_sys::Array {
    let array = js_sys::Array::new_with_length(8);
    args.iter().enumerate().for_each(|(i, &arg)| {
        array.set(i as u32, JsValue::from(*arg));
    });
    ops.iter().enumerate().for_each(|(i, &op)| {
        array.set(i as u32 + 4, JsValue::from(*op as i32));
    });
    array.set(7, JsValue::from(*shape as i32));

    array
}
