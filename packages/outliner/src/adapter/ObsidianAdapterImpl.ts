import { ChangeSpec, Line } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { App, VaultConfig } from 'obsidian';
import type { GetCursorOutput, ObsidianAdapter, ReadCurrentLineOutput } from 'src/domain/adapter/ObsidianAdapter';
import { EXCLUDE_LIST_SECTIONS, IndentDirection, LineNo, LineRange, ListItem } from 'src/domain/model';

export class ObsidianAdapterImpl implements ObsidianAdapter {
  constructor(private app: App, private editor: EditorView, private config: VaultConfig) {}

  setCursor(line: number, ch: number) {
    const { from } = this.editor.state.doc.line(line);
    this.editor.dispatch({
      selection: {
        anchor: from + ch,
      },
    });
  }

  getCursor(): GetCursorOutput {
    const anchor = this.editor.state.selection.ranges[0].anchor;
    const { from, number } = this.editor.state.doc.lineAt(anchor);
    return {
      offset: anchor - from,
      line: number,
      anchor,
    };
  }
  private getCurrentLine(): Line {
    const anchor = this.editor.state.selection.ranges[0].anchor;
    return this.editor.state.doc.lineAt(anchor);
  }

  canIndent(): boolean {
    const file = this.app.workspace.getActiveFile();
    const { sections } = this.app.metadataCache.getFileCache(file);
    const { number: line } = this.getCurrentLine();

    if (sections) {
      for (const section of sections) {
        const { position, type } = section;
        if (position.start.line <= line && line <= position.end.line) {
          if (EXCLUDE_LIST_SECTIONS.includes(type)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  lineCount(): number {
    return this.editor.state.doc.lines;
  }

  readCurrentLine(): ReadCurrentLineOutput {
    const { number: lineNo, text } = this.getCurrentLine();
    return {
      lineNo,
      text,
    };
  }

  readLine(lineNo: LineNo): string | undefined {
    if (lineNo < 0 || this.lineCount() < lineNo) {
      return;
    }

    const { text } = this.editor.state.doc.line(lineNo);
    return text;
  }

  // TODO: if the range includes the end of line, it doesn't work
  move(a: LineRange, b: LineNo): void {
    const up = a.start > b;
    const { start, end } = a;

    const { from: cutFrom } = this.editor.state.doc.line(start);
    const { to: cutTo } = this.editor.state.doc.line(end);
    const text = this.editor.state.doc.sliceString(cutFrom, cutTo);

    const changes: ChangeSpec[] = [];
    // cut a line
    changes.push({
      from: cutFrom,
      to: cutTo + 1,
      insert: '',
    });

    // paste
    const { from: dstFrom, to: dstTo } = this.editor.state.doc.line(b);
    const pasteFrom = up ? dstFrom : dstTo + 1;
    const insert = text + '\n';
    changes.push({
      from: pasteFrom,
      insert,
    });

    this.editor.dispatch({
      changes,
    });

    {
      const { offset } = this.getCursor();
      const nextCursorLine = up ? b : a.start + (b - a.end);
      const { from } = this.editor.state.doc.line(nextCursorLine);
      this.editor.dispatch({
        selection: {
          anchor: from + offset,
        },
      });
    }
  }

  indent(items: ListItem[], direction: IndentDirection): void {
    const cursor = this.getCursor();

    const change = direction == 'indent' ? 1 : -1;
    const { useTab, tabSize } = this.config;
    const indentChar = useTab ? '\t' : ' '.repeat(tabSize);

    let offset: number | undefined = undefined;
    const changes: ChangeSpec[] = [];
    items.forEach((item) => {
      const { text: line, from, to } = this.editor.state.doc.line(item.lineNo);
      let text;
      if (item.level + change < 0) {
        text = `${item.text}`;
      } else {
        const space = indentChar.repeat(item.level + change);
        text = `${space}${item.prefix} ${item.text}`;
      }
      if (offset == undefined) {
        offset = text.length - line.length;
      }

      // replace the line with text applied indent
      changes.push({
        from,
        to,
        insert: text,
      });
    });

    this.editor.dispatch({
      changes,
      selection: {
        anchor: cursor.anchor + offset,
      },
    });
  }
}
