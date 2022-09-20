import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { Plugin } from 'obsidian';

import { ObsidianAdapterImpl } from './adapter/ObsidianAdapterImpl';
import { IndentListItemsUsecase, IndentListItemsUsecaseOutput } from './domain/usecase/IndentListItemsUsecase';
import { MoveCursorUsecase } from './domain/usecase/MoveCursorUsecase';
import { ReadListBlockUsecase } from './domain/usecase/ReadListBlockUsecase';
import { SwapListItemsUseacase } from './domain/usecase/SwapListItemsUsecase';
import type { OutlinerSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export { DEFAULT_SETTINGS as OUTLINER_DEFAULT_SETTINGS };

export default class OutlinerPlugin extends Plugin {
  settings: OutlinerSettings;

  async onload() {
    const config = this.app.vault.config;

    const move = (target: EditorView, direction: 'up' | 'down') => {
      const obsidianAdapter = new ObsidianAdapterImpl(this.app, target, config);
      const readListBlockUsecase = new ReadListBlockUsecase(obsidianAdapter);
      const usecase = new SwapListItemsUseacase(obsidianAdapter, readListBlockUsecase);
      usecase.invoke(direction);
    };

    const indent = (
      target: EditorView,
      direction: 'indent' | 'outdent',
      condition: 'begin-of-line' | 'after-prefix' | undefined = undefined,
    ): IndentListItemsUsecaseOutput => {
      const obsidianAdapter = new ObsidianAdapterImpl(this.app, target, config);
      const readListBlockUsecase = new ReadListBlockUsecase(obsidianAdapter);
      const usecase = new IndentListItemsUsecase(obsidianAdapter, readListBlockUsecase);
      return usecase.invoke({ direction, condition });
    };

    // register code mirror extensions triggerd by simple hotkeys
    this.registerEditorExtension(
      Prec.highest(
        keymap.of([
          {
            key: 'Ctrl-a',
            run: (target) => {
              const obsidianAdapter = new ObsidianAdapterImpl(this.app, target, config);
              const usecase = new MoveCursorUsecase(obsidianAdapter);
              usecase.invoke('begin');
              return true;
            },
          },
          {
            key: 'Ctrl-e',
            run: (target) => {
              const obsidianAdapter = new ObsidianAdapterImpl(this.app, target, config);
              const usecase = new MoveCursorUsecase(obsidianAdapter);
              usecase.invoke('end');
              return true;
            },
          },
          {
            key: 'Alt-ArrowUp',
            run: (target) => {
              move(target, 'up');
              return true;
            },
          },
          {
            key: 'Alt-ArrowDown',
            run: (target) => {
              move(target, 'down');
              return true;
            },
          },
          {
            key: 'Alt-ArrowRight',
            run: (target) => {
              return indent(target, 'indent').isList;
            },
          },
          {
            key: 'Alt-ArrowLeft',
            run: (target) => {
              return indent(target, 'outdent').isList;
            },
          },
          {
            key: 'Tab',
            run: (target) => {
              return indent(target, 'indent').isList;
            },
          },
          {
            key: 'Shift-Tab',
            run: (target) => {
              return indent(target, 'outdent').isList;
            },
          },
          {
            key: 'Space',
            run: (target) => {
              // allow to indent by space key only when a line is empty
              const { changedLineNo } = indent(target, 'indent', 'begin-of-line');
              if (changedLineNo.length > 0) {
                return true;
              } else {
                return false; // allow default behavior
              }
            },
          },
          {
            key: 'Backspace',
            run: (target) => {
              // allow to outdent by backspace key only when the cursor is next to a list prefix
              const { changedLineNo } = indent(target, 'outdent', 'after-prefix');
              if (changedLineNo.length > 0) {
                return true;
              } else {
                return false; // allow default behavior
              }
            },
          },
        ]),
      ),
    );
  }
}
