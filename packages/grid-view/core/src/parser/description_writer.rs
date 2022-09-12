use serde::{Deserialize, Serialize};

use scrapbox_converter_core::{
    ast::{Image, NodeKind},
    visitor::{walk_node, walk_paragraph, TransformCommand, Visitor},
};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Kind {
    Normal,
    Code,
    Link,
    Emphasis,
    Image,
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Line {
    kind: Kind,
    value: String,
}

impl Line {
    pub fn new(kind: Kind, value: String) -> Self {
        Self { kind, value }
    }
}

pub struct DescriptionWriter {
    pub lines: Vec<Vec<Line>>,
}

impl DescriptionWriter {
    pub fn new() -> Self {
        Self { lines: vec![] }
    }
}

impl Visitor for DescriptionWriter {
    fn is_finish(&mut self) -> bool {
        self.lines.len() > 5
    }

    fn visit_paragraph(
        &mut self,
        value: &mut scrapbox_converter_core::ast::Paragraph,
    ) -> Option<TransformCommand> {
        // doesn't allow empty line
        if self.lines.is_empty() || !self.lines.last().unwrap().is_empty() {
            self.lines.push(vec![]);
        }
        walk_paragraph(self, value);
        None
    }

    fn visit_node(&mut self, value: &mut scrapbox_converter_core::ast::Node) {
        if self.lines.is_empty() {
            self.lines.push(vec![]);
        }
        walk_node(self, value);
    }

    fn visit_code_block(
        &mut self,
        value: &scrapbox_converter_core::ast::CodeBlock,
    ) -> Option<TransformCommand> {
        // push each line
        for c in value.children.iter() {
            let line = self.lines.last_mut().unwrap();
            line.push(Line::new(Kind::Code, c.into()));
            if self.lines.len() >= 5 {
                return None;
            }
            self.lines.push(vec![]);
        }
        None
    }

    fn visit_emphasis(
        &mut self,
        value: &scrapbox_converter_core::ast::Emphasis,
    ) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Emphasis, value.text.clone()));
        None
    }

    fn visit_external_link(
        &mut self,
        value: &scrapbox_converter_core::ast::ExternalLink,
    ) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        if let Some(title) = value.title.as_ref() {
            line.push(Line::new(Kind::Link, title.clone()));
        } else {
            line.push(Line::new(Kind::Link, value.url.clone()));
        }
        None
    }

    fn visit_internal_link(
        &mut self,
        value: &scrapbox_converter_core::ast::InternalLink,
    ) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Link, value.title.clone()));
        None
    }

    fn visit_text(
        &mut self,
        text: &scrapbox_converter_core::ast::Text,
    ) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Normal, text.value.clone()));
        None
    }

    fn visit_math(
        &mut self,
        value: &scrapbox_converter_core::ast::Math,
    ) -> Option<TransformCommand> {
        // TODO: render math
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Normal, value.value.clone()));
        None
    }

    fn visit_table(
        &mut self,
        value: &scrapbox_converter_core::ast::Table,
    ) -> Option<TransformCommand> {
        // TODO
        None
    }

    fn visit_list(
        &mut self,
        value: &mut scrapbox_converter_core::ast::List,
    ) -> Option<TransformCommand> {
        for item in value.children.iter_mut() {
            if self.lines.len() > 5 {
                return None;
            }
            if !self.lines.last().unwrap().is_empty() {
                self.lines.push(vec![]);
            }
            for node in item.children.iter_mut() {
                self.visit_node(node);
            }
        }
        None
    }

    fn visit_block_quate(
        &mut self,
        value: &scrapbox_converter_core::ast::BlockQuate,
    ) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Code, value.value.clone()));
        None
    }

    fn visit_hashtag(
        &mut self,
        value: &scrapbox_converter_core::ast::HashTag,
    ) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Link, format!("#{}", value.value)));
        None
    }

    fn visit_heading(
        &mut self,
        value: &scrapbox_converter_core::ast::Heading,
    ) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Emphasis, value.text.clone()));
        None
    }

    fn visit_image(&mut self, value: &Image) -> Option<TransformCommand> {
        let line = self.lines.last_mut().unwrap();
        line.push(Line::new(Kind::Image, value.uri.clone()));
        None
    }
}
