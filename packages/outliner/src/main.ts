import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { Plugin } from 'obsidian';

import {
    indentList,
    indentSelecttedBlock,
    moveCursorToBegin,
    moveCursorToEnd,
    moveListBlock,
    outdentList,
} from './features/listop';
import type { OutlinerSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export { DEFAULT_SETTINGS as OUTLINER_DEFAULT_SETTINGS };

export default class OutlinerPlugin extends Plugin {
    settings: OutlinerSettings;

    async onload() {
        this.app.vault.config.tabSize ??= 4;
        this.app.vault.config.useTab ??= true;

        const { useTab, tabSize } = this.app.vault.config;

        // if `useTab`, '\t'
        const indent = useTab ? '\t' : ' '.repeat(tabSize);

        // register code mirror extensions triggerd by simple hotkeys
        this.registerEditorExtension(
            Prec.highest(
                keymap.of([
                    {
                        key: 'Tab',
                        run: (target) => {
                            return indentList(target, indent);
                        },
                    },
                    {
                        key: 'Space',
                        run: (target) => {
                            return indentList(target, indent, 'next-to-prefix');
                        },
                    },
                    {
                        key: 's-Tab',
                        run: (target) => {
                            return outdentList(target, indent);
                        },
                    },
                    {
                        key: 'Backspace',
                        run: (target) => {
                            return outdentList(target, indent, 'next-to-prefix');
                        },
                    },
                ]),
            ),
        );

        this.addCommand({
            id: 'move-cursor-beginning-of-line',
            name: 'Move cursor to the beginning of the line',
            editorCallback: (editor, _markdown) => {
                moveCursorToBegin(editor);
            },
            hotkeys: [{ modifiers: ['Ctrl'], key: 'a' }],
        });

        this.addCommand({
            id: 'move-cursor-end-of-line',
            name: 'Move cursor to the end of the line',
            editorCallback: (editor, _markdown) => {
                moveCursorToEnd(editor);
            },
            hotkeys: [{ modifiers: ['Ctrl'], key: 'e' }],
        });

        this.addCommand({
            id: 'move-up-current-block-of-list',
            name: 'Move up the current block of the list',
            editorCallback: (editor, _markdown) => {
                moveListBlock(editor, 'up');
            },
            hotkeys: [{ modifiers: ['Alt'], key: 'ArrowUp' }],
        });

        this.addCommand({
            id: 'move-down-current-block-of-list',
            name: 'Move down the current block of the list',
            editorCallback: (editor, _markdown) => {
                moveListBlock(editor, 'down');
            },
            hotkeys: [{ modifiers: ['Alt'], key: 'ArrowDown' }],
        });

        this.addCommand({
            id: 'indent-selected-block-of-list',
            name: 'Indent the selected block of the list',
            editorCallback: (editor, _markdown) => {
                indentSelecttedBlock(editor, 'indent', indent);
            },
            hotkeys: [{ modifiers: ['Alt'], key: 'ArrowRight' }],
        });

        this.addCommand({
            id: 'outdent-selected-block-of-list',
            name: 'Outndent the selected block of the list',
            editorCallback: (editor, _markdown) => {
                indentSelecttedBlock(editor, 'outdent', indent);
            },
            hotkeys: [{ modifiers: ['Alt'], key: 'ArrowLeft' }],
        });
    }
}
