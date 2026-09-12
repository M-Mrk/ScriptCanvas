use rhai::{AST, Dynamic, Engine, Scope};
use std::sync::{Arc, Mutex};

use crate::types::Position as CPosition;

use crate::{
    outputs::plot::types::{PlotSettings, XYPair},
    types::{ErrorOutput, LogMessage},
};

fn create_log(x: f32, user_msg: &str) -> LogMessage {
    LogMessage {
        system: format!("[x:{}]", x),
        log: user_msg.to_string(),
    }
}

pub fn run_rhai(
    ast: &AST,
    engine: &mut Engine,
    x: f32,
    _settings: &PlotSettings,
    out_buf: &mut Vec<XYPair>,
    log_buf: Arc<Mutex<Vec<LogMessage>>>,
) -> Result<(), ErrorOutput> {
    let log_fn = move |msg: &str| {
        let log = create_log(x, msg);
        log_buf.clone().lock().unwrap().push(log);
    };

    engine.on_print(log_fn.clone());
    engine.on_debug(move |val, _, pos| {
        let line = pos.line();
        let position = pos.position();
        let pos_string = if let Some(l) = line {
            if let Some(c) = position {
                format!(" @ {}:{}", l, c)
            } else {
                format!(" @ {}", l)
            }
        } else {
            "".to_string()
        };
        log_fn(&format!("{}{}", val, pos_string,));
    });

    let mut scope = Scope::new();
    scope.push_constant("x", x as f64);

    let script_return = engine
        .eval_ast_with_scope::<Dynamic>(&mut scope, ast)
        .map_err(|err| {
            ErrorOutput::new(err.to_string(), Some(CPosition::from_rhai(err.position())))
        })?;

    let big_y_val: f64;
    if script_return.is_float() {
        big_y_val = script_return
            .as_float()
            .map_err(|err| ErrorOutput::new(err.to_string(), None))?;
    } else if script_return.is_int() {
        let i = script_return
            .as_int()
            .map_err(|err| ErrorOutput::new(err.to_string(), None))?;
        big_y_val = i as f64;
    } else {
        return Err(ErrorOutput::new(
            "Unkown return type. Please return an integer or float.".to_string(),
            None,
        ));
    }
    let y_val: f32 = big_y_val as f32;
    if y_val.is_nan() || y_val.is_infinite() {
        return Err(ErrorOutput::new(
            "Failed to convert return to an f32, make sure your return isn't too big".to_string(),
            None,
        ));
    }

    out_buf.push((x, y_val));

    Ok(())
}
