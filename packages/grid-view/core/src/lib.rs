use wasm_bindgen::prelude::*;

mod parser;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    wasm_logger::init(wasm_logger::Config::default());
    Ok(())
}
