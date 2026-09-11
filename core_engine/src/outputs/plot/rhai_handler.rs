use std::sync::{Arc, Mutex};

use rhai::{AST, Engine, Scope};

use crate::{
    outputs::plot::types::XYPair,
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
    out_buf: &mut Vec<XYPair>,
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
    scope.push_constant("x", x as f64);

    let script_return = engine.eval_ast_with_scope(&mut scope, ast);
}
