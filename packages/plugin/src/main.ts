import { App, Plugin } from 'obsidian';
import type { PluginManifest } from 'obsidian';

import GridViewPlugin from '@obsidian-scrapbox-flavored/grid-view';
import OutlinerPlugin from '@obsidian-scrapbox-flavored/outliner';

import { ScrapboxFlavoredPluginSettingTab, ScrapboxFlavoredPluginSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export default class ScrapboxFlavoredPlugin extends Plugin {
  settings: ScrapboxFlavoredPluginSettings;

  gridViewPlugin: GridViewPlugin;
  outlinerPlugin: OutlinerPlugin;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.gridViewPlugin = new GridViewPlugin(app, manifest, this.saveSettings);
    this.outlinerPlugin = new OutlinerPlugin(app, manifest);
  }

  async onload() {
    await this.loadSettings();
    this.gridViewPlugin.settings = this.settings.gridView;
    this.outlinerPlugin.settings = this.settings.outliner;

    this.addSettingTab(new ScrapboxFlavoredPluginSettingTab(this.app, this));

    await this.gridViewPlugin.onload();
    await this.outlinerPlugin.onload();
  }

  onunload() {
    this.gridViewPlugin.onunload();
    this.outlinerPlugin.onunload();
  }

  async activeView() {
    this.gridViewPlugin.activeView();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  saveSettings = async () => {
    this.settings.gridView = this.gridViewPlugin.settings;
    this.settings.outliner = this.outlinerPlugin.settings;
    await this.saveData(this.settings);
  };
}
