use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use crate::types::LogMessage;

#[derive(Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct PlotSettings {
    pub start_x: f32,
    pub end_x: f32,
    pub step_x: f32,
}

pub type XYPair = (f32, f32);

#[wasm_bindgen]
#[derive(Serialize, Clone)]
pub struct PlotSuccessReturn {
    points: Vec<XYPair>,
    logs: Vec<LogMessage>,
}
impl PlotSuccessReturn {
    pub fn new(points: Vec<XYPair>, logs: Vec<LogMessage>) -> Self {
        Self { points, logs }
    }
}
