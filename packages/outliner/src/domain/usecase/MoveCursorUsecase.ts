import { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { REGEX_MARKDOWN_LIST } from '../model';

export class MoveCursorUsecase {
  constructor(private adapter: ObsidianAdapter) {}

  invoke(direction: 'begin' | 'end') {
    if (direction == 'begin') {
      this.moveCursorToBegin(this.adapter);
    } else {
      this.moveCursorToEnd(this.adapter);
    }
  }

  private moveCursorToBegin(adapter: ObsidianAdapter) {
    const { line, offset } = adapter.getCursor();
    const text = adapter.readLine(line);
    const prefix = text.match(REGEX_MARKDOWN_LIST);
    if (prefix !== null && !(offset <= prefix[0].length)) {
      adapter.setCursor(line, prefix[0].length);
    } else {
      adapter.setCursor(line, 0);
    }
  }

  private moveCursorToEnd(adapter: ObsidianAdapter) {
    const { text, lineNo } = adapter.readCurrentLine();
    adapter.setCursor(lineNo, text.length);
  }
}
