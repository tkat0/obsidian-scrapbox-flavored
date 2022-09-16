import { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { getLastListItem, getNextListItem } from '../model';
import { ReadListBlockUsecase } from './ReadListBlockUsecase';

export class SwapListItemsUseacase {
  constructor(private adapter: ObsidianAdapter, private readListBlockUsecase: ReadListBlockUsecase) {}

  // TODO: move selected range
  invoke(direction: 'up' | 'down') {
    const current = this.adapter.readCurrentLine();
    const { block, currentIndex } = this.readListBlockUsecase.invoke(current.lineNo);

    if (!block) {
      return;
    }

    const nextIndex = getNextListItem(block.items, currentIndex, direction);

    if (nextIndex === undefined) {
      return;
    }

    const next = block.items[nextIndex];

    // console.debug(`(${current.lineNo})${current.text} <-> (${next.lineNo})${next.text}`);

    const currentEnd = getLastListItem(block.items, currentIndex).lineNo;

    if (direction == 'up') {
      this.adapter.move({ start: current.lineNo, end: currentEnd }, next.lineNo);
    } else {
      const nextEnd = getLastListItem(block.items, nextIndex).lineNo;
      this.adapter.move({ start: current.lineNo, end: currentEnd }, nextEnd);
    }
  }
}
