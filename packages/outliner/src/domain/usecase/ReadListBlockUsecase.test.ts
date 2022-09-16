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

  it(`should indent with no list item`, async () => {
    const page = ['- 0', '  * 1', '1. 2', '  - 3', '4'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { block, currentIndex } = readListBlockUsecase.invoke(lineNo);

    const expected: ListItem[] = [
      { indent: '', level: 0, lineNo: 0, prefix: '-', text: '0' },
      { indent: '  ', level: 1, lineNo: 1, prefix: '*', text: '1' },
      { indent: '', level: 0, lineNo: 2, prefix: '1.', text: '2' },
      { indent: '  ', level: 1, lineNo: 3, prefix: '-', text: '3' },
    ];

    expect(block?.items).toEqual(expected);
    expect(currentIndex).toBe(1);
  });
});
