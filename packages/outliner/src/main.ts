import { Plugin } from 'obsidian';

import { ObsidianAdapterImpl } from './adapter/ObsidianAdapterImpl';
import { IndentListItemsUsecase } from './domain/usecase/IndentListItemsUsecase';
import { ReadListBlockUsecase } from './domain/usecase/ReadListBlockUsecase';
import { SwapListItemsUseacase } from './domain/usecase/SwapListItemsUsecase';
import { moveCursorToBegin, moveCursorToEnd } from './features/listop';
import type { OutlinerSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export { DEFAULT_SETTINGS as OUTLINER_DEFAULT_SETTINGS };

export default class OutlinerPlugin extends Plugin {
  settings: OutlinerSettings;

  async onload() {
    const config = this.app.vault.config;

    this.addCommand({
      id: 'move-cursor-beginning-of-line',
      name: 'Move cursor to the beginning of the line',
      repeatable: true,
      editorCallback: (editor, _markdown) => {
        moveCursorToBegin(editor);
      },
      hotkeys: [{ modifiers: ['Ctrl'], key: 'a' }],
    });

    this.addCommand({
      id: 'move-cursor-end-of-line',
      name: 'Move cursor to the end of the line',
      repeatable: true,
      editorCallback: (editor, _markdown) => {
        moveCursorToEnd(editor);
      },
      hotkeys: [{ modifiers: ['Ctrl'], key: 'e' }],
    });

    this.addCommand({
      id: 'move-up-current-block-of-list',
      name: 'Move up the current block of the list',
      repeatable: true,
      editorCallback: (editor, _markdown) => {
        const obsidianAdapter = new ObsidianAdapterImpl(this.app, editor, config);
        const readListBlockUsecase = new ReadListBlockUsecase(obsidianAdapter);
        const usecase = new SwapListItemsUseacase(obsidianAdapter, readListBlockUsecase);
        usecase.invoke('up');
      },
      hotkeys: [{ modifiers: ['Alt'], key: 'ArrowUp' }],
    });

    this.addCommand({
      id: 'move-down-current-block-of-list',
      name: 'Move down the current block of the list',
      repeatable: true,
      editorCallback: (editor, _markdown) => {
        const obsidianAdapter = new ObsidianAdapterImpl(this.app, editor, config);
        const readListBlockUsecase = new ReadListBlockUsecase(obsidianAdapter);
        const usecase = new SwapListItemsUseacase(obsidianAdapter, readListBlockUsecase);
        usecase.invoke('down');
      },
      hotkeys: [{ modifiers: ['Alt'], key: 'ArrowDown' }],
    });

    this.addCommand({
      id: 'indent-selected-block-of-list',
      name: 'Indent the selected block of the list',
      repeatable: true,
      editorCallback: (editor, _markdown) => {
        const obsidianAdapter = new ObsidianAdapterImpl(this.app, editor, config);
        const readListBlockUsecase = new ReadListBlockUsecase(obsidianAdapter);
        const usecase = new IndentListItemsUsecase(obsidianAdapter, readListBlockUsecase);
        usecase.invoke('indent');
      },
      hotkeys: [
        { modifiers: ['Alt'], key: 'ArrowRight' },
        { modifiers: [], key: 'Tab' },
        // { modifiers: [], key: 'Space' },
      ],
    });

    this.addCommand({
      id: 'outdent-selected-block-of-list',
      name: 'Outndent the selected block of the list',
      repeatable: true,
      editorCallback: (editor, _markdown) => {
        const obsidianAdapter = new ObsidianAdapterImpl(this.app, editor, config);
        const readListBlockUsecase = new ReadListBlockUsecase(obsidianAdapter);
        const usecase = new IndentListItemsUsecase(obsidianAdapter, readListBlockUsecase);
        usecase.invoke('outdent');
      },
      hotkeys: [
        { modifiers: ['Alt'], key: 'ArrowLeft' },
        { modifiers: ['Shift'], key: 'Tab' },
        // { modifiers: [], key: 'Backspace' },
      ],
    });
  }
}
