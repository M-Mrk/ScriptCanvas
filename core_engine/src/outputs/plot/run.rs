use std::sync::{Arc, Mutex};
use wasm_bindgen::prelude::*;

use super::types::{PlotSettings, PlotSuccessReturn};
use crate::{
    languages::rhai_lang::{compile, create_engine},
    outputs::{common::init_logging, plot::types::XYPair},
    types::{LogMessage, ScriptType, WasmResponse},
};

#[wasm_bindgen]
pub fn run_plot(
    script: String,
    _script_type: ScriptType,
    settings: PlotSettings,
) -> WasmResponse<PlotSuccessReturn> {
    init_logging();

    let num_x_values: u32 = if settings.start_x >= settings.end_x {
        ((settings.end_x - settings.start_x) / settings.step_x).floor() as u32 + 1
    } else {
        ((settings.start_x - settings.end_x) / settings.step_x).floor() as u32 + 1
    };

    let mut script_engine = create_engine();
    let ast = match compile(&script, &script_engine) {
        Ok(a) => a,
        Err(err) => return WasmResponse::Error(err),
    };

    let points_buf: Vec<XYPair> = Vec::with_capacity(num_x_values as usize);
    let logs_buf: Arc<Mutex<Vec<LogMessage>>> = Arc::new(Mutex::new(Vec::new()));
    for i in 0..num_x_values {
        let x_val = settings.start_x + (settings.step_x * i as f32);
        super::rhai_handler::run_rhai(
            &ast,
            &mut script_engine,
            x_val,
            &settings,
            &mut points_buf,
            logs_buf.clone(),
        );
    }

    // start: 1, end: 15, step: 1
    WasmResponse::Ok(PlotSuccessReturn::new(vec![], vec![]))
}
