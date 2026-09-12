use super::rhai_handler;
use super::types::{GridSettings, Pixel};
use crate::languages::rhai_lang::{clear_engine, compile, create_engine};
use crate::outputs::common::{get_logs, init_logging};
use crate::outputs::grid::types::GridSuccessReturn;
use crate::types::{ErrorOutput, LogMessage, ScriptType, WasmResponse};
use std::sync::{Arc, Mutex};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run_grid(
    script: String,
    _script_type: ScriptType,
    settings: GridSettings,
) -> WasmResponse<GridSuccessReturn> {
    init_logging();
    let num_pixels = settings.res_x * settings.res_y;
    let mut out_buf: Vec<Pixel> = Vec::with_capacity(num_pixels as usize);
    let logs_buf: Arc<Mutex<Vec<LogMessage>>> = Arc::new(Mutex::new(Vec::new()));
    let script_handler = rhai_handler::run_rhai;
    let mut script_engine = create_engine();
    let ast = match compile(&script, &script_engine) {
        Ok(a) => a,
        Err(err) => return WasmResponse::Error(err),
    };

    let start = web_time::Instant::now();
    for y in 0..settings.res_y {
        for x in 0..settings.res_x {
            let result = script_handler(
                &ast,
                x,
                y,
                &settings,
                &mut script_engine,
                &mut out_buf,
                logs_buf.clone(),
            );
            if let Err(err) = result {
                clear_engine(&mut script_engine);
                let err_with_logs = ErrorOutput {
                    logs: Arc::try_unwrap(logs_buf).unwrap().into_inner().unwrap(),
                    ..err
                };
                return WasmResponse::Error(err_with_logs);
            }
        }
    }
    // Profile time per pixel
    let elapsed = start.elapsed();
    let elapsed_ms = elapsed.as_secs_f64() * 1000.0;
    let ms_per_pixel = elapsed_ms / (settings.res_x * settings.res_y) as f64;
    log::trace!("Time per pixel: {:.3} ms", ms_per_pixel);

    let rgba: Vec<u8> = out_buf
        .iter()
        .flat_map(|pixel| [pixel.r, pixel.g, pixel.b, 255])
        .collect();
    clear_engine(&mut script_engine);
    let logs = get_logs(logs_buf);
    let success_output = GridSuccessReturn::new(rgba, logs);
    WasmResponse::from_result(Ok(success_output))
}
