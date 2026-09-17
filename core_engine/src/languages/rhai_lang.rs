use rhai::packages::{BasicMathPackage, Package};
use rhai::{AST, Engine, ParseError};
use rhai_sci::SciPackage;

use super::common::rand;
use crate::types::ErrorOutput;
use crate::types::Position as CPosition;

// AI generated macro
macro_rules! overload_math_for_i64 {
    ($engine:expr, $($func:ident),*) => {
        $(
            $engine.register_fn(stringify!($func), |x: i64| (x as f64).$func());
        )*
    };
}

pub fn create_engine() -> Engine {
    let mut engine = Engine::new();
    engine.register_fn("rand", rand);

    let sci = SciPackage::new();
    sci.register_into_engine(&mut engine);

    let math = BasicMathPackage::new();
    math.register_into_engine(&mut engine);

    // Overload functions to also make them work with i64s
    overload_math_for_i64!(
        engine, sin, cos, tan, sinh, cosh, tanh, asin, acos, atan, sqrt, cbrt, exp, ln, log10
    );

    engine
}

pub fn clear_engine(eng: &mut Engine) {
    // Clear hooks so Arc references get removed
    eng.on_print(|_| {});
    eng.on_debug(|_, _, _| {});
}

pub fn compile(script: &str, engine: &Engine) -> Result<AST, ErrorOutput> {
    let compiled = engine.compile(script);
    if let Ok(ast) = compiled {
        return Ok(ast);
    }
    let parse_err: ParseError = compiled.unwrap_err();

    Err(ErrorOutput {
        text: parse_err.to_string(),
        position: Some(CPosition::from_rhai(parse_err.1)),
        logs: Vec::new(),
    })
}
