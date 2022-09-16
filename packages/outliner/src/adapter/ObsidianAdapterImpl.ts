import { Editor, EditorChange, VaultConfig } from 'obsidian';
import type { ObsidianAdapter, ReadCurrentLineOutput } from 'src/domain/adapter/ObsidianAdapter';
import { IndentDirection, LineNo, LineRange, ListItem } from 'src/domain/model';

export class ObsidianAdapterImpl implements ObsidianAdapter {
  constructor(private editor: Editor, private config: VaultConfig) {}

  lineCount(): number {
    return this.editor.lineCount();
  }

  readCurrentLine(): ReadCurrentLineOutput {
    const { line: lineNo } = this.editor.getCursor();
    const text = this.editor.getLine(lineNo);
    return {
      lineNo,
      text,
    };
  }

  readLine(lineNo: LineNo | undefined): string | undefined {
    if (lineNo < 0 || this.editor.lastLine() < lineNo) {
      return;
    }

    return this.editor.getLine(lineNo);
  }

  move(a: LineRange, b: LineNo): void {
    const up = a.start > b;
    const { start, end } = a;

    const cursor = this.editor.getCursor();
    const srcLength = this.editor.getLine(end).length;
    const text = this.editor.getRange({ line: start, ch: 0 }, { line: end, ch: srcLength });

    const changes: EditorChange[] = [];
    // cut
    changes.push({
      from: { line: start, ch: 0 },
      to: { line: end + 1, ch: 0 },
      text: '',
    });

    // paste
    const line = up ? b : b + 1;
    changes.push({
      from: { line, ch: 0 },
      text: text + '\n',
    });

    this.editor.transaction({
      changes,
    });

    const nextCursor = up ? b : a.start + (b - a.end);
    this.editor.setCursor({ line: nextCursor, ch: cursor.ch });
  }

  indent(items: ListItem[], direction: IndentDirection): void {
    const cursor = this.editor.getCursor();

    const change = direction == 'indent' ? 1 : -1;
    const { useTab, tabSize } = this.config;
    const indentChar = useTab ? '\t' : ' '.repeat(tabSize);

    let ch: number | undefined = undefined;
    const changes: EditorChange[] = [];
    items.forEach((item) => {
      const line = this.editor.getLine(item.lineNo);
      let text;
      if (item.level + change < 0) {
        text = `${item.text}`;
      } else {
        const space = indentChar.repeat(item.level + change);
        text = `${space}${item.prefix} ${item.text}`;
      }
      if (ch == undefined) {
        ch = text.length - line.length;
      }
      changes.push({
        from: { line: item.lineNo, ch: 0 },
        to: { line: item.lineNo, ch: line.length },
        text,
      });
    });

    this.editor.transaction({
      changes,
    });

    this.editor.setCursor({ line: cursor.line, ch: cursor.ch + ch });
  }
}
