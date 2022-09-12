import { EditorView } from '@codemirror/view';
import { Editor, EditorChange, EditorPosition } from 'obsidian';

/**
 * matches line as follows.
 *  " - ", " * ", " 1. "
 */
const REGEX_MARKDOWN_LIST = /(?<indent>[\s]*)([-*]|\d+\.)\s+/;

type GetListInfoOutput = {
    isList: boolean;
    level?: number;
    prefix?: string;
};

// even if it's same looks, the return value is different depends on it's tab or space.
// e.g 1 tab => 1, 4 space => 4
const getListInfo = (text: string): GetListInfoOutput => {
    const prefix = text.match(REGEX_MARKDOWN_LIST);
    if (prefix?.groups) {
        return {
            isList: true,
            level: prefix.groups['indent'].length,
            prefix: prefix[0],
        };
    } else {
        return {
            isList: false,
        };
    }
};

/**
 * Get the last line of block in the list.
 */
const getListBlock = (editor: Editor, line: number, to: 'up' | 'down'): number => {
    const { level: srcLevel } = getListInfo(editor.getLine(line));

    let nextLine: number = line;
    let level: number | undefined;
    for (;;) {
        nextLine = to === 'down' ? nextLine + 1 : nextLine - 1;
        level = getListInfo(editor.getLine(nextLine)).level;
        if (level <= srcLevel || level === undefined) {
            return to === 'down' ? nextLine - 1 : nextLine;
        }
    }
};

export const indentSelecttedBlock = (editor: Editor, direction: 'indent' | 'outdent', indent: string) => {
    const selections = editor.listSelections();
    if (!selections) return;

    const { head, anchor } = selections[0];
    const isSelectSingleLine = head.line === anchor.line;

    // calc indent range.
    let begin: number;
    let end: number;
    if (isSelectSingleLine) {
        begin = anchor.line;
        end = getListBlock(editor, begin, 'down');
    } else {
        [begin, end] = head.line < anchor.line ? [head.line, anchor.line] : [anchor.line, head.line];
    }

    // calc cursor position after indent.
    const line = editor.getLine(anchor.line);
    const { level, prefix } = getListInfo(line);
    let newAnchor: EditorPosition;
    let newHead: EditorPosition | undefined = undefined;
    if (direction === 'indent') {
        if (level === undefined) {
            newAnchor = { line: anchor.line, ch: anchor.ch + 2 /* add "- " */ };
            if (!isSelectSingleLine) newHead = { line: head.line, ch: head.ch + 2 };
        } else {
            newAnchor = { line: anchor.line, ch: anchor.ch + indent.length };
            if (!isSelectSingleLine) newHead = { line: head.line, ch: head.ch + indent.length };
        }
    } else {
        if (level === 0) {
            newAnchor = { line: anchor.line, ch: anchor.ch - prefix.length };
            if (!isSelectSingleLine) newHead = { line: head.line, ch: head.ch - prefix.length };
        } else {
            newAnchor = { line: anchor.line, ch: anchor.ch - indent.length };
            if (!isSelectSingleLine) newHead = { line: head.line, ch: head.ch - indent.length };
        }
    }

    // calc updates for each line.
    const changes: EditorChange[] = [];
    for (let i = begin; i <= end; i++) {
        const line = editor.getLine(i);
        const { level, prefix } = getListInfo(line);
        switch (direction) {
            case 'indent':
                if (level === undefined) {
                    changes.push({
                        text: `- ${line}`,
                        from: { line: i, ch: 0 },
                        to: { line: i, ch: line.length },
                    });
                } else {
                    changes.push({
                        text: `${indent}${line}`,
                        from: { line: i, ch: 0 },
                        to: { line: i, ch: line.length },
                    });
                }
                break;
            case 'outdent':
                // if level = 0, remove list
                if (level === 0) {
                    changes.push({
                        text: line.substring(prefix.length),
                        from: { line: i, ch: 0 },
                        to: { line: i, ch: line.length },
                    });
                } else {
                    changes.push({
                        text: line.substring(indent.length),
                        from: { line: i, ch: 0 },
                        to: { line: i, ch: line.length },
                    });
                }
                break;
        }
    }

    editor.transaction({
        changes,
    });

    editor.setSelection(newAnchor, newHead);
};

