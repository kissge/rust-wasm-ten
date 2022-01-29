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
    let operations = [&operations[..], &operations[..], &operations[..]].concat();

    [a, b, c, d]
        .iter()
        .permutations(4)
        .unique()
        .flat_map(|args| {
            operations
                .iter()
                .combinations_with_replacement(3)
                .unique()
                .filter_map(move |ops| {
                    if calculate(&args, &ops) == Ok(10.0) {
                        Some(get_array(&args, &ops))
                    } else {
                        None
                    }
                })
        })
        .collect()
}

pub fn calculate(args: &Vec<&i32>, ops: &Vec<&Operation>) -> Result<f32, ()> {
    let mut result = Rational32::from_integer(*args[0]);

    for (&arg, op) in args[1..].iter().zip(ops.iter()) {
        match op {
            Operation::Add => result += arg,
            Operation::Sub => result -= arg,
            Operation::SubInversed => result = Rational32::from_integer(*arg) - result,
            Operation::Mul => result *= arg,
            Operation::Div => {
                if *arg == 0 {
                    return Err(());
                } else {
                    result /= arg
                }
            }
            Operation::DivInversed => {
                if result == Rational32::from_integer(0) {
                    return Err(());
                } else {
                    result = Rational32::from_integer(*arg) / result
                }
            }
        }
    }

    // if *ops[0] == Operation::Div {
    //     log(&format!("{:?} {:?} {}", args, ops, result));
    // }

    Ok((*result.numer() as f32) / (*result.denom() as f32))
}

pub fn get_array(args: &Vec<&i32>, ops: &Vec<&Operation>) -> js_sys::Array {
    let array = js_sys::Array::new_with_length(7);
    args.iter().enumerate().for_each(|(i, &arg)| {
        array.set(i as u32, JsValue::from(*arg));
    });
    ops.iter().enumerate().for_each(|(i, &op)| {
        array.set(i as u32 + 4, JsValue::from(*op as i32));
    });

    array
}
