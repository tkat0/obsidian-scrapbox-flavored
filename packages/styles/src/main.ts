import { Plugin } from 'obsidian';

import { scrapboxStyleField as scrapboxStylesField } from './field';
import type { StylesSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export { DEFAULT_SETTINGS as OUTLINER_DEFAULT_SETTINGS };

export default class StylesPlugin extends Plugin {
  settings: StylesSettings;

  async onload() {
    this.registerEditorExtension(scrapboxStylesField);
  }
}
