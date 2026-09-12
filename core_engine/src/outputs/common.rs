use log::error;
use std::sync::{Arc, Mutex, Once};

use crate::types::LogMessage;

static INIT_LOGGER: Once = Once::new();
pub fn init_logging() {
    INIT_LOGGER.call_once(|| {
        console_log::init_with_level(log::Level::Trace).expect("Error initializing logging");
        log_panics::init();
    });
}

pub fn get_logs(logs_buf: Arc<Mutex<Vec<LogMessage>>>) -> Vec<LogMessage> {
    let un_arc = Arc::try_unwrap(logs_buf);
    if un_arc.is_err() {
        error!("Failed to unwrap log buffer at arc");
        return Vec::new();
    }
    let un_mutex = un_arc.unwrap().into_inner();
    if un_mutex.is_err() {
        error!("Failed to unwrap log buffer at mutex");
        return Vec::new();
    }
    un_mutex.unwrap()
}
