import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import { PLUGIN_IDENTIFIER } from "./const";
import { AppContext } from "./context";

export class GridView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return PLUGIN_IDENTIFIER;
    }

    getDisplayText(): string {
        return "Scrapbox view";
    }

    async onOpen(): Promise<void> {
        ReactDOM.render(
            <AppContext.Provider value={this.app}>
                <App />
            </AppContext.Provider>,
            this.containerEl.children[1]
        );
    }

    async onClose() {
        ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
    }
}
