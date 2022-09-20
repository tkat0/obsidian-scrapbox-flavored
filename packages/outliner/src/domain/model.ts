export interface ListBlock {
  items: ListItem[];
}

export interface ListItem {
  text: string;
  prefix: string;
  level: number;
  lineNo: LineNo;
  indent: string;
}

export type LineNo = number;
export type IndentDirection = 'indent' | 'outdent';

export interface LineRange {
  start: LineNo;
  end: LineNo;
}

/** The markdown sections where list items should not be placed */
export const EXCLUDE_LIST_SECTIONS = ['code', 'table', 'heading'];

/**
 * matches line as follows.
 *  " - ", " * ", " 1. "
 */
export const REGEX_MARKDOWN_LIST = /(?<indent>[\s]*)([-*]|\d+\.)\s/;

// even if it's same looks, the return value is different depends on it's tab or space.
// e.g 1 tab => 1, 4 space => 4
export const getListInfo = (text: string): GetListInfoOutput => {
  const prefix = text.match(REGEX_MARKDOWN_LIST);
  if (prefix?.groups) {
    return {
      isList: true,
      // level: prefix.groups['indent'].length,
      prefix: prefix[2],
      indent: prefix.groups['indent'],
      content: text.substring(prefix[0].length),
    };
  } else {
    return {
      isList: false,
    };
  }
};

export const calcLevel = (items: ListItem[]) => {
  let currentLevel = 0;
  let indent = '';
  // use first level1 indent as a unit
  let unit: string | undefined = undefined;
  items.map((item) => {
    if (item.indent.length == 0) {
      currentLevel = 0;
    } else if (item.indent.length > indent.length) {
      currentLevel += 1;
      if (currentLevel == 1) {
        unit = item.indent;
      }
    } else if (item.indent.length < indent.length) {
      currentLevel = Math.trunc(item.indent.length / unit.length);
    }
    indent = item.indent;
    item.level = currentLevel;
    return item;
  });
};

export interface GetListInfoOutput {
  isList: boolean;
  level?: number;
  prefix?: string;
  indent?: string;
  content?: string;
}

export const getChildren = (items: ListItem[], index: number) => {
  const current = items[index];
  const children = [];
  for (const item of items.slice(index + 1)) {
    if (item.level <= current.level) {
      // no children
      break;
    }
    children.push(item);
  }
  return children;
};

export const getLastListItem = (items: ListItem[], index: number): ListItem => {
  const current = items[index];
  const children = getChildren(items, index);
  if (children.length > 0) {
    return children.at(-1);
  } else {
    return current;
  }
};

// Get next item of same level
export const getNextListItem = (items: ListItem[], index: number, direction: 'up' | 'down'): number | undefined => {
  const current = items[index];
  let nextIndex = -1;

  if (direction == 'down') {
    const offset = index + 1;
    const iter = items.slice(offset);
    for (let i = 0; i < iter.length; i++) {
      const next = iter[i];
      if (current.level > next.level) {
        break;
      }
      if (current.level == next.level) {
        nextIndex = offset + i;
        break;
      }
    }
  } else {
    const iter = items.slice(0, index);
    for (let i = index - 1; i >= 0; i--) {
      const next = iter[i];
      if (current.level > next.level) {
        break;
      }
      if (current.level == next.level) {
        nextIndex = i;
        break;
      }
    }
  }

  if (nextIndex < 0) {
    return;
  } else {
    return nextIndex;
  }
};

export const isCursorNextToPrefix = (text: string, cursor: number) => {
  // "   - hoge"
  //       ^ cursor is here
  const prefix = text.match(REGEX_MARKDOWN_LIST);
  return prefix !== null && cursor == prefix[0].length;
};
