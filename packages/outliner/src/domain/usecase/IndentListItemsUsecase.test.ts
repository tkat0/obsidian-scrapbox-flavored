import { mock } from 'vitest-mock-extended';

import { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import { IndentListItemsUsecase } from './IndentListItemsUsecase';
import { ReadListBlockUsecase } from './ReadListBlockUsecase';

describe('IndentListItemsUsecase', () => {
  const obsidian = mock<ObsidianAdapter>();
  let indentListItemsUsecase: IndentListItemsUsecase;
  let readListBlockUsecase: ReadListBlockUsecase;

  beforeEach(async () => {
    readListBlockUsecase = new ReadListBlockUsecase(obsidian);
    indentListItemsUsecase = new IndentListItemsUsecase(obsidian, readListBlockUsecase);
  });

  const setMock = (page: string[], lineNo: number) => {
    obsidian.readCurrentLine.mockReturnValue({ lineNo, text: page[lineNo] });
    obsidian.readLine.mockImplementation((lineNo) => page[lineNo]);
    obsidian.lineCount.mockReturnValue(page.length);
    obsidian.canIndent.mockReturnValue(true);
  };

  it(`should indent with no list item`, async () => {
    const page = ['0', '- 1', '- 2'];
    const lineNo = 0;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('indent');

    expect(changedLineNo).toEqual([0]);
  });

  it(`should not indent the first item`, async () => {
    const page = ['- 0', '- 1', '- 2'];
    const lineNo = 0;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('indent');

    expect(changedLineNo).toEqual([]);
  });

  it(`should indent and unindent on several sections`, async () => {
    const page = ['```', 'inside code block', '```'];
    const lineNo = 1;

    setMock(page, lineNo);
    obsidian.canIndent.mockReturnValue(false);

    {
      const { changedLineNo } = indentListItemsUsecase.invoke('indent');
      expect(changedLineNo).toEqual([]);
    }
    {
      const { changedLineNo } = indentListItemsUsecase.invoke('outdent');
      expect(changedLineNo).toEqual([]);
    }
  });

  it(`should indent`, async () => {
    const page = ['- 0', '- 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('indent');

    expect(changedLineNo).toEqual([1]);
  });

  it(`should not indent deeper`, async () => {
    const page = ['- 0', '  - 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('indent');

    expect(changedLineNo).toEqual([]);
  });

  it(`should indent with children`, async () => {
    const page = ['- 0', '- 1', '  - 2', '  - 3'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('indent');

    expect(changedLineNo).toEqual([1, 2, 3]);
  });

  it(`should outdent`, async () => {
    const page = ['- 0', '  - 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('outdent');

    expect(changedLineNo).toEqual([1]);
  });

  it(`should not outdent no list item`, async () => {
    const page = ['- 0', '1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('outdent');

    expect(changedLineNo).toEqual([]);
  });

  it(`should outdent with children`, async () => {
    const page = ['- 0', '  - 1', '    - 2', '    - 3'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke('outdent');

    expect(changedLineNo).toEqual([1, 2, 3]);
  });
});
