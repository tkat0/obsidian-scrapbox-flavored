import { Plugin } from "obsidian";

import { GridView } from "./view";
import { PLUGIN_IDENTIFIER } from "./const";

export default class GridViewPlugin extends Plugin {
    async onload() {
        this.registerView(PLUGIN_IDENTIFIER, (leaf) => new GridView(leaf));

        // TODO(tkat0): replace icon
        this.addRibbonIcon("dice", "Grid View", (_evt: MouseEvent) => {
            this.activeView();
        });

        this.addCommand({
            id: "open-grid-view-command",
            name: "Open grid view",
            callback: () => {
                this.activeView();
            },
        });
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(PLUGIN_IDENTIFIER);
    }

    async activeView() {
        this.app.workspace.detachLeavesOfType(PLUGIN_IDENTIFIER);

        await this.app.workspace.getLeaf(false).setViewState({
            type: PLUGIN_IDENTIFIER,
            active: true,
        });

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(PLUGIN_IDENTIFIER)[0]
        );
    }
}
