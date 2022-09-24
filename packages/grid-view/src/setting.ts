import type { SortKind } from './domain/model';

export interface GridViewSettings {
  gridView: {
    sort: SortKind;
    pinStarred: boolean;
  };
  relatedPages: {
    sort: SortKind;
    pinStarred: boolean;
  };
}

export const DEFAULT_SETTINGS: GridViewSettings = {
  gridView: {
    sort: 'modified-new-to-old',
    pinStarred: true,
  },
  relatedPages: {
    sort: 'modified-new-to-old',
    pinStarred: true,
  },
};
