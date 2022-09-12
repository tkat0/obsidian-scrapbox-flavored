use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"

export type IndentKind = {type: "Tab"} | {type: "Space", size: number};

export interface Config {
  /** Maps which bold level of Scrapbox to heading of Markdown */
  heading1Mapping: number;
  /** Maps bold of Scrapbox to the minimum level of heading of Markdown */
  boldToHeading: boolean;
  /** indent of markdown list */
  indent: IndentKind;
}

export interface Description {
    kind: "normal" | "code" | "link" | "emphasis" | "image";
    value: string;
}[];

"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "string[]")]
    pub type StringArray;

    #[wasm_bindgen(typescript_type = "Record<string, string>")]
    pub type StringMap;

    #[wasm_bindgen(typescript_type = "Config")]
    pub type Config;

    #[wasm_bindgen(typescript_type = "Description[][]")]
    pub type Descriptions;
}
