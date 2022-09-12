use std::collections::{HashMap, HashSet};

use scrapbox_converter_core::{
    ast::{Image, NodeKind},
    visitor::{TransformCommand, Visitor},
};

pub struct ImageUrlCollector {
    pub urls: HashSet<String>,
}

impl ImageUrlCollector {
    pub fn new() -> Self {
        Self {
            urls: HashSet::new(),
        }
    }
}

impl Visitor for ImageUrlCollector {
    fn visit_image(&mut self, value: &Image) -> Option<TransformCommand> {
        self.urls.insert(value.uri.clone());
        None
    }
}

pub struct ImageUrlRewriter {
    pub urls: HashMap<String, String>,
}

impl ImageUrlRewriter {
    pub fn new(urls: HashMap<String, String>) -> Self {
        Self { urls }
    }
}

impl Visitor for ImageUrlRewriter {
    fn visit_image(&mut self, value: &Image) -> Option<TransformCommand> {
        if let Some(url) = self.urls.get(&value.uri) {
            log::debug!("replace: {} -> {}", &value.uri, url);
            Some(TransformCommand::Replace(NodeKind::Image(Image::new(url))))
        } else {
            None
        }
    }
}
