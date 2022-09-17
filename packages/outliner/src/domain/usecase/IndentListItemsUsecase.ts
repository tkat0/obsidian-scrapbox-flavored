import type { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { IndentDirection, ListItem, getChildren } from '../model';
import { ReadListBlockUsecase } from './ReadListBlockUsecase';

export class IndentListItemsUsecase {
  constructor(private adapter: ObsidianAdapter, private readListBlockUsecase: ReadListBlockUsecase) {}

  invoke(direction: IndentDirection): IndentListItemsUsecaseOutput {
    if (!this.adapter.canIndent()) {
      return { changedLineNo: [] };
    }

    const { lineNo, text } = this.adapter.readCurrentLine();
    const { block, currentIndex } = this.readListBlockUsecase.invoke(lineNo);

    if (!block) {
      if (direction == 'indent') {
        const target: ListItem[] = [
          {
            lineNo,
            level: -1,
            text,
            prefix: '-',
            indent: '',
          },
        ];
        this.adapter.indent(target, direction);
        return { changedLineNo: [lineNo] };
      } else {
        return { changedLineNo: [] };
      }
    }

    const current = block.items[currentIndex];

    if (currentIndex == 0 && direction == 'indent') {
      return { changedLineNo: [] };
    }

    if (currentIndex > 0 && direction == 'indent') {
      const prev = block.items[currentIndex - 1];
      if (prev.level + 1 == current.level) {
        return { changedLineNo: [] };
      }
    }

    const items = getChildren(block.items, currentIndex);
    const target = [current, ...items];

    this.adapter.indent(target, direction);
    return { changedLineNo: target.map((item) => item.lineNo) };
  }
}

export interface IndentListItemsUsecaseOutput {
  changedLineNo: number[];
}
