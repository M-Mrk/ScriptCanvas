use rhai::packages::{BasicMathPackage, Package};
use rhai::{AST, Engine, ParseError};
use rhai_sci::SciPackage;

use super::common::rand;
use crate::types::ErrorOutput;
use crate::types::Position as CPosition;

pub fn create_engine() -> Engine {
    let mut engine = Engine::new();
    engine.register_fn("rand", rand);

    let sci = SciPackage::new();
    sci.register_into_engine(&mut engine);

    let math = BasicMathPackage::new();
    math.register_into_engine(&mut engine);

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
