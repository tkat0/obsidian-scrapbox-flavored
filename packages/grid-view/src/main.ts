import { App, MarkdownView, Plugin } from 'obsidian';
import type { PluginManifest } from 'obsidian';

import { GridView } from './GridView';
import { RelatedPages } from './RelatedPages';
import type { GridViewSettings } from './setting';
import { DEFAULT_SETTINGS } from './setting';

export { DEFAULT_SETTINGS as GRID_VIEW_DEFAULT_SETTINGS };

export { GridViewSettings };

export default class GridViewPlugin extends Plugin {
  settings: GridViewSettings;
  leafs: Record<LeafId, HasComponent>;

  constructor(app: App, manifest: PluginManifest, private saveSettings: () => Promise<void>) {
    super(app, manifest);
    this.leafs = {};
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

    // add/delete RelatedPages component to MarkdownView
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (_leaf) => {
        const newLeaves: Record<string, HasComponent> = {};
        this.app.workspace.getLeavesOfType('markdown').forEach((leaf) => {
          const id = (leaf as any).id;
          const path = (leaf.view as MarkdownView).file.path;
          newLeaves[id] = { path };
        });

        for (const [id, data] of Object.entries(newLeaves)) {
          if (id in this.leafs && this.leafs[id].path == data.path) {
            // no change
            newLeaves[id] = this.leafs[id];
            continue;
          }

          if (id in this.leafs && this.leafs[id].path != data.path) {
            // remove component from repleced leaf
            // console.debug('removed', id, this.leafs[id]);
            this.leafs[id].component?.onDestroy();
          }

          // add new component
          // console.debug('added', id, data);
          const component = new RelatedPages(this.app, id, this.settings, this.saveSettings);
          newLeaves[id] = { ...newLeaves[id], component };
          component.onMount();
        }

        // remove component from deleted leaf
        for (const [id, data] of Object.entries(this.leafs)) {
          if (!(id in newLeaves)) {
            // console.debug('removed', id, data);
            data.component?.onDestroy();
          }
        }

        this.leafs = newLeaves;
      }),
    );
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(GridView.id);
  }

  async activeView() {
    // open the view in the new leaf. If it exsits, it shouldn't create new leaf, but just active the leaf.
    const leaves = this.app.workspace.getLeavesOfType(GridView.id);
    if (leaves.length == 1) {
      // set active
      this.app.workspace.setActiveLeaf(leaves[0]);
    } else {
      // create new leaf
      await this.app.workspace.getLeaf(false).setViewState({
        type: GridView.id,
        active: true,
      });
    }
  }
}

type LeafId = string;

interface HasComponent {
  path: string;
  component?: RelatedPages;
}