export const moveListBlock = (editor: Editor, to: 'up' | 'down') => {
    const { line: srcBegin, ch } = editor.getCursor();
    const { level: srcLevel } = getListInfo(editor.getLine(srcBegin));

    // return if not list.
    if (srcLevel === undefined) return;

    const selections = editor.listSelections();
    if (!selections) return;

    const { head, anchor } = selections[0];
    const isSelectSingleLine = head.line === anchor.line;
    if (!isSelectSingleLine) return;

    const srcEnd = getListBlock(editor, srcBegin, 'down');

    let dstBegin, dstEnd: number;
    if (to === 'down') {
        dstBegin = srcEnd + 1;
        dstEnd = getListBlock(editor, dstBegin, 'down');
    } else {
        dstEnd = srcBegin - 1;
        dstBegin = getListBlock(editor, srcBegin, 'up');
    }

    const { level: dstLevel } = getListInfo(editor.getLine(dstBegin));

    // Don't allow moving between different levels.
    // This is different from obsidian-outliner.
    if (srcLevel !== dstLevel) return;

    const srcEndLength = editor.getLine(srcEnd).length;
    const dstEndLength = editor.getLine(dstEnd).length;

    const src = editor.getRange({ line: srcBegin, ch: 0 }, { line: srcEnd, ch: srcEndLength });
    const dst = editor.getRange({ line: dstBegin, ch: 0 }, { line: dstEnd, ch: dstEndLength });

    const changes: EditorChange[] = [];
    if (to === 'down') {
        changes.push({
            text: `${dst}\n${src}`,
            from: { line: srcBegin, ch: 0 },
            to: { line: dstEnd, ch: dstEndLength },
        });
        editor.transaction({
            changes,
        });
        editor.setCursor({ line: srcBegin + (dstEnd - dstBegin) + 1, ch });
    } else {
        changes.push({
            text: `${src}\n${dst}`,
            from: { line: dstBegin, ch: 0 },
            to: { line: srcEnd, ch: srcEndLength },
        });
        editor.transaction({
            changes,
        });
        editor.setCursor({ line: dstBegin, ch });
    }
};

export const moveCursorToBegin = (editor: Editor) => {
    const { line, ch } = editor.getCursor();
    const text = editor.getLine(line);
    const prefix = text.match(REGEX_MARKDOWN_LIST);
    if (prefix !== null && !(ch <= prefix[0].length)) {
        editor.setCursor(line, prefix[0].length);
    } else {
        editor.setCursor(line, 0);
    }
};

export const moveCursorToEnd = (editor: Editor) => {
    const { line } = editor.getCursor();
    const text = editor.getLine(line);
    editor.setCursor(line, text.length);
};

export const indentList = (
    target: EditorView,
    indent: string,
    cursor: 'next-to-prefix' | undefined = undefined,
): boolean => {
    const selection = target.state.selection;

    if (selection.ranges.length !== 1) return false;

    const range = selection.ranges[0];
    const line = target.state.doc.lineAt(range.anchor);

    const { level, prefix } = getListInfo(line.text);

    // 1) "hoge"
    //     ^ cursor is here
    // 2) "   - hoge"
    //          ^ cursor is here
    const isCursorNextToPrefix =
        level === undefined ? line.from === range.from : line.from + prefix.length === range.from;

    if (cursor === 'next-to-prefix' && !isCursorNextToPrefix) {
        return false;
    }

    if (level === undefined) {
        const prefix = '- ';
        target.dispatch({
            changes: [
                {
                    from: line.from,
                    to: line.to,
                    insert: `${prefix}${line.text}`,
                },
            ],
            selection: {
                anchor: range.anchor + prefix.length,
            },
        });
    } else {
        target.dispatch({
            changes: [
                {
                    from: line.from,
                    to: line.to,
                    insert: `${indent}${line.text}`,
                },
            ],
            selection: {
                anchor: range.anchor + indent.length,
            },
        });
    }
    return true;
};

export const outdentList = (
    target: EditorView,
    indent: string,
    cursor: 'next-to-prefix' | undefined = undefined,
): boolean => {
    const selection = target.state.selection;

    if (selection.ranges.length !== 1) return false;

    const range = selection.ranges[0];
    const line = target.state.doc.lineAt(range.anchor);

    const { level, prefix } = getListInfo(line.text);

    if (level === undefined) return false;

    // "   - hoge"
    //       ^ cursor is here
    const isCursorNextToPrefix = line.from + prefix.length === range.from;

    if (cursor === 'next-to-prefix' && !isCursorNextToPrefix) return false;

    if (level === 0) {
        target.dispatch({
            changes: [
                {
                    from: line.from,
                    to: line.to,
                    insert: line.text.substring(prefix.length),
                },
            ],
            selection: {
                anchor: range.anchor - prefix.length,
            },
        });
    } else {
        target.dispatch({
            changes: [
                {
                    from: line.from,
                    to: line.to,
                    insert: line.text.substring(indent.length),
                },
            ],
            selection: {
                anchor: range.anchor - indent.length,
            },
        });
    }

    return true;
};
