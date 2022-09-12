import { type EventRef, MetadataCache, Vault, WorkspaceLeaf, prepareFuzzySearch } from 'obsidian';
import type { App, CachedMetadata, SearchResult, TFile } from 'obsidian';

import { GridView } from '../GridView';
import { VIEW_IDENTIFIER } from '../const';

export interface ObsidianAdapter {
  getMetadata(file: TFile): CachedMetadata | undefined;
  getMarkdownFiles(): TFile[];
  cachedRead(file: TFile): Promise<string>;
  openFile(file: TFile): Promise<void>;
  trash(file: TFile, system: boolean): Promise<void>;
  pluginEnabled(name: InternalPlugin): boolean;
  getStarredFile(): TFile[];
  createSearchFun(query: string): (text: string) => SearchResult | null;
  toggleFileStar(file: TFile): void;
  getFirstImage(file: TFile, content: string): string | undefined;
  isViewActive(): boolean;
  onFileChange(onChange: () => void): void;
  dispose(): void;
}

export type InternalPlugin = 'starred';

export class ObsidianAdapterImpl implements ObsidianAdapter {
  private starredPlugin?: any;
  private wait: boolean;
  private vaultEvents: EventRef[];
  private workspaceEvents: EventRef[];
  private starredPluginEvents: EventRef[];

  constructor(private app: App) {
    const internalPlugins = (this.app as any).internalPlugins;
    this.starredPlugin = internalPlugins.plugins['starred'];
    this.wait = false;
    this.vaultEvents = [];
    this.workspaceEvents = [];
    this.starredPluginEvents = [];
  }

  dispose(): void {
    // NOTE: see Plugin.registerEvent.
    for (const event of this.vaultEvents) {
      this.app.vault.offref(event);
    }
    for (const event of this.workspaceEvents) {
      this.app.workspace.offref(event);
    }
    for (const event of this.starredPluginEvents) {
      this.starredPlugin.instance.offref(event);
    }
  }

  onFileChange(onChange: () => void): void {
    // while the view is inactive, onChange should not be called.
    // after the view gets active, it should be called.
    const f = () => {
      if (this.isViewActive()) {
        this.wait = false;
        onChange();
      } else {
        this.wait = true;
      }
    };
    this.vaultEvents.push(this.app.vault.on('create', f));
    this.vaultEvents.push(this.app.vault.on('delete', f));
    this.vaultEvents.push(this.app.vault.on('modify', f));
    this.vaultEvents.push(this.app.vault.on('rename', f));

    this.starredPluginEvents.push(this.starredPlugin?.instance.on('changed', f));

    this.workspaceEvents.push(
      this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf | null) => {
        if (leaf?.view.getViewType() == VIEW_IDENTIFIER && this.wait) {
          onChange();
        }
      }),
    );
  }

  isViewActive(): boolean {
    return this.app.workspace.getActiveViewOfType(GridView) !== null;
  }

  getFirstImage(file: TFile, content: string): string | undefined {
    const { vault, metadataCache } = this.app;
    const [lImg, lPos] = getFirstLocalImage(vault, metadataCache, file);
    const [rImg, rPos] = getFirstRemoteImage(content);

    // TODO(tkat0): Support excaildraw

    if (lImg && rImg) {
      return lPos < rPos ? lImg : rImg;
    } else if (lImg && !rImg) {
      return lImg;
    } else if (!lImg && rImg) {
      return rImg;
    } else {
      return undefined;
    }
  }

  createSearchFun(query: string): (text: string) => SearchResult | null {
    return prepareFuzzySearch(query);
  }

  trash(file: TFile, system: boolean): Promise<void> {
    return this.app.vault.trash(file, system);
  }

  toggleFileStar(file: TFile) {
    this.starredPlugin.instance.toggleFileStar(file);
  }

  openFile(file: TFile): Promise<void> {
    return this.app.workspace.getLeaf(true).openFile(file, { active: true });
  }

  cachedRead(file: TFile): Promise<string> {
    return this.app.vault.cachedRead(file);
  }

  getMarkdownFiles(): TFile[] {
    return this.app.vault.getMarkdownFiles();
  }

  getMetadata(file: TFile): CachedMetadata | undefined {
    return this.app.metadataCache.getFileCache(file) ?? undefined;
  }

  getStarredFile(): TFile[] {
    return this.starredPlugin.instance.items;
  }

  pluginEnabled(name: InternalPlugin): boolean {
    switch (name) {
      case 'starred':
        return this.starredPlugin.enabled;
      default:
        return false;
    }
  }
}

const getFirstLocalImage = (
  vault: Vault,
  metadataCache: MetadataCache,
  file: TFile,
): [string, number] | [undefined, undefined] => {
  const cachedMetadata = metadataCache.getFileCache(file);
  for (const embed of cachedMetadata?.embeds ?? []) {
    const ext = embed.link.split('.').pop();
    if (ext && ['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
      const linkFile = metadataCache.getFirstLinkpathDest(embed.link, file.path);
      if (linkFile) {
        return [vault.getResourcePath(linkFile), embed.position.start.line];
      }
    }
  }
  return [undefined, undefined];
};

const getFirstRemoteImage = (content: string): [string, number] | [undefined, undefined] => {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const result = line.match(/!\[.*]\((?<url>.*)\)/);
    if (result?.groups) {
      const url = result.groups['url'];
      if (url) return [url, i];
    }
  }
  return [undefined, undefined];
};
