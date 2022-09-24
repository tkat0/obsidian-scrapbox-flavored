import { ListItem, calcLevel, getLastListItem, isCursorNextToPrefix } from './model';

describe('calcLevel', () => {
  test(`normal list`, async () => {
    const items: ListItem[] = [
      { lineNo: 1, level: -1, indent: '', prefix: '-', text: '1' },
      { lineNo: 2, level: -1, indent: '\t', prefix: '-', text: '2' },
      { lineNo: 3, level: -1, indent: '\t', prefix: '-', text: '3' },
      { lineNo: 4, level: -1, indent: '', prefix: '-', text: '4' },
      { lineNo: 5, level: -1, indent: '\t', prefix: '-', text: '5' },
      { lineNo: 6, level: -1, indent: '\t\t', prefix: '-', text: '6' },
      { lineNo: 7, level: -1, indent: '\t\t\t', prefix: '-', text: '7' },
      { lineNo: 8, level: -1, indent: '\t', prefix: '-', text: '8' },
      { lineNo: 9, level: -1, indent: '', prefix: '-', text: '9' },
    ];

    calcLevel(items);

    const levels = items.map((item) => item.level);
    expect(levels).toStrictEqual([0, 2, 2, 0, 2, 4, 6, 2, 0]);
  });
});

describe('getLastListItem', () => {
  test(`no children`, async () => {
    const items: ListItem[] = [
      { lineNo: 1, level: 0, indent: '', prefix: '-', text: '1' },
      { lineNo: 2, level: 0, indent: '', prefix: '-', text: '2' },
    ];

    expect(getLastListItem(items, 0)).toBe(items[0]);
    expect(getLastListItem(items, 1)).toBe(items[1]);
  });

  test(`children`, async () => {
    const items: ListItem[] = [
      { lineNo: 1, level: 0, indent: '', prefix: '-', text: '1' },
      { lineNo: 2, level: 1, indent: '  ', prefix: '-', text: '2' },
      { lineNo: 3, level: 2, indent: '    ', prefix: '-', text: '3' },
      { lineNo: 4, level: 0, indent: '', prefix: '-', text: '4' },
      { lineNo: 5, level: 1, indent: '  ', prefix: '-', text: '5' },
    ];

    expect(getLastListItem(items, 0)).toBe(items[2]);
  });
});

describe('isCursorNextToPrefix', () => {
  test(`returns true`, async () => {
    expect(isCursorNextToPrefix('- abc', 2)).toBeTruthy();
    expect(isCursorNextToPrefix('  - abc', 4)).toBeTruthy();
  });

  test(`returns false`, async () => {
    expect(isCursorNextToPrefix('- abc', 0)).toBeFalsy();
    expect(isCursorNextToPrefix('- abc', 1)).toBeFalsy();
    expect(isCursorNextToPrefix('- abc', 3)).toBeFalsy();
    expect(isCursorNextToPrefix('abc', 0)).toBeFalsy();
  });
});
