use rhai::{AST, Engine, Scope};
use std::sync::{Arc, Mutex};

use super::types::{GridSettings, Pixel};
use crate::types::Position as CPosition;
use crate::types::{ErrorOutput, LogMessage};

fn create_log(x: i32, y: i32, user_msg: &str) -> LogMessage {
    LogMessage {
        system: format!("[x:{}|y:{}]", x, y),
        log: (user_msg.to_string()),
    }
}

pub fn run_rhai(
    ast: &AST,
    x: i32,
    y: i32,
    settings: &GridSettings,
    engine: &mut Engine,
    out_buf: &mut Vec<Pixel>,
    log_buf: Arc<Mutex<Vec<LogMessage>>>,
) -> Result<(), ErrorOutput> {
    let log_fn = move |msg: &str| {
        let log = create_log(x, y, msg);
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
    scope.push_constant("x", x as i64);
    scope.push_constant("y", y as i64);
    scope.push_constant("res_x", settings.res_x as i64);
    scope.push_constant("res_y", settings.res_y as i64);

    let script_return = engine.eval_ast_with_scope::<rhai::Array>(&mut scope, ast);
    if let Err(err) = script_return {
        match *err {
            rhai::EvalAltResult::ErrorMismatchOutputType(req_type, actual_type, pos) => {
                return Err(ErrorOutput::new(
                    format!(
                        "Unexpected return at {}! Return is of type '{}' and not the expected '{}'! Example return: [255, 125, 50] in the order of RGB.",
                        pos, actual_type, req_type,
                    ),
                    Some(CPosition::from_rhai(pos)),
                ));
            }
            _ => {
                return Err(ErrorOutput::new(
                    (*err).to_string(),
                    Some(CPosition::from_rhai(err.position())),
                ));
            }
        }
    }
    let raw_script_color = script_return.unwrap();
    if raw_script_color.len() != 3 {
        return Err(ErrorOutput::new(
            format!(
                "Bad return! '{:?}' has a wrong amount of elements. Make sure to return an array of 3 u8's. Example return: [255, 125, 50] in the order of RGB.",
                raw_script_color
            ),
            None,
        ));
    }

    let mut script_color = Vec::with_capacity(raw_script_color.len());
    for val in raw_script_color {
        if let Some(int_val) = val.clone().try_cast::<i64>() {
            script_color.push(int_val);
        } else if let Some(float_val) = val.clone().try_cast::<f64>() {
            script_color.push(float_val as i64);
        } else {
            return Err(ErrorOutput::new(
                format!(
                    "Bad return! Array elements must all be 64 bit integers (or 64 bit floats which get rounded). Bad type was '{}'",
                    val.type_name()
                ),
                None,
            ));
        }
    }

    if script_color.iter().any(|val| *val > 255_i64) {
        if !settings.clamp {
            return Err(ErrorOutput::new(
                format!(
                    "Bad return! '{:?}' can not be used as 3 8-bit unsigned integers. Make sure all 3 values are not more than 255.",
                    script_color
                ),
                None,
            ));
        }
        script_color = script_color
            .iter()
            .map(|val| {
                if *val > 255 {
                    return 255;
                }
                *val
            })
            .collect();
    }

    let mut color: (u8, u8, u8) = (255, 255, 255);
    color.0 = script_color[0] as u8;
    color.1 = script_color[1] as u8;
    color.2 = script_color[2] as u8;

    out_buf.push(Pixel::from_tuple(color));
    Ok(())
}
