import type { File, Metadata } from './adapter/ObsidianAdapter';

export interface ICard {
  title: string;
  description: Description[][];
  icon?: string;
  path: string;
  star?: boolean;
  tags?: string[];
  onClick?: () => Promise<void>;
  toggleStar?: () => void;
  trash?: () => void;
}

export interface Description {
  kind: 'normal' | 'code' | 'link' | 'emphasis' | 'image';
  value: string;
}
[];

// TODO: sort by file size
// TODO: view count
export type SortKind =
  | 'file-name-a-to-z'
  | 'file-name-z-to-a'
  | 'modified-new-to-old'
  | 'modified-old-to-new'
  | 'created-new-to-old'
  | 'created-old-to-new'
  | 'most-linked'
  | 'least-linked';

export const getSortTitle = (kind: SortKind): string => {
  switch (kind) {
    case 'file-name-a-to-z':
      return 'File name (Z to A)';
    case 'file-name-z-to-a':
      return 'File name (A to Z)';
    case 'created-new-to-old':
      return 'Created time (new to old)';
    case 'created-old-to-new':
      return 'Created time (old to new)';
    case 'modified-new-to-old':
      return 'Modified time (new to old)';
    case 'modified-old-to-new':
      return 'Modified time (old to new)';
    case 'most-linked':
      return 'Most Linked';
    case 'least-linked':
      return 'Least Linked';
  }
};

export interface SortItem {
  file: File;
  star?: boolean;
  meta?: Metadata;
}

export const createSortFn = (pinStarred: boolean, sort: SortKind) => {
  return (a: SortItem, b: SortItem) => {
    // 1. sorted by star
    // file with star is always first
    if (pinStarred) {
      if (a.star && !b.star) {
        return -1;
      } else if (!a.star && b.star) {
        return 1;
      }
    }
    // 2. sorted by other props
    const al = (a.meta?.resolvedLinks.length ?? 0) + (a.meta?.unresolvedLinks.length ?? 0);
    const bl = (b.meta?.resolvedLinks.length ?? 0) + (b.meta?.unresolvedLinks.length ?? 0);
    switch (sort) {
      case 'file-name-a-to-z':
        return a.file.name.localeCompare(b.file.name);
      case 'file-name-z-to-a':
        return b.file.name.localeCompare(a.file.name);
      case 'created-new-to-old':
        return b.file.stat.ctime - a.file.stat.ctime;
      case 'created-old-to-new':
        return a.file.stat.ctime - b.file.stat.ctime;
      case 'modified-new-to-old':
        return b.file.stat.mtime - a.file.stat.mtime;
      case 'modified-old-to-new':
        return a.file.stat.mtime - b.file.stat.mtime;
      case 'most-linked':
        return bl - al;
      case 'least-linked':
        return al - bl;
    }
  };
};

export const YAMLFrontMatter = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3}\n)/;
