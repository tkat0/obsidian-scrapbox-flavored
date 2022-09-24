import { mock } from 'vitest-mock-extended';

import { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { ListItem } from '../model';
import { ReadListBlockUsecase } from './ReadListBlockUsecase';

describe('ReadListBlockUsecase', () => {
  const obsidian = mock<ObsidianAdapter>();
  let readListBlockUsecase: ReadListBlockUsecase;

  beforeEach(async () => {
    readListBlockUsecase = new ReadListBlockUsecase(obsidian);
  });

  const setMock = (page: string[], lineNo: number) => {
    obsidian.readLine.mockImplementation((lineNo) => page[lineNo]);
    obsidian.lineCount.mockReturnValue(page.length);
  };

  it(`should not read block with no list item`, async () => {
    const page = ['0', '- 1', '- 2'];
    const lineNo = 0;

    setMock(page, lineNo);

    const { block, currentIndex } = readListBlockUsecase.invoke(lineNo);

    expect(block).toBeUndefined();
    expect(currentIndex).toBeUndefined();
  });
});
