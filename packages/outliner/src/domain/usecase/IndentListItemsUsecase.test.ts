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
    obsidian.readCurrentLine.mockReturnValue({ lineNo, text: page[lineNo - 1] });
    obsidian.readLine.mockImplementation((lineNo) => page[lineNo - 1]);
    obsidian.lineCount.mockReturnValue(page.length);
    obsidian.canIndent.mockReturnValue(true);
    obsidian.getCursor.mockReturnValue({ offset: 0, line: 0, anchor: 0 });
  };

  it(`should indent with no list item`, async () => {
    const page = ['0', '- 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'indent' });

    expect(changedLineNo).toEqual([1]);
  });

  it(`should not indent the first item`, async () => {
    const page = ['- 0', '- 1', '- 2'];
    const lineNo = 1;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'indent' });

    expect(changedLineNo).toEqual([]);
  });

  it(`should indent and unindent on several sections`, async () => {
    const page = ['```', 'inside code block', '```'];
    const lineNo = 2;

    setMock(page, lineNo);
    obsidian.canIndent.mockReturnValue(false);

    {
      const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'indent' });
      expect(changedLineNo).toEqual([]);
    }
    {
      const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'outdent' });
      expect(changedLineNo).toEqual([]);
    }
  });

  it(`should indent`, async () => {
    const page = ['- 0', '- 1', '- 2'];
    const lineNo = 2;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'indent' });

    expect(changedLineNo).toEqual([2]);
  });

  it(`should indent deeper`, async () => {
    const page = ['- 0', '  - 1', '- 2'];
    const lineNo = 2;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'indent' });

    expect(changedLineNo).toEqual([2]);
  });

  it(`should indent with children`, async () => {
    const page = ['- 0', '- 1', '  - 2', '  - 3'];
    const lineNo = 2;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'indent' });

    expect(changedLineNo).toEqual([2, 3, 4]);
  });

  it(`should outdent`, async () => {
    const page = ['- 0', '  - 1', '- 2'];
    const lineNo = 2;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'outdent' });

    expect(changedLineNo).toEqual([2]);
  });

  it(`should not outdent no list item`, async () => {
    const page = ['- 0', '1', '- 2'];
    const lineNo = 2;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'outdent' });

    expect(changedLineNo).toEqual([]);
  });

  it(`should outdent with children`, async () => {
    const page = ['- 0', '  - 1', '    - 2', '    - 3'];
    const lineNo = 2;

    setMock(page, lineNo);

    const { changedLineNo } = indentListItemsUsecase.invoke({ direction: 'outdent' });

    expect(changedLineNo).toEqual([2, 3, 4]);
  });
});
