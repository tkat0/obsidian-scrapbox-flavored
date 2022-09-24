import { App, Plugin } from 'obsidian';
import type { PluginManifest } from 'obsidian';

import GridViewPlugin from '@obsidian-scrapbox-flavored/grid-view';
import OutlinerPlugin from '@obsidian-scrapbox-flavored/outliner';
import StylesPlugin from '@obsidian-scrapbox-flavored/styles';

import { ScrapboxFlavoredPluginSettingTab, ScrapboxFlavoredPluginSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export default class ScrapboxFlavoredPlugin extends Plugin {
  settings: ScrapboxFlavoredPluginSettings;

  gridViewPlugin?: GridViewPlugin;
  outlinerPlugin?: OutlinerPlugin;
  stylesPlugin?: StylesPlugin;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  async onload() {
    const { app, manifest } = this;
    await this.loadSettings();

    this.gridViewPlugin = new GridViewPlugin(app, manifest, this.saveSettings);
    this.gridViewPlugin.settings = this.settings.gridView;

    if (this.settings.enableOutliner) {
      this.outlinerPlugin = new OutlinerPlugin(app, manifest);
      this.outlinerPlugin.settings = this.settings.outliner;
    }

    if (this.settings.enableStyles) {
      this.stylesPlugin = new StylesPlugin(app, manifest);
    }

    this.addSettingTab(new ScrapboxFlavoredPluginSettingTab(this.app, this));

    await this.gridViewPlugin?.onload();
    await this.outlinerPlugin?.onload();
    await this.stylesPlugin?.onload();
  }

  onunload() {
    this.gridViewPlugin?.onunload();
    this.outlinerPlugin?.onunload();
    this.stylesPlugin?.onunload();
  }

  async activeView() {
    this.gridViewPlugin?.activeView();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  saveSettings = async () => {
    if (this.gridViewPlugin) {
      this.settings.gridView = this.gridViewPlugin.settings;
    }
    if (this.outlinerPlugin) {
      this.settings.outliner = this.outlinerPlugin.settings;
    }
    await this.saveData(this.settings);
  };
}
