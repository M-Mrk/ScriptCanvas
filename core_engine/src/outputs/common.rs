use std::sync::Once;

static INIT_LOGGER: Once = Once::new();
pub fn init_logging() {
    INIT_LOGGER.call_once(|| {
        console_log::init_with_level(log::Level::Trace).expect("Error initializing logging");
        log_panics::init();
    });
}
