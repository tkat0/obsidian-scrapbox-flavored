import { App, PluginSettingTab, Setting } from 'obsidian';

import { GRID_VIEW_DEFAULT_SETTINGS } from '@obsidian-scrapbox-flavored/grid-view';
import type { GridViewSettings } from '@obsidian-scrapbox-flavored/grid-view';
import { OUTLINER_DEFAULT_SETTINGS } from '@obsidian-scrapbox-flavored/outliner';
import type { OutlinerSettings } from '@obsidian-scrapbox-flavored/outliner';

import ScrapboxFlavoredPlugin from './main';

export interface ScrapboxFlavoredPluginSettings {
  gridView: GridViewSettings;
  outliner: OutlinerSettings;
  enableOutliner: boolean;
}

export const DEFAULT_SETTINGS: ScrapboxFlavoredPluginSettings = {
  gridView: GRID_VIEW_DEFAULT_SETTINGS,
  outliner: OUTLINER_DEFAULT_SETTINGS,
  enableOutliner: false,
};

export class ScrapboxFlavoredPluginSettingTab extends PluginSettingTab {
  plugin: ScrapboxFlavoredPlugin;

  constructor(app: App, plugin: ScrapboxFlavoredPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'Scrapbox-flavored Settings' });

    new Setting(containerEl).setName('Outliner').setHeading();

    new Setting(containerEl)
      .setName('enable')
      .setDesc('enable experimental feature')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.enableOutliner).onChange(async (value) => {
          this.plugin.settings.enableOutliner = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
