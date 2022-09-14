export interface ObsidianAdapter {
  getMetadata(file: File): Metadata;
  getMarkdownFiles(): File[];
  cachedRead(file: File): Promise<string>;
  openFile(file: File): Promise<void>;
  trash(file: File, system: boolean): Promise<void>;
  pluginEnabled(name: InternalPlugin): boolean;
  getStarredFile(): File[];
  createSearchFun(query: string): (text: string) => SearchResult | undefined;
  toggleFileStar(file: File): void;
  getFirstImage(file: File, content: string): string | undefined;
  isViewActive(): boolean;
  onFileChange(onChange: () => void): void;
  setIcon(parent: HTMLElement, iconId: string, size?: number): void;
  dispose(): void;
}

export interface File {
  stat: {
    ctime: number;
    mtime: number;
    size: number;
  };
  basename: string;
  extension: string;
  path: string;
  name: string;
}

export interface SearchResult {
  score: number;
}

export interface Metadata {
  links: number;
  tags: string[];
}

export type InternalPlugin = 'starred';
