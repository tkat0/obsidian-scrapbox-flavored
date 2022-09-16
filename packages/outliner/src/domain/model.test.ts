import { ListItem, calcLevel, getLastListItem } from './model';

describe('calcLevel', () => {
  test(`normal list`, async () => {
    const items: ListItem[] = [
      { lineNo: 0, level: -1, indent: '', prefix: '-', text: '0' },
      { lineNo: 1, level: -1, indent: '  ', prefix: '-', text: '1' },
      { lineNo: 2, level: -1, indent: '  ', prefix: '-', text: '2' },
      { lineNo: 3, level: -1, indent: '', prefix: '-', text: '3' },
      { lineNo: 4, level: -1, indent: '    ', prefix: '-', text: '4' },
    ];

    calcLevel(items);

    const levels = items.map((item) => item.level);
    expect(levels).toStrictEqual([0, 1, 1, 0, 1]);
  });
});

describe('getLastListItem', () => {
  test(`no children`, async () => {
    const items: ListItem[] = [
      { lineNo: 0, level: 0, indent: '', prefix: '-', text: '0' },
      { lineNo: 1, level: 0, indent: '', prefix: '-', text: '1' },
    ];

    expect(getLastListItem(items, 0)).toBe(items[0]);
    expect(getLastListItem(items, 1)).toBe(items[1]);
  });

  test(`children`, async () => {
    const items: ListItem[] = [
      { lineNo: 0, level: 0, indent: '', prefix: '-', text: '0' },
      { lineNo: 1, level: 1, indent: '  ', prefix: '-', text: '1' },
      { lineNo: 2, level: 2, indent: '    ', prefix: '-', text: '2' },
      { lineNo: 3, level: 0, indent: '', prefix: '-', text: '3' },
      { lineNo: 4, level: 1, indent: '  ', prefix: '-', text: '4' },
    ];

    expect(getLastListItem(items, 0)).toBe(items[2]);
  });
});
