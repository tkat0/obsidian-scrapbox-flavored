use std::collections::HashMap;

use scrapbox_converter_core::{
    ast::Page,
    parser::{
        self,
        markdown::{MarkdownParserConfig, MarkdownParserContext},
        scrapbox::ScrapboxParserContext,
    },
    visitor::{
        markdown_printer::{MarkdownPass, MarkdownPrinter, MarkdownPrinterConfig},
        scrapbox_printer::{ScrapboxPrinter, ScrapboxPrinterConfig},
        Visitor,
    },
    Config, Span,
};
use wasm_bindgen::prelude::*;

use crate::parser::{description_writer::DescriptionWriter, image_url_collector::ImageUrlRewriter};

use self::image_url_collector::ImageUrlCollector;

mod description_writer;
mod image_url_collector;
mod types;

#[wasm_bindgen(inspectable)]
pub struct MarkdownConverter {
    page: Page,
    config: Config,
}

#[wasm_bindgen]
impl MarkdownConverter {
    #[wasm_bindgen(constructor)]
    pub fn new(input: &str, config: types::Config) -> Result<MarkdownConverter, JsError> {
        let config: Config = config.into_serde()?;
        let context = MarkdownParserContext {
            config: MarkdownParserConfig {},
            ..Default::default()
        };
        let (_, page) = parser::markdown::page(Span::new_extra(input, context))?;
        Ok(Self { page, config })
    }

    /// Function: (url: string) => string
    /// e.g. convert local file path to Gyazo URL
    // pub fn get_image_urls(&mut self, f: &js_sys::Function) -> Result<StringArray, JsError> {
    //     let mut image_url_collector = ImageUrlCollector::new();
    //     image_url_collector.visit(&mut self.page);
    //     log::debug!("URL: {:?}", &image_url_collector.urls);

    //     let mut mapper = HashMap::new();
    //     let this = JsValue::null();
    //     for url in &image_url_collector.urls {
    //         let x = f.call1(&this, &JsValue::from(url)).unwrap();
    //         mapper.insert(url.clone(), x.as_string().unwrap());
    //     }
    //     log::debug!("mapper: {:?}", &mapper);

    //     let mut image_url_rewriter = ImageUrlRewriter::new(mapper);
    //     image_url_rewriter.visit(&mut self.page);

    //     Ok(StringArray::from(
    //         JsValue::from_serde(&image_url_collector.urls).unwrap(),
    //     ))
    // }

    pub fn get_image_urls(&mut self) -> Result<types::StringArray, JsError> {
        let mut image_url_collector = ImageUrlCollector::new();
        image_url_collector.visit(&mut self.page);

        Ok(JsValue::from_serde(&image_url_collector.urls)
            .unwrap()
            .into())
    }

    pub fn replace_image_urls(&mut self, map: types::StringMap) -> Result<(), JsError> {
        let map: HashMap<String, String> = map.into_serde().unwrap();

        log::debug!("map: {:?}", &map);

        let mut image_url_rewriter = ImageUrlRewriter::new(map);
        image_url_rewriter.visit(&mut self.page);

        Ok(())
    }

    pub fn generate(&mut self) -> Result<String, JsError> {
        let mut visitor = ScrapboxPrinter::new(ScrapboxPrinterConfig::default());
        Ok(visitor.generate(&mut self.page))
    }

    pub fn description(&mut self, lines: usize) -> Result<types::Descriptions, JsError> {
        // let nodes = self.page.nodes.iter().take(lines).collect::<Vec<_>>();
        // serde_json::to_string_pretty(&nodes).map_err(JsError::from)
        let mut description_writer = DescriptionWriter::new();
        description_writer.visit(&mut self.page);
        let description = description_writer.lines;
        Ok(JsValue::from_serde(&description).unwrap().into())
    }
}

#[wasm_bindgen(inspectable)]
pub struct ScrapboxConverter {
    page: Page,
    config: Config,
}

#[wasm_bindgen]
impl ScrapboxConverter {
    #[wasm_bindgen(constructor)]
    pub fn new(input: &str, config: types::Config) -> Result<ScrapboxConverter, JsError> {
        let config: Config = config.into_serde()?;
        let context = ScrapboxParserContext::default();
        let (_, page) = parser::scrapbox::page(Span::new_extra(input, context))?;
        Ok(Self { page, config })
    }

    pub fn get_image_urls(&mut self) -> Result<types::StringArray, JsError> {
        let mut image_url_collector = ImageUrlCollector::new();
        image_url_collector.visit(&mut self.page);

        Ok(JsValue::from_serde(&image_url_collector.urls)
            .unwrap()
            .into())
    }

    pub fn replace_image_urls(&mut self, map: types::StringMap) -> Result<(), JsError> {
        let map: HashMap<String, String> = map.into_serde().unwrap();

        log::debug!("map: {:?}", &map);

        let mut image_url_rewriter = ImageUrlRewriter::new(map);
        image_url_rewriter.visit(&mut self.page);

        Ok(())
    }

    pub fn generate(&mut self) -> Result<String, JsError> {
        let mut pass = MarkdownPass {
            h1_level: self.config.heading1_mapping,
            bold_to_h: self.config.bold_to_heading,
        };
        pass.visit(&mut self.page);
        log::debug!("visited");

        let config = MarkdownPrinterConfig::default();
        let mut visitor = MarkdownPrinter::new(config);
        Ok(visitor.generate(&mut self.page))
    }
}
