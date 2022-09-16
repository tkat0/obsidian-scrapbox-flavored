import { type EventRef, setIcon } from 'obsidian';
import { App, MetadataCache, TFile, Vault, WorkspaceLeaf, prepareFuzzySearch } from 'obsidian';

import { GridView } from '../GridView';
import { VIEW_IDENTIFIER } from '../const';
import type { File, InternalPlugin, Metadata, ObsidianAdapter, SearchResult } from '../domain/adapter/ObsidianAdapter';

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

  setIcon(parent: HTMLElement, iconId: string, size?: number | undefined): void {
    setIcon(parent, iconId, size);
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

  getFirstImage(file: File, content: string): string | undefined {
    const { vault, metadataCache } = this.app;
    const [lImg, lPos] = getFirstLocalImage(vault, metadataCache, file as TFile);
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

  createSearchFun(query: string): (text: string) => SearchResult | undefined {
    const search = prepareFuzzySearch(query);
    return (text: string) => {
      const ret = search(text);
      return ret ? { score: ret.score } : undefined;
    };
  }

  trash(file: File, system: boolean): Promise<void> {
    return this.app.vault.trash(file as TFile, system);
  }

  toggleFileStar(file: File) {
    this.starredPlugin.instance.toggleFileStar(file);
  }

  openFile(file: File): Promise<void> {
    return this.app.workspace.getLeaf(true).openFile(file as TFile, { active: true });
  }

  cachedRead(file: File): Promise<string> {
    return this.app.vault.cachedRead(file as TFile);
  }

  getMarkdownFiles(): File[] {
    return this.app.vault.getMarkdownFiles();
  }

  getMetadata(file: File): Metadata {
    const metadata = this.app.metadataCache.getFileCache(file as TFile);
    return {
      links: metadata?.links?.length ?? 0,
      tags: metadata?.tags?.map(({ tag }) => tag) ?? [],
    };
  }

  getStarredFile(): File[] {
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

  // TODO: rewrite with Wasm
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
