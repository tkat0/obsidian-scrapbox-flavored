import type { App, MarkdownView } from 'obsidian';

import RelatedPagesComponent from './RelatedPagesComponent.svelte';
import { ObsidianAdapterImpl } from './adapter/ObsidianAdapterImpl';
import { WasmAdapterImpl } from './adapter/WasmAdapterImpl';
import type { GridViewSettings } from './setting';
import { GetRelatedPagesUsecaseImpl } from './usecase/GetRelatedPagesUsecase';

export class RelatedPages {
  private component: RelatedPagesComponent;
  private view: MarkdownView;

  constructor(
    private app: App,
    id: string,
    private settings: GridViewSettings,
    private saveSettings: () => Promise<void>,
  ) {
    this.view = app.workspace.getLeafById(id).view as MarkdownView;
  }

  async onMount(): Promise<void> {
    // add to the bottom of the page
    const contentEl = this.view.containerEl.querySelector('.view-content .cm-editor .cm-contentContainer');
    if (!contentEl) return;

    const target = document.createElement('div');
    target.setAttribute('class', 'obsidian-scrapbox-flavored related-pages');

    contentEl.after(target);

    const obsidianAdapter = new ObsidianAdapterImpl(this.app);
    const wasmAdapter = await WasmAdapterImpl.init();
    this.component = new RelatedPagesComponent({
      target,
      props: {
        getRelatedPagesUsecase: await GetRelatedPagesUsecaseImpl.init(obsidianAdapter, wasmAdapter),
        app: this.app,
        obsidianAdapter,
        settings: this.settings,
        saveSettings: this.saveSettings,
      },
    });
  }

  async onDestroy() {
    this.component.$destroy();
  }
}
