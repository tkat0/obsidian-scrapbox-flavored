import { Editor } from 'obsidian';

/**
 * matches line as follows.
 *  " - ", " * ", " 1. "
 */
const REGEX_MARKDOWN_LIST = /(?<indent>[\s]*)([-*]|\d+\.)\s+/;

export const moveCursorToBegin = (editor: Editor) => {
  const { line, ch } = editor.getCursor();
  const text = editor.getLine(line);
  const prefix = text.match(REGEX_MARKDOWN_LIST);
  if (prefix !== null && !(ch <= prefix[0].length)) {
    editor.setCursor(line, prefix[0].length);
  } else {
    editor.setCursor(line, 0);
  }
};

export const moveCursorToEnd = (editor: Editor) => {
  const { line } = editor.getCursor();
  const text = editor.getLine(line);
  editor.setCursor(line, text.length);
};
