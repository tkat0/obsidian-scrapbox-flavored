import type { IndentDirection, LineNo, LineRange, ListBlock, ListItem } from '../model';

export interface ObsidianAdapter {
  canIndent(): boolean;
  lineCount(): number;
  readLine(lineNo: LineNo): string | undefined;
  readCurrentLine(): ReadCurrentLineOutput;
  getCursor(): GetCursorOutput;
  setCursor(line: number, ch: number): void;
  move(a: LineRange, b: LineNo): void;
  indent(items: ListItem[], direction: IndentDirection): void;
}

export interface ReadCurrentLineOutput {
  lineNo: number;
  text: string;
}

export interface ReadListBlockOutput {
  block?: ListBlock;
  currentIndex?: number;
}

export interface GetCursorOutput {
  offset: number;
  line: number;
  anchor: number;
}
