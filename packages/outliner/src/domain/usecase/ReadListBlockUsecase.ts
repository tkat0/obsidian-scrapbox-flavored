import { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { ListBlock, ListItem, calcLevel, getListInfo } from '../model';

export class ReadListBlockUsecase {
  constructor(private adapter: ObsidianAdapter) {}

  invoke(lineNo: number) {
    const text = this.adapter.readLine(lineNo);
    const { isList, prefix, indent, content } = getListInfo(text);
    const level = -1; // dummy

    if (!isList) {
      return {};
    }

    const items: ListItem[] = [];

    for (let i = lineNo - 1; i >= 0; i--) {
      const text = this.adapter.readLine(i);
      const { isList, prefix, indent, content } = getListInfo(text);
      if (!isList) {
        break;
      }
      items.push({
        level,
        prefix,
        lineNo: i,
        text: content,
        indent,
      });
    }
    items.reverse();

    const currentIndex = items.length;
    items.push({
      level,
      prefix,
      lineNo,
      text: content,
      indent,
    });

    for (let i = lineNo + 1; i <= this.adapter.lineCount(); i++) {
      const text = this.adapter.readLine(i);
      const { isList, prefix, indent, content } = getListInfo(text);
      if (!isList) {
        break;
      }
      items.push({
        level,
        prefix,
        lineNo: i,
        text: content,
        indent,
      });
    }

    // update level
    calcLevel(items);

    return {
      block: {
        items,
      },
      currentIndex,
    };
  }
}

export interface ReadListBlockUsecaseOutput {
  block?: ListBlock;
  currentIndex?: number;
}
