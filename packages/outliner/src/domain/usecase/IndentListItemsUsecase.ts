import type { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { IndentDirection, ListItem, getChildren, isCursorNextToPrefix } from '../model';
import { ReadListBlockUsecase } from './ReadListBlockUsecase';

export class IndentListItemsUsecase {
  constructor(private adapter: ObsidianAdapter, private readListBlockUsecase: ReadListBlockUsecase) {}

  invoke(input: IndentListItemsUsecaseInput): IndentListItemsUsecaseOutput {
    const { direction, condition } = input;
    if (!this.adapter.canIndent()) {
      return { changedLineNo: [], isList: false };
    }

    const { offset } = this.adapter.getCursor();
    const { lineNo, text } = this.adapter.readCurrentLine();

    if (condition == 'after-prefix' && !isCursorNextToPrefix(text, offset)) {
      return { changedLineNo: [], isList: true };
    }

    if (condition == 'begin-of-line' && text.length != 0) {
      return { changedLineNo: [], isList: true };
    }

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
        return { changedLineNo: [lineNo], isList: true };
      } else {
        return { changedLineNo: [], isList: true };
      }
    }

    const current = block.items[currentIndex];

    if (currentIndex == 0 && direction == 'indent') {
      return { changedLineNo: [], isList: true };
    }

    if (currentIndex > 0 && direction == 'indent') {
      const prev = block.items[currentIndex - 1];
      if (prev.level + 1 == current.level) {
        return { changedLineNo: [], isList: true };
      }
    }

    const items = getChildren(block.items, currentIndex);
    const target = [current, ...items];

    this.adapter.indent(target, direction);
    return { changedLineNo: target.map((item) => item.lineNo), isList: true };
  }
}

export interface IndentListItemsUsecaseInput {
  direction: IndentDirection;
  condition?: 'begin-of-line' | 'after-prefix';
}

export interface IndentListItemsUsecaseOutput {
  changedLineNo: number[];
  isList: boolean;
}
