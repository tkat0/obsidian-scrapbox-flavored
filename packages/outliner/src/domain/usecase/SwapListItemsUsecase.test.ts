import { mock } from 'vitest-mock-extended';

import { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { ReadListBlockUsecase } from './ReadListBlockUsecase';
import { SwapListItemsUseacase } from './SwapListItemsUsecase';

describe('GetPagesUsecaseImpl', () => {
  const obsidian = mock<ObsidianAdapter>();
  let swapListItemsUseacase: SwapListItemsUseacase;
  let readListBlockUsecase: ReadListBlockUsecase;

  beforeEach(async () => {
    readListBlockUsecase = new ReadListBlockUsecase(obsidian);
    swapListItemsUseacase = new SwapListItemsUseacase(obsidian, readListBlockUsecase);
  });

  const setMock = (page: string[], lineNo: number) => {
    obsidian.readCurrentLine.mockReturnValue({ lineNo, text: page[lineNo] });
    obsidian.readLine.mockImplementation((lineNo) => page[lineNo]);
    obsidian.lineCount.mockReturnValue(page.length);
  };

  it(`should not move if it's no list`, async () => {
    const page = ['0', '- 1', '- 2'];
    const lineNo = 0;

    setMock(page, lineNo);

    swapListItemsUseacase.invoke('up');
    swapListItemsUseacase.invoke('down');

    expect(obsidian.move).not.toBeCalled();
  });

  it(`should not move if it's first item`, async () => {
    const page = ['- 0', '  - 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    swapListItemsUseacase.invoke('up');
    swapListItemsUseacase.invoke('down');

    expect(obsidian.move).not.toBeCalled();
  });

  it(`should move up`, async () => {
    const page = ['- 0', '- 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    swapListItemsUseacase.invoke('up');

    expect(obsidian.move).toHaveBeenCalledWith({ start: 1, end: 1 }, 0);
  });

  it(`should move down`, async () => {
    const page = ['- 0', '- 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    swapListItemsUseacase.invoke('down');

    expect(obsidian.move).toHaveBeenCalledWith({ start: 1, end: 1 }, 2);
  });

  it(`should move up with children`, async () => {
    const page = ['- 0', '- 1', '  - 2', '  - 3', '- 4', '  - 5'];
    const lineNo = 1;

    setMock(page, lineNo);

    swapListItemsUseacase.invoke('up');

    expect(obsidian.move).toHaveBeenCalledWith({ start: 1, end: 3 }, 0);
  });

  it(`should move down with children`, async () => {
    const page = ['- 0', '- 1', '  - 2', '  - 3', '- 4', '  - 5'];
    const lineNo = 1;

    setMock(page, lineNo);

    swapListItemsUseacase.invoke('down');

    expect(obsidian.move).toHaveBeenCalledWith({ start: 1, end: 3 }, 5);
  });
});
