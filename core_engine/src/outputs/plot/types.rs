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
pub struct GlueXYPair {
    pub x: f32,
    pub y: f32,
}

#[derive(Serialize, Clone)]
#[wasm_bindgen]
pub struct PlotSuccessReturn {
    points: Vec<XYPair>,
    logs: Vec<LogMessage>,
}
impl PlotSuccessReturn {
    pub fn new(points: Vec<XYPair>, logs: Vec<LogMessage>) -> Self {
        Self { points, logs }
    }
}

#[wasm_bindgen]
impl PlotSuccessReturn {
    #[wasm_bindgen(getter)]
    pub fn logs(&self) -> Vec<LogMessage> {
        self.logs.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn points(&self) -> Vec<GlueXYPair> {
        let mut out = Vec::with_capacity(self.points.len());
        for pair in self.points.clone() {
            out.push(GlueXYPair {
                x: pair.0,
                y: pair.1,
            });
        }
        out
    }
}
