import type { SortKind } from './domain/model';

export interface GridViewSettings {
  gridView: {
    sort: SortKind;
    pinStarred: boolean;
  };
  relatedPages: {
    enable: boolean;
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
    enable: true,
    sort: 'modified-new-to-old',
    pinStarred: true,
  },
};

export const migration = (setting: GridViewSettings): GridViewSettings => {
  if (setting.relatedPages.enable == undefined) {
    setting.relatedPages.enable = DEFAULT_SETTINGS.relatedPages.enable;
  }
  return setting;
};
