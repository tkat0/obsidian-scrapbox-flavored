import type { ICard } from '../model';

export interface GetPagesUsecase {
  invoke: (input: GetPagesUsecaseInput) => Promise<GetPagesUsecaseOutput>;
}

export interface GetPagesUsecaseInput {
  page: number;
  size: number;
  search: string;
  sort: SortKind;
  pinStarred: boolean;
}

export interface GetPagesUsecaseOutput {
  cards: ICard[];
  hasMore: boolean;
}

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
