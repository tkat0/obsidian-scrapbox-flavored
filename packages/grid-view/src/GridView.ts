import { ItemView, type WorkspaceLeaf } from 'obsidian';

import GridComponent from './GridComponent.svelte';
import { ObsidianAdapterImpl } from './adapter/ObsidianAdapterImpl';
import { WasmAdapterImpl } from './adapter/WasmAdapterImpl';
import { VIEW_IDENTIFIER } from './const';
import type { ObsidianAdapter } from './domain/adapter/ObsidianAdapter';
import type { GridViewSettings } from './setting';
import { GetPagesUsecaseImpl } from './usecase/GetPagesUsecase';

export class GridView extends ItemView {
  private component: GridComponent;
  private obsidianAdapter: ObsidianAdapter;
  static id = VIEW_IDENTIFIER;

  constructor(leaf: WorkspaceLeaf, private settings: GridViewSettings, private saveSettings: () => Promise<void>) {
    super(leaf);
    this.obsidianAdapter = new ObsidianAdapterImpl(this.app);
  }

  getViewType(): string {
    return VIEW_IDENTIFIER;
  }

  getDisplayText(): string {
    return 'Scrapbox-flavored Grid View';
  }

  async onOpen(): Promise<void> {
    const wasmAdapter = await WasmAdapterImpl.init();
    this.component = new GridComponent({
      target: this.contentEl,
      props: {
        getPagesUsecase: await GetPagesUsecaseImpl.init(this.obsidianAdapter, wasmAdapter),
        obsidianAdapter: this.obsidianAdapter,
        settings: this.settings,
        saveSettings: this.saveSettings,
      },
    });
  }

  async onClose() {
    this.component.$destroy();
    this.obsidianAdapter.dispose();
  }
}
