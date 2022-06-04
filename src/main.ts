import { Plugin } from "obsidian";

import { GridView } from "./view";
import { PLUGIN_IDENTIFIER } from "./const";
import {
    moveListBlock,
    indentSelecttedBlock,
    moveCursorToBegin,
    moveCursorToEnd,
} from "./features/listop";

export default class GridViewPlugin extends Plugin {
    async onload() {
        this.registerView(PLUGIN_IDENTIFIER, (leaf) => new GridView(leaf));

        // TODO(tkat0): replace icon
        this.addRibbonIcon("dice", "Scrapbox View", (_evt: MouseEvent) => {
            this.activeView();
        });

        this.addCommand({
            id: "open-scrapbox-view-command",
            name: "Open scrapbox view",
            callback: () => {
                this.activeView();
            },
            hotkeys: [{ modifiers: ["Meta"], key: "s" }],
        });

        // NOTE(tkat0): obsidian may update default values in the next version.
        this.app.vault.config.tabSize ??= 4;
        this.app.vault.config.useTab ??= true;

        const { useTab, tabSize } = this.app.vault.config;

        // if `useTab`, '\t'
        const indent = useTab ? "\t" : " ".repeat(tabSize);

        // TODO(tkat0): allow user to set default hot key by settings. Refer other plugins

        this.addCommand({
            id: "move-cursor-beginning-of-line",
            name: "Move cursor to the beginning of the line",
            editorCallback: (editor, _markdown) => {
                moveCursorToBegin(editor);
            },
            hotkeys: [{ modifiers: ["Ctrl"], key: "a" }],
        });

        this.addCommand({
            id: "move-cursor-end-of-line",
            name: "Move cursor to the end of the line",
            editorCallback: (editor, _markdown) => {
                moveCursorToEnd(editor);
            },
            hotkeys: [{ modifiers: ["Ctrl"], key: "e" }],
        });

        this.addCommand({
            id: "move-up-current-block-of-list",
            name: "Move up the current block of the list",
            editorCallback: (editor, _markdown) => {
                moveListBlock(editor, "up");
            },
            hotkeys: [{ modifiers: ["Alt"], key: "ArrowUp" }],
        });

        this.addCommand({
            id: "move-down-current-block-of-list",
            name: "Move down the current block of the list",
            editorCallback: (editor, _markdown) => {
                moveListBlock(editor, "down");
            },
            hotkeys: [{ modifiers: ["Alt"], key: "ArrowDown" }],
        });

        this.addCommand({
            id: "indent-selected-block-of-list",
            name: "Indent the selected block of the list",
            editorCallback: (editor, _markdown) => {
                indentSelecttedBlock(editor, "indent", indent);
            },
            hotkeys: [{ modifiers: ["Alt"], key: "ArrowRight" }],
        });

        this.addCommand({
            id: "outdent-selected-block-of-list",
            name: "Outndent the selected block of the list",
            editorCallback: (editor, _markdown) => {
                indentSelecttedBlock(editor, "outdent", indent);
            },
            hotkeys: [{ modifiers: ["Alt"], key: "ArrowLeft" }],
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
