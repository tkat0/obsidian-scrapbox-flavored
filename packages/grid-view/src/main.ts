import { App, Plugin } from 'obsidian';
import type { PluginManifest } from 'obsidian';

import { GridView } from './GridView';
import type { GridViewSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export { DEFAULT_SETTINGS as GRID_VIEW_DEFAULT_SETTINGS };

export { GridViewSettings };

export default class GridViewPlugin extends Plugin {
  settings: GridViewSettings;

  constructor(app: App, manifest: PluginManifest, private saveSettings: () => Promise<void>) {
    super(app, manifest);
  }

  async onload() {
    this.registerView(GridView.id, (leaf) => new GridView(leaf, this.settings, this.saveSettings));

    this.addRibbonIcon('grid', 'Scrapbox-flavored Grid View', (_evt: MouseEvent) => {
      this.activeView();
    });

    this.addCommand({
      id: 'open-scrapbox-flavored-grid-view-command',
      name: 'Open Scrapbox-flavored Grid View',
      callback: () => {
        this.activeView();
      },
      hotkeys: [{ modifiers: ['Meta', 'Shift'], key: 'g' }],
    });
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(GridView.id);
  }

  async activeView() {
    this.app.workspace.detachLeavesOfType(GridView.id);

    await this.app.workspace.getLeaf(false).setViewState({
      type: GridView.id,
      active: true,
    });

    this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(GridView.id)[0]);
  }
}
