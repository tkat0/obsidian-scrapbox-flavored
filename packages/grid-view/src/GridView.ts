import { ItemView, WorkspaceLeaf } from 'obsidian';

import GridComponent from './GridComponent.svelte';
import { type ObsidianAdapter, ObsidianAdapterImpl } from './adapter/ObsidianAdapter';
import { VIEW_IDENTIFIER } from './const';
import type { GridViewSettings } from './setting';
import { ContextMenuUsecaseImpl } from './usecase/ContextMenuUsecase';
import { GetPagesUsecaseImpl } from './usecase/GetPagesUsecase';
import { PageObserveUsecaseImpl } from './usecase/PageObserveUsecase';

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
        this.component = new GridComponent({
            target: this.contentEl,
            props: {
                getPagesUsecase: await GetPagesUsecaseImpl.init(this.obsidianAdapter),
                contextMenuUsecase: new ContextMenuUsecaseImpl(this.obsidianAdapter),
                pageObserveUsecase: new PageObserveUsecaseImpl(this.obsidianAdapter),
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
